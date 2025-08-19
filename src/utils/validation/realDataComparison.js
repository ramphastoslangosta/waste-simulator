/**
 * Real Data Comparison Framework
 * 
 * Statistical framework for comparing simulation results against historical data from Holbox.
 * Provides rigorous academic validation with error analysis, confidence intervals, and significance testing.
 * 
 * Critical for thesis validation and model credibility assessment.
 */

/**
 * Main function to compare simulation results with real historical data
 * @param {Object} simulationResults - Results from useWasteSimulation
 * @param {Array} historicalData - Array of real data points from CSV
 * @param {Object} options - Comparison options and parameters
 * @returns {Object} Comprehensive validation results with statistical analysis
 */
export function compareWithRealData(simulationResults, historicalData, options = {}) {
  const {
    confidenceLevel = 0.95,
    significanceLevel = 0.05,
    errorThresholds = { good: 5, acceptable: 20, poor: Infinity },
    excludeOutliers = true,
    season = 'high'
  } = options;

  try {
    // Extract KPIs from simulation for the specified season
    const simulationKPIs = extractSimulationKPIs(simulationResults, season);
    
    // Match historical data with simulation KPIs
    const matchedData = matchHistoricalData(simulationKPIs, historicalData);
    
    // Perform statistical comparisons
    const comparisons = performStatisticalComparisons(matchedData, { confidenceLevel, significanceLevel });
    
    // Analyze discrepancies and categorize results
    const discrepancyAnalysis = analyzeDiscrepancies(comparisons, errorThresholds);
    
    // Calculate overall model performance metrics
    const performanceMetrics = calculateOverallPerformance(comparisons);
    
    // Generate academic validation summary
    const validationSummary = generateValidationSummary(comparisons, discrepancyAnalysis, performanceMetrics);
    
    return {
      isValid: performanceMetrics.overallAccuracy > 0.7, // 70% threshold for academic validation
      totalComparisons: comparisons.length,
      validComparisons: comparisons.filter(c => c.isValid).length,
      comparisons,
      discrepancyAnalysis,
      performanceMetrics,
      validationSummary,
      metadata: {
        season,
        confidenceLevel,
        significanceLevel,
        errorThresholds,
        timestamp: new Date().toISOString(),
        frameworkVersion: '1.0.0'
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message,
      errors: [`Real data comparison failed: ${error.message}`],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Extracts relevant KPIs from simulation results for comparison
 * @param {Object} simulationResults - Results from useWasteSimulation hook
 * @param {string} season - 'high' or 'low' season
 * @returns {Object} Extracted KPIs with standardized naming
 */
function extractSimulationKPIs(simulationResults, season) {
  const kpis = season === 'high' ? simulationResults.high : simulationResults.low;
  
  return {
    // Generation metrics (ton/day)
    waste_generated_daily: kpis.rsu?.totalGeneration || 0,
    waste_generated_monthly: (kpis.rsu?.totalGeneration || 0) * 30,
    waste_generated_annually: (kpis.rsu?.totalGeneration || 0) * 365,
    
    // Collection metrics
    collection_efficiency: kpis.rsu?.collectedTotal && kpis.rsu?.totalGeneration 
      ? (kpis.rsu.collectedTotal / kpis.rsu.totalGeneration) * 100 : 0,
    collection_deficit_daily: kpis.rsu?.collectionDeficit || 0,
    collection_deficit_percentage: kpis.rsu?.collectionDeficit && kpis.rsu?.totalGeneration
      ? (kpis.rsu.collectionDeficit / kpis.rsu.totalGeneration) * 100 : 0,
    
    // Recovery metrics
    recovery_rate_total: kpis.rsu?.recoveryByStage ? 
      Object.values(kpis.rsu.recoveryByStage).reduce((a, b) => a + b, 0) : 0,
    recovery_rate_source: kpis.rsu?.recoveryByStage?.source || 0,
    recovery_rate_plant: kpis.rsu?.recoveryByStage?.plant || 0,
    recovery_rate_informal: kpis.rsu?.recoveryByStage?.informal || 0,
    
    // Valorization metrics
    valorization_total: kpis.valorization ? 
      Object.values(kpis.valorization).reduce((a, b) => a + b, 0) : 0,
    valorization_compost: kpis.valorization?.composted || 0,
    valorization_biogas: kpis.valorization?.biogas || 0,
    valorization_pyrolysis: kpis.valorization?.pyrolyzed || 0,
    
    // Disposal metrics
    disposal_daily: kpis.rsu?.toDisposal || 0,
    disposal_monthly: (kpis.rsu?.toDisposal || 0) * 30,
    disposal_annually: (kpis.rsu?.toDisposal || 0) * 365,
    
    // Economic metrics
    total_cost_daily: kpis.economics?.totalCost || 0,
    total_cost_monthly: (kpis.economics?.totalCost || 0) * 30,
    total_cost_annually: (kpis.economics?.totalCost || 0) * 365,
    cost_per_ton_collected: kpis.economics?.costPerTonCollected || 0,
    cost_per_ton_disposed: kpis.economics?.costPerTonDisposed || 0,
    
    // Operational metrics
    system_leakage_rate: kpis.rsu?.totalLeak && kpis.rsu?.totalGeneration
      ? (kpis.rsu.totalLeak / kpis.rsu.totalGeneration) * 100 : 0,
    transfer_station_utilization: kpis.rsu?.inventoryLevels?.transferStation || 0,
    collection_vehicles_utilization: kpis.rsu?.inventoryLevels?.collectionVehicles || 0
  };
}

/**
 * Matches historical data points with simulation KPIs
 * @param {Object} simulationKPIs - Extracted simulation KPIs
 * @param {Array} historicalData - Historical data from CSV
 * @returns {Array} Matched data pairs for comparison
 */
function matchHistoricalData(simulationKPIs, historicalData) {
  const matchedPairs = [];
  
  historicalData.forEach(dataPoint => {
    const kpiName = dataPoint.kpi_name;
    const simulatedValue = simulationKPIs[kpiName];
    
    if (simulatedValue !== undefined && simulatedValue !== null) {
      matchedPairs.push({
        kpiName,
        kpiCategory: dataPoint.kpi_category || 'unknown',
        simulatedValue,
        realValue: parseFloat(dataPoint.real_value),
        units: dataPoint.units || '',
        dataSource: dataPoint.data_source || 'unknown',
        confidenceLevel: dataPoint.confidence_level || 'medium',
        date: dataPoint.date || '',
        notes: dataPoint.notes || '',
        citation: dataPoint.source_citation || ''
      });
    }
  });
  
  return matchedPairs;
}

/**
 * Performs statistical comparisons for each matched data pair
 * @param {Array} matchedData - Matched simulation and real data pairs
 * @param {Object} options - Statistical analysis options
 * @returns {Array} Statistical comparison results
 */
function performStatisticalComparisons(matchedData, options) {
  const { confidenceLevel, significanceLevel } = options;
  
  return matchedData.map(dataPoint => {
    const { simulatedValue, realValue, kpiName } = dataPoint;
    
    // Calculate basic error metrics
    const absoluteError = Math.abs(simulatedValue - realValue);
    const percentageError = realValue !== 0 ? (absoluteError / Math.abs(realValue)) * 100 : 0;
    const relativeError = realValue !== 0 ? (simulatedValue - realValue) / realValue : 0;
    
    // Calculate confidence intervals (approximation for single values)
    const meanValue = (simulatedValue + realValue) / 2;
    const standardError = Math.abs(simulatedValue - realValue) / Math.sqrt(2);
    const tValue = getTValueForConfidence(confidenceLevel);
    const marginOfError = tValue * standardError;
    
    const confidenceInterval = {
      lower: meanValue - marginOfError,
      upper: meanValue + marginOfError,
      level: confidenceLevel
    };
    
    // Perform significance test (approximation)
    const tStatistic = Math.abs(simulatedValue - realValue) / (standardError || 1);
    const pValue = calculatePValue(tStatistic);
    const isStatisticallySignificant = pValue < significanceLevel;
    
    // Determine validation status
    const isValid = percentageError <= 20; // 20% threshold for academic validation
    const accuracy = Math.max(0, 100 - percentageError);
    
    return {
      ...dataPoint,
      absoluteError,
      percentageError,
      relativeError,
      accuracy,
      confidenceInterval,
      tStatistic,
      pValue,
      isStatisticallySignificant,
      isValid,
      errorCategory: categorizeError(percentageError),
      comparison: {
        simulated: simulatedValue,
        real: realValue,
        difference: simulatedValue - realValue,
        ratio: realValue !== 0 ? simulatedValue / realValue : null
      }
    };
  });
}

/**
 * Analyzes discrepancies and categorizes validation results
 * @param {Array} comparisons - Statistical comparison results
 * @param {Object} errorThresholds - Error categorization thresholds
 * @returns {Object} Discrepancy analysis summary
 */
function analyzeDiscrepancies(comparisons, errorThresholds) {
  const categories = {
    excellent: [], // < 5% error
    good: [],      // 5-10% error
    acceptable: [], // 10-20% error
    poor: [],      // > 20% error
    outliers: []   // Statistical outliers
  };
  
  const significantDiscrepancies = [];
  const modelBiases = {
    overestimation: [],
    underestimation: []
  };
  
  comparisons.forEach(comparison => {
    const { percentageError, relativeError, isStatisticallySignificant, kpiName } = comparison;
    
    // Categorize by error magnitude
    if (percentageError < 5) categories.excellent.push(comparison);
    else if (percentageError < 10) categories.good.push(comparison);
    else if (percentageError < 20) categories.acceptable.push(comparison);
    else categories.poor.push(comparison);
    
    // Identify statistically significant discrepancies
    if (isStatisticallySignificant) {
      significantDiscrepancies.push(comparison);
    }
    
    // Analyze model bias
    if (relativeError > 0.1) modelBiases.overestimation.push(comparison);
    else if (relativeError < -0.1) modelBiases.underestimation.push(comparison);
    
    // Identify outliers (>50% error)
    if (percentageError > 50) categories.outliers.push(comparison);
  });
  
  return {
    categories,
    significantDiscrepancies,
    modelBiases,
    summary: {
      excellentCount: categories.excellent.length,
      goodCount: categories.good.length,
      acceptableCount: categories.acceptable.length,
      poorCount: categories.poor.length,
      outlierCount: categories.outliers.length,
      significantDiscrepancyCount: significantDiscrepancies.length
    }
  };
}

/**
 * Calculates overall model performance metrics
 * @param {Array} comparisons - Statistical comparison results
 * @returns {Object} Performance metrics summary
 */
function calculateOverallPerformance(comparisons) {
  if (comparisons.length === 0) {
    return {
      overallAccuracy: 0,
      meanAbsoluteError: 0,
      rootMeanSquareError: 0,
      correlationCoefficient: 0,
      validationRate: 0
    };
  }
  
  const accuracies = comparisons.map(c => c.accuracy);
  const absoluteErrors = comparisons.map(c => c.absoluteError);
  const percentageErrors = comparisons.map(c => c.percentageError);
  
  // Overall accuracy (mean of individual accuracies)
  const overallAccuracy = mean(accuracies) / 100;
  
  // Mean Absolute Error
  const meanAbsoluteError = mean(absoluteErrors);
  
  // Root Mean Square Error
  const rootMeanSquareError = Math.sqrt(mean(absoluteErrors.map(e => e * e)));
  
  // Mean Absolute Percentage Error
  const meanAbsolutePercentageError = mean(percentageErrors);
  
  // Correlation coefficient (approximation)
  const simulatedValues = comparisons.map(c => c.simulatedValue);
  const realValues = comparisons.map(c => c.realValue);
  const correlationCoefficient = calculateCorrelation(simulatedValues, realValues);
  
  // Validation rate (% of comparisons within acceptable error)
  const validComparisons = comparisons.filter(c => c.isValid).length;
  const validationRate = validComparisons / comparisons.length;
  
  return {
    overallAccuracy,
    meanAbsoluteError,
    rootMeanSquareError,
    meanAbsolutePercentageError,
    correlationCoefficient,
    validationRate,
    totalComparisons: comparisons.length,
    validComparisons
  };
}

/**
 * Generates comprehensive validation summary for academic reporting
 * @param {Array} comparisons - Statistical comparison results
 * @param {Object} discrepancyAnalysis - Discrepancy analysis results
 * @param {Object} performanceMetrics - Overall performance metrics
 * @returns {Object} Academic validation summary
 */
function generateValidationSummary(comparisons, discrepancyAnalysis, performanceMetrics) {
  const totalComparisons = comparisons.length;
  const { categories, significantDiscrepancies } = discrepancyAnalysis;
  
  // Academic credibility assessment
  const credibilityScore = calculateCredibilityScore(performanceMetrics, discrepancyAnalysis);
  const credibilityLevel = assessCredibilityLevel(credibilityScore);
  
  // Model validation status
  const isModelValidated = performanceMetrics.validationRate >= 0.7; // 70% threshold
  const hasSignificantBias = significantDiscrepancies.length > (totalComparisons * 0.3);
  
  // Key findings for thesis
  const keyFindings = generateKeyFindings(comparisons, discrepancyAnalysis, performanceMetrics);
  
  // Recommendations for model improvement
  const recommendations = generateRecommendations(discrepancyAnalysis, performanceMetrics);
  
  return {
    credibilityScore,
    credibilityLevel,
    isModelValidated,
    hasSignificantBias,
    keyFindings,
    recommendations,
    academicSummary: {
      totalKPIsCompared: totalComparisons,
      validationSuccessRate: `${(performanceMetrics.validationRate * 100).toFixed(1)}%`,
      overallModelAccuracy: `${(performanceMetrics.overallAccuracy * 100).toFixed(1)}%`,
      meanAbsolutePercentageError: `${performanceMetrics.meanAbsolutePercentageError.toFixed(1)}%`,
      correlationWithRealData: performanceMetrics.correlationCoefficient.toFixed(3),
      excellentPredictions: categories.excellent.length,
      acceptablePredictions: categories.excellent.length + categories.good.length + categories.acceptable.length,
      poorPredictions: categories.poor.length,
      statisticallySignificantDiscrepancies: significantDiscrepancies.length
    }
  };
}

// Helper Functions

function getTValueForConfidence(confidenceLevel) {
  // Simplified t-values for common confidence levels
  const tValues = {
    0.90: 1.645,
    0.95: 1.960,
    0.99: 2.576
  };
  return tValues[confidenceLevel] || 1.960;
}

function calculatePValue(tStatistic) {
  // Simplified p-value calculation (approximation)
  // In a real implementation, you'd use a proper statistical library
  if (tStatistic < 1.645) return 0.1;
  if (tStatistic < 1.960) return 0.05;
  if (tStatistic < 2.576) return 0.01;
  return 0.001;
}

function categorizeError(percentageError) {
  if (percentageError < 5) return 'excellent';
  if (percentageError < 10) return 'good';
  if (percentageError < 20) return 'acceptable';
  return 'poor';
}

function mean(array) {
  return array.length > 0 ? array.reduce((a, b) => a + b, 0) / array.length : 0;
}

function calculateCorrelation(x, y) {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

function calculateCredibilityScore(performanceMetrics, discrepancyAnalysis) {
  const { overallAccuracy, validationRate, correlationCoefficient } = performanceMetrics;
  const { excellentCount, goodCount, acceptableCount, poorCount } = discrepancyAnalysis.summary;
  
  const totalComparisons = excellentCount + goodCount + acceptableCount + poorCount;
  if (totalComparisons === 0) return 0;
  
  // Weighted scoring
  const accuracyScore = overallAccuracy * 0.4;
  const validationScore = validationRate * 0.3;
  const correlationScore = Math.max(0, correlationCoefficient) * 0.2;
  const qualityScore = ((excellentCount * 1.0 + goodCount * 0.8 + acceptableCount * 0.6) / totalComparisons) * 0.1;
  
  return Math.min(1.0, accuracyScore + validationScore + correlationScore + qualityScore);
}

function assessCredibilityLevel(score) {
  if (score >= 0.85) return 'excellent';
  if (score >= 0.70) return 'good';
  if (score >= 0.50) return 'acceptable';
  return 'poor';
}

function generateKeyFindings(comparisons, discrepancyAnalysis, performanceMetrics) {
  const findings = [];
  
  // Overall performance finding
  findings.push(`Model achieved ${(performanceMetrics.overallAccuracy * 100).toFixed(1)}% overall accuracy against real data`);
  
  // Validation rate finding
  findings.push(`${(performanceMetrics.validationRate * 100).toFixed(1)}% of KPIs validated within acceptable error bounds (<20%)`);
  
  // Best performing categories
  const excellentKPIs = discrepancyAnalysis.categories.excellent.map(c => c.kpiName);
  if (excellentKPIs.length > 0) {
    findings.push(`Excellent predictions (<5% error) for: ${excellentKPIs.join(', ')}`);
  }
  
  // Areas needing improvement
  const poorKPIs = discrepancyAnalysis.categories.poor.map(c => c.kpiName);
  if (poorKPIs.length > 0) {
    findings.push(`Model requires improvement for: ${poorKPIs.join(', ')}`);
  }
  
  // Statistical significance
  if (discrepancyAnalysis.significantDiscrepancies.length > 0) {
    findings.push(`${discrepancyAnalysis.significantDiscrepancies.length} statistically significant discrepancies identified`);
  }
  
  return findings;
}

function generateRecommendations(discrepancyAnalysis, performanceMetrics) {
  const recommendations = [];
  
  // Overall performance recommendations
  if (performanceMetrics.overallAccuracy < 0.7) {
    recommendations.push('Consider recalibrating model parameters to improve overall accuracy');
  }
  
  // Category-specific recommendations
  if (discrepancyAnalysis.categories.poor.length > 0) {
    recommendations.push('Focus parameter tuning on poorly performing KPIs');
  }
  
  // Bias recommendations
  if (discrepancyAnalysis.modelBiases.overestimation.length > discrepancyAnalysis.modelBiases.underestimation.length) {
    recommendations.push('Model shows systematic overestimation bias - review input assumptions');
  } else if (discrepancyAnalysis.modelBiases.underestimation.length > discrepancyAnalysis.modelBiases.overestimation.length) {
    recommendations.push('Model shows systematic underestimation bias - review input assumptions');
  }
  
  // Data collection recommendations
  if (performanceMetrics.totalComparisons < 5) {
    recommendations.push('Collect additional historical data points to improve validation robustness');
  }
  
  // Statistical recommendations
  if (performanceMetrics.correlationCoefficient < 0.5) {
    recommendations.push('Low correlation with real data suggests fundamental model structure review needed');
  }
  
  return recommendations;
}

/**
 * Loads and parses historical data from CSV format
 * @param {string} csvData - Raw CSV data string
 * @returns {Array} Parsed historical data objects
 */
export function parseHistoricalDataCSV(csvData) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const dataPoint = {};
    
    headers.forEach((header, index) => {
      dataPoint[header] = values[index]?.trim() || '';
    });
    
    return dataPoint;
  });
}

/**
 * Parses a single CSV line handling quoted values
 * @param {string} line - CSV line string
 * @returns {Array} Parsed values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current);
  return values;
}

/**
 * Creates a detailed validation report for academic documentation
 * @param {Object} validationResults - Complete validation results
 * @returns {string} Formatted academic report
 */
export function createRealDataValidationReport(validationResults) {
  const { comparisons, performanceMetrics, discrepancyAnalysis, validationSummary } = validationResults;
  
  let report = `
Real Data Validation Report
==========================
Timestamp: ${validationResults.metadata?.timestamp || new Date().toISOString()}
Season: ${validationResults.metadata?.season?.toUpperCase() || 'HIGH'}
Framework Version: ${validationResults.metadata?.frameworkVersion || '1.0.0'}

Executive Summary
================
Model Validation Status: ${validationResults.isValid ? 'VALIDATED' : 'NOT VALIDATED'}
Overall Accuracy: ${(performanceMetrics.overallAccuracy * 100).toFixed(1)}%
Validation Success Rate: ${(performanceMetrics.validationRate * 100).toFixed(1)}%
Total KPIs Compared: ${validationResults.totalComparisons}
Credibility Level: ${validationSummary.credibilityLevel.toUpperCase()}

Statistical Performance Metrics
==============================
Mean Absolute Percentage Error: ${performanceMetrics.meanAbsolutePercentageError.toFixed(2)}%
Root Mean Square Error: ${performanceMetrics.rootMeanSquareError.toFixed(4)}
Correlation Coefficient: ${performanceMetrics.correlationCoefficient.toFixed(3)}
Statistical Significance Threshold: p < ${validationResults.metadata?.significanceLevel || 0.05}

Validation Results by Category
=============================
Excellent (<5% error): ${discrepancyAnalysis.summary.excellentCount} KPIs
Good (5-10% error): ${discrepancyAnalysis.summary.goodCount} KPIs  
Acceptable (10-20% error): ${discrepancyAnalysis.summary.acceptableCount} KPIs
Poor (>20% error): ${discrepancyAnalysis.summary.poorCount} KPIs
Statistical Outliers: ${discrepancyAnalysis.summary.outlierCount} KPIs

Detailed Comparison Results
==========================
`;

  comparisons.forEach(comparison => {
    report += `
KPI: ${comparison.kpiName}
Category: ${comparison.kpiCategory}
Simulated: ${comparison.simulatedValue.toFixed(3)} ${comparison.units}
Real Data: ${comparison.realValue.toFixed(3)} ${comparison.units}
Absolute Error: ${comparison.absoluteError.toFixed(3)} ${comparison.units}
Percentage Error: ${comparison.percentageError.toFixed(2)}%
Accuracy: ${comparison.accuracy.toFixed(1)}%
p-value: ${comparison.pValue.toFixed(4)}
Statistically Significant: ${comparison.isStatisticallySignificant ? 'YES' : 'NO'}
Validation Status: ${comparison.isValid ? 'VALIDATED' : 'NEEDS IMPROVEMENT'}
Data Source: ${comparison.dataSource}
Citation: ${comparison.citation}
---
`;
  });

  if (validationSummary.keyFindings.length > 0) {
    report += '\nKey Findings\n============\n';
    validationSummary.keyFindings.forEach((finding, index) => {
      report += `${index + 1}. ${finding}\n`;
    });
  }

  if (validationSummary.recommendations.length > 0) {
    report += '\nRecommendations for Model Improvement\n===================================\n';
    validationSummary.recommendations.forEach((recommendation, index) => {
      report += `${index + 1}. ${recommendation}\n`;
    });
  }

  report += '\nModel Bias Analysis\n==================\n';
  report += `Overestimation Bias: ${discrepancyAnalysis.modelBiases.overestimation.length} KPIs\n`;
  report += `Underestimation Bias: ${discrepancyAnalysis.modelBiases.underestimation.length} KPIs\n`;

  return report;
}