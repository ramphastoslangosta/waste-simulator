#!/usr/bin/env python3
"""prep_holbox_inventory.py — cierre del Track A0: inventario completo de generadores.

A0 preguntaba "que clases de generador no esta contando el bottom-up". La respuesta
no se construye ubicando mas puntos en el mapa: se construye declarando el UNIVERSO
de clases con su CONTROL TOTAL citable, y dejando que el bottom-up geoespacial haga
lo que un censo a pie no puede — ubicar, dimensionar y regenerar.

Es el mismo patron Capa 1 / Capa 2 que ya se uso con los cuartos de hotel (Sedetur
ancla el total, DENUE lo reparte), generalizado a todas las clases:

    control total (censo/registro oficial)  x  factor por clase (medicion local)
    -----------------------------------------------------------------------
    el bottom-up geo ubica un subconjunto; el residual se declara, no se omite

FUENTES DE CONTROL TOTAL
  - WP2E  = Holbox.WP2E.DocumentoMaestro.pdf (docs/), diagnostico de campo 2022.
            Tabla 3 (censo municipal 2019, 1,197 establecimientos + ~70 ambulantes
            + 544 viviendas con renta turistica), tabla 4 (proyeccion 2022).
  - AM20  = Alonzo-Marrufo (2020), recorrido de calles 2019: 930 generadores no
            domiciliarios y los factores kg/establecimiento/dia que usa el WP2E.
  - SED   = Sedetur QR "Como vamos en turismo", abr-2026: 170 hoteles / 2,341
            cuartos registrados + ocupacion mensual.
  - CEN   = INEGI, Censo de Poblacion y Vivienda 2020, ITER, localidad 23-007-0012.
  - DEN   = INEGI DENUE, recorte Holbox (571 unidades).

Salida: data/holbox_inventory.json  +  tabla de reconciliacion por stdout.

Uso:  python3 scripts/geo/prep_holbox_inventory.py [--year 2022|2026]
"""
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "scripts" / "geo" / "data"
GEO_DIR = ROOT / "src" / "studyCases" / "holbox" / "geo"
RESIDENTS_JSON = DATA_DIR / "holbox_residents.json"
SEDETUR_JSON = DATA_DIR / "sedetur_holbox.json"
OUT = DATA_DIR / "holbox_inventory.json"
TS_OUT = ROOT / "src" / "studyCases" / "holbox" / "inventory.ts"

# ─────────────────────────────────────────────────────────────────────────────
# Proyeccion 2022 → 2026
# ─────────────────────────────────────────────────────────────────────────────
# El WP2E proyecto 2019→2022 con la tasa de NACIMIENTO de negocios de INEGI
# (0.57%/mes comercio, 0.52%/mes servicios). Reproduce sus numeros exacto
# (418 x 1.0057^24 = 479 ~ 482; 149 x 1.0052^24 = 169 ~ 170), asi que el metodo
# esta verificado. Pero una tasa de nacimiento NO es crecimiento neto — no resta
# muertes — y componerla 7 anos la vuelve fantasia.
#
# Holbox tiene algo mejor: crecimiento NETO OBSERVADO. Sedetur conto 112 hoteles /
# 1,551 cuartos en 2021 y 170 / 2,341 en abr-2026. Eso es un CAGR medido de
# 8.6%/ano en cuartos (8.7% en hoteles) — local, oficial, neto de cierres.
#
# Los dos metodos se corroboran: natalidad da x1.28 a 4 anos, Sedetur medido da
# x1.39. La banda los usa como cotas en vez de elegir uno.
BIRTH_RATE = {"comercio": 0.0057, "servicios": 0.0052}   # INEGI DN 2019-2021, QRoo
SEDETUR_CAGR = 0.0858                                     # 1,551 → 2,341 cuartos, 2021→2026
PROJ_MONTHS = 48                                          # 2022 → 2026

_p_birth = (1 + BIRTH_RATE["servicios"]) ** PROJ_MONTHS   # 1.2818, cota conservadora
_p_sed = (1 + SEDETUR_CAGR) ** (PROJ_MONTHS / 12)         # 1.3903, medido
PROJ = {
    "low": _p_birth,
    "base": _p_sed,
    "high": _p_sed + (_p_sed - _p_birth),                 # simetrico sobre el medido
}
PROJ_2019 = {k: v * (1 + SEDETUR_CAGR) ** 3 for k, v in PROJ.items()}  # 2019 → 2026

BANDS = ("low", "base", "high")


def band(low: float, base: float, high: float) -> dict:
    return {"low": low, "base": base, "high": high}


def scale(counts: dict, factors: dict) -> dict:
    """kg/dia por banda = conteo x factor, emparejando low-low / base-base / high-high."""
    return {k: counts[k] * factors[k] for k in BANDS}


