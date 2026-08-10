#!/usr/bin/env python3
"""prep_holbox_denue.py — geodata de generadores desde el DENUE (INEGI).

Fuente OFICIAL mexicana (Directorio Estadístico Nacional de Unidades Económicas).
Verifica/reemplaza el inventario de OSM, que sub-representa el comercio local.
Corre OFFLINE y produce artefactos ESTÁTICOS (cero runtime en el server).

Ventaja sobre OSM:
  - Cobertura oficial (571 unidades en Holbox vs 264 clasificables en OSM).
  - `per_ocu` (estrato de personal ocupado) → calibra la GENERACION por tamaño,
    en vez de un coeficiente plano por tipo.

Fuente de datos: descarga masiva DENUE por entidad (sin token). Se cachea el
recorte de Holbox en scripts/geo/data/denue_holbox.csv (reproducible, chico).

Salidas:
  - src/studyCases/holbox/geo/generators_denue.geojson
  - src/studyCases/holbox/geoDENUE.ts  (CaseGeo tipado)

Uso:  python3 scripts/geo/prep_holbox_denue.py
"""
from __future__ import annotations
import csv
import io
import json
import re
import sys
import urllib.request
import zipfile
from collections import Counter
from pathlib import Path

UA = "waste-simulator-holbox/1.0 (rafaellangmillet@gmail.com)"
DENUE_QR_ZIP = "https://www.inegi.org.mx/contenidos/masiva/denue/denue_23_csv.zip"  # 23 = Quintana Roo

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "scripts" / "geo" / "data"
CACHE_CSV = DATA_DIR / "denue_holbox.csv"
ROOMS_CSV = DATA_DIR / "holbox_hotel_inventory.csv"       # Capa 3/4: cuartos reales
NONDENUE_CSV = DATA_DIR / "holbox_nondenue.csv"           # hoteles fuera de DENUE (Overture + investigados)
SEDETUR_JSON = DATA_DIR / "sedetur_holbox.json"           # ocupación oficial
GEO_DIR = ROOT / "src" / "studyCases" / "holbox" / "geo"
TS_OUT = ROOT / "src" / "studyCases" / "holbox" / "geoDENUE.ts"

# Clasificación SCIAN (codigo_act) → tipo del modelo.
def classify(cod: str) -> str | None:
    if cod.startswith("721"):  # alojamiento temporal
        return "hotel"
    if cod.startswith("722"):  # preparación de alimentos y bebidas
        return "restaurante"
    if cod.startswith(("43", "46")):  # comercio mayoreo / menudeo
        return "comercio"
    if cod[:6] in INCLUDE_EXCLUDED:  # Tier A de los "excluidos": orgánico real (pan/tortillería/pesca…)
        return "comercio"
    return None

# Estrato de personal ocupado (DENUE) → punto medio de empleados.
STAFF_MID = {
    "0 a 5 personas": 3,
    "6 a 10 personas": 8,
    "11 a 30 personas": 20,
    "31 a 50 personas": 40,
    "51 a 100 personas": 75,
    "101 a 250 personas": 175,
    "251 y más personas": 300,
}
# Factor representativo kg de residuo / empleado / día por tipo (v1, a calibrar).
# Se conserva para comercio (su modelo v2 aún no está definido). Hotel y restaurante
# tienen modelo v2 propio abajo.
KG_PER_STAFF = {"hotel": 6.0, "restaurante": 4.0, "comercio": 1.5}

