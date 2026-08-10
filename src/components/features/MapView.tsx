// MapView — capa espacial del simulador (react-leaflet).
// Mapea los generadores del caso sobre dos basemaps conmutables (satélite default),
// con filtro por tipo y selector de FUENTE (DENUE / OSM / Overture / Consenso). En
// modo consenso colorea las unidades oficiales (DENUE) por # de fuentes independientes
// que las corroboran, y marca lo que las fuentes frescas ven fuera del registro oficial.
// Sin QGIS en runtime: solo pinta las coords que vienen del `StudyCase.geo`.
import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, LayersControl, Polygon, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { CaseGeo, GeneratorPoint } from '../../studyCases';

const { BaseLayer } = LayersControl;

// Escala de densidad (kg/día) → color. Rampa ámbar→rojo.
const DENSITY_STOPS = [
  { max: 150, color: '#fde68a', label: '< 150' },
  { max: 300, color: '#fbbf24', label: '150–300' },
  { max: 450, color: '#f97316', label: '300–450' },
  { max: Infinity, color: '#dc2626', label: '> 450' },
];
const colorFor = (gen: number) => DENSITY_STOPS.find((s) => gen <= s.max)!.color;
const radiusFor = (gen: number) => 6 + Math.sqrt(gen) * 0.7;

// Vista de consenso: color por nivel de corroboración de la unidad oficial (DENUE),
// más lo que las fuentes independientes ven fuera del registro.
const CONSENSUS = {
  both: { color: '#16a34a', label: 'Oficial · corroborado ×2' },
  one: { color: '#f59e0b', label: 'Oficial · corroborado ×1' },
  none: { color: '#dc2626', label: 'Solo oficial (sin corroborar)' },
  sourceOnly: { color: '#7c3aed', label: 'No en DENUE (posible nuevo)' },
};
const consensusKey = (g: GeneratorPoint): keyof typeof CONSENSUS => {
  if (g.source !== 'denue') return 'sourceOnly';
  return g.confirm === 2 ? 'both' : g.confirm === 1 ? 'one' : 'none';
};

const TYPE_LABEL: Record<GeneratorPoint['type'], string> = {
  hotel: 'Hotel', restaurante: 'Restaurante', comercio: 'Comercio', hogar: 'Hogar',
};

type ViewMode = 'denue' | 'osm' | 'overture' | 'consenso';
const SOURCE_TABS: [ViewMode, string][] = [
  ['denue', 'DENUE'], ['osm', 'OSM'], ['overture', 'Overture'], ['consenso', 'Consenso'],
];

const MONTH_LABEL: Record<string, string> = {
  enero: 'Ene', febrero: 'Feb', marzo: 'Mar', abril: 'Abr', mayo: 'May', junio: 'Jun',
  julio: 'Jul', agosto: 'Ago', septiembre: 'Sep', octubre: 'Oct', noviembre: 'Nov', diciembre: 'Dic',
};
const BAND_TABS: ['low' | 'base' | 'high', string][] = [
  ['low', 'Bajo'], ['base', 'Base'], ['high', 'Alto'],
];

