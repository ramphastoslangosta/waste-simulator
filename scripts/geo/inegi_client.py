#!/usr/bin/env python3
"""inegi_client.py — cliente programático del API de Indicadores de INEGI (BISE/BIE).

Objetivo: dejar la fuente OFICIAL de cuartos de hospedaje CABLEADA y auto-actualizable,
en vez de un número copiado a mano. Fuente confirmada:

  Cuadro INEGI "Cuartos y unidades de hospedaje registrados POR MUNICIPIO según
  categoría turística del establecimiento" (programa estatal 21_4, Quintana Roo).

⚠ GRANULARIDAD: el cuadro es por MUNICIPIO = Lázaro Cárdenas (cve 23-007), que
  incluye Holbox (isla) + Chiquilá/Kantunilkín (tierra firme). No baja a localidad
  Holbox. Es el mejor dato oficial auto-actualizable; el 2,282 "Holbox-isla" (Sedetur)
  es más fino pero no tiene API → se usa como cruce, no como fuente viva.

── Cómo obtener el TOKEN (acción única de Rafael) ──────────────────────────────
  1. Registrarse gratis: https://www.inegi.org.mx/app/api/indicadores/  (constructor
     de consultas → "Token"). Confirma por email → devuelve un token permanente.
  2. Exportarlo:  export INEGI_TOKEN="xxxxxxxx-xxxx-..."
     (o guardarlo en scripts/geo/data/.inegi_token — gitignored)

── Estructura del endpoint (API v2.0) ──────────────────────────────────────────
  https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/
    {idIndicador}/{idioma}/{areaGeografica}/{soloRecientes}/{fuente}/2.0/{token}?type=json

  - idIndicador     : id del BISE (resolver con --list para el programa de turismo)
  - areaGeografica  : municipio Lázaro Cárdenas. Formato a CONFIRMAR con el token
                      (probable "0700023007" ó "23007"); ver AREA_LAZARO abajo.
  - fuente          : BISE (banco de indicadores de estados/municipios)

Uso:
  python3 scripts/geo/inegi_client.py --indicator <ID> --recent
  python3 scripts/geo/inegi_client.py --url <ID>        # solo imprime la URL armada
"""
from __future__ import annotations
import argparse
import json
import os
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "scripts" / "geo" / "data"
TOKEN_FILE = DATA_DIR / ".inegi_token"

# Área geográfica INEGI: nacional "00", entidad "23000" (QRoo), municipio = entidad+
# municipio "23007" (Lázaro Cárdenas). El querybuilder2 confirma el formato exacto.
AREA_NACIONAL = "00"
AREA_QROO = "23000"
AREA_LAZARO = "23007"  # entidad 23 + municipio 007; --area para override
BASE = ("https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/"
        "INDICATOR/{ind}/es/{area}/{recent}/BISE/2.0/{token}?type=json")


def get_token() -> str | None:
    tok = os.environ.get("INEGI_TOKEN")
    if tok:
        return tok.strip()
    if TOKEN_FILE.exists():
        return TOKEN_FILE.read_text().strip()
    return None


def build_url(indicator: str, area: str, recent: bool, token: str) -> str:
    return BASE.format(ind=indicator, area=area,
                       recent=str(recent).lower(), token=token)


def fetch(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "waste-sim-holbox/1.0"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--indicator", required=True, help="id del indicador BISE")
    ap.add_argument("--area", default=AREA_LAZARO)
    ap.add_argument("--recent", action="store_true", help="solo el dato más reciente")
    ap.add_argument("--url", action="store_true", help="solo imprimir la URL, no llamar")
    a = ap.parse_args()

    token = get_token() or "TOKEN_FALTANTE"
    url = build_url(a.indicator, a.area, a.recent, token)

    if a.url or token == "TOKEN_FALTANTE":
        print(url.replace(token, "<TOKEN>"))
        if token == "TOKEN_FALTANTE":
            print("\n⚠ Falta INEGI_TOKEN. Regístrate (gratis, 1 vez) y expórtalo — ver "
                  "docstring. Con el token, re-corre sin --url para traer el dato.",
                  file=sys.stderr)
            return 2
        return 0

    data = fetch(url)
    out = DATA_DIR / f"inegi_{a.indicator}.json"
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    series = data.get("Series") or data.get("CODE") or []
    print(f"✓ Indicador {a.indicator} — {len(series)} serie(s) → {out.relative_to(ROOT)}")
    for s in series[:3]:
        obs = (s.get("OBSERVATIONS") or [{}])[0]
        print(f"   {obs.get('TIME_PERIOD','?')}: {obs.get('OBS_VALUE','?')}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
