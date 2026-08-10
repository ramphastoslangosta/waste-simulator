// Registro de casos de estudio — desacopla el "caso" del "motor".
// El motor de simulación es invariante; cada caso es un set de parámetros + metadata.
// Holbox es el primer caso validado (vs SUEMA 2022, error 6%). Agregar un caso = una
// entrada nueva aquí con su objeto `inputs` (mismo shape que INITIAL_INPUTS).
import { INITIAL_INPUTS } from '../constants/initialState';
import { HOLBOX_GEO_RECONCILED } from './holbox/geoReconciled';

// Geodata del caso — capa espacial cuantitativa (v1 sintética; luego GeoJSON reales
// de OSM/Google/KMZ vía scripts/geo/prep_*.py). `generation` en kg/día por generador.
export interface GeneratorPoint {
  id: string;
  name: string;
  type: 'hotel' | 'restaurante' | 'comercio' | 'hogar';
  lat: number;
  lng: number;
  generation: number; // kg/día — alimenta el mapa de densidad
  source?: 'osm' | 'denue' | 'overture' | 'manual'; // procedencia del punto
  staff?: string; // estrato de personal ocupado (DENUE) — base de la calibración
  rooms?: number; // (hotel) cuartos — reales Capa 3 o prior de estrato; driver de gen v2
  covers?: number; // (restaurante) comidas-equiv/día — driver de gen v2 (staff × formato)
  category?: string; // (comercio) categoría de residuo (sub-SCIAN) — driver de gen v2_category
  gen_model?: 'v2_rooms' | 'v2_covers' | 'v2_category' | 'v1_staff'; // cómo se calculó generation
  genLow?: number; // cota baja de generation (banda de sensibilidad kg/huésped-noche)
  genHigh?: number; // cota alta de generation
  confidence?: number | null; // score de calidad (Overture)
  match?: 'matched' | 'only'; // paridad espacial vs el backbone DENUE
  inOsm?: boolean; // (DENUE) corroborado por OSM
  inOverture?: boolean; // (DENUE) corroborado por Overture
  confirm?: number; // (DENUE) # de fuentes independientes que corroboran (0/1/2)
  offRegistry?: boolean; // hotel fuera del registro DENUE (visto por Overture, cuartos investigados)
}

// Reconciliación multi-fuente DENUE↔OSM↔Overture: consenso (unidades oficiales
// corroboradas por ≥1 fuente independiente) + aporte de cada fuente.
export interface ReconcileByType {
  type: GeneratorPoint['type'];
  denue: number;
  osm: number;
  overture: number;
  byOsm: number;
  byOverture: number;
  byBoth: number;
  byAny: number; // corroborado por ≥1 fuente
  byNone: number; // solo en el registro oficial
  osmOnly: number; // en OSM, no en DENUE
  overtureOnly: number; // en Overture, no en DENUE (posibles negocios nuevos)
  coverage: number; // % de DENUE corroborado (byAny)
}

export interface ReconcileSummary {
  thresholdM: number;
  byType: ReconcileByType[];
  totals: Omit<ReconcileByType, 'type'>;
}

export interface CaseGeo {
  center: [number, number];
  zoom: number;
  boundary: [number, number][]; // anillo del polígono [lat, lng]
  generators: GeneratorPoint[]; // capa primaria (default view)
  sources?: { denue: GeneratorPoint[]; osm: GeneratorPoint[]; overture: GeneratorPoint[] }; // capas por fuente
  offRegistry?: GeneratorPoint[]; // hoteles fuera de DENUE (Overture+investigados) — cierran gap 134→170 oficial
  reconcile?: ReconcileSummary; // métrica de cobertura OSM↔DENUE
  route?: [number, number][]; // ruta de transporte [lat, lng] — diferido (fuera de v1)
  occupancy?: { annual: number; monthly: Record<string, number> }; // ocupación hotelera Sedetur; gen hotel escala lineal con occ
  genBand?: { lowFactor: number; baseFactor: number; highFactor: number }; // kg/huésped-noche usado (banda de sensibilidad)
  restaurantCoupling?: number; // α: fracción de demanda de restaurante turista-elástica (gen v2_covers escala (1−α)+α·occ(m)/anual)
  synthetic?: boolean; // true = datos de relleno para el esqueleto, no reales
}

export interface StudyCase {
  id: string;
  name: string;
  location: string;
  description: string;
  validated: boolean;
  inputs: any;
  geo?: CaseGeo;
}

export const STUDY_CASES: StudyCase[] = [
  {
    id: 'holbox',
    name: 'Isla Holbox',
    location: 'Quintana Roo, México',
    description: 'SIDS municipal · validado vs SUEMA 2022 (error 6.0%)',
    validated: true,
    inputs: INITIAL_INPUTS,
    geo: HOLBOX_GEO_RECONCILED,
  },
  {
    id: 'plantilla',
    name: 'Nuevo caso (plantilla)',
    location: '—',
    description: 'Parte de la configuración de Holbox; edita los parámetros para tu caso',
    validated: false,
    inputs: INITIAL_INPUTS,
  },
];

export const DEFAULT_CASE = 'holbox';

export const getStudyCase = (id: string): StudyCase =>
  STUDY_CASES.find((c) => c.id === id) ?? STUDY_CASES[0];

// Deep-clone para que editar los parámetros de un caso no mute la config compartida.
export const getInitialInputs = (id: string): any =>
  JSON.parse(JSON.stringify(getStudyCase(id).inputs));