# ─────────────────────────────────────────────────────────────────────────────
# Factores kg/dia — medicion LOCAL cuando existe (AM20), literatura cuando no
# ─────────────────────────────────────────────────────────────────────────────
# AM20 midio en Holbox: 1.62 kg/cuarto/dia formal, 0.78 informal, 19.77 por negocio
# comercial, 38.5 por fonda, 114.2 por restaurante. El WP2E los aplica sobre cuartos
# y establecimientos DISPONIBLES (no ocupados) — o sea la ocupacion ya esta dentro.
F_ROOM_FORMAL = band(1.38, 1.62, 1.86)      # AM20 +/-15% (medicion puntual)
F_ROOM_INFORMAL = band(0.66, 0.78, 0.90)    # AM20 informal +/-15%
F_RESTAURANT = band(97.1, 114.2, 131.3)     # AM20 +/-15%
F_FONDA = band(32.7, 38.5, 44.3)            # AM20 +/-15%
F_COMERCIO = band(16.8, 19.77, 22.7)        # AM20 +/-15%
# Ambulante: sin medicion local. Un puesto de calle sin refrigeracion ni almacen
# genera una fraccion de un local establecido. Se ancla como fraccion del comercio.
F_AMBULANTE = band(5.0, 8.0, 12.0)
# Per-capita domiciliario. El WP2E uso 0.743 (SEMARNAT, Diagnostico Basico 2020,
# region SURESTE). El pipeline venia usando 0.90/1.00/1.10 anclado al promedio
# NACIONAL (~0.94) — 35% arriba de la cifra regional que el propio campo cito.
# Se corrige a la baja: el ancla regional es la buena y es la que el sinodo vera.
F_PER_CAPITA = band(0.743, 0.85, 1.00)

# ─────────────────────────────────────────────────────────────────────────────
# A0.4 — Barrido, limpieza de playa y poda
# ─────────────────────────────────────────────────────────────────────────────
# Driver duro del WP2E: "el barrido es manual y lo realizan 4 personas en total,
# 2 por cada lado de la isla" (rastrillo, escobas, bolsas, picos). El propio estudio
# declara: "Se desconoce la cantidad de residuos recolectados a traves del barrido".
# El Reglamento de Limpia municipal (art. 92 fr. I y art. 40 fr. I) fija el ALCANCE
# del servicio: barrido de calles, avenidas, jardines, parques, playas y humedales.
SWEEPERS = 4
KM_PER_SWEEPER = band(1.0, 1.3, 1.6)        # productividad barrido manual
KG_PER_KM = band(25.0, 45.0, 70.0)          # zona costera: arena, hoja, litter
# Poda y jardineria: el reglamento (art. 82) obliga a separar el organico de podas,
# o sea es flujo reconocido, pero no hay conteo ni presupuesto publicado.
PODA = band(50.0, 150.0, 300.0)             # kg/dia, banda ancha declarada
# Playa NO-sargazo: solo el frente urbano se limpia (~3 km de los 34 km de playa).
BEACH_KM = 3.0
BEACH_KG_PER_KM = band(10.0, 25.0, 50.0)

# ─────────────────────────────────────────────────────────────────────────────
# A0.5 — Day-trippers via ferry
# ─────────────────────────────────────────────────────────────────────────────
# Unico conteo duro: 308,000 visitantes en 2019 segun las navieras = 843/dia
# promedio, con picos de mas de 5,000 en un dia (AM20 via WP2E).
FERRY_2019_DAY = 843.0
FERRY_PEAK_DAY = 5000.0
# El 843/dia NO cuadra con el stock de cuartos: 2,341 cuartos Sedetur x 73.2% x 2
# huespedes = 3,427 huespedes/noche, que con estancia media de 3 noches exige
# ~417,000 llegadas/ano de pernocta sola — mas que el total de navieras. Holbox
# tiene dos lineas de ferry; lo mas probable es que el 308,000 sea de UNA. La cota
# alta duplica para cubrir esa hipotesis.
FERRY_ARRIVALS = band(FERRY_2019_DAY,
                      FERRY_2019_DAY * PROJ_2019["base"],
                      FERRY_2019_DAY * PROJ_2019["base"] * 2.0)
DAYTRIP_SHARE = band(0.20, 0.30, 0.40)
# Residual: la comida del excursionista YA esta contada en restaurantes/fondas.
# Solo se le atribuye lo que consume fuera del establecimiento: botella, empaque
# de conveniencia, residuo de playa. Frontera declarada, no negociable despues.
KG_PER_DAYTRIPPER = band(0.15, 0.25, 0.40)

# ─────────────────────────────────────────────────────────────────────────────
# A0.6 — Tour operadoras y lanchas
# ─────────────────────────────────────────────────────────────────────────────
# DENUE 5615* = 6 unidades (5 organizacion de excursiones + 1 agencia de viajes) y
# 4871*/4883* = 0: las cooperativas de lancheros no estan en el registro. La via
# oficial es el padron de permisionarios de CONANP (APFF Yum Balam / Reserva de la
# Biosfera Tiburon Ballena, DOF 2009) — no expone API ni descarga abierta; queda
# como solicitud documental, no como bloqueo.
BOATS_IN_SEASON = band(30, 60, 100)
PAX_PER_TOUR = band(8, 9, 10)
KG_PER_TOUR_PAX = band(0.30, 0.45, 0.60)
SEASON_DAYS = 153                            # may-sep, temporada de tiburon ballena

