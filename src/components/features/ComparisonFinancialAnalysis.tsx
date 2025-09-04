import React, { useMemo } from 'react';
import { useWasteSimulation } from '../../hooks/useWasteSimulation';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import ChartExportWrapper from '../ui/ChartExportWrapper.tsx';
import { formatNumber } from '../../utils/formatNumber';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ComparisonFinancialAnalysisProps {
  scenarios: Array<{
    id: string;
    name: string;
    description?: string;
    inputs: any;
  }>;
  season: 'high' | 'low';
}

const ComparisonFinancialAnalysis: React.FC<ComparisonFinancialAnalysisProps> = ({ scenarios, season }) => {
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

  // Prepare comparison data for financial metrics
  const financialMetrics = scenarioResults.map(scenario => {
    const kpis = season === 'high' ? scenario.results.high : scenario.results.low;
    return {
      name: scenario.name,
      totalSystemCost: kpis.totalSystemCost,
      rsuCost: kpis.rsu.netCostPerDay,
      sargassumCost: kpis.sargassumCost,
      rcdCost: kpis.rcdCost,
      totalIncome: Object.values(kpis.rsu.incomeByMaterial).reduce((sum: number, value: any) => sum + (value || 0), 0),
      incomeByMaterial: kpis.rsu.incomeByMaterial
    };
  });

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  // Aggregate all income sources for comparison
  const allMaterials = new Set();
  financialMetrics.forEach(metric => {
    Object.keys(metric.incomeByMaterial).forEach(material => allMaterials.add(material));
  });

  const incomeComparisonData = Array.from(allMaterials).map(material => {
    const dataPoint = { material };
    financialMetrics.forEach((metric, index) => {
      dataPoint[`scenario${index}`] = metric.incomeByMaterial[material] || 0;
      dataPoint[`name${index}`] = metric.name;
    });
    return dataPoint;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader 
          title={`Análisis Financiero Comparativo - ${seasonLabel}`}
          subtitle={`Comparación de costos e ingresos entre ${scenarios.length} escenarios`}
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

      {/* Cost Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ChartExportWrapper
          title="Costo Total"
          subtitle="MXN/día"
          enableExport={true}
        >
          <div className="space-y-2">
            {financialMetrics.map((metric, index) => (
              <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                   style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                <span className="font-bold" style={{color: colors[index % colors.length]}}>
                  {formatNumber(metric.totalSystemCost, 0)}
                </span>
              </div>
            ))}
          </div>
        </ChartExportWrapper>

        <ChartExportWrapper
          title="Costo Sistema RSU"
          subtitle="MXN/día"
          enableExport={true}
        >
          <div className="space-y-2">
            {financialMetrics.map((metric, index) => (
              <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                   style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                <span className="font-bold" style={{color: colors[index % colors.length]}}>
                  {formatNumber(metric.rsuCost, 0)}
                </span>
              </div>
            ))}
          </div>
        </ChartExportWrapper>

        <ChartExportWrapper
          title="Costo Sargazo"
          subtitle="MXN/día"
          enableExport={true}
        >
          <div className="space-y-2">
            {financialMetrics.map((metric, index) => (
              <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                   style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                <span className="font-bold" style={{color: colors[index % colors.length]}}>
                  {formatNumber(metric.sargassumCost, 0)}
                </span>
              </div>
            ))}
          </div>
        </ChartExportWrapper>

        <ChartExportWrapper
          title="Ingresos Totales"
          subtitle="MXN/día"
          enableExport={true}
        >
          <div className="space-y-2">
            {financialMetrics.map((metric, index) => (
              <div key={metric.name} className="flex justify-between items-center p-2 rounded" 
                   style={{backgroundColor: `${colors[index % colors.length]}15`}}>
                <span className="text-sm font-medium truncate mr-2">{metric.name}</span>
                <span className="font-bold text-green-600">
                  {formatNumber(metric.totalIncome, 0)}
                </span>
              </div>
            ))}
          </div>
        </ChartExportWrapper>
      </div>

      {/* Comparative Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Cost Comparison */}
        <ChartExportWrapper
          title="Costo Total Comparativo"
          subtitle="Comparación de costos totales del sistema"
          enableExport={true}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN/día`} />
              <Bar dataKey="totalSystemCost" fill="#8b5cf6">
                {financialMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartExportWrapper>

        {/* Income Comparison */}
        <ChartExportWrapper
          title="Ingresos Totales Comparativo"
          subtitle="Comparación de ingresos por venta de materiales"
          enableExport={true}
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={financialMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN/día`} />
              <Bar dataKey="totalIncome" fill="#22c55e">
                {financialMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartExportWrapper>
      </div>

      {/* Cost Breakdown Comparison */}
      <ChartExportWrapper
        title="Desglose de Costos por Sistema"
        subtitle="Comparación detallada de costos por tipo de residuo"
        enableExport={true}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold mb-4 text-center">Costo Sistema RSU</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={financialMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN/día`} />
                <Bar dataKey="rsuCost" fill="#3b82f6">
                  {financialMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-center">Costo Gestión Sargazo</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={financialMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN/día`} />
                <Bar dataKey="sargassumCost" fill="#10b981">
                  {financialMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-center">Costo Gestión RCD</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={financialMetrics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `${formatNumber(value, 0)} MXN/día`} />
                <Bar dataKey="rcdCost" fill="#f97316">
                  {financialMetrics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ChartExportWrapper>

      {/* Income by Material Comparison */}
      <ChartExportWrapper
        title="Ingresos por Material - Comparación"
        subtitle="Comparación de ingresos por tipo de material recuperado"
        enableExport={true}
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={incomeComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="material" />
            <YAxis />
            <Tooltip formatter={(value, name, props) => [
              `${formatNumber(value, 0)} MXN/día`, 
              props.payload[`name${name.replace('scenario', '')}`] || name
            ]} />
            {financialMetrics.map((_, index) => (
              <Bar 
                key={`scenario${index}`}
                dataKey={`scenario${index}`} 
                fill={colors[index % colors.length]}
                name={financialMetrics[index].name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartExportWrapper>

      {/* Summary Table */}
      <ChartExportWrapper
        title="Resumen Financiero Comparativo"
        subtitle="Tabla detallada de métricas financieras por escenario"
        enableExport={true}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left p-2 font-semibold">Escenario</th>
                <th className="text-right p-2 font-semibold">Costo Total</th>
                <th className="text-right p-2 font-semibold">Costo RSU</th>
                <th className="text-right p-2 font-semibold">Costo Sargazo</th>
                <th className="text-right p-2 font-semibold">Costo RCD</th>
                <th className="text-right p-2 font-semibold">Ingresos</th>
                <th className="text-right p-2 font-semibold">Balance Neto</th>
              </tr>
            </thead>
            <tbody>
              {financialMetrics.map((metric) => {
                const netBalance = metric.totalIncome - metric.totalSystemCost;
                return (
                  <tr key={metric.name} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-2 font-medium">{metric.name}</td>
                    <td className="p-2 text-right text-red-600">{formatNumber(metric.totalSystemCost, 0)}</td>
                    <td className="p-2 text-right">{formatNumber(metric.rsuCost, 0)}</td>
                    <td className="p-2 text-right">{formatNumber(metric.sargassumCost, 0)}</td>
                    <td className="p-2 text-right">{formatNumber(metric.rcdCost, 0)}</td>
                    <td className="p-2 text-right text-green-600">{formatNumber(metric.totalIncome, 0)}</td>
                    <td className={`p-2 text-right font-medium ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatNumber(netBalance, 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartExportWrapper>
    </div>
  );
};

export default ComparisonFinancialAnalysis;