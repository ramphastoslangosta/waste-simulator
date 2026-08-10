#!/usr/bin/env python3
"""prep_holbox_rooms.py — Capa 1+2 del inventario de CUARTOS de hotel (Holbox).

El DENUE NO trae número de cuartos (solo estrato de personal `per_ocu`). El modelo
de generación de residuo para hoteles necesita cuartos × ocupación, así que aquí
construimos un PRIOR per-hotel de cuartos, anclado a un CONTROL TOTAL oficial.

Pipeline (capas):
  Capa 1  Control total oficial   — # de cuartos de Holbox según DATATUR/Sedetur/INEGI.
  Capa 2  Prior per-hotel         — reparte el control total sobre los hoteles DENUE
                                    según un peso de tamaño = estrato × factor sub-SCIAN.
  Capa 3  Extracción internet     — cuartos REALES top-N (Booking/TripAdvisor/oficial),
                                    en holbox_rooms_manual.csv (override por nombre DENUE).
  Capa 4  Curaduría manual        — mismo archivo de override; se edita a mano.

Este script hace Capa 1+2+3: aplica los overrides reales de Capa 3/4 y REDISTRIBUYE el
residual del control total sobre los hoteles NO curados (por su peso de tamaño). Así el
top queda anclado a datos reales y el prior solo llena la cola.

Salidas:
  - scripts/geo/data/holbox_hotel_inventory.csv   (inventario curable)
  - imprime la reconciliación contra el control total

Uso:  python3 scripts/geo/prep_holbox_rooms.py
"""
from __future__ import annotations
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DENUE_CSV = ROOT / "scripts" / "geo" / "data" / "denue_holbox.csv"
SEDETUR_JSON = ROOT / "scripts" / "geo" / "data" / "sedetur_holbox.json"
MANUAL_CSV = ROOT / "scripts" / "geo" / "data" / "holbox_rooms_manual.csv"
OUT_CSV = ROOT / "scripts" / "geo" / "data" / "holbox_hotel_inventory.csv"


def _load_manual() -> dict[str, dict]:
    """Capa 3/4: overrides de cuartos reales, keyed por nombre DENUE (upper)."""
    if not MANUAL_CSV.exists():
        return {}
    out = {}
    for r in csv.DictReader(MANUAL_CSV.open(encoding="utf-8")):
        rooms = (r.get("rooms") or "").strip()
        if not rooms:
            continue
        out[(r["name"] or "").strip().upper()] = {
            "rooms": int(rooms),
            "source": (r.get("source") or "web").strip(),
            "confidence": (r.get("confidence") or "").strip(),
        }
    return out

# ── Capa 1: CONTROL TOTAL oficial ────────────────────────────────────────────
# Cuartos de hospedaje en Holbox — fuente OFICIAL viva: Sedetur QR "¿Cómo vamos
# en turismo?" (extraído por prep_sedetur.py → sedetur_holbox.json, auto-actualizable).
# La INEGI API NO expone inventario de hospedaje; el cuadroentidad es app JS no headless.
# Fallback al último dato confirmado si el JSON no está.
_FALLBACK_ROOMS, _FALLBACK_HOTELS = 2341, 170  # Sedetur reporte 2026-04


def _load_control() -> tuple[int, int, str]:
    if SEDETUR_JSON.exists():
        d = json.loads(SEDETUR_JSON.read_text())
        if d.get("cuartos"):
            return d["cuartos"], d.get("hoteles") or _FALLBACK_HOTELS, d.get("report_ym", "?")
    return _FALLBACK_ROOMS, _FALLBACK_HOTELS, "fallback"


CONTROL_TOTAL_ROOMS, CONTROL_TOTAL_HOTELS_OFICIAL, CONTROL_SRC_YM = _load_control()

# Estrato de personal (DENUE) → punto medio de empleados (señal de tamaño).
STAFF_MID = {
    "0 a 5 personas": 3,
    "6 a 10 personas": 8,
    "11 a 30 personas": 20,
    "31 a 50 personas": 40,
    "51 a 100 personas": 75,
    "101 a 250 personas": 175,
    "251 y más personas": 300,
}

# Factor de "cuartos por unidad de tamaño" según sub-SCIAN (tipología de hospedaje).
# Los hoteles integrados concentran más cuartos por empleado que una pensión.
SUBSCIAN = {
    "721111": ("Hotel con servicios integrados", 1.30),
    "721112": ("Hotel sin servicios integrados", 1.00),
    "721190": ("Cabañas, villas y similares", 0.80),
    "721311": ("Pensiones y casas de huéspedes", 0.50),
    "721312": ("Departamentos amueblados", 0.60),
    "721210": ("Campamentos y albergues", 0.40),
}

# Nombres que delatan mala clasificación DENUE (no son hospedaje) → fuera del reparto.
SUSPICIOUS = ("RESTAURANTE", "INMOBILIARIA", "BAR ")


