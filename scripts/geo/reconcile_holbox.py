#!/usr/bin/env python3
"""reconcile_holbox.py — reconciliación espacial multi-fuente (DENUE ↔ OSM ↔ Overture).

DENUE (oficial) = backbone. Se cruza por PROXIMIDAD contra cada fuente independiente
(OSM, Overture) para medir CONSENSO: ¿cuántas unidades oficiales están corroboradas
por ≥1 fuente independiente, y qué aporta cada fuente que el registro oficial no tiene?

Método: match codicioso 1-a-1 por tipo entre DENUE y cada fuente, dentro de un umbral
en metros (default 60m — sensible, ver barrido con --sweep).

Entrada:  geo/generators_denue.geojson, generators.geojson (OSM), generators_overture.geojson
Salida:   src/studyCases/holbox/geoReconciled.ts + geo/reconcile_report.json

Uso:  python3 scripts/geo/reconcile_holbox.py [--threshold 60] [--sweep 30,50,80]
"""
from __future__ import annotations
import argparse
import json
import math
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEO_DIR = ROOT / "src" / "studyCases" / "holbox" / "geo"
TS_OUT = ROOT / "src" / "studyCases" / "holbox" / "geoReconciled.ts"

LAT0 = 21.5
M_PER_DEG_LAT = 111_320.0
M_PER_DEG_LNG = 111_320.0 * math.cos(math.radians(LAT0))
TYPES = ["hotel", "restaurante", "comercio"]


def load(path: Path) -> list[dict]:
    d = json.loads(path.read_text())
    out = []
    for f in d["features"]:
        p = dict(f["properties"])
        lng, lat = f["geometry"]["coordinates"]
        p["lat"], p["lng"] = round(lat, 6), round(lng, 6)
        p.setdefault("type", p.get("gen_type"))
        out.append(p)
    return out


def meters(a: dict, b: dict) -> float:
    dx = (a["lng"] - b["lng"]) * M_PER_DEG_LNG
    dy = (a["lat"] - b["lat"]) * M_PER_DEG_LAT
    return math.hypot(dx, dy)


def match_pairs(A: list[dict], B: list[dict], thr: float) -> tuple[set, set]:
    """Match greedy 1-a-1 entre A y B dentro de thr. Devuelve (idxA_used, idxB_used)."""
    pairs = []
    for i, a in enumerate(A):
        for j, b in enumerate(B):
            dist = meters(a, b)
            if dist <= thr:
                pairs.append((dist, i, j))
    pairs.sort()
    ua, ub = set(), set()
    for _, i, j in pairs:
        if i in ua or j in ub:
            continue
        ua.add(i); ub.add(j)
    return ua, ub


def by_type(points: list[dict]) -> dict:
    d = defaultdict(list)
    for g in points:
        if g["type"] in TYPES:
            d[g["type"]].append(g)
    return d


