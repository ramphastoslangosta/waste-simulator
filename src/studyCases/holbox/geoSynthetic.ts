// Geodata SINTÉTICA de Holbox — esqueleto para levantar MapView antes de tener
// las capas reales (OSM/Google/KMZ → GeoJSON vía scripts/geo/prep_holbox.py).
// Coords plausibles alrededor del pueblo de Holbox (~21.52 N, -87.38 W). NO usar
// para análisis: `synthetic: true` marca que son datos de relleno.
import type { CaseGeo } from '../index';

export const HOLBOX_GEO_SYNTHETIC: CaseGeo = {
  center: [21.523, -87.379],
  zoom: 15,
  synthetic: true,
  // Anillo rectangular aproximado sobre la zona urbana + playa (relleno).
  boundary: [
    [21.535, -87.392],
    [21.535, -87.362],
    [21.512, -87.362],
    [21.512, -87.392],
    [21.535, -87.392],
  ],
  // Generadores sintéticos — mezcla hotel/restaurante/comercio/hogar con
  // generación (kg/día) dispersa para que el mapa de densidad tenga contraste.
  generators: [
    { id: 'g1', name: 'Hotel Playa Norte', type: 'hotel', lat: 21.5312, lng: -87.3808, generation: 420 },
    { id: 'g2', name: 'Hotel Casa Sandra', type: 'hotel', lat: 21.5289, lng: -87.3771, generation: 350 },
    { id: 'g3', name: 'Hotel Las Nubes', type: 'hotel', lat: 21.5271, lng: -87.3849, generation: 510 },
    { id: 'g4', name: 'Restaurante El Sabor', type: 'restaurante', lat: 21.5238, lng: -87.3792, generation: 180 },
    { id: 'g5', name: 'Restaurante Marea', type: 'restaurante', lat: 21.5225, lng: -87.3778, generation: 145 },
    { id: 'g6', name: 'Comercio Centro', type: 'comercio', lat: 21.5219, lng: -87.3801, generation: 90 },
    { id: 'g7', name: 'Mercado Local', type: 'comercio', lat: 21.5231, lng: -87.3815, generation: 130 },
    { id: 'g8', name: 'Zona Habitacional Sur', type: 'hogar', lat: 21.5182, lng: -87.3787, generation: 260 },
    { id: 'g9', name: 'Zona Habitacional Este', type: 'hogar', lat: 21.5204, lng: -87.3742, generation: 210 },
    { id: 'g10', name: 'Hotel Villas Flamingos', type: 'hotel', lat: 21.5335, lng: -87.3735, generation: 480 },
  ],
  // Ruta de recolección/transporte sintética: barre el pueblo hacia el sitio de
  // transferencia al sur (relleno, no optimizada).
  route: [
    [21.5335, -87.3735],
    [21.5312, -87.3808],
    [21.5271, -87.3849],
    [21.5238, -87.3792],
    [21.5219, -87.3801],
    [21.5204, -87.3742],
    [21.5150, -87.3760],
  ],
};
