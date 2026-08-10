#!/usr/bin/env python3
"""prep_sedetur.py — fuente OFICIAL de cuartos + ocupación de Holbox (Sedetur QR).

Reemplaza el intento fallido de la INEGI API (que NO expone inventario de cuartos).
Sedetur publica mensual el reporte "¿Cómo vamos en turismo?" (PDF), que trae:
  - Infraestructura hotelera por destino  → Holbox: # hoteles, # cuartos (control total)
  - Ocupación hotelera mensual por destino → Holbox: curva estacional (el 2º driver)

Fuente estable y auto-actualizable (mensual) — a diferencia del cuadroentidad INEGI
(app JS, no headless) o la API de Indicadores (no tiene inventario de hospedaje).

URL: https://sedeturqroo.gob.mx/ARCHIVOS/comovamos/como_vamos_YYYYMM.pdf
Requiere: pdftotext (poppler-utils).

Salidas:
  - scripts/geo/data/sedetur_holbox.json  (inventario + ocupación + procedencia)
  - imprime lo extraído

Uso:  python3 scripts/geo/prep_sedetur.py            # busca el reporte más reciente
      python3 scripts/geo/prep_sedetur.py 202506     # fuerza un YYYYMM
"""
from __future__ import annotations
import datetime as dt
import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "scripts" / "geo" / "data"
URL = "https://sedeturqroo.gob.mx/ARCHIVOS/comovamos/como_vamos_{ym}.pdf"
UA = "waste-sim-holbox/1.0 (rafaellangmillet@gmail.com)"
MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
          "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


def candidate_yms(start: str | None) -> list[str]:
    if start:
        return [start]
    today = dt.date.today()
    out, y, m = [], today.year, today.month
    for _ in range(18):  # retrocede hasta 18 meses buscando el más reciente
        out.append(f"{y}{m:02d}")
        m -= 1
        if m == 0:
            y, m = y - 1, 12
    return out


def fetch_pdf(ym: str) -> bytes | None:
    try:
        req = urllib.request.Request(URL.format(ym=ym), headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.read() if r.status == 200 else None
    except Exception:
        return None


def pdf_to_text(blob: bytes) -> str:
    p = subprocess.run(["pdftotext", "-layout", "-", "-"], input=blob,
                       capture_output=True, timeout=60)
    return p.stdout.decode("utf-8", errors="replace")


def extract(text: str) -> dict:
    out: dict = {"hoteles": None, "cuartos": None, "ocupacion_mensual": {},
                 "ocupacion_prom": None}
    # Infraestructura: "Holbox   169   2,282"
    m = re.search(r"Holbox\s+(\d{1,4})\s+([\d,]{2,7})\b", text)
    if m:
        out["hoteles"] = int(m.group(1))
        out["cuartos"] = int(m.group(2).replace(",", ""))
    # Ocupación: línea "Holbox  74.0  68.1 ... 68.0" (varios floats)
    for line in text.splitlines():
        if "Holbox" not in line:
            continue
        floats = re.findall(r"\b(\d{1,3}\.\d)\b", line)
        if len(floats) >= 3:  # línea de ocupación (no la de infraestructura)
            vals = [float(x) for x in floats]
            # el último suele ser el resumen (prom/anual); los previos = meses
            out["ocupacion_prom"] = vals[-1]
            for i, v in enumerate(vals[:-1]):
                if i < len(MONTHS):
                    out["ocupacion_mensual"][MONTHS[i]] = v
            break
    return out


def main() -> int:
    start = sys.argv[1] if len(sys.argv) > 1 else None
    blob, used_ym = None, None
    for ym in candidate_yms(start):
        blob = fetch_pdf(ym)
        if blob:
            used_ym = ym
            break
    if not blob:
        print("✗ No se encontró ningún reporte 'Cómo vamos' reciente.", file=sys.stderr)
        return 1

    text = pdf_to_text(blob)
    data = extract(text)
    data["source"] = "Secretaría de Turismo del Estado de Quintana Roo — "
    data["source"] += f"'¿Cómo vamos en turismo?' reporte {used_ym}"
    data["source_url"] = URL.format(ym=used_ym)
    data["report_ym"] = used_ym

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out = DATA_DIR / "sedetur_holbox.json"
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2))

    print(f"── Sedetur '{used_ym}' — Holbox")
    print(f"   Hoteles: {data['hoteles']}   Cuartos: {data['cuartos']}  (control total)")
    if data["ocupacion_mensual"]:
        oc = "  ".join(f"{k[:3]} {v}" for k, v in data["ocupacion_mensual"].items())
        print(f"   Ocupación: {oc}   → prom {data['ocupacion_prom']}%")
    print(f"✓ Escrito: {out.relative_to(ROOT)}")
    if not data["cuartos"]:
        print("⚠ No se pudo parsear cuartos — revisar layout del PDF.", file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