# ─────────────────────────────────────────────────────────────────────────────
# Control totales de conteo (WP2E tabla 3 = 2019, tabla 4 = 2022)
# ─────────────────────────────────────────────────────────────────────────────
CT_2022 = {
    "negocios_comerciales": 482,
    "posadas": 535,
    "hoteles": 83,
    "fondas": 170,
    "restaurantes": 99,
}
CT_2019 = {
    "ambulantes": 70,          # "sin contar los aproximadamente 70 negocios ambulantes"
    "viviendas_renta": 544,    # "se censaron alrededor de 544 viviendas"
    "cuartos_alojamiento": 3491,
}
CT_2022_ROOMS = 3708           # 618 establecimientos x ~6 cuartos, proyeccion WP2E
SEDETUR_2021_ROOMS = 1551      # base del CAGR observado

# Exclusiones por diseno — documentadas, no omitidas.
EXCLUSIONS = [
    ("sargazo", "Corriente distinta, estacional y masiva. Compite por la misma "
                "capacidad de recoleccion y disposicion pero no es RSU. Merece "
                "renglon propio en el diagnostico, no entrar al total."),
    ("rcd_construccion", "Residuo de construccion y demolicion. Holbox esta en boom "
                         "constructivo; el Reglamento de Limpia (art. 74) prohibe "
                         "mezclarlo con RSU. Flujo real, corriente distinta."),
    ("rpbi", "Residuo peligroso biologico-infeccioso de las 6 clinicas del DENUE. "
             "Marco normativo aparte (NOM-087)."),
    ("terminal_chiquila", "Fuera de la frontera del sistema. La terminal de ferry en "
                          "tierra firme genera, pero no es de la isla."),
    ("talleres", "7 talleres del DENUE: generan residuo de manejo especial "
                 "(aceite, filtros, llantas), no RSU municipal."),
    ("servicios_peso_cero", "Inmobiliarias, banca, religiosas, alquiler de bicis y "
                            "carritos (17 u). Empaque marginal."),
]


