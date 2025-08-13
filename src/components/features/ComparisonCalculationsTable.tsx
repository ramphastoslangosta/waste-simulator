import React, { useMemo } from 'react';
import { useWasteSimulation } from '../../hooks/useWasteSimulation';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import { formatNumber } from '../../utils/formatNumber';
import { Download } from 'lucide-react';
import { exportComparisonAnalysisToCSV, downloadCSV } from '../../utils/csvUtils';

interface ComparisonCalculationsTableProps {
  scenarios: Array<{
    id: string;
    name: string;
    description?: string;
    inputs: any;
  }>;
  season: 'high' | 'low';
}

const ComparisonCalculationsTable: React.FC<ComparisonCalculationsTableProps> = ({ scenarios, season }) => {
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

  const handleExportComparisonCalculations = () => {
    try {
      // Use the new enhanced CSV export function
      const csvContent = exportComparisonAnalysisToCSV(scenarioResults, season);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const seasonLabelFile = season.toLowerCase().replace(' ', '-');
      downloadCSV(csvContent, `analisis-comparativo-thesis-${seasonLabelFile}-${timestamp}.csv`);
    } catch (error) {
      console.error('Error exporting comparison analysis:', error);
      alert('Error al exportar análisis comparativo: ' + error.message);
    }
  };

  // Prepare calculation data for display
  const calculationRows = useMemo(() => {
    if (scenarioResults.length === 0) return [];

    return scenarioResults.map(scenario => {
      const kpis = season === 'high' ? scenario.results.high : scenario.results.low;
      const rsuKpis = kpis.rsu;
      const data = rsuKpis.calculations;
      
      // Access generation by source
      const genBySource = rsuKpis.genBySource || data.genBySource || {
        hotels: 0,
        restaurants: 0,
        homes: 0,
        commerce: 0
      };

      return {
        scenario: scenario.name,
        inputs: scenario.inputs,
        data: {
          // Generation
          totalGeneration: rsuKpis.totalGeneration,
          genHotels: genBySource.hotels,
          genRestaurants: genBySource.restaurants,
          genHomes: genBySource.homes,
          genCommerce: genBySource.commerce,
          
          // Collection
          collectionCapacity: data.collectionCapacity,
          collectionDeficit: rsuKpis.collectionDeficit,
          collectedWasteTotal: data.collectedWasteTotal,
          informalRecoveryCollection: data.informalRecoveryCollection,
          leakCollection: data.leakCollection,
          toTransferStationTotal: data.toTransferStationTotal,
          
          // Processing
          materialProcessedToday: data.materialProcessedToday,
          finalInventory: rsuKpis.finalInventory,
          totalRecoveredAtStation: data.totalRecoveredAtStation,
          recoverySource: rsuKpis.recoveryByStage.source,
          recoveryPlant: rsuKpis.recoveryByStage.plant,
          leakTransferStation: data.leakTransferStation,
          toFinalTransport: data.toFinalTransport,
          
          // Final disposal
          actualFinalTransport: data.actualFinalTransport,
          untransportedMaterial: data.untransportedMaterial,
          leakFinalTransport: data.leakFinalTransport,
          toDisposalSite: data.toDisposalSite,
          informalRecoveryDisposal: data.informalRecoveryDisposal,
          leakDisposal: data.leakDisposal,
          toDisposal: rsuKpis.toDisposal,
          
          // Financial
          totalRsuIncome: rsuKpis.totalRsuIncome,
          totalRsuCosts: rsuKpis.totalRsuCosts,
          netCostPerDay: rsuKpis.netCostPerDay,
          totalCollectionCost: data.totalCollectionCost,
          totalTransferCost: data.totalTransferCost,
          totalFinalTransportCost: data.totalFinalTransportCost,
          totalDisposalCost: data.totalDisposalCost
        }
      };
    });
  }, [scenarioResults, season]);

  const TableRow = ({ label, values, unit, isTitle = false, bold = false, highlight = false }) => (
    <tr className={`${highlight ? 'bg-yellow-50' : ''} ${isTitle ? 'bg-blue-100' : 'border-b border-slate-100'}`}>
      {isTitle ? (
        <td colSpan={scenarioResults.length + 2} className="py-3 px-4 font-bold text-blue-900">
          {label}
        </td>
      ) : (
        <>
          <td className={`py-2 px-4 ${bold ? 'font-bold text-slate-900' : 'text-slate-700'} w-1/4`}>
            {label}
          </td>
          {values.map((value, index) => (
            <td key={index} className="py-2 px-4 text-right font-mono text-sm">
              {formatNumber(value, 2)}
            </td>
          ))}
          <td className="py-2 px-4 text-left text-slate-600 text-sm w-20">
            {unit}
          </td>
        </>
      )}
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {`Tabla de Cálculos Comparativa - ${seasonLabel}`}
            </h3>
            <p className="text-sm text-slate-500">
              Comparación detallada de cálculos técnicos entre {scenarioResults.length} escenarios
            </p>
          </div>
          <button
            onClick={handleExportComparisonCalculations}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Exportar Análisis Thesis (CSV)
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarioResults.map((scenario, index) => (
            <div key={scenario.id} className="p-3 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-sm">{scenario.name}</h4>
              {scenario.description && (
                <p className="text-xs text-slate-600 mt-1">{scenario.description}</p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Comparison Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-blue-900 w-1/4">
                  Concepto
                </th>
                {scenarioResults.map((scenario) => (
                  <th key={scenario.id} className="py-3 px-4 text-center font-semibold text-blue-900">
                    {scenario.name}
                  </th>
                ))}
                <th className="py-3 px-4 text-left font-semibold text-blue-900 w-20">
                  Unidad
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Generation Section */}
              <TableRow isTitle={true} label="ETAPA 1: GENERACIÓN DE RSU" values={[]} unit="" />
              <TableRow 
                label="Generación Total de RSU" 
                values={calculationRows.map(row => row.data.totalGeneration)} 
                unit="ton/día" 
                bold={true}
              />
              <TableRow 
                label="  - Generado por Hoteles" 
                values={calculationRows.map(row => row.data.genHotels)} 
                unit="ton/día"
              />
              <TableRow 
                label="  - Generado por Restaurantes" 
                values={calculationRows.map(row => row.data.genRestaurants)} 
                unit="ton/día"
              />
              <TableRow 
                label="  - Generado por Hogares" 
                values={calculationRows.map(row => row.data.genHomes)} 
                unit="ton/día"
              />
              <TableRow 
                label="  - Generado por Comercios" 
                values={calculationRows.map(row => row.data.genCommerce)} 
                unit="ton/día"
              />

              {/* Collection Section */}
              <TableRow isTitle={true} label="ETAPA 2: RECOLECCIÓN Y LOGÍSTICA PRIMARIA" values={[]} unit="" />
              <TableRow 
                label="Capacidad de Recolección" 
                values={calculationRows.map(row => row.data.collectionCapacity)} 
                unit="ton/día" 
                bold={true}
              />
              <TableRow 
                label="Déficit de Recolección (Fuga)" 
                values={calculationRows.map(row => row.data.collectionDeficit)} 
                unit="ton/día" 
                bold={true} 
                highlight={true}
              />
              <TableRow 
                label="Total Recolectado" 
                values={calculationRows.map(row => row.data.collectedWasteTotal)} 
                unit="ton/día"
              />
              <TableRow 
                label="  - Recuperación Informal (en ruta)" 
                values={calculationRows.map(row => row.data.informalRecoveryCollection)} 
                unit="ton/día"
              />
              <TableRow 
                label="  - Fuga en Recolección" 
                values={calculationRows.map(row => row.data.leakCollection)} 
                unit="ton/día" 
                highlight={true}
              />
              <TableRow 
                label="Entrada a Sitio de Transferencia" 
                values={calculationRows.map(row => row.data.toTransferStationTotal)} 
                unit="ton/día" 
                bold={true}
              />

              {/* Processing Section */}
              <TableRow isTitle={true} label="ETAPA 3: SITIO DE TRANSFERENCIA Y VALORIZACIÓN" values={[]} unit="" />
              <TableRow 
                label="Material Procesado (Promedio diario)" 
                values={calculationRows.map(row => row.data.materialProcessedToday)} 
                unit="ton/día" 
                bold={true}
              />
              <TableRow 
                label="Inventario Acumulado (Día 30)" 
                values={calculationRows.map(row => row.data.finalInventory)} 
                unit="ton" 
                bold={true} 
                highlight={true}
              />
              <TableRow 
                label="Recuperación Formal Total" 
                values={calculationRows.map(row => row.data.totalRecoveredAtStation)} 
                unit="ton/día"
              />
              <TableRow 
                label="  - Recuperado Alta Calidad (Origen)" 
                values={calculationRows.map(row => row.data.recoverySource)} 
                unit="ton/día"
              />
              <TableRow 
                label="  - Recuperado Baja Calidad (Planta)" 
                values={calculationRows.map(row => row.data.recoveryPlant)} 
                unit="ton/día"
              />
              <TableRow 
                label="  - Fuga en Planta" 
                values={calculationRows.map(row => row.data.leakTransferStation)} 
                unit="ton/día" 
                highlight={true}
              />
              <TableRow 
                label="Material para Traslado Final" 
                values={calculationRows.map(row => row.data.toFinalTransport)} 
                unit="ton/día" 
                bold={true}
              />

              {/* Final Disposal Section */}
              <TableRow isTitle={true} label="ETAPA 4: TRASLADO Y DISPOSICIÓN FINAL" values={[]} unit="" />
              <TableRow 
                label="Material Efectivamente Trasladado" 
                values={calculationRows.map(row => row.data.actualFinalTransport)} 
                unit="ton/día" 
                bold={true}
              />
              <TableRow 
                label="Material No Trasladado (acum. en planta)" 
                values={calculationRows.map(row => row.data.untransportedMaterial)} 
                unit="ton/día" 
                highlight={true}
              />
              <TableRow 
                label="  - Fuga en Traslado Final" 
                values={calculationRows.map(row => row.data.leakFinalTransport)} 
                unit="ton/día" 
                highlight={true}
              />
              <TableRow 
                label="Entrada a Disposición Final" 
                values={calculationRows.map(row => row.data.toDisposalSite)} 
                unit="ton/día" 
                bold={true}
              />
              <TableRow 
                label="  - Recuperación Informal (en sitio)" 
                values={calculationRows.map(row => row.data.informalRecoveryDisposal)} 
                unit="ton/día"
              />
              <TableRow 
                label="  - Fuga en Disposición Final" 
                values={calculationRows.map(row => row.data.leakDisposal)} 
                unit="ton/día" 
                highlight={true}
              />
              <TableRow 
                label="Residuo Final Enterrado" 
                values={calculationRows.map(row => row.data.toDisposal)} 
                unit="ton/día" 
                bold={true} 
                highlight={true}
              />

              {/* Financial Section */}
              <TableRow isTitle={true} label="ANÁLISIS FINANCIERO (SOLO RSU)" values={[]} unit="" />
              <TableRow 
                label="Ingresos Totales por Venta" 
                values={calculationRows.map(row => row.data.totalRsuIncome)} 
                unit="MXN/día" 
                bold={true}
              />
              <TableRow 
                label="Costos Totales de Operación" 
                values={calculationRows.map(row => row.data.totalRsuCosts)} 
                unit="MXN/día" 
                bold={true}
              />
              <TableRow 
                label="  - Costo de Recolección" 
                values={calculationRows.map(row => row.data.totalCollectionCost)} 
                unit="MXN/día"
              />
              <TableRow 
                label="  - Costo de Transferencia" 
                values={calculationRows.map(row => row.data.totalTransferCost)} 
                unit="MXN/día"
              />
              <TableRow 
                label="  - Costo de Traslado Final" 
                values={calculationRows.map(row => row.data.totalFinalTransportCost)} 
                unit="MXN/día"
              />
              <TableRow 
                label="  - Costo de Disposición Final" 
                values={calculationRows.map(row => row.data.totalDisposalCost)} 
                unit="MXN/día"
              />
              <TableRow 
                label="Costo Neto del Sistema RSU" 
                values={calculationRows.map(row => row.data.netCostPerDay)} 
                unit="MXN/día" 
                bold={true} 
                highlight={true}
              />
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ComparisonCalculationsTable;