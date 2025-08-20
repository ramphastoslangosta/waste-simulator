/**
 * Validation Test Dashboard
 * 
 * Comprehensive test of the complete validation framework.
 * Demonstrates mass conservation, physical constraints, and real data comparison.
 * Generates academic reports for thesis documentation.
 */

import React, { useMemo, useState } from 'react';
import { FileText, Play, CheckCircle, AlertCircle, Download, BarChart3 } from 'lucide-react';
import Card from '../ui/Card.tsx';
import CardHeader from '../ui/CardHeader.tsx';
import { useWasteSimulation } from '../../hooks/useWasteSimulation';
import { 
  validateMassConservation, 
  validatePhysicalConstraints,
  compareWithRealData,
  parseHistoricalDataCSV,
  createMassBalanceReport,
  createPhysicalConstraintsReport,
  createRealDataValidationReport
} from '../../utils/validation';
import { formatNumber } from '../../utils/formatNumber';

// Test scenario for validation
const testScenario = {
  general: { highSeasonOccupancy: 80, lowSeasonOccupancy: 40, fixedPopulation: 2500 },
  generation: {
    hotels: { units: 50, rate: 1.5, sourceSeparationRate: 0 },
    restaurants: { units: 30, rate: 2.0, sourceSeparationRate: 0 },
    homes: { rate: 0.8, sourceSeparationRate: 0 },
    commerce: { units: 80, rate: 1.2, sourceSeparationRate: 0 }
  },
  composition: {
    hotels: { organicos: 40, pet: 8, aluminio: 2, carton: 15, vidrio: 5, rechazo: 28, peligrosos: 2 },
    restaurants: { organicos: 50, pet: 10, aluminio: 3, carton: 12, vidrio: 8, rechazo: 15, peligrosos: 2 },
    homes: { organicos: 45, pet: 6, aluminio: 2, carton: 10, vidrio: 7, rechazo: 28, peligrosos: 2 },
    commerce: { organicos: 35, pet: 12, aluminio: 4, carton: 20, vidrio: 9, rechazo: 18, peligrosos: 2 }
  },
  rsuSystem: {
    logistics: { vehicles: 4, vehicleCapacity: 5, tripsPerVehicle: 2 },
    processing: { transferStationRate: 50, transferStationCapacity: 150, finalTransportCapacity: 40 },
    leaks: { collectionLeak: 2, transferLeak: 1, transportLeak: 1 },
    separation: { informalRecoveryRateCollection: 15, informalRecoveryRateTransfer: 10 },
    initialInventory: { transferStation: 10, collectionVehicles: 2, finalTransportVehicles: 5, disposalSite: 0 }
  }
};

// Mock historical data based on CSV template
const mockHistoricalCSV = `date,data_source,kpi_name,kpi_category,real_value,units,confidence_level,notes,source_citation
2023-01,Municipal_Report,waste_generated_monthly,generation,45.2,ton/month,high,"Reporte oficial de limpia pública municipal","Municipio de Lázaro Cárdenas (2023). Reporte Anual de Residuos Sólidos"
2023-02,SEMARNAT_Study,collection_efficiency,logistics,85.5,percentage,medium,"Estudio regional de manejo de residuos","SEMARNAT Quintana Roo (2023). Diagnóstico de Residuos Sólidos"
2023-03,Academic_Research,total_cost_monthly,economics,125000,pesos/month,high,"Investigación académica peer-reviewed","Universidad de Yucatán (2023). Costos de Manejo de Residuos en Islas"
2022-12,Operator_Data,recovery_rate_informal,recovery,12.5,percentage,medium,"Datos de operadores de reciclaje informal","Cooperativa de Recicladores Holbox (2022). Reporte de Actividades"
2023-04,Tourism_Board,waste_generated_daily,generation,1.8,ton/day,low,"Estimación basada en ocupación turística","Consejo de Promoción Turística de Quintana Roo (2023)"
2023-05,Environmental_NGO,system_leakage_rate,operational,8.2,percentage,medium,"Monitoreo ambiental independiente","Greenpeace México (2023). Contaminación Costera en el Caribe"`;