def coverage_at(denue_by, osm_by, over_by, thr: float) -> dict:
    """Consenso total y por tipo a un umbral, sin escribir artefactos."""
    tot = dict(denue=0, byAny=0)
    per = {}
    for t in TYPES:
        d = denue_by.get(t, [])
        _, d_osm = match_pairs(osm_by.get(t, []), d, thr)
        _, d_over = match_pairs(over_by.get(t, []), d, thr)
        any_ = d_osm | d_over
        per[t] = round(100 * len(any_) / len(d), 1) if d else 0.0
        tot["denue"] += len(d); tot["byAny"] += len(any_)
    tot["coverage"] = round(100 * tot["byAny"] / tot["denue"], 1) if tot["denue"] else 0.0
    return {"per": per, **tot}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--threshold", type=float, default=60.0)
    ap.add_argument("--sweep", type=str, default="")
    args = ap.parse_args()
    thr = args.threshold

    denue_by = by_type(load(GEO_DIR / "generators_denue.geojson"))
    osm_by = by_type(load(GEO_DIR / "generators.geojson"))
    over_by = by_type(load(GEO_DIR / "generators_overture.geojson"))

    if args.sweep:
        print(f"{'umbral':>7} | {'hotel':>7} {'rest.':>7} {'comerc':>7} | {'CONSENSO':>8}")
        print("-" * 50)
        for tt in [float(x) for x in args.sweep.split(",")]:
            c = coverage_at(denue_by, osm_by, over_by, tt)
            print(f"{int(tt):>6}m | {c['per']['hotel']:>6}% {c['per']['restaurante']:>6}% "
                  f"{c['per']['comercio']:>6}% | {c['coverage']:>7}%")
        return 0

    denue_out, osm_out, over_out = [], [], []
    by_type_summary = []
    T = dict(denue=0, osm=0, overture=0, byOsm=0, byOver=0, byBoth=0, byAny=0, byNone=0,
             osmOnly=0, overOnly=0)

    for t in TYPES:
        d, o, v = denue_by.get(t, []), osm_by.get(t, []), over_by.get(t, [])
        o_used, d_by_osm = match_pairs(o, d, thr)
        v_used, d_by_over = match_pairs(v, d, thr)

        for j, g in enumerate(d):
            in_osm, in_over = j in d_by_osm, j in d_by_over
            confirm = int(in_osm) + int(in_over)
            denue_out.append(dict(g, source="denue", inOsm=in_osm, inOverture=in_over,
                                  confirm=confirm, match="matched" if confirm else "only"))
        for i, g in enumerate(o):
            osm_out.append(dict(g, source="osm", match="matched" if i in o_used else "only"))
        for i, g in enumerate(v):
            over_out.append(dict(g, source="overture", match="matched" if i in v_used else "only"))

        by_osm = len(d_by_osm); by_over = len(d_by_over)
        by_both = len(d_by_osm & d_by_over); by_any = len(d_by_osm | d_by_over)
        by_none = len(d) - by_any
        osm_only = len(o) - len(o_used); over_only = len(v) - len(v_used)
        by_type_summary.append({
            "type": t, "denue": len(d), "osm": len(o), "overture": len(v),
            "byOsm": by_osm, "byOverture": by_over, "byBoth": by_both,
            "byAny": by_any, "byNone": by_none, "osmOnly": osm_only, "overtureOnly": over_only,
            "coverage": round(100 * by_any / len(d), 1) if d else 0.0,
        })
        T["denue"] += len(d); T["osm"] += len(o); T["overture"] += len(v)
        T["byOsm"] += by_osm; T["byOver"] += by_over; T["byBoth"] += by_both
        T["byAny"] += by_any; T["byNone"] += by_none
        T["osmOnly"] += osm_only; T["overOnly"] += over_only
        print(f"  {t:12} DENUE {len(d):3} · corrob {by_any:3} ({round(100*by_any/len(d) if d else 0,1)}%) · "
              f"solo-oficial {by_none:3} · +OSM {osm_only:3} · +Overture {over_only:3}")

    T["coverage"] = round(100 * T["byAny"] / T["denue"], 1) if T["denue"] else 0.0
    print(f"  {'TOTAL':12} DENUE {T['denue']:3} · corroborado {T['byAny']:3} = {T['coverage']}% "
          f"(umbral {int(thr)}m) · solo-oficial {T['byNone']}")

    totals = {"denue": T["denue"], "osm": T["osm"], "overture": T["overture"],
              "byOsm": T["byOsm"], "byOverture": T["byOver"], "byBoth": T["byBoth"],
              "byAny": T["byAny"], "byNone": T["byNone"], "osmOnly": T["osmOnly"],
              "overtureOnly": T["overOnly"], "coverage": T["coverage"]}
    report = {"thresholdM": thr, "byType": by_type_summary, "totals": totals}
    (GEO_DIR / "reconcile_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2))

    def slim(g, extra=()):
        keys = ("id", "name", "type", "lat", "lng", "generation", "genLow", "genHigh",
                "rooms", "covers", "category", "gen_model", "source", "match", "staff", "confidence") + extra
        return {k: g[k] for k in keys if k in g}

    denue_slim = [slim(g, ("inOsm", "inOverture", "confirm")) for g in denue_out]
    osm_slim = [slim(g) for g in osm_out]
    over_slim = [slim(g) for g in over_out]

    # Hoteles fuera de DENUE (Overture + cuartos investigados). Se llevan aparte para
    # NO contaminar las cuentas de reconciliación; la UI los mergea en la vista DENUE.
    nd_path = GEO_DIR / "generators_nondenue.geojson"
    nondenue_slim = [slim(g, ("offRegistry",)) for g in load(nd_path)] if nd_path.exists() else []

    lat = sum(g["lat"] for g in denue_slim) / len(denue_slim)
    lng = sum(g["lng"] for g in denue_slim) / len(denue_slim)
    boundary = json.loads((GEO_DIR / "boundary.geojson").read_text())["features"][0]["geometry"]["coordinates"][0]

    geo = {
        "center": [round(lat, 6), round(lng, 6)],
        "zoom": 15,
        "synthetic": False,
        "boundary": [[p[1], p[0]] for p in boundary],
        "generators": denue_slim,
        "sources": {"denue": denue_slim, "osm": osm_slim, "overture": over_slim},
        "offRegistry": nondenue_slim,
        "reconcile": report,
    }
    # Carrea el meta de caso (occupancy estacional + banda kg) emitido por prep_holbox_denue.py
    # — sin esto la UI de temporada/escenario no se renderiza (gated tras geo.occupancy).
    meta_p = ROOT / "scripts" / "geo" / "data" / "holbox_case_meta.json"
    if meta_p.exists():
        geo.update(json.loads(meta_p.read_text()))
    ts = (
        "// AUTO-GENERADO por scripts/geo/reconcile_holbox.py — NO editar a mano.\n"
        "// Reconciliación multi-fuente DENUE↔OSM↔Overture. DENUE = backbone; consenso =\n"
        "// unidades oficiales corroboradas por ≥1 fuente independiente. Default view = DENUE.\n"
        "import type { CaseGeo } from '../index';\n\n"
        "export const HOLBOX_GEO_RECONCILED: CaseGeo = "
        + json.dumps(geo, ensure_ascii=False, indent=2)
        + ";\n"
    )
    TS_OUT.write_text(ts)
    print(f"✓ Escrito: {TS_OUT.name} y geo/reconcile_report.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