# ── Modelo gen v2 para RESTAURANTES ──────────────────────────────────────────
# El estrato DENUE `per_ocu` SATURA (101/149 restaurantes = "0 a 5 personas") →
# como en hoteles, el staff plano casi no discrimina. El driver físico correcto es
# COMIDAS SERVIDAS/día (no empleados). Sin # de mesas en DENUE, se estima:
#   comidas/día = staff_mid × comidas_por_empleado(FORMATO)
# donde el FORMATO (sub-SCIAN 722xxx) es la señal que el staff pierde — un
# full-service ≠ una nevería ≠ un bar. Las cifras son comida-EQUIVALENTES/empleado/día
# (una nevería sirve porciones ligeras → menos kg; un bar casi no genera orgánico).
MEALS_PER_STAFF = {
    "722511": 12,  # restaurantes con servicio completo
    "722512": 13,  # pescados y mariscos (alto orgánico)
    "722513": 18,  # antojitos
    "722514": 24,  # tacos (alta rotación, poca mano de obra)
    "722515": 6,   # cafeterías/neverías/fuentes de sodas (fare ligero)
    "722516": 20,  # autoservicio
    "722517": 15,  # pizzas
    "722518": 12,  # otros alimentos para consumo inmediato
    "722519": 12,  # otros servicios de preparación de alimentos
    "722412": 2,   # bares/cantinas (casi-cero orgánico — residuo = vidrio/envase)
}
REST_MEALS_DEFAULT = 12
# kg de residuo TOTAL / comida (literatura ~0.72; solo-comida ≈0.20). Se cuenta el
# flujo total (consistente con el modelo de hotel). Banda de sensibilidad, se reporta
# como cota de incertidumbre en la tesis.
KG_PER_MEAL = 0.72       # base
KG_PER_MEAL_LOW = 0.50   # cota baja
KG_PER_MEAL_HIGH = 0.90  # cota alta
# Acople a la demanda turística: fracción de la demanda de restaurante que es
# turista-elástica (el resto es piso residente que no varía con la temporada).
# gen(mes) = base × [(1−α) + α·occ(mes)/occ_anual]. Lo aplica el frontend con la
# curva Sedetur (misma que hoteles). α=0.7 = mayoría turista, piso residente ~30%.
REST_COUPLING = 0.7


def _rest_meals(cod: str) -> float:
    """Comidas-equivalentes por empleado/día según el formato (sub-SCIAN 722xxx)."""
    return MEALS_PER_STAFF.get(cod[:6], REST_MEALS_DEFAULT)


# ── Modelo gen v2 para COMERCIO + los 111 excluidos ──────────────────────────
# El estrato satura AÚN MÁS (158/172 = 92% en "0-5 pers") → el driver es la CATEGORÍA
# (sub-SCIAN), no el staff. Comercio es bimodal: alimento (abarrotes/frutas/carnes →
# orgánico real) vs no-alimento (bisutería/artesanías/joyería → solo empaque). Factor
# kg/establecimiento/día por categoría, con escala ligera por staff (staff_mid/3) para
# las ~14 unidades más grandes. Sin banda (factores puntuales, no incertidumbre kg).
COMMERCE_CATS = {  # sub-SCIAN 5 díg → (etiqueta, kg/día/establecimiento)
    "46113": ("frutas y verduras", 30),   # alto orgánico (merma)
    "46112": ("carnes", 22),              # orgánico (recorte)
    "46111": ("abarrotes", 18),           # orgánico + empaque (tienda de esquina)
    # 46211 = minisúper/supermercado de cadena (DUNOSUSA, Chedraui, OXXO, Gomart, Monkeys):
    # generan mucho más que un abarrotes (más empaque + merma). El SCIAN los separa de las
    # ~24 tiendas de esquina (461110). La escala por staff amplifica los grandes (DUNOSUSA 11-30).
    "46211": ("minisúper/supermercado", 35),
    "46121": ("bebidas", 8),              # empaque/vidrio, bajo orgánico
    "46117": ("hielo/paletas", 8),
    "46411": ("farmacia", 5),             # bajo + algo de especial
    "46711": ("ferretería", 4),           # inerte/bajo
    "43421": ("mat. construcción", 4),
}
COMMERCE_DEFAULT = ("comercio no-alimento", 4)  # bisutería, artesanías, joyería, electrónica…

