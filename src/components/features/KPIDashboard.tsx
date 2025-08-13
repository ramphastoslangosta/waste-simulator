// ========================================================================
// FILE: src/components/features/KPIDashboard.js
// ========================================================================
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import KPICard from '../ui/KPICard.tsx';
import ChartExportWrapper from '../ui/ChartExportWrapper.tsx';
import { formatNumber } from '../../utils/formatNumber';

const KPIDashboard = ({ kpis, season }) => {
    const recoveryData = [
        { name: 'Recuperado en Origen (Alta Cal.)', value: kpis.rsu.recoveryByStage.source, color: '#22c55e' },
        { name: 'Recuperado en Planta (Baja Cal.)', value: kpis.rsu.recoveryByStage.plant, color: '#84cc16' },
        { name: 'Recuperado Informal', value: kpis.rsu.recoveryByStage.informal, color: '#f97316' },
        { name: 'RSU a Disposición Final', value: kpis.rsu.toDisposal, color: '#71717a' },
        { name: 'Fuga Total RSU', value: kpis.rsu.totalLeak, color: '#ef4444' },
    ];

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <KPICard 
                    title={`Generación Total Diaria (${season})`}
                    value={formatNumber(kpis.totalGeneration, 1)} 
                    unit="ton/día"
                    description="Suma de RSU, Sargazo y RCD."
                    color="text-blue-600"
                    enableExport={true}
                />
                <KPICard 
                    title="Generación RSU Diaria"
                    value={formatNumber(kpis.rsu.totalGeneration, 1)} 
                    unit="ton/día"
                    description="Residuos Sólidos Urbanos únicamente."
                    color="text-amber-600"
                    enableExport={true}
                />
                 <KPICard 
                    title="Déficit Recolección RSU" 
                    value={formatNumber(kpis.rsu.collectionDeficit, 1)} 
                    unit="ton/día"
                    description="RSU no recolectados por falta de capacidad."
                    color={kpis.rsu.collectionDeficit > 0 ? 'text-red-600' : 'text-green-600'}
                    enableExport={true}
                />
                <KPICard 
                    title="Costo Total del Sistema" 
                    value={formatNumber(kpis.totalSystemCost, 0)} 
                    unit="MXN/día"
                    description="Costo neto de gestión de todos los flujos."
                    color="text-purple-600"
                    enableExport={true}
                />
            </div>
            
            {/* Inventory Levels Section */}
            <div className="mb-6">
                <Card>
                    <CardHeader title="Inventarios Actuales del Sistema" subtitle="Niveles de acumulación de material en cada etapa del proceso" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-semibold text-sm text-slate-700">Vehículos Recolección</h4>
                            <p className="text-2xl font-bold text-blue-600">{formatNumber(kpis.rsu.inventoryLevels?.collectionVehicles || 0, 1)}</p>
                            <p className="text-xs text-slate-500">ton</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-sm text-slate-700">Estación Transferencia</h4>
                            <p className="text-2xl font-bold text-green-600">{formatNumber(kpis.rsu.inventoryLevels?.transferStation || 0, 1)}</p>
                            <p className="text-xs text-slate-500">ton</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <h4 className="font-semibold text-sm text-slate-700">Vehículos Traslado</h4>
                            <p className="text-2xl font-bold text-orange-600">{formatNumber(kpis.rsu.inventoryLevels?.finalTransportVehicles || 0, 1)}</p>
                            <p className="text-xs text-slate-500">ton</p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <h4 className="font-semibold text-sm text-slate-700">Sitio Disposición</h4>
                            <p className="text-2xl font-bold text-purple-600">{formatNumber(kpis.rsu.inventoryLevels?.disposalSite || 0, 1)}</p>
                            <p className="text-xs text-slate-500">ton</p>
                        </div>
                    </div>
                </Card>
            </div>

            <ChartExportWrapper
                title={`Distribución del Flujo de RSU (${season})`}
                subtitle="Destino final promedio de los Residuos Sólidos Urbanos generados en ton/día."
                enableExport={true}
            >
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={recoveryData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={180} />
                        <Tooltip formatter={(value) => `${formatNumber(value, 2)} ton`} />
                        <Bar dataKey="value" fill="#8884d8" background={{ fill: '#eee' }}>
                            {recoveryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartExportWrapper>
        </div>
    );
};

export default KPIDashboard;