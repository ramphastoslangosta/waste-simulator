// ========================================================================
// FILE: src/components/features/ProcessAnalysis.js
// ========================================================================
import React from 'react';
import { Package, Warehouse, Ship, Trash2, Leaf, TrendingUp, Clock } from 'lucide-react';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import ChartExportWrapper from '../ui/ChartExportWrapper.tsx';
import { formatNumber } from '../../utils/formatNumber';

const ProcessAnalysis = ({ kpis, season, inputs }) => {
    const data = kpis.rsu.calculations;
    const recoveryByStage = kpis.rsu.recoveryByStage;
    const inventoryLevels = kpis.rsu.inventoryLevels || {};
    const valorization = kpis.valorization || { composted: 0, biogas: 0, pyrolyzed: 0 };
    const totalValorized = valorization.composted + valorization.biogas + valorization.pyrolyzed;
    
    // Calculate inventory percentages and wait times
    const transferStationInventoryPercentage = inputs.rsuSystem.processing.transferStationCapacity > 0 ? 
        (inventoryLevels.transferStation / inputs.rsuSystem.processing.transferStationCapacity) * 100 : 0;
    
    const collectionVehicleCapacityPercentage = inputs.rsuSystem.logistics ? 
        (inventoryLevels.collectionVehicles / (inputs.rsuSystem.logistics.vehicles * inputs.rsuSystem.logistics.vehicleCapacity)) * 100 : 0;
        
    const finalTransportCapacityPercentage = inputs.rsuSystem.processing.finalTransportCapacity > 0 ? 
        (inventoryLevels.finalTransportVehicles / inputs.rsuSystem.processing.finalTransportCapacity) * 100 : 0;
    
    const ProgressBar = ({ value }) => (
        <div className="w-full bg-slate-200 rounded-full h-4 mt-2">
            <div 
                className={`h-4 rounded-full transition-all duration-500 ${value > 90 ? 'bg-red-500' : value > 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
                style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
        </div>
    );

    const ProcessCard = ({ title, icon, rateIn, rateOut, inventory, waitTime, children }) => (
        <Card className="flex-1">
            <div className="flex items-center mb-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl mr-4">{icon}</div>
                <div>
                    <h4 className="font-bold text-xl text-slate-900">{title}</h4>
                </div>
            </div>
            <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span>Tasa de Entrada (Promedio):</span> <span className="font-bold font-mono">{formatNumber(rateIn, 1)} ton/día</span></div>
                <div className="flex justify-between"><span>Tasa de Salida (Promedio):</span> <span className="font-bold font-mono">{formatNumber(rateOut, 1)} ton/día</span></div>
                {inventory !== null && <div className="flex justify-between"><span>Acumulado/No Procesado:</span> <span className="font-bold font-mono">{formatNumber(inventory, 1)} ton</span></div>}
                {waitTime !== null && <div className="flex justify-between"><span>Tiempo de Espera (Promedio):</span> <span className="font-bold font-mono">{formatNumber(waitTime, 1)} días</span></div>}
                <div className="border-t border-slate-200 mt-3 pt-3">{children}</div>
            </div>
        </Card>
    );

    return (
        <ChartExportWrapper
            title={`Análisis de Procesos del Sistema RSU (${season})`}
            subtitle="Evaluación de la dinámica y cuellos de botella del sistema (promedios de simulación de 30 días)."
            enableExport={true}
        >
            <div className="space-y-8">
                {/* Main Process Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    <ProcessCard title="Recolección" icon={<Package size={24}/>} rateIn={kpis.rsu.totalGeneration} rateOut={data.collectedWasteTotal} inventory={inventoryLevels.collectionVehicles || 0} waitTime={null}>
                        <div className="flex justify-between text-orange-600"><span>Recuperación Informal:</span> <span className="font-bold font-mono">{formatNumber(data.informalRecoveryCollection, 2)} ton/día</span></div>
                        <div className="flex justify-between text-red-600"><span>Fuga en Ruta:</span> <span className="font-bold font-mono">{formatNumber(data.leakCollection, 2)} ton/día</span></div>
                        <div className="flex justify-between text-amber-600"><span>Déficit Diario:</span> <span className="font-bold font-mono">{formatNumber(kpis.rsu.collectionDeficit, 2)} ton/día</span></div>
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Uso Capacidad Vehículos</span>
                                <span>{formatNumber(collectionVehicleCapacityPercentage, 0)}%</span>
                            </div>
                            <ProgressBar value={collectionVehicleCapacityPercentage} />
                        </div>
                    </ProcessCard>
                    
                    <ProcessCard title="Estación Transferencia" icon={<Warehouse size={24}/>} rateIn={data.toTransferStationTotal} rateOut={data.toFinalTransport + totalValorized} inventory={inventoryLevels.transferStation || 0} waitTime={kpis.rsu.inventoryWaitTime}>
                        <div className="flex justify-between text-green-600"><span>Reciclaje (Alta Cal.):</span> <span className="font-bold font-mono">{formatNumber(recoveryByStage.source, 2)} ton/día</span></div>
                        <div className="flex justify-between text-yellow-600"><span>Reciclaje (Baja Cal.):</span> <span className="font-bold font-mono">{formatNumber(recoveryByStage.plant, 2)} ton/día</span></div>
                        {totalValorized > 0 && (
                            <div className="flex justify-between text-purple-600"><span>Valorización:</span> <span className="font-bold font-mono">{formatNumber(totalValorized, 2)} ton/día</span></div>
                        )}
                        <div className="flex justify-between text-red-600"><span>Fuga en Proceso:</span> <span className="font-bold font-mono">{formatNumber(data.leakTransferStation, 2)} ton/día</span></div>
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Uso Capacidad Almacenamiento</span>
                                <span>{formatNumber(transferStationInventoryPercentage, 0)}%</span>
                            </div>
                            <ProgressBar value={transferStationInventoryPercentage} />
                        </div>
                    </ProcessCard>
                    
                    <ProcessCard title="Traslado Final" icon={<Ship size={24}/>} rateIn={data.toFinalTransport} rateOut={data.toDisposalSite} inventory={inventoryLevels.finalTransportVehicles || 0} waitTime={null}>
                        <div className="flex justify-between text-red-600"><span>Fuga en Traslado:</span> <span className="font-bold font-mono">{formatNumber(data.leakFinalTransport, 2)} ton/día</span></div>
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Uso Capacidad Transporte</span>
                                <span>{formatNumber(finalTransportCapacityPercentage, 0)}%</span>
                            </div>
                            <ProgressBar value={finalTransportCapacityPercentage} />
                        </div>
                    </ProcessCard>
                    
                    <ProcessCard title="Disposición Final" icon={<Trash2 size={24}/>} rateIn={data.toDisposalSite} rateOut={kpis.rsu.toDisposal} inventory={inventoryLevels.disposalSite || 0} waitTime={null}>
                        <div className="flex justify-between text-orange-600"><span>Recuperación Informal:</span> <span className="font-bold font-mono">{formatNumber(data.informalRecoveryDisposal, 2)} ton/día</span></div>
                        <div className="flex justify-between text-red-600"><span>Fuga en Sitio:</span> <span className="font-bold font-mono">{formatNumber(data.leakDisposal, 2)} ton/día</span></div>
                        <div className="flex justify-between text-slate-600"><span>Inventario Acumulado:</span> <span className="font-bold font-mono">{formatNumber(inventoryLevels.disposalSite || 0, 1)} ton</span></div>
                    </ProcessCard>
                </div>

                {/* Valorization Process Analysis */}
                {totalValorized > 0 && (
                    <div className="border-t-2 border-dashed border-purple-300 pt-6">
                        <h4 className="text-center text-purple-700 font-bold mb-6 flex items-center justify-center">
                            <Leaf size={20} className="mr-2" />
                            Análisis de Procesos de Valorización
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {valorization.composted > 0 && (
                                <Card>
                                    <div className="flex items-center mb-4">
                                        <div className="bg-green-100 text-green-600 p-3 rounded-xl mr-4">
                                            <Leaf size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl text-slate-900">Compostaje</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span>Material Procesado:</span> <span className="font-bold font-mono text-green-600">{formatNumber(valorization.composted, 1)} ton/día</span></div>
                                        <div className="flex justify-between"><span>Ingresos Generados:</span> <span className="font-bold font-mono text-green-600">{formatNumber((valorization.composted * (inputs.rsuSystem.valorization?.compostIncome || 0)), 0)} MXN/día</span></div>
                                        <div className="flex justify-between"><span>Eficiencia Proceso:</span> <span className="font-bold font-mono">{inputs.rsuSystem.valorization?.compostingEfficiency || 0}%</span></div>
                                    </div>
                                </Card>
                            )}
                            
                            {valorization.biogas > 0 && (
                                <Card>
                                    <div className="flex items-center mb-4">
                                        <div className="bg-blue-100 text-blue-600 p-3 rounded-xl mr-4">
                                            <TrendingUp size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl text-slate-900">Biogás</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span>Material Procesado:</span> <span className="font-bold font-mono text-blue-600">{formatNumber(valorization.biogas, 1)} ton/día</span></div>
                                        <div className="flex justify-between"><span>Ingresos Generados:</span> <span className="font-bold font-mono text-blue-600">{formatNumber((valorization.biogas * (inputs.rsuSystem.valorization?.biogasIncome || 0)), 0)} MXN/día</span></div>
                                        <div className="flex justify-between"><span>Eficiencia Proceso:</span> <span className="font-bold font-mono">{inputs.rsuSystem.valorization?.biogasEfficiency || 0}%</span></div>
                                    </div>
                                </Card>
                            )}
                            
                            {valorization.pyrolyzed > 0 && (
                                <Card>
                                    <div className="flex items-center mb-4">
                                        <div className="bg-orange-100 text-orange-600 p-3 rounded-xl mr-4">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-xl text-slate-900">Pirólisis</h4>
                                        </div>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span>Material Procesado:</span> <span className="font-bold font-mono text-orange-600">{formatNumber(valorization.pyrolyzed, 1)} ton/día</span></div>
                                        <div className="flex justify-between"><span>Ingresos Generados:</span> <span className="font-bold font-mono text-orange-600">{formatNumber((valorization.pyrolyzed * (inputs.rsuSystem.valorization?.pyrolysisIncome || 0)), 0)} MXN/día</span></div>
                                        <div className="flex justify-between"><span>Eficiencia Proceso:</span> <span className="font-bold font-mono">{inputs.rsuSystem.valorization?.pyrolysisEfficiency || 0}%</span></div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                {/* System Performance Summary */}
                <div className="border-t-2 border-dashed border-slate-300 pt-6">
                    <h4 className="text-center text-slate-700 font-bold mb-6 flex items-center justify-center">
                        <Clock size={20} className="mr-2" />
                        Resumen de Rendimiento del Sistema
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <div className="text-center">
                                <h5 className="font-semibold text-slate-700 mb-2">Eficiencia de Recolección</h5>
                                <p className="text-2xl font-bold text-blue-600">
                                    {formatNumber(((data.collectedWasteTotal / kpis.rsu.totalGeneration) * 100), 1)}%
                                </p>
                                <p className="text-xs text-slate-500">de RSU generado</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h5 className="font-semibold text-slate-700 mb-2">Tasa de Recuperación</h5>
                                <p className="text-2xl font-bold text-green-600">
                                    {formatNumber(((recoveryByStage.source + recoveryByStage.plant + totalValorized) / kpis.rsu.totalGeneration) * 100, 1)}%
                                </p>
                                <p className="text-xs text-slate-500">reciclaje + valorización</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h5 className="font-semibold text-slate-700 mb-2">Tiempo Espera Promedio</h5>
                                <p className="text-2xl font-bold text-orange-600">
                                    {formatNumber(kpis.rsu.inventoryWaitTime, 1)}
                                </p>
                                <p className="text-xs text-slate-500">días en transferencia</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <h5 className="font-semibold text-slate-700 mb-2">Pérdidas Totales</h5>
                                <p className="text-2xl font-bold text-red-600">
                                    {formatNumber((kpis.rsu.totalLeak / kpis.rsu.totalGeneration) * 100, 1)}%
                                </p>
                                <p className="text-xs text-slate-500">fugas del sistema</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </ChartExportWrapper>
    );
};

export default ProcessAnalysis;