# Reclasificación por MARCA: el DENUE codifica varias tiendas de autoservicio con
# nombre "MINI SUPER X" como 46111 abarrotes (formato mostrador). En Holbox el formato
# real es minisúper (autoservicio + refrigerados + más SKUs → más empaque/merma que un
# abarrotes de esquina). Cuando el nombre lo declara minisúper, se usa el bucket 46211.
# El estrato de personal sigue escalando el tamaño (una MINISUPER de 6-10 pers pesa más
# que una de 0-5), así que no se sobre-cuenta a los chicos.
_MINISUPER_RE = re.compile(r"MINI\s*-?\s*S[UÚ]PER", re.IGNORECASE)

# Override de ESTRATO para formatos grandes mal-registrados en el DENUE. El snapshot del
# DENUE capturó al Súper Chedraui "6 a 10 personas" (registro de pre-apertura), pero abrió
# dic-2025 como Súper Chedraui AB: piso 1,000-2,500 m² con panadería + carnicería +
# perecederos (contrató panaderos/carniceros/gerentes/supervisores). Es el mayor generador
# de comercio de la isla. Se fuerza su estrato al real (31-50 pers) → ~467 kg/día.
# Fuente: prensa (POSTA, Chedraui oficial). Lista corta y citable, no heurística.
STAFF_OVERRIDE = [
    # \w*UI tolera el typo del DENUE: el registro dice "CHEDARUI" (R/A transpuestas).
    (re.compile(r"CHED\w*UI", re.IGNORECASE), "31 a 50 personas"),
]

# Los 111 excluidos — inclusión TIERIZADA por relevancia de residuo (plan §"111 excluidos").
# Tier A (orgánico real) → se INCLUYEN como comercio. El resto (servicios ~cero, biológico,
# inerte, alquiler) queda EXCLUIDO por diseño (no por omisión): meterlos con factor plano
# infla el total. sub-SCIAN 6 díg → (etiqueta, kg/día).
INCLUDE_EXCLUDED = {
    # Tier A — orgánico real (industria alimentaria + pesca)
    "311812": ("panificación", 20),
    "311830": ("tortillería", 18),  # tortillas de maíz + nixtamal (merma húmeda)
    "311813": ("tortillería", 18),  # tortillas de harina
    "311922": ("café tostado", 10),
    "311520": ("helados/paletas", 8),
    "114119": ("pesca", 25),        # captura → vísceras/desecho, alto orgánico
    "312112": ("agua embotellada", 6),  # empaque
    # Instituciones — educación básica (grandes generadores: matrícula, no staff docente).
    # Base = estimación de TODO el plantel (residuo alumno: papel + restos de comida). Solo
    # las escuelas formales; kite/cocina/tareas quedan fuera (no son generador municipal).
    "611112": ("escuela preescolar", 10),
    "611122": ("escuela primaria", 30),
    "611142": ("escuela secundaria", 35),
}


def commerce_generation(cod: str, staff: str, name: str = "") -> tuple[int, str]:
    """→ (kg/día, etiqueta de categoría). Comercio 43/46: factor por categoría × escala
    ligera de staff (staff_mid/3, =1.0 en el estrato base) para amplificar los grandes
    (supermercados de cadena). Tier A orgánico + escuelas: base FIJA de establecimiento
    (sin escala — su driver es matrícula/proceso, no el estrato de personal).

    Reclasificación por marca: un 46111 abarrotes cuyo nombre declara minisúper se trata
    como 46211 (formato autoservicio, ver _MINISUPER_RE). El estrato sigue escalando."""
    six, five = cod[:6], cod[:5]
    if six in INCLUDE_EXCLUDED:
        label, base = INCLUDE_EXCLUDED[six]
        return base, label
    if five == "46111" and _MINISUPER_RE.search(name or ""):
        label, base = COMMERCE_CATS["46211"]
    elif five in COMMERCE_CATS:
        label, base = COMMERCE_CATS[five]
    else:
        label, base = COMMERCE_DEFAULT
    staff_eff = staff
    for rx, ov in STAFF_OVERRIDE:
        if rx.search(name or ""):
            staff_eff = ov
            break
    scale = STAFF_MID.get(staff_eff.strip(), 3) / 3.0
    return round(base * scale), label

