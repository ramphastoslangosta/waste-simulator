/**
 * Real Data Comparison Framework Tests
 * 
 * Tests the statistical framework for comparing simulation results against historical data.
 * Ensures accuracy of error calculations, confidence intervals, and statistical analysis.
 * 
 * Critical for thesis validation credibility and academic rigor.
 */

import { renderHook } from '@testing-library/react';
import { useWasteSimulation } from '../../hooks/useWasteSimulation';
import { 
  compareWithRealData, 
  parseHistoricalDataCSV,
  createRealDataValidationReport 
} from '../../utils/validation/realDataComparison';

// Mock historical data for testing
const mockHistoricalData = [
  {
    date: '2023-01',
    data_source: 'Municipal_Report',
    kpi_name: 'waste_generated_monthly',
    kpi_category: 'generation',
    real_value: '45.2',
    units: 'ton/month',
    confidence_level: 'high',
    notes: 'Official municipal report',
    source_citation: 'Municipality Test Data 2023'
  },
  {
    date: '2023-02',
    data_source: 'SEMARNAT_Study',
    kpi_name: 'collection_efficiency',
    kpi_category: 'logistics',
    real_value: '85.5',
    units: 'percentage',
    confidence_level: 'medium',
    notes: 'Regional waste management study',
    source_citation: 'SEMARNAT Test Study 2023'
  },
  {
    date: '2023-03',
    data_source: 'Academic_Research',
    kpi_name: 'disposal_cost_per_ton',
    kpi_category: 'economics',
    real_value: '2800',
    units: 'pesos/ton',
    confidence_level: 'high',
    notes: 'Peer-reviewed research',
    source_citation: 'Academic Test Paper 2023'
  },
  {
    date: '2023-04',
    data_source: 'Operator_Data',
    kpi_name: 'recovery_rate_informal',
    kpi_category: 'recovery',
    real_value: '12.5',
    units: 'percentage',
    confidence_level: 'medium',
    notes: 'Informal recycling operator data',
    source_citation: 'Recycling Cooperative Test Data 2023'
  },
  {
    date: '2023-05',
    data_source: 'Environmental_NGO',
    kpi_name: 'system_leakage_rate',
    kpi_category: 'operational',
    real_value: '8.2',
    units: 'percentage',
    confidence_level: 'medium',
    notes: 'Independent environmental monitoring',
    source_citation: 'Environmental NGO Test Report 2023'
  }
];

// Baseline simulation scenario for testing
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

// Scenario with known values for testing accuracy
const calibratedScenario = {
  ...testScenario,
  general: { ...testScenario.general, highSeasonOccupancy: 75 }, // Calibrated to match historical data
  generation: {
    ...testScenario.generation,
    hotels: { units: 45, rate: 1.4, sourceSeparationRate: 0 } // Adjusted for validation
  }
};

