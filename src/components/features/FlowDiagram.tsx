// ========================================================================
// FILE: src/components/features/FlowDiagram.js
// ========================================================================
import React from 'react';
import { ArrowRight, ArrowDown, Recycle, AlertTriangle, Factory, Package, Warehouse, Ship, Trash2, Leaf, DollarSign, TrendingUp } from 'lucide-react';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import ExportButton from '../ui/ExportButton.tsx';
import { useExportRef } from '../../hooks/useExportRef';
import { formatNumber } from '../../utils/formatNumber';

const FlowDiagram = ({ kpis, season }) => {
    const data = kpis.rsu.calculations;
    const recoveryByStage = kpis.rsu.recoveryByStage;
    const valorization = kpis.valorization || { composted: 0, biogas: 0, pyrolyzed: 0 };
    const totalValorized = valorization.composted + valorization.biogas + valorization.pyrolyzed;
    const separationPrograms = kpis.separationProgramCosts > 0;
    const { elementRef } = useExportRef();

    const FlowBox = ({ title, value, icon }) => (
        <div className="bg-white p-4 rounded-xl shadow-lg text-center border border-slate-200 flex-shrink-0 w-48 min-h-[140px] flex flex-col justify-center hover:shadow-xl transition-shadow duration-300">
            <div className="text-blue-600 mx-auto mb-2">{icon}</div>
            <h4 className="font-bold text-slate-900">{title}</h4>
            <p className="text-2xl font-bold text-slate-900">{formatNumber(value, 1)}</p>
            <p className="text-xs text-slate-500">ton/día</p>
        </div>
    );

    const FlowArrow = ({ value }) => (
        <div className="flex-grow flex items-center justify-center relative w-full md:w-auto h-16 md:h-auto">
            <ArrowRight className="text-slate-400 w-8 h-8 mx-2 absolute" />
            <span className="absolute -top-3 md:top-auto md:-bottom-6 bg-slate-100 px-2 py-1 text-xs rounded-md font-semibold">{formatNumber(value, 1)} ton/día</span>
        </div>
    );
    
    const LossArrow = ({ value, label, icon, color }) => (
        <div className="flex items-center mt-2 text-sm w-full">
            <ArrowDown className={`${color} w-4 h-4 mr-2 flex-shrink-0`} />
            <div className={`${color} font-semibold flex items-center`}>
                {icon}
                <span className="ml-1">{label}:</span>
            </div>
            <div className="ml-auto font-mono">{formatNumber(value, 2)} ton</div>
        </div>
    );

    const ValorizationBox = ({ title, value, icon, color }) => (
        <div className={`${color} p-3 rounded-lg text-center border-2 border-dashed w-40 min-h-[100px] flex flex-col justify-center`}>
            <div className="mx-auto mb-1">{icon}</div>
            <h5 className="font-semibold text-xs">{title}</h5>
            <p className="text-lg font-bold">{formatNumber(value, 1)}</p>
            <p className="text-xs opacity-75">ton/día</p>
        </div>
    );

    const IncomeIndicator = ({ value }) => (
        value > 0 && (
            <div className="flex items-center mt-1 text-xs text-green-600">
                <DollarSign size={12} className="mr-1" />
                <span>{formatNumber(value, 0)} MXN</span>
            </div>
        )
    );

    const EnhancementBadge = () => (
        separationPrograms && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <TrendingUp size={10} className="mr-1" />
                Mejorado
            </div>
        )
    );

    return (
        <div ref={elementRef} data-export-name={`Diagrama de Flujo del Sistema RSU (${season})`}>
            <Card>
                <div className="flex justify-between items-start mb-4">
                    <CardHeader 
                        title={`Diagrama de Flujo del Sistema RSU (${season})`} 
                        subtitle="Visualización del recorrido promedio diario de los Residuos Sólidos Urbanos." 
                    />
                    <ExportButton
                        targetElement={elementRef.current}
                        exportName={`Diagrama de Flujo del Sistema RSU (${season})`}
                        exportType="chart"
                        size="sm"
                        showLabel={true}
                    />
                </div>
            <div className="space-y-8">
                {/* Main Flow Line */}
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-4 overflow-x-auto p-4">
                    <div className="flex flex-col items-center space-y-2 relative">
                        <FlowBox title="Generación RSU" value={kpis.rsu.totalGeneration} icon={<Factory size={24}/>} />
                        <EnhancementBadge />
                        <LossArrow value={kpis.rsu.collectionDeficit} label="No Recolectado" icon={<AlertTriangle size={16}/>} color="text-red-500" />
                    </div>
                    <FlowArrow value={data.collectedWasteTotal}/>
                    <div className="flex flex-col items-center space-y-2">
                        <FlowBox title="Recolección" value={data.collectedWasteTotal} icon={<Package size={24}/>} />
                        <LossArrow value={data.informalRecoveryCollection} label="Rec. Informal" icon={<Recycle size={16}/>} color="text-orange-500" />
                        <LossArrow value={data.leakCollection} label="Fuga" icon={<AlertTriangle size={16}/>} color="text-red-500" />
                    </div>
                    <FlowArrow value={data.toTransferStationTotal} />
                    <div className="flex flex-col items-center space-y-2 relative">
                        <FlowBox title="Estación Transferencia" value={data.toTransferStationTotal} icon={<Warehouse size={24}/>} />
                        <LossArrow value={recoveryByStage.source + recoveryByStage.plant} label="Reciclaje Formal" icon={<Recycle size={16}/>} color="text-green-500" />
                        {totalValorized > 0 && (
                            <LossArrow value={totalValorized} label="Valorización" icon={<Leaf size={16}/>} color="text-purple-500" />
                        )}
                        <LossArrow value={data.leakTransferStation} label="Fuga" icon={<AlertTriangle size={16}/>} color="text-red-500" />
                        <IncomeIndicator value={(kpis.valorizationIncomes || 0) + (kpis.rsu.totalRsuIncome || 0)} />
                    </div>
                    <FlowArrow value={data.toFinalTransport}/>
                    <div className="flex flex-col items-center space-y-2">
                        <FlowBox title="Traslado Final" value={data.toFinalTransport} icon={<Ship size={24}/>} />
                        <LossArrow value={data.leakFinalTransport} label="Fuga en Traslado" icon={<AlertTriangle size={16}/>} color="text-red-500" />
                    </div>
                    <FlowArrow value={data.toDisposalSite}/>
                    <div className="flex flex-col items-center space-y-2">
                        <FlowBox title="Disposición Final" value={data.toDisposalSite} icon={<Trash2 size={24}/>} />
                        <LossArrow value={data.informalRecoveryDisposal} label="Rec. Informal" icon={<Recycle size={16}/>} color="text-orange-500" />
                        <LossArrow value={data.leakDisposal} label="Fuga en Sitio" icon={<AlertTriangle size={16}/>} color="text-red-500" />
                    </div>
                </div>

                {/* Valorization Processes Branch */}
                {totalValorized > 0 && (
                    <div className="border-t-2 border-dashed border-purple-300 pt-6">
                        <h4 className="text-center text-purple-700 font-bold mb-4 flex items-center justify-center">
                            <Leaf size={20} className="mr-2" />
                            Procesos de Valorización en Estación de Transferencia
                        </h4>
                        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
                            {valorization.composted > 0 && (
                                <ValorizationBox
                                    title="Compostaje"
                                    value={valorization.composted}
                                    icon={<Leaf size={20} className="text-green-600" />}
                                    color="bg-green-50 border-green-300"
                                />
                            )}
                            {valorization.biogas > 0 && (
                                <ValorizationBox
                                    title="Biogás"
                                    value={valorization.biogas}
                                    icon={<Factory size={20} className="text-blue-600" />}
                                    color="bg-blue-50 border-blue-300"
                                />
                            )}
                            {valorization.pyrolyzed > 0 && (
                                <ValorizationBox
                                    title="Pirólisis"
                                    value={valorization.pyrolyzed}
                                    icon={<Recycle size={20} className="text-orange-600" />}
                                    color="bg-orange-50 border-orange-300"
                                />
                            )}
                        </div>
                        <div className="text-center mt-4">
                            <div className="inline-flex items-center bg-purple-100 px-4 py-2 rounded-lg">
                                <DollarSign size={16} className="text-green-600 mr-2" />
                                <span className="text-purple-800 font-semibold">
                                    Ingresos Valorización: {formatNumber(kpis.valorizationIncomes || 0, 0)} MXN/día
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Separation Programs Enhancement Indicator */}
                {separationPrograms && (
                    <div className="border-t-2 border-dashed border-blue-300 pt-6">
                        <div className="text-center">
                            <div className="inline-flex items-center bg-blue-100 px-6 py-3 rounded-lg">
                                <TrendingUp size={20} className="text-blue-600 mr-3" />
                                <div className="text-left">
                                    <p className="text-blue-800 font-semibold">Programas de Separación Activos</p>
                                    <p className="text-blue-600 text-sm">
                                        Costo: {formatNumber(kpis.separationProgramCosts || 0, 0)} MXN/día | 
                                        Mejora en separación en origen
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </Card>
        </div>
    );
};

export default FlowDiagram;