# ── Modelo gen v2 para HOTELES (Capa 3) ──────────────────────────────────────
# gen = cuartos × ocupación × huésp/cuarto × kg/huésped-noche.
#   cuartos          → reales (Capa 3) por hotel; fallback al prior de estrato.
#   ocupación        → Sedetur, prom anual (73.2% 2026); param estacional del sim.
#   huésp/cuarto     → 2.0 (doble ocupación típica).
#   kg/huésped-noche → 2.0. Holbox es 100% "SIN CATEGORÍA" en INEGI → no ancla a
#                      estrellas; tier por precio/ADR (boutique-alto ≈ 3-4★, lit.
#                      1.7–2.3). 2.0 = punto medio defendible, parametrizable.
GUESTS_PER_ROOM = 2.0
# kg/huésped-noche — Holbox es 100% "SIN CATEGORÍA" en INEGI → no ancla a estrellas.
# Camino A: FACTOR ÚNICO de isla (boutique-alto) con BANDA DE SENSIBILIDAD, en vez de
# tier per-hotel por ADR (falsa precisión: la isla es homogéneamente boutique-alto).
# Literatura boutique-alto ≈ 3-4★ → 1.7–2.3 kg/huésped-noche. La banda se reporta como
# cota de incertidumbre (defensa de tesis), no como precisión inventada.
KG_PER_GUEST_NIGHT = 2.0       # base (punto medio boutique-alto)
KG_PER_GUEST_NIGHT_LOW = 1.7   # cota baja
KG_PER_GUEST_NIGHT_HIGH = 2.3  # cota alta
_FALLBACK_OCC = 0.732
_FALLBACK_CURVE = {"enero": 73.1, "febrero": 69.7, "marzo": 78.2, "abril": 71.8}


def _load_occupancy() -> float:
    """Ocupación anual promedio (base para la generación precomputada)."""
    if SEDETUR_JSON.exists():
        d = json.loads(SEDETUR_JSON.read_text())
        if d.get("ocupacion_prom"):
            return d["ocupacion_prom"] / 100.0
    return _FALLBACK_OCC


def _load_occupancy_curve() -> dict:
    """Curva estacional {annual, monthly}. El sim escala la gen hotelera linealmente
    con occ(mes)/annual — la generación baked está en el promedio anual."""
    annual = _load_occupancy()
    monthly = dict(_FALLBACK_CURVE)
    if SEDETUR_JSON.exists():
        d = json.loads(SEDETUR_JSON.read_text())
        if d.get("ocupacion_mensual"):
            monthly = d["ocupacion_mensual"]
    return {"annual": round(annual, 4),
            "monthly": {k: round(v / 100.0, 4) for k, v in monthly.items()}}


def _load_rooms() -> dict[str, int]:
    """id DENUE → cuartos finales (real Capa 3 o prior de estrato)."""
    if not ROOMS_CSV.exists():
        return {}
    out = {}
    for r in csv.DictReader(ROOMS_CSV.open(encoding="utf-8")):
        rf = (r.get("rooms_final") or "").strip()
        if rf:
            out[r["id"]] = int(rf)
    return out