describe('Real Data Comparison Framework', () => {
  
  describe('CSV Data Parsing', () => {
    test('correctly parses historical data CSV format', () => {
      const csvData = `date,data_source,kpi_name,kpi_category,real_value,units,confidence_level,notes,source_citation
2023-01,Municipal_Report,waste_generated_monthly,generation,45.2,ton/month,high,"Official report","Municipality 2023"
2023-02,Study,collection_efficiency,logistics,85.5,percentage,medium,"Regional study","SEMARNAT 2023"`;
      
      const parsedData = parseHistoricalDataCSV(csvData);
      
      expect(parsedData).toHaveLength(2);
      expect(parsedData[0]).toEqual({
        date: '2023-01',
        data_source: 'Municipal_Report',
        kpi_name: 'waste_generated_monthly',
        kpi_category: 'generation',
        real_value: '45.2',
        units: 'ton/month',
        confidence_level: 'high',
        notes: 'Official report',
        source_citation: 'Municipality 2023'
      });
    });

    test('handles quoted CSV values with commas', () => {
      const csvData = `date,notes,citation
2023-01,"Report with, comma","Author, J. (2023)"`;
      
      const parsedData = parseHistoricalDataCSV(csvData);
      
      expect(parsedData[0].notes).toBe('Report with, comma');
      expect(parsedData[0].citation).toBe('Author, J. (2023)');
    });

    test('handles empty CSV values gracefully', () => {
      const csvData = `date,value,notes
2023-01,45.2,
2023-02,,Empty value`;
      
      const parsedData = parseHistoricalDataCSV(csvData);
      
      expect(parsedData).toHaveLength(2);
      expect(parsedData[0].notes).toBe('');
      expect(parsedData[1].value).toBe('');
    });
  });

  describe('Statistical Comparison Functions', () => {
    test('performs accurate comparison with perfect match', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      // Create perfect match data (simulated values = real values)
      const perfectMatchData = [
        {
          date: '2023-01',
          data_source: 'Test',
          kpi_name: 'waste_generated_monthly',
          kpi_category: 'generation',
          real_value: (result.current.high.rsu.totalGeneration * 30).toString(),
          units: 'ton/month',
          confidence_level: 'high',
          notes: 'Perfect match test',
          source_citation: 'Test Data'
        }
      ];
      
      const comparison = compareWithRealData(result.current, perfectMatchData, { season: 'high' });
      
      expect(comparison.isValid).toBe(true);
      expect(comparison.comparisons).toHaveLength(1);
      expect(comparison.comparisons[0].percentageError).toBeCloseTo(0, 1);
      expect(comparison.comparisons[0].isValid).toBe(true);
      expect(comparison.performanceMetrics.overallAccuracy).toBeCloseTo(1.0, 2);
    });

    test('calculates error metrics correctly', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      // Create data with known error
      const knownErrorData = [
        {
          date: '2023-01',
          data_source: 'Test',
          kpi_name: 'waste_generated_daily',
          kpi_category: 'generation',
          real_value: '2.0', // If simulation gives 1.8, error should be 10%
          units: 'ton/day',
          confidence_level: 'high',
          notes: 'Known error test',
          source_citation: 'Test Data'
        }
      ];
      
      const comparison = compareWithRealData(result.current, knownErrorData, { season: 'high' });
      
      expect(comparison.comparisons).toHaveLength(1);
      
      const comp = comparison.comparisons[0];
      expect(comp.absoluteError).toBeGreaterThan(0);
      expect(comp.percentageError).toBeGreaterThan(0);
      expect(comp.relativeError).toBeDefined();
      expect(comp.accuracy).toBeLessThan(100);
    });

    test('identifies statistical significance correctly', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      // Large difference should be statistically significant
      const significantDifferenceData = [
        {
          date: '2023-01',
          data_source: 'Test',
          kpi_name: 'waste_generated_daily',
          kpi_category: 'generation',
          real_value: '10.0', // Very different from simulation
          units: 'ton/day',
          confidence_level: 'high',
          notes: 'Significant difference test',
          source_citation: 'Test Data'
        }
      ];
      
      const comparison = compareWithRealData(result.current, significantDifferenceData, { season: 'high' });
      
      expect(comparison.comparisons[0].isStatisticallySignificant).toBe(true);
      expect(comparison.comparisons[0].pValue).toBeLessThan(0.05);
    });

    test('calculates confidence intervals', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const comparison = compareWithRealData(result.current, mockHistoricalData, { 
        season: 'high',
        confidenceLevel: 0.95 
      });
      
      comparison.comparisons.forEach(comp => {
        expect(comp.confidenceInterval).toBeDefined();
        expect(comp.confidenceInterval.lower).toBeDefined();
        expect(comp.confidenceInterval.upper).toBeDefined();
        expect(comp.confidenceInterval.level).toBe(0.95);
        expect(comp.confidenceInterval.lower).toBeLessThan(comp.confidenceInterval.upper);
      });
    });
  });

  describe('Error Categorization', () => {
    test('categorizes errors correctly by magnitude', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      // Mix of error levels
      const mixedErrorData = [
        {
          kpi_name: 'excellent_kpi',
          real_value: result.current.high.rsu.totalGeneration.toString(), // ~0% error
          units: 'ton/day'
        },
        {
          kpi_name: 'good_kpi', 
          real_value: (result.current.high.rsu.totalGeneration * 1.07).toString(), // ~7% error
          units: 'ton/day'
        },
        {
          kpi_name: 'acceptable_kpi',
          real_value: (result.current.high.rsu.totalGeneration * 1.15).toString(), // ~15% error
          units: 'ton/day'
        },
        {
          kpi_name: 'poor_kpi',
          real_value: (result.current.high.rsu.totalGeneration * 1.30).toString(), // ~30% error
          units: 'ton/day'
        }
      ].map(item => ({
        ...item,
        date: '2023-01',
        data_source: 'Test',
        kpi_category: 'generation',
        confidence_level: 'high',
        notes: 'Error categorization test',
        source_citation: 'Test Data'
      }));
      
      const comparison = compareWithRealData(result.current, mixedErrorData, { season: 'high' });
      
      // Check that errors are categorized correctly
      const excellent = comparison.discrepancyAnalysis.categories.excellent;
      const good = comparison.discrepancyAnalysis.categories.good;
      const acceptable = comparison.discrepancyAnalysis.categories.acceptable;
      const poor = comparison.discrepancyAnalysis.categories.poor;
      
      expect(excellent.length).toBeGreaterThan(0);
      expect(good.length).toBeGreaterThan(0);
      expect(acceptable.length).toBeGreaterThan(0);
      expect(poor.length).toBeGreaterThan(0);
      
      // Verify error ranges
      excellent.forEach(comp => expect(comp.percentageError).toBeLessThan(5));
      good.forEach(comp => expect(comp.percentageError).toBeGreaterThanOrEqual(5));
      good.forEach(comp => expect(comp.percentageError).toBeLessThan(10));
      acceptable.forEach(comp => expect(comp.percentageError).toBeGreaterThanOrEqual(10));
      acceptable.forEach(comp => expect(comp.percentageError).toBeLessThan(20));
      poor.forEach(comp => expect(comp.percentageError).toBeGreaterThanOrEqual(20));
    });

    test('identifies model bias patterns', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      // Create data that shows systematic overestimation
      const biasedData = [
        {
          kpi_name: 'kpi1',
          real_value: (result.current.high.rsu.totalGeneration * 0.8).toString(), // Simulation higher
          units: 'ton/day'
        },
        {
          kpi_name: 'kpi2',
          real_value: (result.current.high.rsu.totalGeneration * 0.7).toString(), // Simulation higher
          units: 'ton/day'
        }
      ].map(item => ({
        ...item,
        date: '2023-01',
        data_source: 'Test',
        kpi_category: 'generation',
        confidence_level: 'high',
        notes: 'Bias test',
        source_citation: 'Test Data'
      }));
      
      const comparison = compareWithRealData(result.current, biasedData, { season: 'high' });
      
      expect(comparison.discrepancyAnalysis.modelBiases.overestimation.length).toBeGreaterThan(0);
      expect(comparison.validationSummary.hasSignificantBias).toBeDefined();
    });
  });

  describe('Performance Metrics Calculation', () => {
    test('calculates overall performance metrics accurately', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const comparison = compareWithRealData(result.current, mockHistoricalData, { season: 'high' });
      
      expect(comparison.performanceMetrics).toBeDefined();
      expect(comparison.performanceMetrics.overallAccuracy).toBeGreaterThanOrEqual(0);
      expect(comparison.performanceMetrics.overallAccuracy).toBeLessThanOrEqual(1);
      expect(comparison.performanceMetrics.meanAbsoluteError).toBeGreaterThanOrEqual(0);
      expect(comparison.performanceMetrics.validationRate).toBeGreaterThanOrEqual(0);
      expect(comparison.performanceMetrics.validationRate).toBeLessThanOrEqual(1);
      expect(comparison.performanceMetrics.totalComparisons).toBe(comparison.comparisons.length);
    });

    test('calculates correlation coefficient', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const comparison = compareWithRealData(result.current, mockHistoricalData, { season: 'high' });
      
      expect(comparison.performanceMetrics.correlationCoefficient).toBeGreaterThanOrEqual(-1);
      expect(comparison.performanceMetrics.correlationCoefficient).toBeLessThanOrEqual(1);
    });

    test('handles edge cases gracefully', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      // Empty historical data
      const emptyComparison = compareWithRealData(result.current, [], { season: 'high' });
      
      expect(emptyComparison.isValid).toBe(false);
      expect(emptyComparison.totalComparisons).toBe(0);
      expect(emptyComparison.performanceMetrics.overallAccuracy).toBe(0);
    });
  });

  describe('Validation Summary Generation', () => {
    test('generates comprehensive validation summary', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const comparison = compareWithRealData(result.current, mockHistoricalData, { season: 'high' });
      
      expect(comparison.validationSummary).toBeDefined();
      expect(comparison.validationSummary.credibilityScore).toBeGreaterThanOrEqual(0);
      expect(comparison.validationSummary.credibilityScore).toBeLessThanOrEqual(1);
      expect(comparison.validationSummary.credibilityLevel).toMatch(/excellent|good|acceptable|poor/);
      expect(comparison.validationSummary.isModelValidated).toBeDefined();
      expect(comparison.validationSummary.keyFindings).toBeInstanceOf(Array);
      expect(comparison.validationSummary.recommendations).toBeInstanceOf(Array);
    });

    test('provides academic summary with correct structure', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const comparison = compareWithRealData(result.current, mockHistoricalData, { season: 'high' });
      
      const academic = comparison.validationSummary.academicSummary;
      expect(academic.totalKPIsCompared).toBe(comparison.totalComparisons);
      expect(academic.validationSuccessRate).toMatch(/\d+\.\d+%/);
      expect(academic.overallModelAccuracy).toMatch(/\d+\.\d+%/);
      expect(academic.correlationWithRealData).toMatch(/\d\.\d{3}/);
    });

    test('generates actionable recommendations', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      // Create data with poor performance to trigger recommendations
      const poorPerformanceData = mockHistoricalData.map(item => ({
        ...item,
        real_value: (parseFloat(item.real_value) * 2).toString() // Double all values to create large errors
      }));
      
      const comparison = compareWithRealData(result.current, poorPerformanceData, { season: 'high' });
      
      expect(comparison.validationSummary.recommendations.length).toBeGreaterThan(0);
      expect(comparison.validationSummary.recommendations.some(rec => 
        rec.includes('parameter') || rec.includes('calibrat') || rec.includes('improve')
      )).toBe(true);
    });
  });

  describe('Report Generation', () => {
    test('creates detailed validation report', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const comparison = compareWithRealData(result.current, mockHistoricalData, { season: 'high' });
      const report = createRealDataValidationReport(comparison);
      
      expect(report).toContain('Real Data Validation Report');
      expect(report).toContain('Executive Summary');
      expect(report).toContain('Statistical Performance Metrics');
      expect(report).toContain('Detailed Comparison Results');
      expect(report).toContain('Key Findings');
      expect(report).toContain('Recommendations');
    });

    test('includes all comparison details in report', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const comparison = compareWithRealData(result.current, mockHistoricalData, { season: 'high' });
      const report = createRealDataValidationReport(comparison);
      
      // Check that each comparison is included
      comparison.comparisons.forEach(comp => {
        expect(report).toContain(comp.kpiName);
        expect(report).toContain(comp.dataSource);
        expect(report).toContain(comp.citation);
      });
    });
  });

  describe('Framework Integration', () => {
    test('integrates with different seasons correctly', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const highSeasonComparison = compareWithRealData(result.current, mockHistoricalData, { season: 'high' });
      const lowSeasonComparison = compareWithRealData(result.current, mockHistoricalData, { season: 'low' });
      
      expect(highSeasonComparison.metadata.season).toBe('high');
      expect(lowSeasonComparison.metadata.season).toBe('low');
      
      // Results should be different due to different occupancy rates
      if (highSeasonComparison.comparisons.length > 0 && lowSeasonComparison.comparisons.length > 0) {
        const highGeneration = highSeasonComparison.comparisons.find(c => c.kpiName.includes('generated'));
        const lowGeneration = lowSeasonComparison.comparisons.find(c => c.kpiName.includes('generated'));
        
        if (highGeneration && lowGeneration) {
          expect(highGeneration.simulatedValue).toBeGreaterThan(lowGeneration.simulatedValue);
        }
      }
    });

    test('handles various confidence levels', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const comparison90 = compareWithRealData(result.current, mockHistoricalData, { 
        season: 'high', 
        confidenceLevel: 0.90 
      });
      const comparison99 = compareWithRealData(result.current, mockHistoricalData, { 
        season: 'high', 
        confidenceLevel: 0.99 
      });
      
      expect(comparison90.metadata.confidenceLevel).toBe(0.90);
      expect(comparison99.metadata.confidenceLevel).toBe(0.99);
      
      // 99% confidence intervals should be wider than 90%
      if (comparison90.comparisons.length > 0 && comparison99.comparisons.length > 0) {
        const ci90 = comparison90.comparisons[0].confidenceInterval;
        const ci99 = comparison99.comparisons[0].confidenceInterval;
        
        const width90 = ci90.upper - ci90.lower;
        const width99 = ci99.upper - ci99.lower;
        expect(width99).toBeGreaterThan(width90);
      }
    });

    test('validates framework metadata', () => {
      const { result } = renderHook(() => useWasteSimulation(testScenario));
      
      const comparison = compareWithRealData(result.current, mockHistoricalData, { season: 'high' });
      
      expect(comparison.metadata).toBeDefined();
      expect(comparison.metadata.timestamp).toBeDefined();
      expect(comparison.metadata.frameworkVersion).toBe('1.0.0');
      expect(comparison.metadata.season).toBe('high');
      expect(comparison.metadata.confidenceLevel).toBeDefined();
      expect(comparison.metadata.significanceLevel).toBeDefined();
    });
  });
});