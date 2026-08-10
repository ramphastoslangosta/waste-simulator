#!/usr/bin/env python3
"""prep_holbox_overture.py — generadores desde Overture Maps Places.

Tercera fuente: Overture Maps (Meta + Microsoft), dataset abierto (CDLA/Apache) →
SÍ se puede mostrar. Aporta FRESCURA (releases mensuales) + precisión de coordenada
a nivel fachada + un `confidence` propio. Independiente de OSM y del DENUE.

No trae tamaño/empleo (eso solo DENUE) → generación = coeficiente plano por tipo.

Descarga previa (venv .venv-geo):
  overturemaps download --bbox=-87.42,21.50,-87.30,21.58 -f geojson --type=place \\
    -o scripts/geo/data/overture_holbox.geojson

Salida:  src/studyCases/holbox/geo/generators_overture.geojson

Uso:  python3 scripts/geo/prep_holbox_overture.py [--min-confidence 0.0]
"""
from __future__ import annotations
import argparse
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "scripts" / "geo" / "data" / "overture_holbox.geojson"
GEO_DIR = ROOT / "src" / "studyCases" / "holbox" / "geo"

# Coeficiente representativo kg/día por tipo (sin dato de tamaño → plano, como OSM).
GEN_KG_DIA = {"hotel": 380, "restaurante": 160, "comercio": 95}

HOTEL_KW = ("hotel", "resort", "hostel", "motel", "accommodation", "holiday_rental",
            "guest_house", "bed_and_breakfast", "lodging", "campground", "villa", "cabin")
FOOD_KW = ("restaurant", "cafe", "coffee", "bar", "pub", "brewery", "food", "bakery",
           "ice_cream", "grill", "eatery", "cocktail", "bistro", "diner", "pizzeria",
           "taqueria", "cantina", "deli", "juice", "dessert")
RETAIL_KW = ("shop", "store", "retail", "market", "grocery", "supermarket", "boutique",
             "pharmacy", "convenience", "mall", "shopping")


def classify(primary: str) -> str | None:
    p = primary or ""
    if any(k in p for k in HOTEL_KW):
        return "hotel"
    if any(k in p for k in FOOD_KW):
        return "restaurante"
    if any(k in p for k in RETAIL_KW):
        return "comercio"
    return None


def primary_name(names: dict) -> str:
    if not names:
        return ""
    return names.get("primary") or (names.get("common") or [{}])[0].get("value", "") or ""


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-confidence", type=float, default=0.0)
    minc = ap.parse_args().min_confidence

    d = json.loads(SRC.read_text())
    gens, excluded, dropped_conf = [], Counter(), 0
    for f in d["features"]:
        p = f["properties"]
        conf = p.get("confidence")
        if conf is not None and conf < minc:
            dropped_conf += 1
            continue
        cats = p.get("categories") or {}
        typ = classify(cats.get("primary", ""))
        if not typ:
            excluded[cats.get("primary", "(none)")] += 1
            continue
        lng, lat = f["geometry"]["coordinates"]
        name = primary_name(p.get("names") or {})
        gens.append({
            "id": f"overture/{p.get('id', len(gens))}",
            "name": name or f"({typ} sin nombre)",
            "type": typ,
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "generation": GEN_KG_DIA[typ],
            "source": "overture",
            "confidence": round(conf, 2) if conf is not None else None,
        })

    by_type = Counter(g["type"] for g in gens)
    print(f"✓ {len(gens)} generadores Overture: " + ", ".join(f"{k}={v}" for k, v in sorted(by_type.items())))
    print(f"  ({sum(excluded.values())} fuera de tipo, {dropped_conf} bajo confidence<{minc})")

    GEO_DIR.mkdir(parents=True, exist_ok=True)
    (GEO_DIR / "generators_overture.geojson").write_text(json.dumps({
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [g["lng"], g["lat"]]},
            "properties": {k: g[k] for k in ("id", "name", "type", "generation", "source", "confidence")},
        } for g in gens],
    }, ensure_ascii=False, indent=2))
    print(f"✓ Escrito: geo/generators_overture.geojson")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
