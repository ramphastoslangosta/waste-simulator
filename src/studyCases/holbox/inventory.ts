// AUTO-GENERADO por scripts/geo/prep_holbox_inventory.py — NO editar a mano.
// Inventario de generadores por CONTROL TOTAL (cierre del Track A0). Cada clase
// declara a que bucket del motor va y si su conteo es sumable como `units`.
import type { CaseInventory } from '../deriveInputs';

export const HOLBOX_INVENTORY: CaseInventory = {
  "case": "holbox",
  "targetYear": 2026,
  "occupancyRef": 0.732,
  "classes": [
    {
      "id": "residencial",
      "task": "A0.1",
      "status": "corregido",
      "label": "Poblacion residente (censada + flotante de trabajo)",
      "driver": "habitantes x kg/hab/dia",
      "bucket": "homes",
      "units_countable": true,
      "counts": {
        "low": 2735.0,
        "base": 4732.224334600761,
        "high": 6869.0280989562725
      },
      "gen_kg": {
        "low": 2032.105,
        "base": 4022.3906844106464,
        "high": 6869.0280989562725
      },
      "seasonality": "flat"
    },
    {
      "id": "hospedaje_formal",
      "task": "A2",
      "status": "modelado",
      "label": "Hospedaje formal registrado (170 hoteles)",
      "driver": "cuartos registrados x kg/cuarto/dia (ocupacion ya dentro del factor)",
      "bucket": "hotels",
      "units_countable": true,
      "counts": {
        "low": 2341,
        "base": 2341,
        "high": 2341
      },
      "gen_kg": {
        "low": 3230.58,
        "base": 3792.42,
        "high": 4354.26
      },
      "seasonality": "sedetur"
    },
    {
      "id": "hospedaje_informal",
      "task": "A0.3",
      "status": "nuevo_A0",
      "label": "Hospedaje informal en establecimiento (posadas no registradas)",
      "driver": "cuartos del censo municipal menos los registrados en Sedetur",
      "bucket": "hotels",
      "units_countable": true,
      "counts": {
        "low": 2415.1852491679183,
        "base": 2812.9366341772447,
        "high": 3210.688019186572
      },
      "gen_kg": {
        "low": 1594.0222644508262,
        "base": 2194.090574658251,
        "high": 2889.619217267915
      },
      "seasonality": "sedetur"
    },
    {
      "id": "renta_vacacional",
      "task": "A0.3",
      "status": "nuevo_A0",
      "label": "Renta vacacional en vivienda particular (Airbnb/VRBO)",
      "driver": "viviendas censadas x cuartos/vivienda x kg/cuarto/dia informal",
      "bucket": "hotels",
      "units_countable": true,
      "counts": {
        "low": 544.0,
        "base": 1451.9077385009246,
        "high": 2085.276910688188
      },
      "gen_kg": {
        "low": 359.04,
        "base": 1132.488036030721,
        "high": 1876.7492196193691
      },
      "seasonality": "sedetur"
    },
    {
      "id": "restaurantes",
      "task": "A0.2",
      "status": "modelado",
      "label": "Restaurantes",
      "driver": "establecimientos x kg/establecimiento/dia",
      "bucket": "restaurants",
      "units_countable": true,
      "counts": {
        "low": 126.9855284972017,
        "base": 137.60510431055752,
        "high": 148.22468012391334
      },
      "gen_kg": {
        "low": 12330.294817078284,
        "base": 15714.502912265669,
        "high": 19461.900500269825
      },
      "seasonality": "restaurant_coupling"
    },
    {
      "id": "fondas",
      "task": "A0.2-h4",
      "status": "nuevo_A0",
      "label": "Fondas (cocina economica)",
      "driver": "establecimientos x kg/establecimiento/dia",
      "bucket": "restaurants",
      "units_countable": true,
      "counts": {
        "low": 218.05595802549786,
        "base": 236.2915932605533,
        "high": 254.52722849560874
      },
      "gen_kg": {
        "low": 7130.429827433781,
        "base": 9097.226340531302,
        "high": 11275.556222355466
      },
      "seasonality": "restaurant_coupling"
    },
    {
      "id": "comercio",
      "task": "A0.2",
      "status": "modelado",
      "label": "Negocios comerciales establecidos",
      "driver": "establecimientos x kg/establecimiento/dia",
      "bucket": "commerce",
      "units_countable": true,
      "counts": {
        "low": 618.252775107588,
        "base": 669.9561644210982,
        "high": 721.6595537346084
      },
      "gen_kg": {
        "low": 10386.64662180748,
        "base": 13245.03337060511,
        "high": 16381.67186977561
      },
      "seasonality": "flat"
    },
    {
      "id": "ambulantes",
      "task": "A0.2",
      "status": "nuevo_A0",
      "label": "Comercio ambulante",
      "driver": "puestos x kg/puesto/dia",
      "bucket": "commerce",
      "units_countable": true,
      "counts": {
        "low": 114.93878134681317,
        "base": 124.55090894003028,
        "high": 134.16303653324738
      },
      "gen_kg": {
        "low": 574.6939067340659,
        "base": 996.4072715202423,
        "high": 1609.9564383989687
      },
      "seasonality": "sedetur"
    },
    {
      "id": "servicio_limpia",
      "task": "A0.4",
      "status": "nuevo_A0",
      "label": "Barrido de calles, limpieza de playa y poda",
      "driver": "barrenderos x km/dia x kg/km  +  frente de playa  +  poda",
      "bucket": "commerce",
      "units_countable": false,
      "counts": {
        "low": 4,
        "base": 4,
        "high": 4
      },
      "gen_kg": {
        "low": 180.0,
        "base": 459.0,
        "high": 898.0
      },
      "seasonality": "flat"
    },
    {
      "id": "day_trippers",
      "task": "A0.5",
      "status": "nuevo_A0",
      "label": "Excursionistas via ferry (residual, sin pernocta)",
      "driver": "llegadas de ferry x fraccion sin pernocta x kg residual/persona",
      "bucket": "commerce",
      "units_countable": false,
      "counts": {
        "low": 168.60000000000002,
        "base": 449.9846410133379,
        "high": 1199.9590427022347
      },
      "gen_kg": {
        "low": 25.290000000000003,
        "base": 112.49616025333448,
        "high": 479.9836170808939
      },
      "seasonality": "sedetur"
    },
    {
      "id": "tour_operadoras",
      "task": "A0.6",
      "status": "nuevo_A0",
      "label": "Tour operadoras y lanchas (tiburon ballena)",
      "driver": "lanchas en temporada x pax/tour x kg/pax, anualizado",
      "bucket": "commerce",
      "units_countable": false,
      "counts": {
        "low": 240,
        "base": 540,
        "high": 1000
      },
      "gen_kg": {
        "low": 30.18082191780822,
        "base": 101.86027397260274,
        "high": 251.5068493150685
      },
      "seasonality": "whale_shark"
    }
  ],
  "totals": {
    "low": 37.873283259422244,
    "base": 50.86791562424788,
    "high": 66.34823203303938
  },
  "witnesses": {
    "campo_wp2e_2022_t_dia": 34.8,
    "estacion_transferencia_t_dia": [
      20,
      25
    ],
    "estacion_transferencia_fuente": "Nomadas (2022) via WP2E: 'Entre 20 y 25 toneladas diarias se reportan llegan a la ET'",
    "cobertura_hogares": 0.8,
    "cobertura_fuente": "AM20 via WP2E: ~80% de los hogares recibian el servicio"
  }
};
