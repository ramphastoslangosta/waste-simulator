// ========================================================================
// FILE: src/components/features/FinancialAnalysis.js
// ========================================================================
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import ChartExportWrapper from '../ui/ChartExportWrapper.tsx';
import { formatNumber } from '../../utils/formatNumber';

const FinancialAnalysis = ({ kpis, season }) => {
    // Enhanced cost breakdown including valorization and separation programs
    const enhancedCostData = [
        { name: 'Costo Base RSU', value: kpis.rsu.netCostPerDay, color: '#3b82f6' },
        { name: 'Gestión Sargazo', value: kpis.sargassumCost, color: '#10b981' },
        { name: 'Gestión RCD', value: kpis.rcdCost, color: '#f97316' },
        { name: 'Programas Separación', value: kpis.separationProgramCosts || 0, color: '#8b5cf6' },
        { name: 'Costos Valorización', value: kpis.valorizationCosts || 0, color: '#06b6d4' },
    ].filter(item => item.value > 0);
    
    // Enhanced income breakdown including valorization
    const enhancedIncomeData = [
        ...Object.entries(kpis.rsu.incomeByMaterial)
            .map(([name, value]) => ({
                name: `Reciclaje ${name.charAt(0).toUpperCase() + name.slice(1)}`,
                value,
                color: { pet: '#22c55e', aluminio: '#a855f7', carton: '#f59e0b', vidrio: '#0ea5e9' }[name] || '#84cc16'
            }))
            .filter(item => item.value > 0),
        ...(kpis.valorizationIncomes > 0 ? [{
            name: 'Ingresos Valorización',
            value: kpis.valorizationIncomes,
            color: '#059669'
        }] : [])
    ];

    // Cost-benefit waterfall data
    const waterfallData = [
        { name: 'Costo Base', value: kpis.rsu.netCostPerDay + kpis.sargassumCost + kpis.rcdCost, type: 'cost' },
        { name: 'Programas Separación', value: -(kpis.separationProgramCosts || 0), type: 'cost' },
        { name: 'Costos Valorización', value: -(kpis.valorizationCosts || 0), type: 'cost' },
        { name: 'Ingresos Valorización', value: kpis.valorizationIncomes || 0, type: 'income' },
        { name: 'Costo Total Final', value: kpis.totalSystemCost, type: 'final' }
    ];

    // Program ROI analysis
    const totalProgramCosts = (kpis.separationProgramCosts || 0) + (kpis.valorizationCosts || 0);
    const totalProgramBenefits = (kpis.valorizationIncomes || 0);
    const netProgramImpact = totalProgramBenefits - totalProgramCosts;
    
    // Detailed cost breakdown
    const detailedCostBreakdown = [
        { category: 'Operaciones Base', value: kpis.rsu.netCostPerDay + kpis.sargassumCost + kpis.rcdCost, color: '#64748b' },
        { category: 'Programas Separación', value: kpis.separationProgramCosts || 0, color: '#8b5cf6' },
        { category: 'Valorización (Neto)', value: (kpis.valorizationCosts || 0) - (kpis.valorizationIncomes || 0), color: '#06b6d4' }
    ].filter(item => item.value !== 0);
    
    return (
        <div className="space-y-6">
            {/* Enhanced Financial Overview */}
            <ChartExportWrapper
                title={`Análisis Financiero Diario (${season})`}
                subtitle={`Costo Neto Total del Sistema: ${formatNumber(kpis.totalSystemCost, 0)} MXN | Impacto Programas: ${formatNumber(netProgramImpact, 0)} MXN`}
                enableExport={true}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-center text-slate-700 mb-2">Desglose Completo de Costos</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={enhancedCostData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {enhancedCostData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div>
                        <h4 className="font-bold text-center text-slate-700 mb-2">Fuentes de Ingresos</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={enhancedIncomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                    {enhancedIncomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </ChartExportWrapper>

            {/* Program Cost-Benefit Analysis */}
            {(totalProgramCosts > 0 || totalProgramBenefits > 0) && (
                <ChartExportWrapper
                    title="Análisis Costo-Beneficio de Programas"
                    subtitle="Impacto económico de programas de separación y valorización"
                    enableExport={true}
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Program Costs */}
                        <div className="text-center p-6 bg-red-50 rounded-lg">
                            <h4 className="font-semibold text-red-800 mb-2">Costos de Programas</h4>
                            <p className="text-3xl font-bold text-red-600">{formatNumber(totalProgramCosts, 0)}</p>
                            <p className="text-sm text-red-700">MXN/día</p>
                            <div className="mt-2 text-xs text-red-600">
                                <p>Separación: {formatNumber(kpis.separationProgramCosts || 0, 0)} MXN</p>
                                <p>Valorización: {formatNumber(kpis.valorizationCosts || 0, 0)} MXN</p>
                            </div>
                        </div>

                        {/* Program Benefits */}
                        <div className="text-center p-6 bg-green-50 rounded-lg">
                            <h4 className="font-semibold text-green-800 mb-2">Beneficios de Programas</h4>
                            <p className="text-3xl font-bold text-green-600">{formatNumber(totalProgramBenefits, 0)}</p>
                            <p className="text-sm text-green-700">MXN/día</p>
                            <div className="mt-2 text-xs text-green-600">
                                <p>Valorización: {formatNumber(kpis.valorizationIncomes || 0, 0)} MXN</p>
                            </div>
                        </div>

                        {/* Net Impact */}
                        <div className={`text-center p-6 rounded-lg ${netProgramImpact >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
                            <h4 className={`font-semibold mb-2 ${netProgramImpact >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>Impacto Neto</h4>
                            <p className={`text-3xl font-bold ${netProgramImpact >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {formatNumber(netProgramImpact, 0)}
                            </p>
                            <p className={`text-sm ${netProgramImpact >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>MXN/día</p>
                            <div className={`mt-2 text-xs ${netProgramImpact >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                <p>{netProgramImpact >= 0 ? 'Beneficio neto' : 'Inversión neta'}</p>
                                <p>ROI: {totalProgramCosts > 0 ? formatNumber((totalProgramBenefits / totalProgramCosts - 1) * 100, 1) : 0}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Waterfall Chart */}
                    <div className="mt-6">
                        <h4 className="font-bold text-center text-slate-700 mb-4">Impacto Progresivo en Costos del Sistema</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip formatter={(value) => `${formatNumber(Math.abs(value), 0)} MXN`} />
                                <Bar dataKey="value" fill={(entry) => {
                                    if (entry.type === 'cost') return '#ef4444';
                                    if (entry.type === 'income') return '#22c55e';
                                    return '#3b82f6';
                                }}>
                                    {waterfallData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.type === 'cost' ? '#ef4444' :
                                            entry.type === 'income' ? '#22c55e' : '#3b82f6'
                                        } />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartExportWrapper>
            )}

            {/* Detailed Cost Structure */}
            <ChartExportWrapper
                title="Estructura Detallada de Costos"
                subtitle="Análisis comparativo de componentes de costo del sistema"
                enableExport={true}
            >
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={detailedCostBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN/día`} />
                        <Bar dataKey="value" fill="#8884d8">
                            {detailedCostBreakdown.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartExportWrapper>
        </div>
    );
};

export default FinancialAnalysis;

