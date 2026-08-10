#!/usr/bin/env python3
"""prep_holbox.py — geodata real de Holbox desde OpenStreetMap (Overpass API).

MVP del pipeline geoespacial del simulador (Plan: Plans/residuos-simulador-ux.md).
Corre OFFLINE (una vez, en máquina con internet) y produce artefactos ESTÁTICOS
que el SPA renderiza con react-leaflet — cero dependencia de runtime en el server.

Foco v1 = MAPEO DE GENERADORES por densidad de generación (ruta diferida). Trae de OSM:
  - Generadores reales (hoteles, restaurantes, cafes, bares, comercios) con coords.
  - Boundary de la isla (place=island name=Holbox), o convex hull como fallback.

La GENERACION (kg/día) NO está en OSM: se estima con coeficientes representativos
por tipo (documentados abajo). Ubicación = real; magnitud = representativa hasta
tener datos de campo. Escalar a geopandas/QGIS solo si se requiere análisis pesado.

Salidas:
  - src/studyCases/holbox/geo/generators.geojson  (FeatureCollection de puntos)
  - src/studyCases/holbox/geo/boundary.geojson     (Polygon)
  - src/studyCases/holbox/geoOSM.ts                 (CaseGeo tipado para el StudyCase)

Uso:  python3 scripts/geo/prep_holbox.py
"""
from __future__ import annotations
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
]
UA = "waste-simulator-holbox/1.0 (rafaellangmillet@gmail.com)"

# Bounding box de Holbox (isla + pueblo): S,W,N,E
BBOX = (21.50, -87.42, 21.58, -87.30)

# Coeficientes representativos de generación (kg/día) por tipo de generador.
# Placeholder honesto: ubicación real (OSM), magnitud a calibrar con datos de campo.
GEN_KG_DIA = {
    "hotel": 380,
    "restaurante": 160,
    "comercio": 95,
    "hogar": 40,
}

# Mapeo de tags OSM → tipo del modelo.
OSM_TYPE_MAP = [
    ('tourism', 'hotel', 'hotel'),
    ('tourism', 'guest_house', 'hotel'),
    ('tourism', 'hostel', 'hotel'),
    ('tourism', 'apartment', 'hotel'),
    ('amenity', 'restaurant', 'restaurante'),
    ('amenity', 'cafe', 'restaurante'),
    ('amenity', 'bar', 'restaurante'),
    ('amenity', 'fast_food', 'restaurante'),
    ('shop', None, 'comercio'),  # cualquier shop=*
]

ROOT = Path(__file__).resolve().parents[2]
GEO_DIR = ROOT / "src" / "studyCases" / "holbox" / "geo"
TS_OUT = ROOT / "src" / "studyCases" / "holbox" / "geoOSM.ts"


def overpass(query: str) -> dict:
    """POST a Overpass con fallback entre mirrors y reintentos."""
    data = urllib.parse.urlencode({"data": query}).encode()
    last_err = None
    for endpoint in OVERPASS_ENDPOINTS:
        for attempt in range(3):
            try:
                req = urllib.request.Request(endpoint, data=data, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=90) as r:
                    return json.loads(r.read().decode())
            except Exception as e:  # noqa: BLE001
                last_err = e
                print(f"  · {endpoint} intento {attempt+1} falló: {e}", file=sys.stderr)
                time.sleep(5)
    raise RuntimeError(f"Overpass no respondió en ningún mirror: {last_err}")


def classify(tags: dict) -> str | None:
    for key, val, typ in OSM_TYPE_MAP:
        if key in tags and (val is None or tags[key] == val):
            return typ
    return None


def fetch_generators() -> list[dict]:
    s, w, n, e = BBOX
    q = f"""[out:json][timeout:60];
(
  node["tourism"~"hotel|guest_house|hostel|apartment"]({s},{w},{n},{e});
  way["tourism"~"hotel|guest_house|hostel|apartment"]({s},{w},{n},{e});
  node["amenity"~"restaurant|cafe|bar|fast_food"]({s},{w},{n},{e});
  way["amenity"~"restaurant|cafe|bar|fast_food"]({s},{w},{n},{e});
  node["shop"]({s},{w},{n},{e});
  way["shop"]({s},{w},{n},{e});
);
out center tags;"""
    els = overpass(q).get("elements", [])
    gens, seen = [], set()
    for el in els:
        tags = el.get("tags", {})
        typ = classify(tags)
        if not typ:
            continue
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lng = el.get("lon") or el.get("center", {}).get("lon")
        if lat is None or lng is None:
            continue
        key = (round(lat, 5), round(lng, 5))
        if key in seen:
            continue
        seen.add(key)
        gens.append({
            "id": f"{el['type']}/{el['id']}",
            "name": tags.get("name", f"({typ} sin nombre)"),
            "type": typ,
            "lat": round(lat, 6),
            "lng": round(lng, 6),
            "generation": GEN_KG_DIA[typ],
        })
    return gens