def main() -> int:
    rows = list(csv.DictReader(DENUE_CSV.open(encoding="utf-8")))
    hotels = [r for r in rows if r.get("codigo_act", "").startswith("721")]

    inventory, flagged = [], []
    for r in hotels:
        name = (r.get("nom_estab") or "").strip()
        cod = r.get("codigo_act", "")
        desc, mult = SUBSCIAN.get(cod, ("(sub-SCIAN 721 otro)", 1.0))
        strata = (r.get("per_ocu") or "").strip()
        weight = STAFF_MID.get(strata, 3) * mult
        suspicious = any(s in name.upper() for s in SUSPICIOUS)
        rec = {
            "id": f"denue/{r['id']}",
            "name": name,
            "subscian": cod,
            "subscian_desc": desc,
            "strata": strata,
            "lat": r.get("latitud", ""),
            "lng": r.get("longitud", ""),
            "weight": round(weight, 2),
            "suspicious": "SÍ" if suspicious else "",
        }
        (flagged if suspicious else inventory).append(rec)

    # ── Capa 3/4: aplicar overrides de cuartos REALES ────────────────────────
    manual = _load_manual()
    n_curated = 0
    for r in inventory:
        m = manual.get(r["name"].upper())
        if m:
            r["rooms_manual"] = m["rooms"]
            r["rooms_source"] = m["source"]
            r["_curated"] = True
            n_curated += 1
        else:
            r["rooms_manual"] = ""
            r["rooms_source"] = "prior"
            r["_curated"] = False

    # ── Capa 2: prior por peso de tamaño (distribución del control total) ──────
    # El prior reparte el control total oficial sobre TODOS los hoteles DENUE por
    # su peso de tamaño. Es la señal de contraste; NO se rescala para absorber el
    # faltante de los curados (eso reinfla la cola de forma indefendible).
    total_w = sum(r["weight"] for r in inventory) or 1
    for r in inventory:
        r["rooms_prior"] = max(1, round(CONTROL_TOTAL_ROOMS * r["weight"] / total_w))

    # rooms_final = real curado (Capa 3) donde lo hay; si no, el prior de estrato.
    # El total FLOTA por debajo del oficial: la Capa 3 reveló que el proxy de
    # estrato sobreestima ~2x el top (637 real vs 1333 prior en los 24 curados);
    # además DENUE sólo ve 134 de los 170 hoteles oficiales. El gap se reporta.
    for r in inventory:
        r["rooms_final"] = int(r["rooms_manual"]) if r["_curated"] else r["rooms_prior"]

    curated_rooms = sum(int(r["rooms_manual"]) for r in inventory if r["_curated"])
    curated_prior = sum(r["rooms_prior"] for r in inventory if r["_curated"])
    final_total = sum(r["rooms_final"] for r in inventory)
    residual = final_total - curated_rooms  # cuartos aportados por la cola (prior)

    inventory.sort(key=lambda r: r["rooms_final"], reverse=True)

    cols = ["id", "name", "subscian", "subscian_desc", "strata", "lat", "lng",
            "weight", "rooms_prior", "rooms_manual", "rooms_source", "rooms_final",
            "suspicious"]
    with OUT_CSV.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction="ignore")
        w.writeheader()
        w.writerows(inventory + flagged)

    # ── Reconciliación / reporte ─────────────────────────────────────────────
    n = len(inventory)
    print(f"── Capa 1: control total oficial = {CONTROL_TOTAL_ROOMS} cuartos "
          f"({CONTROL_TOTAL_HOTELS_OFICIAL} hoteles) [Sedetur, reporte {CONTROL_SRC_YM}]")
    curated = [r for r in inventory if r["_curated"]]
    gap = CONTROL_TOTAL_ROOMS - final_total
    print(f"── Capa 2/3: {n} hoteles DENUE — {len(curated)} con cuartos REALES "
          f"(Capa 3) + {n - len(curated)} con prior de estrato "
          f"({len(flagged)} sospechosos excluidos)")
    print(f"   Σ reales curados = {curated_rooms}  (su prior de estrato era "
          f"{curated_prior} → el proxy sobreestimaba ×{curated_prior/max(curated_rooms,1):.1f})")
    print(f"   Σ cola (prior)   = {residual}")
    print(f"   Σ FINAL          = {final_total} cuartos  (control oficial "
          f"{CONTROL_TOTAL_ROOMS}; gap {gap} = 36 hoteles no-DENUE + calibración)")
    print(f"   promedio final = {final_total/n:.1f} cuartos/hotel  "
          f"(oficial implícito {CONTROL_TOTAL_ROOMS/CONTROL_TOTAL_HOTELS_OFICIAL:.1f})")
    by_sub = defaultdict(lambda: [0, 0])
    for r in inventory:
        by_sub[r["subscian_desc"]][0] += 1
        by_sub[r["subscian_desc"]][1] += r["rooms_final"]
    print("\n   Reparto final por tipología:")
    for desc, (cnt, rms) in sorted(by_sub.items(), key=lambda x: -x[1][1]):
        print(f"     {rms:5} cuartos  {cnt:3} hoteles  {desc}")
    print("\n   TOP 12 final (real Capa 3 vs prior Capa 2):")
    for r in inventory[:12]:
        tag = f"REAL/{r['rooms_source']}" if r["_curated"] else "prior"
        delta = f"(prior {r['rooms_prior']})" if r["_curated"] else ""
        print(f"     {r['rooms_final']:4} cuartos  {tag:>16}  {r['name'][:34]:34} {delta}")
    if flagged:
        print(f"\n   ⚠ {len(flagged)} sospechosos (mala clasificación 721, revisar):")
        for r in flagged:
            print(f"     {r['name'][:42]}  ({r['subscian']})")
    print(f"\n✓ Escrito: {OUT_CSV.relative_to(ROOT)}  "
          f"(llenar rooms_manual = Capa 4 curaduría)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