def load_json(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def load_geo_located() -> dict:
    """Cuantas unidades y cuanta masa ubica hoy el bottom-up geoespacial, por tipo.
    Es el numerador de la cobertura: control total = universo, geo = lo localizado."""
    out = defaultdict(lambda: {"units": 0, "rooms": 0, "kg": 0.0})
    for fn in ("generators_denue.geojson", "generators_nondenue.geojson"):
        f = GEO_DIR / fn
        if not f.exists():
            continue
        for ft in json.loads(f.read_text(encoding="utf-8"))["features"]:
            p = ft["properties"]
            t = out[p["type"]]
            t["units"] += 1
            t["rooms"] += p.get("rooms", 0) or 0
            t["kg"] += p.get("generation", 0)
    return dict(out)


def build(year: int) -> dict:
    residents = load_json(RESIDENTS_JSON)
    sedetur = load_json(SEDETUR_JSON)
    geo = load_geo_located()

    proj = PROJ if year == 2026 else {k: 1.0 for k in BANDS}
    proj19 = PROJ_2019 if year == 2026 else {k: (1 + SEDETUR_CAGR) ** 3 for k in BANDS}
    # Sedetur (abr-2026) y el DENUE (snapshot 2025) son entradas NATIVAS de 2026. La
    # corrida de 2022 existe para validar el marco contra el estudio de campo, asi que
    # ambas se retro-proyectan con el mismo CAGR observado; de lo contrario se compara
    # un stock de 2026 contra una medicion de 2022.
    back = 1.0 if year == 2026 else (1 + SEDETUR_CAGR) ** -4
    sed_rooms = round(sedetur.get("cuartos", 2341) * back)
    sed_hotels = round(sedetur.get("hoteles", 170) * back)

    classes = []

    # ── 1. Residencial (A0.1) ────────────────────────────────────────────────
    censo = residents.get("censo_2020", {})
    pobtot = censo.get("pobtot", 1841)
    ocupados = censo.get("pob_ocupada", 1232)
    empleos_raw = residents.get("empleo_denue", {}).get("empleos",
                                                        {"low": 2126, "base": 3848, "high": 5640})
    empleos = {k: empleos_raw[k] * back for k in BANDS}
    # Poblacion censada por banda. El censo 2020 es el piso duro; el WP2E estimo
    # 2,673 para 2022 con padron electoral + matricula escolar (metodo local
    # independiente); la cota alta proyecta ese 2022 al ano objetivo.
    pob_censada = band(pobtot, 2673.0, 2673.0 * proj["base"]) if year == 2026 \
        else band(pobtot, 2673.0, 2673.0)
    # Tasa de ocupacion observada en el censo — se sostiene al proyectar.
    tasa_ocup = ocupados / pobtot if pobtot else 0.669
    # El trabajador no censado = empleos del DENUE (snapshot 2025, ya vigente)
    # menos los residentes que ya trabajan. Supuesto conservador: llega solo.
    flotante = {k: max(0.0, empleos[k] - pob_censada[k] * tasa_ocup) for k in BANDS}
    pob_generadora = {k: pob_censada[k] + flotante[k] for k in BANDS}
    classes.append({
        "id": "residencial", "bucket": "homes", "units_countable": True, "task": "A0.1", "status": "corregido",
        "label": "Poblacion residente (censada + flotante de trabajo)",
        "driver": "habitantes x kg/hab/dia",
        "counts": pob_generadora,
        "factors": F_PER_CAPITA,
        "gen_kg": scale(pob_generadora, F_PER_CAPITA),
        "geo_located_units": None,
        "seasonality": "flat",
        "sources": ["CEN (ITER 2020, loc. 23-007-0012)", "DEN (empleo por estrato)",
                    "WP2E (2,673 hab 2022 via padron electoral + matricula)",
                    "SEMARNAT Diagnostico Basico 2020, region Sureste (0.743 kg/hab/dia)"],
        "detail": {"pob_censada": pob_censada, "trabajadores_no_censados": flotante,
                   "tasa_ocupacion_censo": round(tasa_ocup, 4)},
        "notes": [
            "El heredado 'fixedPopulation: 2673' esta atribuido al Censo 2020 en "
            "holbox-historical-data.csv, pero el censo da 1,841. El 2,673 SI existe: "
            "es la estimacion 2022 del WP2E por padron electoral + matricula. La "
            "atribucion del CSV es lo que esta mal, no el numero.",
            "El per-capita baja de 0.90/1.00/1.10 a 0.743/0.85/1.00: el ancla correcta "
            "es SEMARNAT region Sureste (0.743), no el promedio nacional. Correccion "
            "a la BAJA de ~15% en la base.",
        ],
    })

    # ── 2. Hospedaje formal registrado ───────────────────────────────────────
    rooms_formal = band(sed_rooms, sed_rooms, sed_rooms)   # medido, no se proyecta
    classes.append({
        "id": "hospedaje_formal", "bucket": "hotels", "units_countable": True, "task": "A2", "status": "modelado",
        "label": f"Hospedaje formal registrado ({sed_hotels} hoteles)",
        "driver": "cuartos registrados x kg/cuarto/dia (ocupacion ya dentro del factor)",
        "counts": rooms_formal, "factors": F_ROOM_FORMAL,
        "gen_kg": scale(rooms_formal, F_ROOM_FORMAL),
        "geo_located_units": geo.get("hotel", {}).get("rooms", 0),
        "coverage": {"label": "Hospedaje formal (cuartos ubicados)",
                     "universe": sed_rooms, "unit": "cuartos"},
        "seasonality": "sedetur",
        "sources": ["SED (abr-2026)", "AM20 (1.62 kg/cuarto/dia formal)"],
        "notes": [
            "Sedetur abr-2026 es conteo oficial vigente: no se proyecta.",
            "CONFLICTO DE FACTOR: el modelo v2 del geo asume 2.0 kg/huesped-noche x "
            "2 huesp/cuarto x 73.2% ocupacion = 2.93 kg/cuarto/dia, 1.8x la unica "
            "medicion local disponible (AM20, 1.62). Decidir en A1 cual gobierna.",
        ],
    })

    # ── 3. Hospedaje informal en establecimiento (posadas no registradas) ────
    rooms_muni = {k: CT_2022_ROOMS * proj[k] for k in BANDS}
    rooms_informal = {k: max(0.0, rooms_muni[k] - sed_rooms) for k in BANDS}
    classes.append({
        "id": "hospedaje_informal", "bucket": "hotels", "units_countable": True, "task": "A0.3", "status": "nuevo_A0",
        "label": "Hospedaje informal en establecimiento (posadas no registradas)",
        "driver": "cuartos del censo municipal menos los registrados en Sedetur",
        "counts": rooms_informal, "factors": F_ROOM_INFORMAL,
        "gen_kg": scale(rooms_informal, F_ROOM_INFORMAL),
        "geo_located_units": None,
        "seasonality": "sedetur",
        "sources": [f"WP2E tabla 4 ({CT_2022['posadas']} posadas + {CT_2022['hoteles']} "
                    f"hoteles = {CT_2022_ROOMS} cuartos 2022)", "SED", "AM20 (0.78 informal)"],
        "notes": [
            "El censo municipal cuenta el universo (formal + informal); Sedetur solo "
            "el registrado. El residual es el informal — resta, no suma nueva.",
            "AM20 estimo ~1,000 cuartos informales publicados en sitios web en 2019: "
            "corrobora el orden de magnitud por una via independiente.",
        ],
    })

    # ── 4. Renta vacacional en vivienda particular (A0.3) ────────────────────
    # 544 viviendas censadas, "entre 1 y 2 cuartos" cada una. Es la clase que el
    # DENUE ve como 2 unidades (721312) — subregistro de tres ordenes.
    rooms_vivienda = {
        "low": CT_2019["viviendas_renta"] * 1.0,
        "base": CT_2019["viviendas_renta"] * 1.5 * proj19["base"],
        "high": CT_2019["viviendas_renta"] * 2.0 * proj19["high"],
    }
    classes.append({
        "id": "renta_vacacional", "bucket": "hotels", "units_countable": True, "task": "A0.3", "status": "nuevo_A0",
        "label": "Renta vacacional en vivienda particular (Airbnb/VRBO)",
        "driver": "viviendas censadas x cuartos/vivienda x kg/cuarto/dia informal",
        "counts": rooms_vivienda, "factors": F_ROOM_INFORMAL,
        "gen_kg": scale(rooms_vivienda, F_ROOM_INFORMAL),
        "geo_located_units": 2,
        "coverage": {"label": "Renta vacacional (viviendas)",
                     "universe": CT_2019["viviendas_renta"] * proj19["base"],
                     "unit": "viviendas"},
        "seasonality": "sedetur",
        "sources": [f"WP2E ({CT_2019['viviendas_renta']} viviendas censadas 2019, "
                    "1-2 cuartos c/u)", "AM20 (0.78 kg/cuarto/dia informal)"],
        "notes": [
            "El DENUE registra 2 unidades bajo 721312. El censo municipal encontro "
            "544 viviendas. Subregistro de tres ordenes de magnitud.",
            "No hay doble conteo con las 17 unidades 7213* del DENUE: esas son "
            "pensiones/casas de huespedes (establecimiento), no vivienda particular, "
            "y entran en el conteo municipal de posadas.",
            "Cota baja deliberadamente plana (1 cuarto, sin proyectar): es el piso "
            "duro del censo 2019.",
        ],
    })

    # ── 5. Restaurantes ──────────────────────────────────────────────────────
    n_rest = {k: CT_2022["restaurantes"] * proj[k] for k in BANDS}
    n_fondas = {k: CT_2022["fondas"] * proj[k] for k in BANDS}
    classes.append({
        "id": "restaurantes", "bucket": "restaurants", "units_countable": True, "task": "A0.2", "status": "modelado",
        "label": "Restaurantes", "driver": "establecimientos x kg/establecimiento/dia",
        "counts": n_rest, "factors": F_RESTAURANT,
        "gen_kg": scale(n_rest, F_RESTAURANT),
        "geo_located_units": geo.get("restaurante", {}).get("units", 0),
        # El bucket 722* del geo no distingue restaurante de fonda: su cobertura se
        # mide contra el universo de alimentos completo, no contra los restaurantes.
        "coverage": {"label": "Alimentos (restaurantes + fondas, bucket 722* del geo)",
                     "universe": n_rest["base"] + n_fondas["base"], "unit": "u"},
        "seasonality": "restaurant_coupling",
        "sources": ["WP2E tabla 4 (99 u 2022)", "AM20 (114.2 kg/est/dia)"],
        "notes": [
            "El bottom-up geo mete restaurantes Y fondas en un solo bucket de 149 "
            "unidades 722*. El control total los separa: son dos clases con factores "
            "que difieren 3x.",
        ],
    })

    # ── 6. Fondas (clase NUEVA — el modelo geo no la tenia) ──────────────────
    classes.append({
        "id": "fondas", "bucket": "restaurants", "units_countable": True, "task": "A0.2-h4", "status": "nuevo_A0",
        "label": "Fondas (cocina economica)",
        "driver": "establecimientos x kg/establecimiento/dia",
        "counts": n_fondas, "factors": F_FONDA,
        "gen_kg": scale(n_fondas, F_FONDA),
        "geo_located_units": None,
        "seasonality": "restaurant_coupling",
        "sources": ["WP2E tabla 4 (170 u 2022)", "AM20 (38.5 kg/est/dia)"],
        "notes": [
            "Clase que el modelo geo nunca tuvo. El campo la separa de restaurante "
            "porque el factor es 3x menor (38.5 vs 114.2).",
            "Es el tipo de establecimiento que un registro administrativo ve peor: "
            "informal, familiar, sin razon social.",
        ],
    })

    # ── 7. Comercio establecido ──────────────────────────────────────────────
    n_com = {k: CT_2022["negocios_comerciales"] * proj[k] for k in BANDS}
    classes.append({
        "id": "comercio", "bucket": "commerce", "units_countable": True, "task": "A0.2", "status": "modelado",
        "label": "Negocios comerciales establecidos",
        "driver": "establecimientos x kg/establecimiento/dia",
        "counts": n_com, "factors": F_COMERCIO,
        "gen_kg": scale(n_com, F_COMERCIO),
        "geo_located_units": geo.get("comercio", {}).get("units", 0),
        "seasonality": "flat",
        "sources": ["WP2E tabla 4 (482 u 2022)", "AM20 (19.77 kg/est/dia)"],
        "notes": [
            "El factor del geo por categoria sub-SCIAN (19.30 kg/u/dia promedio) "
            "coincide con el del campo (19.77) al 2.4%, construidos de forma "
            "independiente. El factor esta validado; el gap era 100% conteo.",
        ],
    })

    # ── 8. Comercio ambulante (clase NUEVA) ──────────────────────────────────
    n_amb = {k: CT_2019["ambulantes"] * proj19[k] for k in BANDS}
    classes.append({
        "id": "ambulantes", "bucket": "commerce", "units_countable": True, "task": "A0.2", "status": "nuevo_A0",
        "label": "Comercio ambulante",
        "driver": "puestos x kg/puesto/dia",
        "counts": n_amb, "factors": F_AMBULANTE,
        "gen_kg": scale(n_amb, F_AMBULANTE),
        "geo_located_units": 0,
        "seasonality": "sedetur",
        "sources": ["WP2E (~70 negocios ambulantes 2019, FUERA de los 1,197)"],
        "notes": [
            "El WP2E los excluye explicitamente del 1,197 y nunca los suma al total. "
            "Es masa que ni el campo ni el geo estaban contando.",
            "Sin medicion local del factor: se ancla como fraccion de un local "
            "establecido (sin refrigeracion ni almacen). Banda ancha declarada.",
        ],
    })

    # ── 9. Barrido, playa y poda (A0.4, clase NUEVA) ─────────────────────────
    barrido = {k: SWEEPERS * KM_PER_SWEEPER[k] * KG_PER_KM[k] for k in BANDS}
    playa = {k: BEACH_KM * BEACH_KG_PER_KM[k] for k in BANDS}
    servicio = {k: barrido[k] + playa[k] + PODA[k] for k in BANDS}
    classes.append({
        "id": "servicio_limpia", "bucket": "commerce", "units_countable": False, "task": "A0.4", "status": "nuevo_A0",
        "label": "Barrido de calles, limpieza de playa y poda",
        "driver": "barrenderos x km/dia x kg/km  +  frente de playa  +  poda",
        "counts": band(SWEEPERS, SWEEPERS, SWEEPERS), "factors": None,
        "gen_kg": servicio,
        "geo_located_units": None,
        "seasonality": "flat",
        "sources": ["WP2E (barrido manual, 4 personas, 2 por lado de la isla)",
                    "Reglamento de Limpia municipal, art. 92 fr. I y art. 40 fr. I "
                    "(alcance: calles, avenidas, jardines, parques, playas, humedales)",
                    "Reglamento art. 82 (obligacion de separar organico de podas)"],
        "detail": {"barrido_kg": barrido, "playa_kg": playa, "poda_kg": PODA},
        "notes": [
            "REVISION A LA BAJA: el a-priori del plan era 1.0-2.5 t/d. Con el driver "
            "real (4 barrenderos manuales) la clase pesa ~0.5 t/d. El a-priori venia "
            "de un porcentaje tipico del total, no de la operacion observada.",
            "El WP2E declara: 'Se desconoce la cantidad de residuos recolectados a "
            "traves del barrido manual'. Esta clase es estimacion por driver, no "
            "medicion — la mas debil del inventario.",
            "SARGAZO EXCLUIDO: corriente aparte, ver exclusiones.",
        ],
    })

    # ── 10. Day-trippers via ferry (A0.5, clase NUEVA) ───────────────────────
    daytrippers = {k: FERRY_ARRIVALS[k] * DAYTRIP_SHARE[k] for k in BANDS}
    classes.append({
        "id": "day_trippers", "bucket": "commerce", "units_countable": False, "task": "A0.5", "status": "nuevo_A0",
        "label": "Excursionistas via ferry (residual, sin pernocta)",
        "driver": "llegadas de ferry x fraccion sin pernocta x kg residual/persona",
        "counts": daytrippers, "factors": KG_PER_DAYTRIPPER,
        "gen_kg": scale(daytrippers, KG_PER_DAYTRIPPER),
        "geo_located_units": None,
        "seasonality": "sedetur",
        "sources": ["WP2E/AM20 (308,000 visitantes 2019 segun navieras = 843/dia, "
                    "picos >5,000/dia)"],
        "detail": {"llegadas_ferry_dia": FERRY_ARRIVALS,
                   "pico_historico_dia": FERRY_PEAK_DAY},
        "notes": [
            "FRONTERA DECLARADA: la comida del excursionista ya esta contada en "
            "restaurantes y fondas. Solo se le atribuye el residual de consumo fuera "
            "del establecimiento (botella, empaque, residuo de playa).",
            "INCONSISTENCIA DETECTADA: 843 llegadas/dia no cuadra con el stock de "
            "cuartos (2,341 Sedetur x 73.2% x 2 huesp = 3,427 huespedes/noche, que a "
            "3 noches de estancia exige ~417,000 llegadas/ano de pernocta sola, mas "
            "que el total reportado). Holbox opera dos lineas de ferry; lo mas "
            "probable es que el 308,000 sea de una sola. La cota alta duplica.",
            "REVISION A LA BAJA: a-priori 0.5-1.5 t/d; con el residual declarado la "
            "clase pesa ~0.1 t/d en la base.",
            "SOLAPE con tour operadoras: buena parte del excursionista viene al tour "
            "de tiburon ballena. No sumar ambos sin descontar.",
        ],
    })

    # ── 11. Tour operadoras y lanchas (A0.6, clase NUEVA) ────────────────────
    pax_season = {k: BOATS_IN_SEASON[k] * PAX_PER_TOUR[k] for k in BANDS}
    tours_season_kg = {k: pax_season[k] * KG_PER_TOUR_PAX[k] for k in BANDS}
    tours_annual_kg = {k: v * SEASON_DAYS / 365.0 for k, v in tours_season_kg.items()}
    classes.append({
        "id": "tour_operadoras", "bucket": "commerce", "units_countable": False, "task": "A0.6", "status": "nuevo_A0",
        "label": "Tour operadoras y lanchas (tiburon ballena)",
        "driver": "lanchas en temporada x pax/tour x kg/pax, anualizado",
        "counts": pax_season, "factors": KG_PER_TOUR_PAX,
        "gen_kg": tours_annual_kg,
        "geo_located_units": 6,
        "coverage": {"label": "Tour operadoras (embarcaciones en temporada)",
                     "universe": BOATS_IN_SEASON["base"], "unit": "lanchas"},
        "seasonality": "whale_shark",
        "sources": ["DEN 5615* (6 unidades: 5 organizacion de excursiones + 1 agencia)",
                    "CONANP APFF Yum Balam / Reserva Tiburon Ballena (DOF 2009) — "
                    "padron de permisionarios, pendiente por solicitud documental"],
        "detail": {"gen_en_temporada_kg": tours_season_kg,
                   "dias_temporada": SEASON_DAYS,
                   "meses_temporada": "mayo-septiembre"},
        "notes": [
            "Revierte una exclusion mal hecha: se habian tierizado como 'peso ~cero'. "
            "Un tour mueve box lunch, botellas y equipo para ~10 pax y el residuo "
            "regresa a la isla.",
            "DENUE registra 6 unidades y 0 bajo 4871*/4883*: las cooperativas de "
            "lancheros no estan en el registro. CONANP es el unico conteo duro y no "
            "expone API — solicitud documental, no bloqueo.",
            "Fuertemente estacional: en temporada pesa ~2.4x el promedio anual.",
        ],
    })

    # ── Totales ──────────────────────────────────────────────────────────────
    totals = {k: sum(c["gen_kg"][k] for c in classes) / 1000.0 for k in BANDS}
    nuevos = {k: sum(c["gen_kg"][k] for c in classes if c["status"] == "nuevo_A0") / 1000.0
              for k in BANDS}
    geo_total_kg = sum(v["kg"] for v in geo.values())

    return {
        "case": "holbox",
        "target_year": year,
        "occupancy_ref": round(sedetur.get("ocupacion_prom", 73.2) / 100.0, 4),
        "generated_by": "scripts/geo/prep_holbox_inventory.py (cierre Track A0)",
        "projection": {
            "months": PROJ_MONTHS if year == 2026 else 0,
            "factors": PROJ if year == 2026 else {k: 1.0 for k in BANDS},
            "method_low": "tasa de nacimiento de negocios INEGI (0.52%/mes servicios), "
                          "el metodo del propio WP2E",
            "method_base": f"CAGR observado de Sedetur {SEDETUR_CAGR:.2%}/ano "
                           f"({SEDETUR_2021_ROOMS} cuartos 2021 -> {sed_rooms} en abr-2026), "
                           "crecimiento NETO medido y local",
            "note": "Los dos metodos se corroboran: x1.28 vs x1.39 a 4 anos. Una tasa "
                    "de nacimiento no resta cierres, asi que el CAGR medido gobierna "
                    "la base y la natalidad queda como cota conservadora.",
        },
        "classes": classes,
        "totals_t_dia": totals,
        "nuevas_clases_A0_t_dia": nuevos,
        "geo_bottom_up_actual_t_dia": round(geo_total_kg / 1000.0, 2),
        "witnesses": {
            "campo_wp2e_2022_t_dia": 34.8,
            "estacion_transferencia_t_dia": [20, 25],
            "estacion_transferencia_fuente": "Nomadas (2022) via WP2E: 'Entre 20 y 25 "
                                             "toneladas diarias se reportan llegan a la ET'",
            "cobertura_hogares": 0.80,
            "cobertura_fuente": "AM20 via WP2E: ~80% de los hogares recibian el servicio",
        },
        "exclusions": [{"id": i, "reason": r} for i, r in EXCLUSIONS],
    }


def report(inv: dict) -> None:
    y = inv["target_year"]
    print(f"\n{'='*78}")
    print(f"INVENTARIO DE GENERADORES — Holbox {y}   (cierre Track A0)")
    print(f"{'='*78}\n")
    print(f"{'clase':<42}{'low':>10}{'base':>10}{'high':>10}   t/dia")
    print("-" * 78)
    for c in inv["classes"]:
        g = c["gen_kg"]
        flag = "  NUEVA" if c["status"] == "nuevo_A0" else ""
        print(f"{c['label'][:41]:<42}"
              f"{g['low']/1000:>10.2f}{g['base']/1000:>10.2f}{g['high']/1000:>10.2f}{flag}")
    print("-" * 78)
    t = inv["totals_t_dia"]
    n = inv["nuevas_clases_A0_t_dia"]
    print(f"{'TOTAL':<42}{t['low']:>10.2f}{t['base']:>10.2f}{t['high']:>10.2f}")
    print(f"{'  de las cuales clases nuevas de A0':<42}"
          f"{n['low']:>10.2f}{n['base']:>10.2f}{n['high']:>10.2f}")

    # Cobertura: que fraccion del universo ubica hoy el bottom-up geoespacial. Lo que
    # no ubica NO desaparece del total — entra como residual declarado.
    print(f"\n{'COBERTURA DEL BOTTOM-UP (ubicado / universo)':<42}")
    print("-" * 78)
    print(f"{'clase':<42}{'ubicado':>10}{'universo':>10}{'cobertura':>12}")
    for c in inv["classes"]:
        loc = c.get("geo_located_units")
        if loc is None:
            continue
        cov = c.get("coverage") or {}
        uni = cov.get("universe", c["counts"]["base"])
        unit = cov.get("unit", "u")
        label = cov.get("label", c["label"])
        pct = f"{loc/uni:.0%}" if uni else "-"
        print(f"{label[:41]:<42}{loc:>10,.0f}{uni:>10,.0f}{pct:>12}  {unit}")

    w = inv["witnesses"]
    print(f"\n{'TESTIGOS INDEPENDIENTES':<42}")
    print("-" * 78)
    print(f"{'  bottom-up geo actual (lo que ubica el mapa)':<50}"
          f"{inv['geo_bottom_up_actual_t_dia']:>8.2f} t/dia")
    print(f"{'  estimacion de campo WP2E 2022':<50}{w['campo_wp2e_2022_t_dia']:>8.2f} t/dia")
    print(f"{'  MEDIDO en estacion de transferencia (Nomadas 2022)':<50}"
          f"{w['estacion_transferencia_t_dia'][0]:>5}-{w['estacion_transferencia_t_dia'][1]} t/dia")
    cap_lo = w["estacion_transferencia_t_dia"][0] / t["base"]
    cap_hi = w["estacion_transferencia_t_dia"][1] / t["base"]
    print(f"\n  captura implicita (recolectado / generado, base): {cap_lo:.0%}-{cap_hi:.0%}")
    print(f"  cobertura de hogares reportada: {w['cobertura_hogares']:.0%}")

    print(f"\n{'EXCLUIDOS POR DISENO':<42}")
    print("-" * 78)
    for e in inv["exclusions"]:
        print(f"  - {e['id']}")
    print()


def emit_ts(inv: dict) -> None:
    """Emite el inventario como CaseInventory tipado para que el motor lo consuma.
    Mismo patron que prep_holbox_denue.py: el prep es la unica fuente de verdad y el
    .ts es artefacto generado. Se recorta a lo que la proyeccion necesita — la prosa
    (notas, caveats, fuentes) se queda en el JSON y no viaja al bundle."""
    keep = ("id", "task", "status", "label", "driver", "bucket", "units_countable",
            "counts", "gen_kg", "seasonality")
    payload = {
        "case": inv["case"],
        "targetYear": inv["target_year"],
        # Los factores kg/cuarto/dia traen la ocupacion DENTRO (se midieron sobre
        # cuartos disponibles). El motor en cambio multiplica por ocupacion, asi que
        # la proyeccion tiene que dividir por esta referencia para no contarla dos veces.
        "occupancyRef": inv["occupancy_ref"],
        "classes": [{k: c[k] for k in keep} for c in inv["classes"]],
        "totals": inv["totals_t_dia"],
        "witnesses": inv["witnesses"],
    }
    ts = (
        "// AUTO-GENERADO por scripts/geo/prep_holbox_inventory.py — NO editar a mano.\n"
        "// Inventario de generadores por CONTROL TOTAL (cierre del Track A0). Cada clase\n"
        "// declara a que bucket del motor va y si su conteo es sumable como `units`.\n"
        "import type { CaseInventory } from '../deriveInputs';\n\n"
        "export const HOLBOX_INVENTORY: CaseInventory = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n"
    )
    TS_OUT.parent.mkdir(parents=True, exist_ok=True)
    TS_OUT.write_text(ts, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--year", type=int, default=2026, choices=(2022, 2026))
    args = ap.parse_args()
    inv = build(args.year)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(inv, indent=2, ensure_ascii=False), encoding="utf-8")
    emit_ts(inv)
    report(inv)
    print(f"-> {OUT.relative_to(ROOT)}")
    print(f"-> {TS_OUT.relative_to(ROOT)}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
