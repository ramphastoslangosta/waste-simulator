// ========================================================================
// FILE: src/components/features/ResultsTable.js
// ========================================================================
import React from 'react';
import { Download } from 'lucide-react';
import Card from '../ui/Card.tsx';
// import CardHeader from '../ui/CardHeader.tsx';
import { exportCalculationsToCSV, downloadCSV } from '../../utils/csvUtils';
import { formatNumber } from '../../utils/formatNumber';

// =================================================================================
// NEW COMPONENT: DetailedResultsTable
// =================================================================================
const ResultsTable = ({ kpis, inputs, season }) => {
    const rsuKpis = kpis.rsu;
    const data = rsuKpis.calculations;
    const rsuInputs = inputs.rsuSystem;

    // Access generation by source - now available at top level
    const genBySource = rsuKpis.genBySource || data.genBySource || {
        hotels: 0,
        restaurants: 0,
        homes: 0,
        commerce: 0
    };

    const handleExportCalculations = () => {
        try {
            const csvContent = exportCalculationsToCSV(kpis, inputs, season);
            const timestamp = new Date().toISOString().split('T')[0];
            const seasonLabel = season.toLowerCase().replace(' ', '-');
            downloadCSV(csvContent, `calculos-detallados-${seasonLabel}-${timestamp}.csv`);
        } catch (error) {
            console.error('Error exporting calculations:', error);
            alert('Error al exportar cálculos: ' + error.message);
        }
    };

    const Row = ({ label, value, unit, bold = false, indent = 0, highlight = false, isTitle = false, calculation = "" }) => (
        <tr className={highlight ? 'bg-slate-100' : 'border-b border-slate-100'}>
            {isTitle ? (
                <td colSpan="4" className="py-3 px-4 bg-blue-100 font-bold text-blue-900">{label}</td>
            ) : (
                <>
                    <td className={`py-3 px-4 ${bold ? 'font-bold text-slate-900' : 'text-slate-700'}`} style={{ paddingLeft: `${1 + indent * 1.5}rem` }}>{label}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">{formatNumber(value, 2)}</td>
                    <td className="py-3 px-4 text-left text-slate-600">{unit}</td>
                    <td className="py-3 px-4 text-left text-xs text-slate-600 font-mono">{calculation}</td>
                </>
            )}
        </tr>
    );

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{`Tabla de Cálculos Detallados (${season})`}</h3>
                    <p className="text-sm text-slate-500">Desglose completo del flujo de RSU (promedios de simulación de 30 días).</p>
                </div>
                <button
                    onClick={handleExportCalculations}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Download size={16} className="mr-2" />
                    Exportar CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-blue-50">
                        <tr>
                            <th className="py-3 px-4 text-left w-2/5 font-semibold text-blue-900">Concepto</th>
                            <th className="py-3 px-4 text-right font-semibold text-blue-900">Valor</th>
                            <th className="py-3 px-4 text-left font-semibold text-blue-900">Unidad</th>
                            <th className="py-3 px-4 text-left w-2/5 font-semibold text-blue-900">Inputs y Desglose del Cálculo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* --- GENERACIÓN --- */}
                        <Row isTitle={true} label="ETAPA 1: GENERACIÓN DE RSU" />
                        <Row label="Generación Total de RSU" value={rsuKpis.totalGeneration} unit="ton/día" bold={true} calculation="Suma de todas las fuentes" />
                        <Row 
                            label="Generado por Hoteles" 
                            value={genBySource.hotels} 
                            unit="ton/día" 
                            indent={1} 
                            calculation={`${inputs.generation.hotels.units} cuartos × ${season === 'Temporada Alta' ? inputs.general.highSeasonOccupancy : inputs.general.lowSeasonOccupancy}% ocup. × ${inputs.generation.hotels.rate} kg/cuarto/día ÷ 1000`}
                        />
                        <Row 
                            label="Generado por Restaurantes" 
                            value={genBySource.restaurants} 
                            unit="ton/día" 
                            indent={1}
                            calculation={`${inputs.generation.restaurants.units} locales × ${inputs.generation.restaurants.rate} kg/local/día ÷ 1000`}
                        />
                        <Row 
                            label="Generado por Hogares" 
                            value={genBySource.homes} 
                            unit="ton/día" 
                            indent={1}
                            calculation={`${inputs.general.fixedPopulation} hab. × ${inputs.generation.homes.rate} kg/hab/día ÷ 1000`}
                        />
                        <Row 
                            label="Generado por Comercios" 
                            value={genBySource.commerce} 
                            unit="ton/día" 
                            indent={1}
                            calculation={`${inputs.generation.commerce.units} locales × ${inputs.generation.commerce.rate} kg/local/día ÷ 1000`}
                        />

                        {/* --- RECOLECCIÓN --- */}
                        <Row isTitle={true} label="ETAPA 2: RECOLECCIÓN Y LOGÍSTICA PRIMARIA" />
                        <Row label="Capacidad de Recolección" value={data.collectionCapacity} unit="ton/día" bold={true} calculation={`${rsuInputs.logistics.vehicles} veh. × ${rsuInputs.logistics.vehicleCapacity} ton × ${rsuInputs.logistics.tripsPerVehicle} viajes`} />
                        <Row label="Déficit de Recolección (Fuga)" value={rsuKpis.collectionDeficit} unit="ton/día" bold={true} highlight={true} calculation="MAX(0, Generación RSU - Capacidad)" />
                        <Row label="Total Recolectado" value={data.collectedWasteTotal} unit="ton/día" bold={true} calculation="Generación RSU - Déficit" />
                        <Row label="Recuperación Informal (en ruta)" value={data.informalRecoveryCollection} unit="ton/día" indent={1} calculation={`Total Recolectado × ${rsuInputs.separation.informalRecoveryRateCollection}%`} />
                        <Row label="Fuga en Recolección (derrame)" value={data.leakCollection} unit="ton/día" indent={1} highlight={true} calculation={`(Recolectado - Rec. Informal) × ${rsuInputs.leaks.collectionLeak}%`} />
                        <Row label="Entrada a Sitio de Transferencia" value={data.toTransferStationTotal} unit="ton/día" bold={true} calculation="Recolectado - Rec. Informal - Fuga" />

                        {/* --- PROCESAMIENTO Y VALORIZACIÓN --- */}
                        <Row isTitle={true} label="ETAPA 3: SITIO DE TRANSFERENCIA Y VALORIZACIÓN" />
                        <Row label="Tasa de Procesamiento de la Planta" value={rsuInputs.processing.transferStationRate} unit="ton/día" bold={true} calculation="Input: Capacidad de la maquinaria" />
                        <Row label="Material Procesado (Promedio diario)" value={data.materialProcessedToday} unit="ton/día" bold={true} calculation="MIN(Material Disponible, Tasa de Proc.)" />
                        <Row label="Inventario Acumulado (Día 30)" value={rsuKpis.finalInventory} unit="ton" bold={true} highlight={true} calculation="Acumulación diaria limitada por capacidad" />
                        <Row label="Recuperación Formal Total" value={data.totalRecoveredAtStation} unit="ton/día" bold={true} indent={1} calculation="Suma de Alta y Baja Calidad" />
                        <Row label="Recuperado Alta Calidad (Origen)" value={rsuKpis.recoveryByStage.source} unit="ton/día" indent={2} />
                        <Row label="Recuperado Baja Calidad (Planta)" value={rsuKpis.recoveryByStage.plant} unit="ton/día" indent={2} />
                        <Row label="Fuga en Planta (pérdida de proceso)" value={data.leakTransferStation} unit="ton/día" indent={1} highlight={true} calculation={`Material Procesado × ${rsuInputs.leaks.transferStationLeak}%`} />
                        <Row label="Material para Traslado Final" value={data.toFinalTransport} unit="ton/día" bold={true} calculation="Procesado - Recuperado - Fuga" />

                        {/* --- DISPOSICIÓN FINAL --- */}
                        <Row isTitle={true} label="ETAPA 4: TRASLADO Y DISPOSICIÓN FINAL" />
                        <Row label="Capacidad de Traslado Final" value={rsuInputs.processing.finalTransportCapacity} unit="ton/día" bold={true} calculation="Input: Capacidad de camiones de carga" />
                        <Row label="Material Efectivamente Trasladado" value={data.actualFinalTransport} unit="ton/día" bold={true} calculation="MIN(Material para Traslado, Capacidad)" />
                        <Row label="Material No Trasladado (acum. en planta)" value={data.untransportedMaterial} unit="ton/día" indent={1} highlight={true} calculation="Material para Traslado - Trasladado" />
                        <Row label="Fuga en Traslado Final" value={data.leakFinalTransport} unit="ton/día" indent={1} highlight={true} calculation={`Trasladado × ${rsuInputs.leaks.finalTransportLeak}%`} />
                        <Row label="Entrada a Disposición Final" value={data.toDisposalSite} unit="ton/día" bold={true} calculation="Trasladado - Fuga en Traslado" />
                        <Row label="Recuperación Informal (en sitio)" value={data.informalRecoveryDisposal} unit="ton/día" indent={1} calculation={`Entrada a Disp. × % Valorizables × ${rsuInputs.separation.informalRecoveryRateDisposal}%`} />
                        <Row label="Fuga en Disposición Final" value={data.leakDisposal} unit="ton/día" indent={1} highlight={true} calculation={`Entrada a Disp. × ${rsuInputs.leaks.disposalLeak}%`} />
                        <Row label="Residuo Final Enterrado" value={rsuKpis.toDisposal} unit="ton/día" bold={true} highlight={true} calculation="Entrada a Disp. - Rec. Informal - Fuga" />
                        
                        {/* --- FINANZAS RSU --- */}
                        <Row isTitle={true} label="ANÁLISIS FINANCIERO (SOLO RSU)" />
                        <Row label="Ingresos Totales por Venta" value={rsuKpis.totalRsuIncome} unit="MXN/día" bold={true} calculation="Suma de venta de materiales" />
                        <Row label="Costos Totales de Operación" value={rsuKpis.totalRsuCosts} unit="MXN/día" bold={true} calculation="Suma de costos de todas las etapas" />
                        <Row label="Costo de Recolección" value={data.totalCollectionCost} unit="MXN/día" indent={1} calculation={`Total Recolectado × ${rsuInputs.economics.collectionCost} MXN/ton`} />
                        <Row label="Costo de Transferencia" value={data.totalTransferCost} unit="MXN/día" indent={1} calculation={`Material Procesado × ${rsuInputs.economics.transferStationCost} MXN/ton`} />
                        <Row label="Costo de Traslado Final" value={data.totalFinalTransportCost} unit="MXN/día" indent={1} calculation={`Material Trasladado × ${rsuInputs.economics.finalTransportCost} MXN/ton`} />
                        <Row label="Costo de Disposición Final" value={data.totalDisposalCost} unit="MXN/día" indent={1} calculation={`Entrada a Disp. × ${rsuInputs.economics.disposalCost} MXN/ton`} />
                        <Row label="Costo Neto del Sistema RSU" value={rsuKpis.netCostPerDay} unit="MXN/día" bold={true} highlight={true} calculation="Costos Totales - Ingresos Totales" />
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default ResultsTable;