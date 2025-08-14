import React, { useState, useMemo } from 'react';
import { useWasteSimulation } from '../../hooks/useWasteSimulation';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import ComparisonFinancialAnalysis from './ComparisonFinancialAnalysis.tsx';
import ComparisonCalculationsTable from './ComparisonCalculationsTable.tsx';
import ChartExportWrapper from '../ui/ChartExportWrapper.tsx';
import { formatNumber } from '../../utils/formatNumber';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ComparisonDashboardProps {
  scenarios: Array<{
    id: string;
    name: string;
    description?: string;
    inputs: any;
  }>;
  season: 'high' | 'low';
}

const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ scenarios, season }) => {
  const [activeComparisonTab, setActiveComparisonTab] = useState<'kpis' | 'financials' | 'calculations'>('kpis');
  
  // Calculate simulation results for each scenario using individual hooks
  const scenario1Results = scenarios[0] ? useWasteSimulation(scenarios[0].inputs) : null;
  const scenario2Results = scenarios[1] ? useWasteSimulation(scenarios[1].inputs) : null;
  const scenario3Results = scenarios[2] ? useWasteSimulation(scenarios[2].inputs) : null;
  const scenario4Results = scenarios[3] ? useWasteSimulation(scenarios[3].inputs) : null;
  
  // Combine results with scenarios
  const scenarioResults = useMemo(() => {
    const results = [];
    const allResults = [scenario1Results, scenario2Results, scenario3Results, scenario4Results];
    
    scenarios.forEach((scenario, index) => {
      if (allResults[index]) {
        results.push({
          ...scenario,
          results: allResults[index]
        });
      }
    });
    
    return results;
  }, [scenarios, scenario1Results, scenario2Results, scenario3Results, scenario4Results]);

  const seasonLabel = season === 'high' ? 'Temporada Alta' : 'Temporada Baja';

  // Prepare comparison data for key metrics
  const comparisonMetrics = scenarioResults.map(scenario => {
    const kpis = season === 'high' ? scenario.results.high : scenario.results.low;
    const totalValorized = (kpis.valorization?.composted || 0) + (kpis.valorization?.biogas || 0) + (kpis.valorization?.pyrolyzed || 0);
    
    return {
      name: scenario.name,
      totalGeneration: kpis.totalGeneration,
      rsuGeneration: kpis.rsu.totalGeneration,
      collectionDeficit: kpis.rsu.collectionDeficit,
      totalCost: kpis.totalSystemCost,
      recoverySource: kpis.rsu.recoveryByStage.source,
      recoveryPlant: kpis.rsu.recoveryByStage.plant,
      recoveryInformal: kpis.rsu.recoveryByStage.informal,
      toDisposal: kpis.rsu.toDisposal,
      totalLeak: kpis.rsu.totalLeak,
      
      // Valorization metrics
      totalValorized: totalValorized,
      composted: kpis.valorization?.composted || 0,
      biogas: kpis.valorization?.biogas || 0,
      pyrolyzed: kpis.valorization?.pyrolyzed || 0,
      valorizationIncomes: kpis.valorizationIncomes || 0,
      valorizationCosts: kpis.valorizationCosts || 0,
      valorizationNetBenefit: (kpis.valorizationIncomes || 0) - (kpis.valorizationCosts || 0),
      
      // Separation program metrics
      separationProgramCosts: kpis.separationProgramCosts || 0,
      enhancedSeparationImpact: Object.values(kpis.enhancedSeparationRates || {}).length > 0 ? 
        (Object.values(kpis.enhancedSeparationRates).reduce((a, b) => a + b, 0) / Object.values(kpis.enhancedSeparationRates).length) - 18.75 : 0,
        
      // Overall recovery rate including valorization
      totalRecoveryRate: ((kpis.rsu.recoveryByStage.source + kpis.rsu.recoveryByStage.plant + totalValorized) / kpis.rsu.totalGeneration) * 100,
      
      // Cost per ton including all programs
      costPerTonGenerated: kpis.totalSystemCost / kpis.rsu.totalGeneration
    };
  });

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  const renderComparisonContent = () => {
    if (activeComparisonTab === 'financials') {
      return <ComparisonFinancialAnalysis scenarios={scenarios} season={season} />;
    }
    
    if (activeComparisonTab === 'calculations') {
      return <ComparisonCalculationsTable scenarios={scenarios} season={season} />;
    }
    
    return (
      <div className="space-y-6">
        {/* KPI Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <ChartExportWrapper
            title="Generación Total"
            subtitle="ton/día"
            enableExport={true}
          >
            <div className="space-y-2">
              {comparisonMetrics.map((metric, index) => (
                <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                     style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                  <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                  <span className="font-bold" style={{color: colors[index % colors.length]}}>
                    {formatNumber(metric.totalGeneration, 1)}
                  </span>
                </div>
              ))}
            </div>
          </ChartExportWrapper>

          <ChartExportWrapper
            title="Generación RSU"
            subtitle="ton/día"
            enableExport={true}
          >
            <div className="space-y-2">
              {comparisonMetrics.map((metric, index) => (
                <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                     style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                  <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                  <span className="font-bold" style={{color: colors[index % colors.length]}}>
                    {formatNumber(metric.rsuGeneration, 1)}
                  </span>
                </div>
              ))}
            </div>
          </ChartExportWrapper>

          <ChartExportWrapper
            title="Déficit Recolección"
            subtitle="ton/día"
            enableExport={true}
          >
            <div className="space-y-2">
              {comparisonMetrics.map((metric, index) => (
                <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                     style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                  <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                  <span className={`font-bold ${metric.collectionDeficit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatNumber(metric.collectionDeficit, 1)}
                  </span>
                </div>
              ))}
            </div>
          </ChartExportWrapper>

          <ChartExportWrapper
            title="Costo Total"
            subtitle="MXN/día"
            enableExport={true}
          >
            <div className="space-y-2">
              {comparisonMetrics.map((metric, index) => (
                <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                     style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                  <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                  <span className="font-bold" style={{color: colors[index % colors.length]}}>
                    {formatNumber(metric.totalCost, 0)}
                  </span>
                </div>
              ))}
            </div>
          </ChartExportWrapper>

          <ChartExportWrapper
            title="Valorización Total"
            subtitle="ton/día"
            enableExport={true}
          >
            <div className="space-y-2">
              {comparisonMetrics.map((metric, index) => (
                <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                     style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                  <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                  <span className={`font-bold ${metric.totalValorized > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                    {formatNumber(metric.totalValorized, 1)}
                  </span>
                </div>
              ))}
            </div>
          </ChartExportWrapper>
        </div>

        {/* Valorization and Separation Programs Impact */}
        {comparisonMetrics.some(m => m.totalValorized > 0 || m.separationProgramCosts > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <ChartExportWrapper
              title="Beneficio Neto Valorización"
              subtitle="MXN/día"
              enableExport={true}
            >
              <div className="space-y-2">
                {comparisonMetrics.map((metric, index) => (
                  <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                       style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                    <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                    <span className={`font-bold ${metric.valorizationNetBenefit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatNumber(metric.valorizationNetBenefit, 0)}
                    </span>
                  </div>
                ))}
              </div>
            </ChartExportWrapper>

            <ChartExportWrapper
              title="Costo Programas Separación"
              subtitle="MXN/día"
              enableExport={true}
            >
              <div className="space-y-2">
                {comparisonMetrics.map((metric, index) => (
                  <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                       style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                    <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                    <span className={`font-bold ${metric.separationProgramCosts > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {formatNumber(metric.separationProgramCosts, 0)}
                    </span>
                  </div>
                ))}
              </div>
            </ChartExportWrapper>

            <ChartExportWrapper
              title="Mejora en Separación"
              subtitle="% puntos"
              enableExport={true}
            >
              <div className="space-y-2">
                {comparisonMetrics.map((metric, index) => (
                  <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                       style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                    <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                    <span className={`font-bold ${metric.enhancedSeparationImpact > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {formatNumber(metric.enhancedSeparationImpact, 1)}
                    </span>
                  </div>
                ))}
              </div>
            </ChartExportWrapper>

            <ChartExportWrapper
              title="Tasa Recuperación Total"
              subtitle="% (incl. valorización)"
              enableExport={true}
            >
              <div className="space-y-2">
                {comparisonMetrics.map((metric, index) => (
                  <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                       style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                    <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                    <span className="font-bold text-green-600">
                      {formatNumber(metric.totalRecoveryRate, 1)}%
                    </span>
                  </div>
                ))}
              </div>
            </ChartExportWrapper>
          </div>
        )}

        {/* Valorization Breakdown Comparison */}
        {comparisonMetrics.some(m => m.totalValorized > 0) && (
          <ChartExportWrapper
            title="Comparación de Procesos de Valorización"
            subtitle="Distribución de material valorizado por proceso y escenario"
            enableExport={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-4 text-green-700">Compostaje (ton/día)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={comparisonMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${formatNumber(value, 2)} ton/día`} />
                    <Bar dataKey="composted" fill="#16a34a">
                      {comparisonMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-blue-700">Biogás (ton/día)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={comparisonMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${formatNumber(value, 2)} ton/día`} />
                    <Bar dataKey="biogas" fill="#2563eb">
                      {comparisonMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-orange-700">Pirólisis (ton/día)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={comparisonMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => `${formatNumber(value, 2)} ton/día`} />
                    <Bar dataKey="pyrolyzed" fill="#ea580c">
                      {comparisonMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </ChartExportWrapper>
        )}

        {/* Comparative Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Generation Comparison */}
          <ChartExportWrapper
            title="Generación Total Comparativa"
            subtitle="Comparación de generación total por escenario"
            enableExport={true}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `${formatNumber(value, 1)} ton/día`} />
                <Bar dataKey="totalGeneration" fill="#3b82f6">
                  {comparisonMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartExportWrapper>

          {/* Cost Comparison */}
          <ChartExportWrapper
            title="Costo Total Comparativo"
            subtitle="Comparación de costos del sistema por escenario"
            enableExport={true}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN/día`} />
                <Bar dataKey="totalCost" fill="#8b5cf6">
                  {comparisonMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartExportWrapper>
        </div>

        {/* RSU Flow Distribution Comparison */}
        <ChartExportWrapper
          title="Distribución del Flujo de RSU - Comparación"
          subtitle="Comparación del destino final de RSU entre escenarios"
          enableExport={true}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Recuperación en Origen (Alta Calidad)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={comparisonMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${formatNumber(value, 2)} ton/día`} />
                  <Bar dataKey="recoverySource" fill="#22c55e">
                    {comparisonMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">A Disposición Final</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={comparisonMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${formatNumber(value, 2)} ton/día`} />
                  <Bar dataKey="toDisposal" fill="#71717a">
                    {comparisonMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartExportWrapper>

        {/* Summary Table */}
        <ChartExportWrapper
          title="Resumen Comparativo"
          subtitle="Tabla detallada de métricas por escenario"
          enableExport={true}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-2 font-semibold">Escenario</th>
                  <th className="text-right p-2 font-semibold">Gen. Total</th>
                  <th className="text-right p-2 font-semibold">Gen. RSU</th>
                  <th className="text-right p-2 font-semibold">Déficit</th>
                  <th className="text-right p-2 font-semibold">Costo Total</th>
                  <th className="text-right p-2 font-semibold">Recup. Origen</th>
                  <th className="text-right p-2 font-semibold">A Disposición</th>
                  <th className="text-right p-2 font-semibold">Fuga Total</th>
                  <th className="text-right p-2 font-semibold">Valorizado</th>
                  <th className="text-right p-2 font-semibold">Prog. Separación</th>
                </tr>
              </thead>
              <tbody>
                {comparisonMetrics.map((metric) => (
                  <tr key={metric.name} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2 font-medium">{metric.name}</td>
                    <td className="p-2 text-right">{formatNumber(metric.totalGeneration, 1)}</td>
                    <td className="p-2 text-right">{formatNumber(metric.rsuGeneration, 1)}</td>
                    <td className={`p-2 text-right font-medium ${metric.collectionDeficit > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatNumber(metric.collectionDeficit, 1)}
                    </td>
                    <td className="p-2 text-right">{formatNumber(metric.totalCost, 0)}</td>
                    <td className="p-2 text-right text-green-600">{formatNumber(metric.recoverySource, 2)}</td>
                    <td className="p-2 text-right text-slate-600">{formatNumber(metric.toDisposal, 2)}</td>
                    <td className="p-2 text-right text-red-600">{formatNumber(metric.totalLeak, 2)}</td>
                    <td className={`p-2 text-right font-medium ${metric.totalValorized > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                      {formatNumber(metric.totalValorized, 2)}
                    </td>
                    <td className={`p-2 text-right font-medium ${metric.separationProgramCosts > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                      {formatNumber(metric.separationProgramCosts, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartExportWrapper>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader 
          title={`Comparación de Escenarios - ${seasonLabel}`}
          subtitle={`Análisis comparativo de ${scenarios.length} escenarios para ${seasonLabel.toLowerCase()}`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((scenario, index) => (
            <div key={scenario.id} className={`p-3 rounded-lg border-l-4`} style={{borderColor: colors[index % colors.length]}}>
              <h4 className="font-semibold text-sm">{scenario.name}</h4>
              {scenario.description && (
                <p className="text-xs text-slate-600 mt-1">{scenario.description}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Comparison Navigation Tabs */}
      <Card>
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveComparisonTab('kpis')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeComparisonTab === 'kpis'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Dashboard de KPIs
          </button>
          <button
            onClick={() => setActiveComparisonTab('financials')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeComparisonTab === 'financials'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Análisis Financiero
          </button>
          <button
            onClick={() => setActiveComparisonTab('calculations')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeComparisonTab === 'calculations'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Tabla de Cálculos
          </button>
        </div>
      </Card>

      {/* Content */}
      {renderComparisonContent()}
    </div>
  );
};

export default ComparisonDashboard;