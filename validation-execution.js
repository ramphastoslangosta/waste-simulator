/**
 * Validation Execution Script
 * 
 * Runs the calibrated simulation and compares it against Holbox historical data
 * for THESIS-003 validation and calibration task
 */

import { INITIAL_INPUTS } from './src/constants/initialState.js';
import { compareWithRealData, parseHistoricalDataCSV, createRealDataValidationReport } from './src/utils/validation/realDataComparison.js';
import fs from 'fs';

// Enhanced simulation to match validation KPIs
function calculateWasteSimulation(inputs) {
  const { general, generation, rsuSystem } = inputs;
  
  // HIGH SEASON CALCULATION
  const highSeasonOccupancy = general.highSeasonOccupancy / 100;
  
  // Daily generation calculation (tons/day)
  const hotelGeneration = generation.hotels.units * highSeasonOccupancy * generation.hotels.rate / 1000;
  const restaurantGeneration = generation.restaurants.units * generation.restaurants.rate / 1000;
  const homeGeneration = general.fixedPopulation * generation.homes.rate / 1000;
  const commerceGeneration = generation.commerce.units * generation.commerce.rate / 1000;
  
  const totalGeneration = hotelGeneration + restaurantGeneration + homeGeneration + commerceGeneration;
  
  // Primary collection (to transfer station)
  const collectionEfficiency = (100 - rsuSystem.leaks.collectionLeak) / 100;
  const primaryCollection = totalGeneration * collectionEfficiency;
  
  // Secondary collection (off-island transport - THE BOTTLENECK)
  const finalTransportCapacity = rsuSystem.processing.finalTransportCapacity;
  const secondaryCollection = Math.min(primaryCollection, finalTransportCapacity);
  
  // Overall system efficiency (what actually gets off-island vs total generation)
  const overallEfficiency = (secondaryCollection / totalGeneration) * 100;
  
  // Collection deficit
  const collectionDeficit = totalGeneration - primaryCollection;
  
  // Disposal (what actually reaches mainland)
  const disposal = secondaryCollection * (1 - rsuSystem.leaks.disposalLeak / 100);
  
  return {
    high: {
      rsu: {
        totalGeneration,
        collectedTotal: primaryCollection,
        toDisposal: disposal,
        collectionDeficit,
        totalLeak: collectionDeficit
      },
      economics: {
        totalCost: primaryCollection * rsuSystem.economics.collectionCost / 1000,
        costPerTonCollected: rsuSystem.economics.collectionCost,
        costPerTonDisposed: rsuSystem.economics.disposalCost
      },
      // Custom KPIs for validation
      customKPIs: {
        total_waste_generation_daily: totalGeneration,
        collection_efficiency: overallEfficiency,
        collection_primary: primaryCollection,
        collection_secondary: secondaryCollection,
        disposal_to_mainland: disposal,
        residential_generation: homeGeneration,
        commercial_generation: hotelGeneration + restaurantGeneration + commerceGeneration
      }
    }
  };
}

// Load and transform historical data to match expected format
const csvData = fs.readFileSync('./data/holbox-historical-data.csv', 'utf8');
const rawHistoricalData = parseHistoricalDataCSV(csvData);

// Transform to expected format (observed_value -> real_value)
const historicalData = rawHistoricalData
  .filter(row => row.kpi_name && row.observed_value) // Filter out empty rows
  .map(row => ({
    ...row,
    real_value: row.observed_value, // Map observed_value to real_value for compatibility
    data_source: row.source_institution || 'unknown',
    source_citation: row.source_document || 'unknown'
  }));

// Calculate simulation results with current calibrated parameters
const simulationResults = calculateWasteSimulation(INITIAL_INPUTS);

// Create custom KPI extraction function for validation
function customExtractSimulationKPIs(simulationResults, season) {
  const kpis = season === 'high' ? simulationResults.high : simulationResults.low;
  const customKPIs = kpis.customKPIs || {};
  
  return {
    // Map exact KPI names from CSV
    total_waste_generation_daily: customKPIs.total_waste_generation_daily || 0,
    collection_efficiency: customKPIs.collection_efficiency || 0,
    collection_primary: customKPIs.collection_primary || 0,
    collection_secondary: customKPIs.collection_secondary || 0,
    disposal_to_mainland: customKPIs.disposal_to_mainland || 0,
    residential_generation: customKPIs.residential_generation || 0,
    commercial_generation: customKPIs.commercial_generation || 0,
    per_capita_generation: customKPIs.residential_generation && INITIAL_INPUTS.general.fixedPopulation
      ? (customKPIs.residential_generation * 1000) / INITIAL_INPUTS.general.fixedPopulation // kg/person/day
      : 0
  };
}

// Custom validation function using exact KPI matching
function customValidation(simulationResults, historicalData, season = 'high') {
  const simulationKPIs = customExtractSimulationKPIs(simulationResults, season);
  const comparisons = [];
  
  historicalData.forEach(dataPoint => {
    const kpiName = dataPoint.kpi_name;
    const simulatedValue = simulationKPIs[kpiName];
    
    if (simulatedValue !== undefined && simulatedValue !== null && dataPoint.real_value) {
      const realValue = parseFloat(dataPoint.real_value);
      const absoluteError = Math.abs(simulatedValue - realValue);
      const percentageError = realValue !== 0 ? (absoluteError / Math.abs(realValue)) * 100 : 0;
      const isValid = percentageError <= 25; // 25% threshold for initial calibration
      
      comparisons.push({
        kpiName,
        simulatedValue,
        realValue,
        absoluteError,
        percentageError,
        isValid,
        units: dataPoint.unit || '',
        dataSource: dataPoint.data_source || 'unknown',
        citation: dataPoint.source_citation || 'unknown',
        notes: dataPoint.notes || ''
      });
    }
  });
  
  return {
    comparisons,
    totalComparisons: comparisons.length,
    validComparisons: comparisons.filter(c => c.isValid).length,
    validationRate: comparisons.length > 0 ? comparisons.filter(c => c.isValid).length / comparisons.length : 0
  };
}

