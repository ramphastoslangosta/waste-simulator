// ========================================================================
// FILE: src/components/features/KPIDashboard.js
// ========================================================================
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import KPICard from '../ui/KPICard.tsx';
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
                />
                <KPICard 
                    title="Generación RSU Diaria"
                    value={formatNumber(kpis.rsu.totalGeneration, 1)} 
                    unit="ton/día"
                    description="Residuos Sólidos Urbanos únicamente."
                    color="text-amber-600"
                />
                 <KPICard 
                    title="Déficit Recolección RSU" 
                    value={formatNumber(kpis.rsu.collectionDeficit, 1)} 
                    unit="ton/día"
                    description="RSU no recolectados por falta de capacidad."
                    color={kpis.rsu.collectionDeficit > 0 ? 'text-red-600' : 'text-green-600'}
                />
                <KPICard 
                    title="Costo Total del Sistema" 
                    value={formatNumber(kpis.totalSystemCost, 0)} 
                    unit="MXN/día"
                    description="Costo neto de gestión de todos los flujos."
                    color="text-purple-600"
                />
            </div>
            <Card>
                <CardHeader title={`Distribución del Flujo de RSU (${season})`} subtitle="Destino final promedio de los Residuos Sólidos Urbanos generados en ton/día." />
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
            </Card>
        </div>
    );
};

export default KPIDashboard;