def estimate_generation(typ: str, staff: str, rooms: int | None, occ: float,
                        cod: str = "") -> tuple[int, int, int]:
    """→ (base, low, high) kg/día. La banda de sensibilidad aplica a hoteles v2
    (kg/huésped-noche) y restaurantes v2 (kg/comida); comercio v1 no tiene banda.
    La base se hornea a la ocupación ANUAL; el frontend la escala por temporada
    (hoteles: lineal en occ; restaurantes: acople amortiguado por REST_COUPLING)."""
    if typ == "hotel" and rooms:
        room_nights = rooms * occ * GUESTS_PER_ROOM
        return (round(room_nights * KG_PER_GUEST_NIGHT),
                round(room_nights * KG_PER_GUEST_NIGHT_LOW),
                round(room_nights * KG_PER_GUEST_NIGHT_HIGH))
    if typ == "restaurante":
        covers = STAFF_MID.get(staff.strip(), 3) * _rest_meals(cod)
        return (round(covers * KG_PER_MEAL),
                round(covers * KG_PER_MEAL_LOW),
                round(covers * KG_PER_MEAL_HIGH))
    # comercio (y hotel sin cuartos): v1 flat por empleado.
    mid = STAFF_MID.get(staff.strip(), 3)
    g = round(mid * KG_PER_STAFF[typ])
    return g, g, g


def load_nondenue(occ: float) -> list[dict]:
    """Hoteles fuera del registro DENUE (detectados por Overture, cuartos investigados
    a mano). Cierran el gap DENUE(134)→oficial(170). Misma gen v2 + banda que los DENUE."""
    if not NONDENUE_CSV.exists():
        return []
    out = []
    for r in csv.DictReader(NONDENUE_CSV.open(encoding="utf-8")):
        try:
            rooms = int(r["rooms"]); lat = float(r["lat"]); lng = float(r["lng"])
        except (ValueError, KeyError):
            continue
        if rooms <= 0:
            continue
        gen, gen_lo, gen_hi = estimate_generation("hotel", "", rooms, occ)
        slug = r["name"].strip().lower().replace(" ", "-")[:40]
        out.append({
            "id": f"nondenue/{slug}",
            "name": r["name"].strip(),
            "type": "hotel",
            "lat": round(lat, 6), "lng": round(lng, 6),
            "generation": gen, "genLow": gen_lo, "genHigh": gen_hi,
            "rooms": rooms, "gen_model": "v2_rooms",
            "source": "overture", "offRegistry": True,
            "staff": "",
        })
    return out