def fetch_boundary() -> list[list[float]] | None:
    """Polígono de la isla Holbox (place=island). Devuelve anillo [[lat,lng],...]."""
    s, w, n, e = BBOX
    q = f"""[out:json][timeout:60];
(
  way["place"="island"]["name"="Holbox"]({s},{w},{n},{e});
  relation["place"="island"]["name"="Holbox"]({s},{w},{n},{e});
);
out geom;"""
    els = overpass(q).get("elements", [])
    for el in els:
        if el.get("type") == "way" and el.get("geometry"):
            return [[round(p["lat"], 6), round(p["lon"], 6)] for p in el["geometry"]]
        if el.get("type") == "relation":
            for m in el.get("members", []):
                if m.get("role") == "outer" and m.get("geometry"):
                    return [[round(p["lat"], 6), round(p["lon"], 6)] for p in m["geometry"]]
    return None


def convex_hull(points: list[tuple[float, float]]) -> list[list[float]]:
    """Fallback: convex hull (monotone chain) de los generadores. Entrada (lat,lng)."""
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


def centroid(gens: list[dict]) -> list[float]:
    lat = sum(g["lat"] for g in gens) / len(gens)
    lng = sum(g["lng"] for g in gens) / len(gens)
    return [round(lat, 6), round(lng, 6)]


def write_geojson(path: Path, feature_collection: dict) -> None:
    path.write_text(json.dumps(feature_collection, ensure_ascii=False, indent=2))


def main() -> int:
    GEO_DIR.mkdir(parents=True, exist_ok=True)
    print("→ Consultando OSM (generadores)…")
    gens = fetch_generators()
    if not gens:
        print("✗ Sin generadores — aborta.", file=sys.stderr)
        return 1
    by_type = {}
    for g in gens:
        by_type[g["type"]] = by_type.get(g["type"], 0) + 1
    print(f"  {len(gens)} generadores: " + ", ".join(f"{k}={v}" for k, v in sorted(by_type.items())))

    print("→ Consultando OSM (boundary isla)…")
    boundary = fetch_boundary()
    if boundary:
        print(f"  boundary OSM: {len(boundary)} vértices")
    else:
        boundary = convex_hull([(g["lat"], g["lng"]) for g in gens])
        print(f"  boundary fallback (convex hull): {len(boundary)} vértices")

    center = centroid(gens)

    # GeoJSON de generadores (lng,lat por spec GeoJSON).
    write_geojson(GEO_DIR / "generators.geojson", {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [g["lng"], g["lat"]]},
            "properties": {"id": g["id"], "name": g["name"], "gen_type": g["type"], "generation": g["generation"]},
        } for g in gens],
    })
    write_geojson(GEO_DIR / "boundary.geojson", {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "geometry": {"type": "Polygon", "coordinates": [[[p[1], p[0]] for p in boundary]]},
            "properties": {"name": "Holbox"},
        }],
    })

    # Módulo TS tipado (consumido por studyCases/index.ts).
    ts = (
        "// AUTO-GENERADO por scripts/geo/prep_holbox.py — NO editar a mano.\n"
        "// Geodata REAL de Holbox desde OpenStreetMap (ubicaciones reales; generación\n"
        "// en kg/día = coeficiente representativo por tipo, a calibrar con datos de campo).\n"
        "import type { CaseGeo } from '../index';\n\n"
        "export const HOLBOX_GEO_OSM: CaseGeo = "
        + json.dumps({
            "center": center,
            "zoom": 15,
            "synthetic": False,
            "boundary": boundary,
            "generators": gens,
        }, ensure_ascii=False, indent=2)
        + ";\n"
    )
    TS_OUT.write_text(ts)
    print(f"✓ Escrito: {GEO_DIR}/generators.geojson, boundary.geojson y {TS_OUT.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
