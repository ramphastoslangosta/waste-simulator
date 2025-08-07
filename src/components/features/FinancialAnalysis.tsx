// ========================================================================
// FILE: src/components/features/FinancialAnalysis.js
// ========================================================================
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import { formatNumber } from '../../utils/formatNumber';

const FinancialAnalysis = ({ kpis, season }) => {
    const costData = [
        { name: 'Costo Sistema RSU', value: kpis.rsu.netCostPerDay, color: '#3b82f6' },
        { name: 'Costo Gestión Sargazo', value: kpis.sargassumCost, color: '#10b981' },
        { name: 'Costo Gestión RCD', value: kpis.rcdCost, color: '#f97316' },
    ];
    
    const incomeData = Object.entries(kpis.rsu.incomeByMaterial)
        .map(([name, value]) => ({
            name: `Ingreso ${name.charAt(0).toUpperCase() + name.slice(1)}`,
            value,
            color: { pet: '#22c55e', aluminio: '#a855f7', carton: '#f59e0b', vidrio: '#0ea5e9' }[name] || '#84cc16'
        }))
        .filter(item => item.value > 0);
    
    return (
        <Card>
            <CardHeader title={`Análisis Financiero Diario (${season})`} subtitle={`Costo Neto Total del Sistema: ${formatNumber(kpis.totalSystemCost, 0)} MXN`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-bold text-center text-slate-700 mb-2">Desglose de Costos por Sistema</h4>
                     <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={costData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {costData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div>
                    <h4 className="font-bold text-center text-slate-700 mb-2">Desglose de Ingresos (Solo RSU)</h4>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={incomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {incomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

export default FinancialAnalysis;

