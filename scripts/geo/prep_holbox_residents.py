#!/usr/bin/env python3
"""
A0.1 — Poblacion residente real de Holbox (censada + flotante de trabajo).

El modelo heredado corre con `fixedPopulation: 2673`, atribuido en
`data/holbox-historical-data.csv` al Censo de Poblacion y Vivienda 2020 del
INEGI. Ese dato NO coincide con el censo: la localidad Holbox (mun. 007 Lazaro
Cardenas, loc. 0012) registra 1,841 habitantes. Ademas, la generacion
residencial de 1.98 t/d del estudio de campo esta marcada como
`demographic_analysis`, o sea derivada de poblacion x per-capita, no medida.
Corregir la poblacion corrige la derivacion; no contradice ninguna medicion.

El censo cuenta residentes habituales. Holbox importa mano de obra, asi que la
poblacion que genera residuo es mayor. Este script la acota por abajo con una
triangulacion sobre datos duros:

    trabajadores no censados = empleos (DENUE) - residentes ocupados (censo)

y emite una banda baja/base/alta segun se tome el borde inferior, el punto
medio o el borde superior de cada estrato `per_ocu` del DENUE.

Fuentes:
  - INEGI, Censo de Poblacion y Vivienda 2020, ITER (principales resultados por
    localidad), entidad 23 Quintana Roo. Descarga abierta, sin token.
  - DENUE, recorte de Holbox ya cacheado por `prep_holbox_denue.py`.

Salida: data/holbox_residents.json
"""

import csv
import io
import json
import pathlib
import urllib.request
import zipfile

DATA_DIR = pathlib.Path(__file__).parent / "data"
ITER_URL = ("https://www.inegi.org.mx/contenidos/programas/ccpv/2020/"
            "datosabiertos/iter/iter_23_cpv2020_csv.zip")
ITER_CACHE = DATA_DIR / "iter_23_cpv2020.zip"
DENUE_CSV = DATA_DIR / "denue_holbox.csv"
OUT = DATA_DIR / "holbox_residents.json"

MUN, LOC = "007", "0012"   # Lazaro Cardenas / Holbox
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")

# Bordes de cada estrato `per_ocu` del DENUE: (inferior, punto medio, superior).
# La banda es honesta sobre lo que el estrato realmente dice — 73% de las
# unidades caen en "0 a 5 personas", asi que el punto medio carga casi todo el
# resultado y merece cota explicita.
STRATA = {
    "0 a 5":    (1, 3, 5),
    "6 a 10":   (6, 8, 10),
    "11 a 30":  (11, 20, 30),
    "31 a 50":  (31, 40, 50),
    "51 a 100": (51, 75, 100),
    "101 a 250": (101, 175, 250),
    "251 y m":  (251, 300, 400),
}

# kg/hab/dia del residente permanente. El 0.74 heredado no es un parametro:
# sale de dividir 1.98 t/d entre los 2,673 habitantes equivocados. Se sustituye
# por una banda anclada al promedio nacional SEMARNAT (~0.94 kg/hab/dia), con
# Quintana Roo por encima de la media.
PER_CAPITA = {"low": 0.90, "base": 1.00, "high": 1.10}


