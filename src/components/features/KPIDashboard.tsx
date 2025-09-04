// ========================================================================
// FILE: src/components/features/KPIDashboard.js
// ========================================================================
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import KPICard from '../ui/KPICard.tsx';
import ChartExportWrapper from '../ui/ChartExportWrapper.tsx';
import { formatNumber } from '../../utils/formatNumber';

const KPIDashboard = ({ kpis, season }) => {
    // Enhanced recovery data including valorization
    const totalValorized = (kpis.valorization?.composted || 0) + (kpis.valorization?.biogas || 0) + (kpis.valorization?.pyrolyzed || 0);
    
    const recoveryData = [
        { name: 'Recuperado en Origen (Alta Cal.)', value: kpis.rsu.recoveryByStage.source, color: '#22c55e' },
        { name: 'Recuperado en Planta (Baja Cal.)', value: kpis.rsu.recoveryByStage.plant, color: '#84cc16' },
        { name: 'Recuperado Informal', value: kpis.rsu.recoveryByStage.informal, color: '#f97316' },
        { name: 'Valorización (Compost/Biogás/Pirólisis)', value: totalValorized, color: '#8b5cf6' },
        { name: 'RSU a Disposición Final', value: kpis.rsu.toDisposal, color: '#71717a' },
        { name: 'Fuga Total RSU', value: kpis.rsu.totalLeak, color: '#ef4444' },
    ];

    // Valorization breakdown data
    const valorizationData = [
        { name: 'Compostaje', value: kpis.valorization?.composted || 0, color: '#16a34a' },
        { name: 'Biogás', value: kpis.valorization?.biogas || 0, color: '#059669' },
        { name: 'Pirólisis Plásticos', value: kpis.valorization?.pyrolyzed || 0, color: '#0d9488' }
    ].filter(item => item.value > 0);

    // Separation program effectiveness data
    const enhancedSeparationRates = kpis.enhancedSeparationRates || {};
    
    const separationComparisonData = [
        { name: 'Hoteles', base: 25, enhanced: enhancedSeparationRates.hotels || 25, color: '#3b82f6' },
        { name: 'Restaurantes', base: 15, enhanced: enhancedSeparationRates.restaurants || 15, color: '#ef4444' },
        { name: 'Hogares', base: 5, enhanced: enhancedSeparationRates.homes || 5, color: '#10b981' },
        { name: 'Comercios', base: 30, enhanced: enhancedSeparationRates.commerce || 30, color: '#f59e0b' }
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

            {/* Valorization Metrics Section */}
            {totalValorized > 0 && (
                <div className="mb-6">
                    <Card>
                        <CardHeader title="Métricas de Valorización" subtitle="Resultados de procesos de economía circular" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <KPICard 
                                title="Total Valorizado"
                                value={formatNumber(totalValorized, 1)} 
                                unit="ton/día"
                                description="Material desviado de disposición final."
                                color="text-purple-600"
                                enableExport={true}
                            />
                            <KPICard 
                                title="% Desviación de Disposición"
                                value={formatNumber((totalValorized / (kpis.rsu.totalGeneration || 1)) * 100, 1)} 
                                unit="%"
                                description="Porcentaje de RSU valorizado vs. generado."
                                color="text-green-600"
                                enableExport={true}
                            />
                            <KPICard 
                                title="Ingresos Valorización"
                                value={formatNumber(kpis.valorizationIncomes || 0, 0)} 
                                unit="MXN/día"
                                description="Ingresos por venta de productos valorizados."
                                color="text-emerald-600"
                                enableExport={true}
                            />
                            <KPICard 
                                title="Costo Neto Valorización"
                                value={formatNumber((kpis.valorizationCosts || 0) - (kpis.valorizationIncomes || 0), 0)} 
                                unit="MXN/día"
                                description="Costo neto (costos - ingresos)."
                                color={(kpis.valorizationCosts || 0) - (kpis.valorizationIncomes || 0) > 0 ? 'text-red-600' : 'text-green-600'}
                                enableExport={true}
                            />
                        </div>

                        {valorizationData.length > 0 && (
                            <ChartExportWrapper
                                title="Distribución de Valorización por Proceso"
                                subtitle="Toneladas procesadas por cada tecnología de valorización"
                                enableExport={true}
                            >
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={valorizationData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, value }) => `${name}: ${formatNumber(value, 1)}t`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {valorizationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => `${formatNumber(value, 2)} ton/día`} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartExportWrapper>
                        )}
                    </Card>
                </div>
            )}

            {/* Separation Program Effectiveness Section */}
            {kpis.separationProgramCosts > 0 && (
                <div className="mb-6">
                    <Card>
                        <CardHeader title="Efectividad de Programas de Separación" subtitle="Impacto de programas educativos, incentivos y contenedores" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <KPICard 
                                title="Costo Programas"
                                value={formatNumber(kpis.separationProgramCosts || 0, 0)} 
                                unit="MXN/día"
                                description="Costo total de programas de separación."
                                color="text-blue-600"
                                enableExport={true}
                            />
                            <KPICard 
                                title="Mejora Promedio"
                                value={formatNumber(
                                    Object.values(enhancedSeparationRates).length > 0 
                                        ? (Object.values(enhancedSeparationRates).reduce((a, b) => a + b, 0) / Object.values(enhancedSeparationRates).length) - 18.75
                                        : 0, 1
                                )} 
                                unit="% pts"
                                description="Mejora promedio en tasas de separación."
                                color="text-green-600"
                                enableExport={true}
                            />
                            <KPICard 
                                title="Material Adicional"
                                value={formatNumber((kpis.rsu.recoveryByStage.source || 0) * 0.2, 1)} 
                                unit="ton/día"
                                description="Material adicional recuperado por programas."
                                color="text-emerald-600"
                                enableExport={true}
                            />
                            <KPICard 
                                title="Costo por Mejora"
                                value={formatNumber(
                                    (kpis.separationProgramCosts || 0) / Math.max(
                                        Object.values(enhancedSeparationRates).length > 0 
                                            ? (Object.values(enhancedSeparationRates).reduce((a, b) => a + b, 0) / Object.values(enhancedSeparationRates).length) - 18.75
                                            : 1, 
                                        0.1
                                    ), 0
                                )} 
                                unit="MXN/% pt"
                                description="Costo por punto porcentual de mejora."
                                color="text-orange-600"
                                enableExport={true}
                            />
                        </div>

                        <ChartExportWrapper
                            title="Comparación de Tasas de Separación"
                            subtitle="Tasas base vs. mejoradas por programas de separación"
                            enableExport={true}
                        >
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={separationComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis label={{ value: '% Separación', angle: -90, position: 'insideLeft' }} />
                                    <Tooltip formatter={(value) => `${formatNumber(value, 1)}%`} />
                                    <Legend />
                                    <Bar dataKey="base" name="Tasa Base" fill="#cbd5e1" />
                                    <Bar dataKey="enhanced" name="Tasa Mejorada" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartExportWrapper>
                    </Card>
                </div>
            )}
            
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