export default function MapView({ geo }: { geo?: CaseGeo }) {
  const hasSources = !!geo?.sources;
  const [mode, setMode] = useState<ViewMode>('denue');

  // Temporada (ocupación estacional Sedetur) + escenario kg (banda de sensibilidad).
  // Afectan a hoteles v2 (gen lineal en ocupación + banda kg/huésped-noche) y a
  // restaurantes v2 (banda kg/comida + acople AMORTIGUADO a la demanda turística:
  // (1−α)+α·occ(m)/anual, con piso residente 1−α). Comercio (v1 staff) no se mueve.
  const occ = geo?.occupancy;
  const months = occ ? Object.keys(occ.monthly) : [];
  const alpha = geo?.restaurantCoupling ?? 0.7;
  const [month, setMonth] = useState<string>('anual');
  const [band, setBand] = useState<'low' | 'base' | 'high'>('base');
  const monthFactor = occ && month !== 'anual' ? occ.monthly[month] / occ.annual : 1;
  const eff = (g: GeneratorPoint) => {
    const b = band === 'low' ? (g.genLow ?? g.generation)
      : band === 'high' ? (g.genHigh ?? g.generation)
      : g.generation;
    if (g.gen_model === 'v2_rooms') return Math.round(b * monthFactor);
    if (g.gen_model === 'v2_covers') return Math.round(b * ((1 - alpha) + alpha * monthFactor));
    return b;
  };

  const basePoints = useMemo<GeneratorPoint[]>(() => {
    if (!geo) return [];
    const s = geo.sources;
    if (!s) return geo.generators;
    if (mode === 'osm') return s.osm;
    if (mode === 'overture') return s.overture;
    // DENUE (vista default) = registro oficial + hoteles fuera de registro (investigados)
    if (mode === 'denue') return [...s.denue, ...(geo.offRegistry ?? [])];
    // consenso: DENUE (coloreado por corroboración) + lo que solo ven las fuentes frescas
    return [
      ...s.denue,
      ...s.osm.filter((g) => g.match === 'only'),
      ...s.overture.filter((g) => g.match === 'only'),
    ];
  }, [geo, mode]);

  const typeCounts = useMemo(() => {
    const c: Partial<Record<GeneratorPoint['type'], number>> = {};
    for (const g of basePoints) c[g.type] = (c[g.type] ?? 0) + 1;
    return Object.entries(c).sort((a, b) => b[1] - a[1]) as [GeneratorPoint['type'], number][];
  }, [basePoints]);

  const [activeTypes, setActiveTypes] = useState<Set<GeneratorPoint['type']>>(
    () => new Set((geo?.sources?.denue ?? geo?.generators ?? []).map((g) => g.type)),
  );
  const toggleType = (t: GeneratorPoint['type']) =>
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });

  const visible = basePoints.filter((g) => activeTypes.has(g.type));

  if (!geo) {
    return (
      <div className="p-8 bg-slate-100 rounded-md text-center text-slate-500">
        Este caso de estudio aún no tiene capa geoespacial configurada.
      </div>
    );
  }

  const rec = geo.reconcile;
  const isConsensus = mode === 'consenso';

  return (
    <div className="space-y-3">
      {geo.synthetic ? (
        <div className="px-4 py-2 bg-amber-50 border border-amber-300 rounded-md text-sm text-amber-800">
          ⚠️ <strong>Datos sintéticos</strong> — geometría de relleno para el esqueleto del mapa.
        </div>
      ) : (
        <div className="px-4 py-2 bg-sky-50 border border-sky-200 rounded-md text-sm text-sky-800">
          ℹ️ <strong>3 fuentes.</strong> DENUE (INEGI, oficial, con tamaño) = backbone · OSM y
          Overture (Meta+MS, mensual) = corroboración independiente. <strong>Hoteles</strong>: gen
          v2 = cuartos reales × ocupación estacional × kg/huésped-noche (banda). <strong>Restaurantes</strong>:
          gen v2 = comidas/día (staff × formato) × kg/comida (banda) × demanda turística (acople α).
          <strong>Comercio</strong>: gen v2 = factor por categoría sub-SCIAN (alimento &gt; no-alimento) +
          giros orgánicos de los excluidos (pan/tortillería/pesca, Tier A).
        </div>
      )}

      {/* Selector de fuente */}
      {hasSources && (
        <div className="flex flex-wrap items-center gap-2 px-1">
          <span className="text-sm font-semibold text-slate-700 mr-1">Fuente:</span>
          {SOURCE_TABS.map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${
                mode === m ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Filtro por tipo */}
      <div className="flex flex-wrap items-center gap-2 px-1">
        <span className="text-sm font-semibold text-slate-700 mr-1">Tipo:</span>
        {typeCounts.map(([t, n]) => {
          const on = activeTypes.has(t);
          return (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                on ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {TYPE_LABEL[t]} <span className="opacity-80">({n})</span>
            </button>
          );
        })}
        <span className="text-xs text-slate-500 ml-1">
          Mostrando <strong>{visible.length}</strong> de {basePoints.length}
        </span>
      </div>

      {/* Temporada + escenario kg (solo si el caso trae ocupación estacional) */}
      {occ && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-700 mr-1">Temporada:</span>
            {(['anual', ...months]).map((m) => (
              <button
                key={m}
                onClick={() => setMonth(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                  month === m ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {m === 'anual' ? 'Anual' : MONTH_LABEL[m] ?? m}
                {m !== 'anual' && <span className="opacity-70"> {Math.round(occ.monthly[m] * 100)}%</span>}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-700 mr-1">Escenario kg:</span>
            {BAND_TABS.map(([b, label]) => (
              <button
                key={b}
                onClick={() => setBand(b)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                  band === b ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
                }`}
              >
                {label}
                {geo.genBand && (
                  <span className="opacity-70"> {b === 'low' ? geo.genBand.lowFactor : b === 'high' ? geo.genBand.highFactor : geo.genBand.baseFactor}</span>
                )}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 ml-auto">
            Σ visible: <strong>{(visible.reduce((s, g) => s + eff(g), 0) / 1000).toFixed(1)} t/día</strong>
            {(month !== 'anual' || band !== 'base') && <span className="text-slate-400"> (hoteles + restaurantes ajustados)</span>}
          </span>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm" style={{ height: '560px' }}>
        <MapContainer center={geo.center} zoom={geo.zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
          <LayersControl position="topright">
            <BaseLayer checked name="Satélite (Esri World Imagery)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
              />
            </BaseLayer>
            <BaseLayer name="Mapa claro (CARTO Positron)">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; OpenStreetMap &copy; CARTO'
                subdomains="abcd"
              />
            </BaseLayer>
          </LayersControl>

          <Polygon positions={geo.boundary} pathOptions={{ color: '#2563eb', weight: 2, fillOpacity: 0.05 }} />

          {visible.map((g) => {
            const g_eff = eff(g);
            const fill = isConsensus ? CONSENSUS[consensusKey(g)].color : colorFor(g_eff);
            const radius = isConsensus ? 5 : radiusFor(g_eff);
            const off = g.offRegistry;
            return (
              <CircleMarker
                key={`${g.source}-${g.id}`}
                center={[g.lat, g.lng]}
                radius={radius}
                pathOptions={{
                  color: off ? '#7c3aed' : '#1e293b',
                  weight: off ? 2.5 : 1,
                  dashArray: off ? '3 2' : undefined,
                  fillColor: fill,
                  fillOpacity: 0.8,
                }}
              >
                <Tooltip direction="top" offset={[0, -4]}>
                  <div className="text-xs">
                    <div className="font-semibold">{g.name}</div>
                    <div>{TYPE_LABEL[g.type]} · {g_eff} kg/día</div>
                    {g.offRegistry && (
                      <div className="text-violet-600 font-medium">◆ Fuera de registro DENUE (Overture)</div>
                    )}
                    {g.type === 'hotel' && g.rooms ? (
                      <div className="text-slate-500">
                        {g.rooms} cuartos · {g.gen_model === 'v2_rooms'
                          ? `gen v2 (${month === 'anual' ? 'anual' : MONTH_LABEL[month] ?? month} · kg ${band})`
                          : 'prior estrato'}
                      </div>
                    ) : g.type === 'restaurante' && g.gen_model === 'v2_covers' ? (
                      <div className="text-slate-500">
                        {g.covers} comidas/día · gen v2 ({month === 'anual' ? 'anual' : MONTH_LABEL[month] ?? month} · kg {band})
                      </div>
                    ) : g.type === 'comercio' && g.gen_model === 'v2_category' ? (
                      <div className="text-slate-500">
                        {g.category || 'comercio'} · gen v2 (factor por categoría)
                      </div>
                    ) : (
                      g.staff && <div className="text-slate-500">{g.staff}</div>
                    )}
                    {isConsensus && <div className="text-slate-500">{CONSENSUS[consensusKey(g)].label}</div>}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Leyenda — según modo */}
      {isConsensus ? (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 px-1">
          <span className="font-semibold text-slate-700">Consenso:</span>
          {Object.values(CONSENSUS).map((r) => (
            <span key={r.label} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
              {r.label}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 px-1">
          <span className="font-semibold text-slate-700">Densidad de generación (kg/día):</span>
          {DENSITY_STOPS.map((s) => (
            <span key={s.label} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      )}

      {/* Panel de consenso (solo en modo consenso) */}
      {isConsensus && rec && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
          <div className="font-semibold text-slate-700 mb-2">
            Consenso multi-fuente — {rec.totals.coverage}% de las {rec.totals.denue} unidades oficiales
            corroboradas por ≥1 fuente independiente (umbral {rec.thresholdM}m)
          </div>
          <table className="w-full text-left">
            <thead className="text-slate-500">
              <tr>
                <th className="py-1">Tipo</th><th>DENUE</th><th>Corrob.</th><th>Solo oficial</th>
                <th>+OSM</th><th>+Overture</th><th>Cobertura</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {rec.byType.map((r) => (
                <tr key={r.type} className="border-t border-slate-100">
                  <td className="py-1 capitalize">{r.type}</td>
                  <td>{r.denue}</td><td>{r.byAny}</td><td>{r.byNone}</td>
                  <td>{r.osmOnly}</td><td>{r.overtureOnly}</td><td>{r.coverage}%</td>
                </tr>
              ))}
              <tr className="border-t border-slate-300 font-semibold">
                <td className="py-1">Total</td>
                <td>{rec.totals.denue}</td><td>{rec.totals.byAny}</td><td>{rec.totals.byNone}</td>
                <td>{rec.totals.osmOnly}</td><td>{rec.totals.overtureOnly}</td><td>{rec.totals.coverage}%</td>
              </tr>
            </tbody>
          </table>
          <div className="text-slate-400 mt-2">
            «+OSM/+Overture» = unidades que esa fuente ve y no están en el registro oficial (posibles negocios nuevos).
          </div>
        </div>
      )}
    </div>
  );
}
