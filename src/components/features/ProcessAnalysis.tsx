// ========================================================================
// FILE: src/components/features/ProcessAnalysis.js
// ========================================================================
import React from 'react';
import { Package, Warehouse, Ship, Trash2 } from 'lucide-react';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import ChartExportWrapper from '../ui/ChartExportWrapper.tsx';
import { formatNumber } from '../../utils/formatNumber';

const ProcessAnalysis = ({ kpis, season, inputs }) => {
    const data = kpis.rsu.calculations;
    const recoveryByStage = kpis.rsu.recoveryByStage;
    const inventoryPercentage = inputs.rsuSystem.processing.transferStationCapacity > 0 ? (kpis.rsu.finalInventory / inputs.rsuSystem.processing.transferStationCapacity) * 100 : 0;
    
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <ProcessCard title="Recolección" icon={<Package size={24}/>} rateIn={kpis.rsu.totalGeneration} rateOut={data.collectedWasteTotal} inventory={kpis.rsu.collectionDeficit} waitTime={0}>
                    <div className="flex justify-between text-orange-600"><span>Recuperación Informal:</span> <span className="font-bold font-mono">{formatNumber(data.informalRecoveryCollection, 2)} ton/día</span></div>
                    <div className="flex justify-between text-red-600"><span>Fuga en Ruta:</span> <span className="font-bold font-mono">{formatNumber(data.leakCollection, 2)} ton/día</span></div>
                </ProcessCard>
                <ProcessCard title="Sitio de Transferencia" icon={<Warehouse size={24}/>} rateIn={data.toTransferStationTotal} rateOut={data.toFinalTransport} inventory={kpis.rsu.finalInventory} waitTime={kpis.rsu.inventoryWaitTime}>
                    <div className="flex justify-between text-green-600"><span>Recuperado (Alta Cal.):</span> <span className="font-bold font-mono">{formatNumber(recoveryByStage.source, 2)} ton/día</span></div>
                    <div className="flex justify-between text-yellow-600"><span>Recuperado (Baja Cal.):</span> <span className="font-bold font-mono">{formatNumber(recoveryByStage.plant, 2)} ton/día</span></div>
                    <div className="flex justify-between text-red-600"><span>Fuga en Proceso:</span> <span className="font-bold font-mono">{formatNumber(data.leakTransferStation, 2)} ton/día</span></div>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Uso de Capacidad de Almacenamiento (Día 30)</span>
                            <span>{formatNumber(inventoryPercentage, 0)}%</span>
                        </div>
                        <ProgressBar value={inventoryPercentage} />
                    </div>
                </ProcessCard>
                <ProcessCard title="Traslado Final" icon={<Ship size={24}/>} rateIn={data.toFinalTransport} rateOut={data.toDisposalSite} inventory={null} waitTime={null}>
                     <div className="flex justify-between text-red-600"><span>Fuga en Traslado:</span> <span className="font-bold font-mono">{formatNumber(data.leakFinalTransport, 2)} ton/día</span></div>
                </ProcessCard>
                <ProcessCard title="Disposición Final" icon={<Trash2 size={24}/>} rateIn={data.toDisposalSite} rateOut={kpis.rsu.toDisposal} inventory={null} waitTime={null}>
                     <div className="flex justify-between text-orange-600"><span>Recuperación Informal:</span> <span className="font-bold font-mono">{formatNumber(data.informalRecoveryDisposal, 2)} ton/día</span></div>
                    <div className="flex justify-between text-red-600"><span>Fuga en Sitio:</span> <span className="font-bold font-mono">{formatNumber(data.leakDisposal, 2)} ton/día</span></div>
                </ProcessCard>
            </div>
        </ChartExportWrapper>
    );
};

export default ProcessAnalysis;