const ValidationTestDashboard: React.FC = () => {
  const [activeTest, setActiveTest] = useState<'mass' | 'constraints' | 'realdata' | 'all'>('mass');
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [reports, setReports] = useState<{[key: string]: string}>({});

  // Run simulation with test scenario
  const simulationResults = useWasteSimulation(testScenario);

  // Parse mock historical data
  const historicalData = useMemo(() => {
    return parseHistoricalDataCSV(mockHistoricalCSV);
  }, []);

  const runValidationTest = async (testType: string) => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
      
      let results: any = {};
      let generatedReports: {[key: string]: string} = {};
      
      if (testType === 'mass' || testType === 'all') {
        // Test mass conservation validation
        const massValidationHigh = validateMassConservation(simulationResults.high, testScenario, 'high');
        const massValidationLow = validateMassConservation(simulationResults.low, testScenario, 'low');
        
        results.massConservation = {
          high: massValidationHigh,
          low: massValidationLow,
          overallValid: massValidationHigh.isValid && massValidationLow.isValid
        };
        
        generatedReports.massBalance = createMassBalanceReport(massValidationHigh);
      }
      
      if (testType === 'constraints' || testType === 'all') {
        // Test physical constraints validation
        const constraintsValidationHigh = validatePhysicalConstraints(simulationResults.high, testScenario, 'high');
        const constraintsValidationLow = validatePhysicalConstraints(simulationResults.low, testScenario, 'low');
        
        results.physicalConstraints = {
          high: constraintsValidationHigh,
          low: constraintsValidationLow,
          overallValid: constraintsValidationHigh.overallValid && constraintsValidationLow.overallValid
        };
        
        generatedReports.physicalConstraints = createPhysicalConstraintsReport(constraintsValidationHigh);
      }
      
      if (testType === 'realdata' || testType === 'all') {
        // Test real data comparison
        const realDataValidationHigh = compareWithRealData(simulationResults, historicalData, { season: 'high' });
        const realDataValidationLow = compareWithRealData(simulationResults, historicalData, { season: 'low' });
        
        results.realDataComparison = {
          high: realDataValidationHigh,
          low: realDataValidationLow,
          overallValid: realDataValidationHigh.isValid && realDataValidationLow.isValid
        };
        
        generatedReports.realDataValidation = createRealDataValidationReport(realDataValidationHigh);
      }
      
      setTestResults(results);
      setReports(generatedReports);
      
    } catch (error) {
      console.error('Validation test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = (reportType: string) => {
    const report = reports[reportType];
    if (!report) return;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-validation-report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTestStatus = (testType: string) => {
    if (!testResults) return 'pending';
    if (testResults.error) return 'error';
    
    switch (testType) {
      case 'mass':
        return testResults.massConservation?.overallValid ? 'success' : 'failure';
      case 'constraints':
        return testResults.physicalConstraints?.overallValid ? 'success' : 'failure';
      case 'realdata':
        return testResults.realDataComparison?.overallValid ? 'success' : 'failure';
      default:
        return 'pending';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failure':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failure':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader 
          title="Framework de Validación - Prueba Integral" 
          subtitle="Demostración completa del sistema de validación científica"
          icon={<BarChart3 size={18} />}
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={() => setActiveTest('mass')}
            className={`p-4 rounded-lg border text-center transition-colors ${
              activeTest === 'mass' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold">Conservación Masa</div>
            <div className="text-sm text-gray-600">Principio físico</div>
          </button>
          
          <button
            onClick={() => setActiveTest('constraints')}
            className={`p-4 rounded-lg border text-center transition-colors ${
              activeTest === 'constraints' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold">Restricciones Físicas</div>
            <div className="text-sm text-gray-600">Capacidades</div>
          </button>
          
          <button
            onClick={() => setActiveTest('realdata')}
            className={`p-4 rounded-lg border text-center transition-colors ${
              activeTest === 'realdata' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold">Datos Reales</div>
            <div className="text-sm text-gray-600">Comparación histórica</div>
          </button>
          
          <button
            onClick={() => setActiveTest('all')}
            className={`p-4 rounded-lg border text-center transition-colors ${
              activeTest === 'all' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-semibold">Validación Completa</div>
            <div className="text-sm text-gray-600">Todas las pruebas</div>
          </button>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => runValidationTest(activeTest)}
            disabled={isRunning}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play size={18} />
            <span>{isRunning ? 'Ejecutando Validación...' : 'Ejecutar Prueba'}</span>
          </button>
        </div>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader 
            title="Resultados de Validación" 
            subtitle="Estado de las pruebas de validación científica"
            icon={<FileText size={18} />}
          />
          
          {testResults.error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="font-semibold">Error en la validación:</div>
              <div>{testResults.error}</div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mass Conservation Results */}
              {testResults.massConservation && (
                <div className={`p-4 rounded-lg border ${getStatusColor(getTestStatus('mass'))}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(getTestStatus('mass'))}
                      <div className="font-semibold">Validación de Conservación de Masa</div>
                    </div>
                    {reports.massBalance && (
                      <button
                        onClick={() => downloadReport('massBalance')}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <Download size={14} />
                        <span>Reporte</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Temporada Alta:</div>
                      <div>Estado: {testResults.massConservation.high.isValid ? 'VÁLIDA' : 'INVÁLIDA'}</div>
                      <div>Error: {formatNumber(testResults.massConservation.high.massBalance?.percentageError || 0, 2)}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Temporada Baja:</div>
                      <div>Estado: {testResults.massConservation.low.isValid ? 'VÁLIDA' : 'INVÁLIDA'}</div>
                      <div>Error: {formatNumber(testResults.massConservation.low.massBalance?.percentageError || 0, 2)}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Physical Constraints Results */}
              {testResults.physicalConstraints && (
                <div className={`p-4 rounded-lg border ${getStatusColor(getTestStatus('constraints'))}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(getTestStatus('constraints'))}
                      <div className="font-semibold">Validación de Restricciones Físicas</div>
                    </div>
                    {reports.physicalConstraints && (
                      <button
                        onClick={() => downloadReport('physicalConstraints')}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <Download size={14} />
                        <span>Reporte</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Temporada Alta:</div>
                      <div>Estado: {testResults.physicalConstraints.high.overallValid ? 'VÁLIDA' : 'INVÁLIDA'}</div>
                      <div>Utilización Sistema: {formatNumber((testResults.physicalConstraints.high.bottleneckAnalysis?.systemStress || 0) * 100, 1)}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Temporada Baja:</div>
                      <div>Estado: {testResults.physicalConstraints.low.overallValid ? 'VÁLIDA' : 'INVÁLIDA'}</div>
                      <div>Utilización Sistema: {formatNumber((testResults.physicalConstraints.low.bottleneckAnalysis?.systemStress || 0) * 100, 1)}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Data Comparison Results */}
              {testResults.realDataComparison && (
                <div className={`p-4 rounded-lg border ${getStatusColor(getTestStatus('realdata'))}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(getTestStatus('realdata'))}
                      <div className="font-semibold">Comparación con Datos Reales</div>
                    </div>
                    {reports.realDataValidation && (
                      <button
                        onClick={() => downloadReport('realDataValidation')}
                        className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        <Download size={14} />
                        <span>Reporte</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Temporada Alta:</div>
                      <div>KPIs Comparados: {testResults.realDataComparison.high.totalComparisons}</div>
                      <div>Validados: {testResults.realDataComparison.high.validComparisons}</div>
                      <div>Precisión: {formatNumber((testResults.realDataComparison.high.performanceMetrics?.overallAccuracy || 0) * 100, 1)}%</div>
                    </div>
                    <div>
                      <div className="font-medium">Correlación:</div>
                      <div>r = {formatNumber(testResults.realDataComparison.high.performanceMetrics?.correlationCoefficient || 0, 3)}</div>
                      <div>Credibilidad: {testResults.realDataComparison.high.validationSummary?.credibilityLevel?.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Historical Data Preview */}
      <Card>
        <CardHeader 
          title="Datos Históricos de Prueba" 
          subtitle="Vista previa de los datos utilizados para la comparación"
          icon={<FileText size={18} />}
        />
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">KPI</th>
                <th className="text-left p-2">Valor Real</th>
                <th className="text-left p-2">Unidades</th>
                <th className="text-left p-2">Fuente</th>
                <th className="text-left p-2">Confianza</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.slice(0, 6).map((data, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{data.kpi_name}</td>
                  <td className="p-2">{data.real_value}</td>
                  <td className="p-2">{data.units}</td>
                  <td className="p-2">{data.data_source}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      data.confidence_level === 'high' ? 'bg-green-100 text-green-700' :
                      data.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {data.confidence_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Test Scenario Details */}
      <Card>
        <CardHeader 
          title="Escenario de Prueba" 
          subtitle="Parámetros utilizados para la validación"
          icon={<BarChart3 size={18} />}
        />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-blue-50 rounded">
            <div className="font-semibold text-blue-700">Generación</div>
            <div>Hoteles: {testScenario.generation.hotels.units} unidades</div>
            <div>Restaurantes: {testScenario.generation.restaurants.units} unidades</div>
            <div>Población: {testScenario.general.fixedPopulation} habitantes</div>
          </div>
          
          <div className="p-3 bg-green-50 rounded">
            <div className="font-semibold text-green-700">Logística</div>
            <div>Vehículos: {testScenario.rsuSystem.logistics.vehicles}</div>
            <div>Capacidad: {testScenario.rsuSystem.logistics.vehicleCapacity} ton</div>
            <div>Viajes/día: {testScenario.rsuSystem.logistics.tripsPerVehicle}</div>
          </div>
          
          <div className="p-3 bg-orange-50 rounded">
            <div className="font-semibold text-orange-700">Procesamiento</div>
            <div>Tasa: {testScenario.rsuSystem.processing.transferStationRate} ton/día</div>
            <div>Capacidad: {testScenario.rsuSystem.processing.transferStationCapacity} ton</div>
            <div>Transporte: {testScenario.rsuSystem.processing.finalTransportCapacity} ton/día</div>
          </div>
          
          <div className="p-3 bg-purple-50 rounded">
            <div className="font-semibold text-purple-700">Temporadas</div>
            <div>Alta: {testScenario.general.highSeasonOccupancy}% ocupación</div>
            <div>Baja: {testScenario.general.lowSeasonOccupancy}% ocupación</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ValidationTestDashboard;