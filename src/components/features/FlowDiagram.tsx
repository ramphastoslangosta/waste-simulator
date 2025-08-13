// ========================================================================
// FILE: src/components/features/FlowDiagram.js
// ========================================================================
import React from 'react';
import { ArrowRight, ArrowDown, Recycle, AlertTriangle, Factory, Package, Warehouse, Ship, Trash2 } from 'lucide-react';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import ChartExportWrapper from '../ui/ChartExportWrapper.tsx';
import { formatNumber } from '../../utils/formatNumber';

const FlowDiagram = ({ kpis, season }) => {
    const data = kpis.rsu.calculations;
    const recoveryByStage = kpis.rsu.recoveryByStage;

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

    return (
        <ChartExportWrapper
            title={`Diagrama de Flujo del Sistema RSU (${season})`}
            subtitle="Visualización del recorrido promedio diario de los Residuos Sólidos Urbanos."
            enableExport={true}
        >
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-4 overflow-x-auto p-4">
                <div className="flex flex-col items-center space-y-2">
                    <FlowBox title="Generación RSU" value={kpis.rsu.totalGeneration} icon={<Factory size={24}/>} />
                    <LossArrow value={kpis.rsu.collectionDeficit} label="No Recolectado" icon={<AlertTriangle size={16}/>} color="text-red-500" />
                </div>
                <FlowArrow value={data.collectedWasteTotal}/>
                <div className="flex flex-col items-center space-y-2">
                    <FlowBox title="Recolección" value={data.collectedWasteTotal} icon={<Package size={24}/>} />
                    <LossArrow value={data.informalRecoveryCollection} label="Rec. Informal" icon={<Recycle size={16}/>} color="text-orange-500" />
                    <LossArrow value={data.leakCollection} label="Fuga" icon={<AlertTriangle size={16}/>} color="text-red-500" />
                </div>
                <FlowArrow value={data.toTransferStationTotal} />
                <div className="flex flex-col items-center space-y-2">
                    <FlowBox title="Sitio Transferencia" value={data.toTransferStationTotal} icon={<Warehouse size={24}/>} />
                    <LossArrow value={recoveryByStage.source + recoveryByStage.plant} label="Valorizado Formal" icon={<Recycle size={16}/>} color="text-green-500" />
                    <LossArrow value={data.leakTransferStation} label="Fuga" icon={<AlertTriangle size={16}/>} color="text-red-500" />
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
        </ChartExportWrapper>
    );
};

export default FlowDiagram;