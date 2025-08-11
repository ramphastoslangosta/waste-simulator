import React from 'react';
import { useWasteSimulation } from '../../hooks/useWasteSimulation';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import { formatNumber } from '../../utils/formatNumber';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

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
  // Calculate simulation results for each scenario
  const scenarioResults = scenarios.map(scenario => ({
    ...scenario,
    results: useWasteSimulation(scenario.inputs)
  }));

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
        <Card>
          <CardHeader title="Costo Total" subtitle="MXN/día" />
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
        </Card>

        <Card>
          <CardHeader title="Costo Sistema RSU" subtitle="MXN/día" />
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
        </Card>

        <Card>
          <CardHeader title="Costo Sargazo" subtitle="MXN/día" />
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
        </Card>

        <Card>
          <CardHeader title="Ingresos Totales" subtitle="MXN/día" />
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
        </Card>
      </div>

      {/* Comparative Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Cost Comparison */}
        <Card>
          <CardHeader title="Costo Total Comparativo" subtitle="Comparación de costos totales del sistema" />
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
        </Card>

        {/* Income Comparison */}
        <Card>
          <CardHeader title="Ingresos Totales Comparativo" subtitle="Comparación de ingresos por venta de materiales" />
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
        </Card>
      </div>

      {/* Cost Breakdown Comparison */}
      <Card>
        <CardHeader title="Desglose de Costos por Sistema" subtitle="Comparación detallada de costos por tipo de residuo" />
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
      </Card>

      {/* Income by Material Comparison */}
      <Card>
        <CardHeader title="Ingresos por Material - Comparación" subtitle="Comparación de ingresos por tipo de material recuperado" />
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
      </Card>

      {/* Summary Table */}
      <Card>
        <CardHeader title="Resumen Financiero Comparativo" subtitle="Tabla detallada de métricas financieras por escenario" />
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
              {financialMetrics.map((metric, index) => {
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
      </Card>
    </div>
  );
};

export default ComparisonFinancialAnalysis;