def fetch_iter() -> bytes:
    if ITER_CACHE.exists():
        return ITER_CACHE.read_bytes()
    req = urllib.request.Request(ITER_URL, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        blob = r.read()
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    ITER_CACHE.write_bytes(blob)
    return blob


def census_holbox() -> dict:
    z = zipfile.ZipFile(io.BytesIO(fetch_iter()))
    name = next(n for n in z.namelist()
                if "conjunto_de_datos" in n and n.lower().endswith(".csv"))
    rows = csv.DictReader(io.StringIO(z.read(name).decode("latin-1")))
    row = next(r for r in rows if r.get("MUN") == MUN and r.get("LOC") == LOC)
    num = lambda k: int(row[k]) if row.get(k, "").isdigit() else None
    return {
        "pobtot": num("POBTOT"),
        "pob_masc": num("POBMAS"),
        "pob_fem": num("POBFEM"),
        "rel_h_m": float(row["REL_H_M"]) if row.get("REL_H_M") else None,
        "pob_0_14": num("POB0_14"),
        "pob_15_64": num("POB15_64"),
        "pob_65_mas": num("POB65_MAS"),
        "pea": num("PEA"),
        "pob_ocupada": num("POCUPADA"),
        "pob_desocupada": num("PDESOCUP"),
        "viviendas_part_hab": num("TVIVPARHAB"),
        "prom_ocup_vivienda": float(row["PROM_OCUP"]) if row.get("PROM_OCUP") else None,
        "viv_1_cuarto": num("VPH_1CUART"),
    }


def denue_employment() -> dict:
    bands = {"low": 0, "base": 0, "high": 0}
    matched = unmatched = 0
    with open(DENUE_CSV, encoding="latin-1") as fh:
        for r in csv.DictReader(fh):
            estrato = (r.get("per_ocu") or "").strip()
            edges = next((v for k, v in STRATA.items() if estrato.startswith(k)), None)
            if not edges:
                unmatched += 1
                continue
            matched += 1
            for key, val in zip(("low", "base", "high"), edges):
                bands[key] += val
    return {"empleos": bands, "unidades": matched, "unidades_sin_estrato": unmatched}


def main() -> None:
    censo = census_holbox()
    empleo = denue_employment()
    ocupados = censo["pob_ocupada"]

    flotante = {k: max(0, v - ocupados) for k, v in empleo["empleos"].items()}
    # Supuesto conservador: el trabajador importado llega solo, sin dependientes.
    # Si llegara con familia la poblacion subiria; se deja fuera a proposito.
    poblacion = {k: censo["pobtot"] + v for k, v in flotante.items()}
    generacion = {k: round(poblacion[k] * PER_CAPITA[k] / 1000, 2)
                  for k in ("low", "base", "high")}

    out = {
        "localidad": "Holbox (INEGI 23-007-0012)",
        "censo_2020": censo,
        "empleo_denue": empleo,
        "trabajadores_no_censados": flotante,
        "poblacion_generadora": poblacion,
        "per_capita_kg_hab_dia": PER_CAPITA,
        "generacion_residencial_t_dia": generacion,
        "heredado": {
            "fixedPopulation": 2673,
            "per_capita": 0.74,
            "generacion_t_dia": 1.98,
            "nota": ("2,673 esta atribuido al Censo 2020 en holbox-historical-data.csv "
                     "pero el censo da 1,841 para la localidad. El 0.74 kg/hab/dia no es "
                     "un parametro medido: es 1.98 t/d dividido entre esa poblacion."),
        },
        "sources": {
            "censo": ITER_URL,
            "denue": "recorte cacheado por prep_holbox_denue.py (INEGI DENUE, entidad 23)",
            "per_capita": "SEMARNAT, Diagnostico Basico para la Gestion Integral de Residuos",
        },
        "caveats": [
            "El estrato per_ocu del DENUE satura: 73% de las unidades caen en '0 a 5 "
            "personas', asi que el punto medio domina el resultado. De ahi la banda.",
            "El personal ocupado del DENUE incluye duenos y familiares sin pago.",
            "Parte de los empleos los cubren conmutadores desde Chiquila (2,311 hab, "
            "25 min de ferry). No hay conteo; se asume marginal y queda como caveat.",
            "El pluriempleo reduciria la brecha; el subregistro de unidades la ampliaria.",
            "La generacion residencial de 1.98 t/d del estudio de campo esta marcada "
            "'demographic_analysis', o sea derivada, no medida. La comercial (32.8 t/d) "
            "si viene de 'establishment_survey' y no se toca aqui.",
        ],
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Censo 2020 Holbox: {censo['pobtot']:,} hab · {censo['pob_ocupada']:,} ocupados "
          f"· {censo['viviendas_part_hab']:,} viviendas · rel H/M {censo['rel_h_m']}")
    print(f"Empleos DENUE: {empleo['empleos']['low']:,} / {empleo['empleos']['base']:,} "
          f"/ {empleo['empleos']['high']:,} (baja/base/alta)")
    print(f"Poblacion generadora: {poblacion['low']:,} / {poblacion['base']:,} "
          f"/ {poblacion['high']:,}")
    print(f"Generacion residencial: {generacion['low']} / {generacion['base']} "
          f"/ {generacion['high']} t/dia  (heredado: 1.98)")
    print(f"-> {OUT}")


if __name__ == "__main__":
    main()