console.log('\n🎯 HOLBOX VALIDATION EXECUTION');
console.log('=====================================');

const customKPIs = simulationResults.high.customKPIs;

console.log('\n📊 CURRENT SIMULATION RESULTS:');
console.log(`Total Generation: ${customKPIs.total_waste_generation_daily.toFixed(2)} tons/day`);
console.log(`Collection Efficiency: ${customKPIs.collection_efficiency.toFixed(1)}%`);
console.log(`Primary Collection: ${customKPIs.collection_primary.toFixed(2)} tons/day`);
console.log(`Secondary Collection: ${customKPIs.collection_secondary.toFixed(2)} tons/day`);
console.log(`Disposal to Mainland: ${customKPIs.disposal_to_mainland.toFixed(2)} tons/day`);

console.log('\n🎯 HISTORICAL DATA REFERENCE:');
console.log(`Expected Generation: 34.8 tons/day`);
console.log(`Expected Collection Efficiency: 28.15%`);
console.log(`Expected Primary Collection: 22.5 tons/day`);
console.log(`Expected Secondary Collection: 9.8 tons/day`);
console.log(`Expected Disposal: 9.6 tons/day`);

// Run custom validation
const validationResults = customValidation(simulationResults, historicalData, 'high');

console.log('\n✅ VALIDATION RESULTS:');
console.log(`Total Comparisons: ${validationResults.totalComparisons}`);
console.log(`Valid Comparisons: ${validationResults.validComparisons}`);
console.log(`Validation Rate: ${(validationResults.validationRate * 100).toFixed(1)}%`);

console.log('\n📋 DETAILED COMPARISONS:');
validationResults.comparisons.forEach(comp => {
  console.log(`\n${comp.kpiName}:`);
  console.log(`  Simulated: ${comp.simulatedValue.toFixed(2)} ${comp.units}`);
  console.log(`  Real: ${comp.realValue.toFixed(2)} ${comp.units}`);
  console.log(`  Error: ${comp.percentageError.toFixed(1)}%`);
  console.log(`  Status: ${comp.isValid ? '✅ Valid (<25% error)' : '❌ Needs calibration (>25% error)'}`);
});

// Create validation report summary
let report = `# Holbox Model Validation Results
## Date: ${new Date().toLocaleDateString()}

### Simulation Results vs Historical Data

| KPI | Simulated | Real Data | Error (%) | Status |
|-----|-----------|-----------|-----------|--------|
`;

validationResults.comparisons.forEach(comp => {
  const status = comp.isValid ? '✅ Valid' : '❌ Needs calibration';
  report += `| ${comp.kpiName} | ${comp.simulatedValue.toFixed(2)} ${comp.units} | ${comp.realValue.toFixed(2)} ${comp.units} | ${comp.percentageError.toFixed(1)}% | ${status} |\n`;
});

report += `
### Summary
- Total KPIs Compared: ${validationResults.totalComparisons}
- Valid Predictions: ${validationResults.validComparisons}
- Validation Rate: ${(validationResults.validationRate * 100).toFixed(1)}%

### Key Findings
`;

// Add calibration analysis
const needsCalibration = validationResults.comparisons.filter(c => c.percentageError > 25);
const excellentPredictions = validationResults.comparisons.filter(c => c.percentageError < 5);
const goodPredictions = validationResults.comparisons.filter(c => c.percentageError >= 5 && c.percentageError < 15);

if (excellentPredictions.length > 0) {
  report += `\n**Excellent Predictions (<5% error):**\n`;
  excellentPredictions.forEach(comp => {
    report += `- ${comp.kpiName}: ${comp.percentageError.toFixed(1)}% error\n`;
  });
}

if (goodPredictions.length > 0) {
  report += `\n**Good Predictions (5-15% error):**\n`;
  goodPredictions.forEach(comp => {
    report += `- ${comp.kpiName}: ${comp.percentageError.toFixed(1)}% error\n`;
  });
}

if (needsCalibration.length > 0) {
  report += `\n**Requires Calibration (>25% error):**\n`;
  needsCalibration.forEach(comp => {
    report += `- ${comp.kpiName}: ${comp.percentageError.toFixed(1)}% error\n`;
  });
}

// Save report
fs.writeFileSync('./validation-results.md', report);

console.log('\n💾 VALIDATION REPORT SAVED: validation-results.md');

// Calibration assessment
if (needsCalibration.length > 0) {
  console.log('\n🔧 CALIBRATION ANALYSIS:');
  needsCalibration.forEach(comp => {
    console.log(`  ❌ ${comp.kpiName}: ${comp.percentageError.toFixed(1)}% error - NEEDS CALIBRATION`);
  });
  
  console.log('\n📋 CALIBRATION RECOMMENDATIONS:');
  needsCalibration.forEach(comp => {
    if (comp.kpiName === 'total_waste_generation_daily') {
      const diff = comp.realValue - comp.simulatedValue;
      console.log(`  • Generation too low by ${diff.toFixed(1)} tons/day - Consider adding fondas category or adjusting rates`);
    }
    if (comp.kpiName === 'collection_efficiency') {
      console.log(`  • Collection efficiency too high - Increase collection leak or reduce transport capacity`);
    }
  });
} else {
  console.log('\n✅ MODEL CALIBRATION ACCEPTABLE (all errors <25%)');
}

console.log('\n🎓 THESIS STATUS: Validation and calibration analysis complete');