def download_and_filter() -> list[dict]:
    """Baja el DENUE de QR y filtra localidad Holbox → cachea el recorte."""
    print("→ Descargando DENUE Quintana Roo (masivo, sin token)…")
    req = urllib.request.Request(DENUE_QR_ZIP, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        blob = r.read()
    with zipfile.ZipFile(io.BytesIO(blob)) as z:
        name = next(n for n in z.namelist() if n.endswith(".csv") and "conjunto" in n)
        raw = z.read(name).decode("latin-1")
    rows = []
    for rec in csv.DictReader(io.StringIO(raw)):
        if "holbox" in (rec.get("localidad") or "").lower():
            rows.append({k: (v or "").strip() for k, v in rec.items()})
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with CACHE_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    print(f"  cacheado {CACHE_CSV.relative_to(ROOT)} ({len(rows)} unidades)")
    return rows


def load_rows() -> list[dict]:
    if CACHE_CSV.exists():
        with CACHE_CSV.open(encoding="utf-8") as f:
            return list(csv.DictReader(f))
    return download_and_filter()


def centroid(gens: list[dict]) -> list[float]:
    lat = sum(g["lat"] for g in gens) / len(gens)
    lng = sum(g["lng"] for g in gens) / len(gens)
    return [round(lat, 6), round(lng, 6)]


def convex_hull(points: list[tuple[float, float]]) -> list[list[float]]:
    pts = sorted(set(points))
    if len(pts) <= 2:
        return [[p[0], p[1]] for p in pts]

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    lower = []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    upper = []
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    hull = lower[:-1] + upper[:-1]
    return [[p[0], p[1]] for p in hull] + [[hull[0][0], hull[0][1]]]


def main() -> int:
    rows = load_rows()
    rooms_by_id = _load_rooms()
    occ = _load_occupancy()
    curve = _load_occupancy_curve()
    gens, excluded = [], Counter()
    n_real_rooms = 0
    for r in rows:
        cod = r.get("codigo_act", "")
        typ = classify(cod)
        if not typ:
            excluded[r.get("nombre_act", "")[:40]] += 1
            continue
        try:
            lat, lng = float(r["latitud"]), float(r["longitud"])
        except (ValueError, KeyError):
            continue
        staff = r.get("per_ocu", "")
        rooms = rooms_by_id.get(f"denue/{r['id']}") if typ == "hotel" else None
        if rooms:
            n_real_rooms += 1
        category = ""
        if typ == "comercio":
            gen, category = commerce_generation(cod, staff, r.get("nom_estab", ""))
            gen_lo = gen_hi = gen
            gm = "v2_category"
        else:
            gen, gen_lo, gen_hi = estimate_generation(typ, staff, rooms, occ, cod)
            if typ == "hotel" and rooms:
                gm = "v2_rooms"
            elif typ == "restaurante":
                gm = "v2_covers"
            else:
                gm = "v1_staff"
        covers = round(STAFF_MID.get(staff.strip(), 3) * _rest_meals(cod)) if typ == "restaurante" else 0
        gens.append({
            "id": f"denue/{r['id']}",
            "name": r.get("nom_estab") or f"({typ} sin nombre)",
            "type": typ,
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "generation": gen,
            "genLow": gen_lo,
            "genHigh": gen_hi,
            "rooms": rooms or 0,
            "covers": covers,
            "category": category,
            "gen_model": gm,
            "source": "denue",
            "staff": staff,
        })

    by_type = Counter(g["type"] for g in gens)
    print(f"✓ {len(gens)} generadores DENUE clasificados: " +
          ", ".join(f"{k}={v}" for k, v in sorted(by_type.items())))
    print(f"  ({sum(excluded.values())} unidades excluidas — fuera de hotel/restaurante/comercio)")
    hotel_gen = sum(g["generation"] for g in gens if g["type"] == "hotel")
    hotel_lo = sum(g["genLow"] for g in gens if g["type"] == "hotel")
    hotel_hi = sum(g["genHigh"] for g in gens if g["type"] == "hotel")
    print(f"  gen v2 hoteles: {n_real_rooms} con cuartos asignados "
          f"(reales Capa 3 + prior en la cola; ver prep_holbox_rooms) "
          f"(ocupación anual {occ:.1%}, {GUESTS_PER_ROOM} huésp/cuarto)")
    print(f"    banda kg/huésped-noche {KG_PER_GUEST_NIGHT_LOW}/{KG_PER_GUEST_NIGHT}/{KG_PER_GUEST_NIGHT_HIGH} → "
          f"{hotel_lo/1000:.1f} / {hotel_gen/1000:.1f} / {hotel_hi/1000:.1f} t/día (low/base/high)")
    rest = [g for g in gens if g["type"] == "restaurante"]
    rest_gen = sum(g["generation"] for g in rest)
    rest_lo = sum(g["genLow"] for g in rest)
    rest_hi = sum(g["genHigh"] for g in rest)
    rest_covers = sum(g["covers"] for g in rest)
    print(f"  gen v2 restaurantes: {len(rest)} unidades, {rest_covers} comidas-equiv/día "
          f"(comidas/día = staff × formato sub-SCIAN)")
    print(f"    banda kg/comida {KG_PER_MEAL_LOW}/{KG_PER_MEAL}/{KG_PER_MEAL_HIGH} → "
          f"{rest_lo/1000:.1f} / {rest_gen/1000:.1f} / {rest_hi/1000:.1f} t/día (low/base/high, a ocupación anual) "
          f"· acople turístico α={REST_COUPLING}")
    com = [g for g in gens if g["type"] == "comercio"]
    com_gen = sum(g["generation"] for g in com)
    incl_labels = {lbl for lbl, _ in INCLUDE_EXCLUDED.values()}
    n_incl = sum(1 for g in com if g.get("category") in incl_labels)
    food_labels = {"frutas y verduras", "carnes", "abarrotes", "minisúper",
                   "panificación", "tortillería", "pesca", "café tostado"}
    com_food = sum(g["generation"] for g in com if g.get("category") in food_labels)
    print(f"  gen v2 comercio: {len(com)} unidades (43/46 + {n_incl} orgánicos/institucionales de los excluidos) "
          f"→ {com_gen/1000:.1f} t/día (factor por categoría; ~{com_food/1000:.1f} t/día = alimento/orgánico)")
    big = sorted(com, key=lambda g: -g["generation"])[:6]
    print("    grandes generadores: " + " · ".join(
        f"{g['name'][:22].strip()} ({g['category']}, {g['generation']}kg)" for g in big))

    nondenue = load_nondenue(occ)
    if nondenue:
        nd_rooms = sum(g["rooms"] for g in nondenue)
        nd_gen = sum(g["generation"] for g in nondenue)
        print(f"  + {len(nondenue)} hoteles FUERA de DENUE (Overture+investigados): "
              f"{nd_rooms} cuartos → {nd_gen/1000:.1f} t/día (cierran gap 134→170 oficial)")

    boundary = convex_hull([(g["lat"], g["lng"]) for g in gens])
    center = centroid(gens)

    GEO_DIR.mkdir(parents=True, exist_ok=True)
    (GEO_DIR / "generators_denue.geojson").write_text(json.dumps({
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [g["lng"], g["lat"]]},
            "properties": {k: g[k] for k in ("id", "name", "type", "generation", "genLow", "genHigh", "rooms", "covers", "category", "gen_model", "source", "staff")},
        } for g in gens],
    }, ensure_ascii=False, indent=2))

    # Hoteles fuera de DENUE → geojson aparte (reconcile lo carrea al primary sin
    # contaminar las cuentas de reconciliación DENUE).
    nd_keys = ("id", "name", "type", "generation", "genLow", "genHigh", "rooms", "gen_model", "source", "offRegistry")
    (GEO_DIR / "generators_nondenue.geojson").write_text(json.dumps({
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [g["lng"], g["lat"]]},
            "properties": {k: g[k] for k in nd_keys},
        } for g in nondenue],
    }, ensure_ascii=False, indent=2))

    ts = (
        "// AUTO-GENERADO por scripts/geo/prep_holbox_denue.py — NO editar a mano.\n"
        "// Geodata REAL de Holbox desde el DENUE (INEGI, fuente oficial). Ubicaciones y\n"
        "// estrato de personal reales; generación (kg/día) = estrato × factor por tipo.\n"
        "import type { CaseGeo } from '../index';\n\n"
        "export const HOLBOX_GEO_DENUE: CaseGeo = "
        + json.dumps({
            "center": center,
            "zoom": 15,
            "synthetic": False,
            "boundary": boundary,
            "generators": gens,
            "occupancy": curve,
            "genBand": {
                "lowFactor": KG_PER_GUEST_NIGHT_LOW,
                "baseFactor": KG_PER_GUEST_NIGHT,
                "highFactor": KG_PER_GUEST_NIGHT_HIGH,
            },
            "restaurantCoupling": REST_COUPLING,
        }, ensure_ascii=False, indent=2)
        + ";\n"
    )
    TS_OUT.write_text(ts)

    # Meta a nivel-caso (occupancy estacional + banda kg) para que reconcile_holbox.py
    # lo carree al CaseGeo final (HOLBOX_GEO_RECONCILED es el que usa el StudyCase).
    (DATA_DIR / "holbox_case_meta.json").write_text(json.dumps({
        "occupancy": curve,
        "genBand": {
            "lowFactor": KG_PER_GUEST_NIGHT_LOW,
            "baseFactor": KG_PER_GUEST_NIGHT,
            "highFactor": KG_PER_GUEST_NIGHT_HIGH,
        },
        "restaurantCoupling": REST_COUPLING,
    }, ensure_ascii=False, indent=2))
    print(f"✓ Escrito: {GEO_DIR.relative_to(ROOT)}/generators_denue.geojson, {TS_OUT.name} y holbox_case_meta.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
