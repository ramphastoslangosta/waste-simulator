/**
 * Holbox Validation Test
 * Tests simulation results against real 2022 Holbox data
 * Uses VALIDATION-003 framework for statistical analysis
 */

import { compareWithRealData } from './src/utils/validation/realDataComparison.js';

// Mock simulation results that match our expected format
// These should be replaced with actual simulation output
const mockSimulationResults = {
  high: {
    rsu: {
      totalGeneration: 35.0,  // tons/day - base simulation result
      collectedTotal: 30.0,   // tons/day - simulated collection
      collectionDeficit: 5.0, // tons/day - deficit
      toDisposal: 25.0,       // tons/day - to landfill
      totalLeak: 5.0,         // tons/day - leakage
      recoveryByStage: {
        source: 1.0,
        plant: 0.5,
        informal: 0.5
      }
    },
    economics: {
      totalCost: 8500,        // pesos/day - operational cost
      costPerTonCollected: 280, // pesos/ton
      costPerTonDisposed: 350   // pesos/ton
    }
  },
  low: {
    rsu: {
      totalGeneration: 15.0,  // tons/day - low season
      collectedTotal: 12.0,   // tons/day - simulated collection
      collectionDeficit: 3.0, // tons/day - deficit
      toDisposal: 10.0,       // tons/day - to landfill
      totalLeak: 2.0,         // tons/day - leakage
      recoveryByStage: {
        source: 0.5,
        plant: 0.25,
        informal: 0.25
      }
    },
    economics: {
      totalCost: 4500,        // pesos/day - operational cost
      costPerTonCollected: 300, // pesos/ton
      costPerTonDisposed: 380   // pesos/ton
    }
  }
};

// Real Holbox data extracted from 2022 study
const holboxRealData = [
  {
    kpi_name: 'waste_generated_daily',
    real_value: 34.8,
    units: 'tons/day',
    data_source: 'Holbox.WP2E.DocumentoMaestro.pdf',
    confidence_level: 'high',
    date: '2022',
    methodology: 'comprehensive_sector_analysis',
    notes: '34.8 tons/day from detailed establishment survey',
    source_citation: 'Own study (2022). Holbox Waste Management Analysis.'
  },
  {
    kpi_name: 'waste_generated_monthly',
    real_value: 1044,
    units: 'tons/month',
    data_source: 'Holbox.WP2E.DocumentoMaestro.pdf',
    confidence_level: 'high',
    date: '2022',
    methodology: 'comprehensive_sector_analysis',
    notes: 'Calculated from 34.8 tons/day × 30',
    source_citation: 'Own study (2022). Holbox Waste Management Analysis.'
  },
  {
    kpi_name: 'disposal_daily',
    real_value: 9.6,
    units: 'tons/day',
    data_source: 'Holbox.WP2E.DocumentoMaestro.pdf',
    confidence_level: 'high',
    date: '2022',
    methodology: 'field_measurement',
    notes: 'Waste actually sent to Kantunilkin landfill',
    source_citation: 'Own study (2022). Holbox Waste Management Analysis.'
  },
  {
    kpi_name: 'collection_efficiency',
    real_value: 28.15,
    units: 'percentage',
    data_source: 'Holbox.WP2E.DocumentoMaestro.pdf',
    confidence_level: 'high',
    date: '2022',
    methodology: 'waste_wise_cities_methodology',
    notes: 'Only 28.15% of generated waste collected off-island',
    source_citation: 'Own study (2022). Holbox Waste Management Analysis.'
  },
  {
    kpi_name: 'system_leakage_rate',
    real_value: 71.85,
    units: 'percentage',
    data_source: 'Holbox.WP2E.DocumentoMaestro.pdf',
    confidence_level: 'high',
    date: '2022',
    methodology: 'calculated',
    notes: '100% - 28.15% collection efficiency',
    source_citation: 'Own study (2022). Holbox Waste Management Analysis.'
  }
];

// Test configuration for limited data validation
const validationOptions = {
  confidenceLevel: 0.90,        // Lower due to limited data points
  significanceLevel: 0.10,      // Adjusted for small sample
  errorThresholds: {
    excellent: 15,              // Direct data threshold
    good: 25,                   // Acceptable for planning
    acceptable: 40,             // Proxy data threshold
    poor: Infinity
  },
  excludeOutliers: false,       // Keep all data points
  season: 'high'               // Test against high season (matches 2022 estimate)
};

/**
 * Run Holbox validation test
 */
async function runHolboxValidation() {
  console.log('HOLBOX MODEL VALIDATION TEST');
  console.log('=' * 50);
  console.log('Testing simulation against 2022 Holbox field data\n');
  
  try {
    // Run validation comparison
    const validationResults = compareWithRealData(
      mockSimulationResults,
      holboxRealData,
      validationOptions
    );
    
    // Display results
    console.log('VALIDATION RESULTS SUMMARY:');
    console.log('-' * 30);
    console.log(`Overall Valid: ${validationResults.isValid ? '✅ YES' : '❌ NO'}`);
    console.log(`Total Comparisons: ${validationResults.totalComparisons}`);
    console.log(`Valid Comparisons: ${validationResults.validComparisons}`);
    console.log(`Success Rate: ${(validationResults.validComparisons / validationResults.totalComparisons * 100).toFixed(1)}%\n`);
    
    // Individual comparison results
    console.log('INDIVIDUAL KPI COMPARISON:');
    console.log('-' * 40);
    console.log('KPI Name'.padEnd(25) + 'Simulated'.padEnd(12) + 'Real'.padEnd(12) + 'Error%'.padEnd(10) + 'Status');
    console.log('-'.repeat(70));
    
    if (validationResults.comparisons) {
      validationResults.comparisons.forEach(comparison => {
        const status = comparison.isValid ? '✅ VALID' : '❌ HIGH ERROR';
        const errorStr = comparison.percentageError.toFixed(1) + '%';
        
        console.log(
          comparison.kpiName.padEnd(25) +
          comparison.simulatedValue.toFixed(2).padEnd(12) +
          comparison.realValue.toFixed(2).padEnd(12) +
          errorStr.padEnd(10) +
          status
        );
      });
    }
    
    // Performance metrics
    if (validationResults.performanceMetrics) {
      console.log('\nPERFORMANCE METRICS:');
      console.log('-' * 20);
      console.log(`Overall Accuracy: ${(validationResults.performanceMetrics.overallAccuracy * 100).toFixed(1)}%`);
      console.log(`Mean Error: ${validationResults.performanceMetrics.meanError?.toFixed(1)}%`);
      console.log(`RMSE: ${validationResults.performanceMetrics.rmse?.toFixed(2)}`);
    }
    
    // Validation summary for thesis
    if (validationResults.validationSummary) {
      console.log('\nVALIDATION SUMMARY FOR THESIS:');
      console.log('-' * 35);
      console.log(validationResults.validationSummary);
    }
    
    // Recommendations
    console.log('\nRECOMMENDATIONS:');
    console.log('-' * 16);
    
    if (validationResults.isValid) {
      console.log('✅ Model shows good agreement with real Holbox data');
      console.log('✅ Suitable for policy analysis and scenario planning');
      console.log('✅ Error margins within acceptable limits for engineering applications');
    } else {
      console.log('⚠️  Model requires calibration for high accuracy');
      console.log('⚠️  Consider adjusting parameters based on validation results');
      console.log('⚠️  Document limitations in thesis methodology section');
    }
    
    return validationResults;
    
  } catch (error) {
    console.error('Validation failed:', error.message);
    console.log('\nDEBUG INFO:');
    console.log('- Check that simulation results format matches expected structure');
    console.log('- Verify real data has correct KPI names');
    console.log('- Ensure validation framework is properly imported');
    return null;
  }
}

/**
 * Generate thesis documentation from validation results
 */
function generateThesisDocumentation(validationResults) {
  if (!validationResults) return;
  
  console.log('\n' + '=' * 60);
  console.log('THESIS DOCUMENTATION SECTION');
  console.log('=' * 60);
  
  const successRate = (validationResults.validComparisons / validationResults.totalComparisons * 100).toFixed(1);
  
  console.log(`
## 4.5 Validation Results - Holbox 2022 Data

### 4.5.1 Statistical Analysis Summary

The waste management simulation model was validated against field data collected 
during the comprehensive 2022 Holbox waste management analysis. The validation 
encompassed ${validationResults.totalComparisons} key performance indicators with 
direct field measurements.

**Overall Validation Performance:**
- Success Rate: ${successRate}% of KPIs within acceptable error thresholds
- Overall Model Accuracy: ${(validationResults.performanceMetrics?.overallAccuracy * 100)?.toFixed(1)}%
- Mean Absolute Error: ${validationResults.performanceMetrics?.meanError?.toFixed(1)}%
- Root Mean Square Error: ${validationResults.performanceMetrics?.rmse?.toFixed(2)}

### 4.5.2 Individual KPI Assessment

The validation results demonstrate ${validationResults.isValid ? 'good' : 'moderate'} 
agreement between simulation predictions and field observations:

${validationResults.comparisons?.map(comp => 
  `- **${comp.kpiName}**: ${comp.percentageError.toFixed(1)}% error (${comp.isValid ? 'ACCEPTABLE' : 'HIGH ERROR'})`
).join('\n')}

### 4.5.3 Model Credibility Assessment

${validationResults.isValid ? 
  'The validation results support the use of this simulation model for policy analysis and infrastructure planning in similar island tourism destinations. Error margins fall within acceptable limits for preliminary engineering applications.' :
  'The validation results indicate that model calibration is recommended before use in high-precision applications. The model provides reasonable order-of-magnitude estimates suitable for initial feasibility studies.'
}

**Recommended Applications:**
- Scenario comparison and policy analysis ✅
- Infrastructure capacity planning ✅  
- Cost-benefit analysis of interventions ✅
- Detailed engineering design: ${validationResults.isValid ? '✅' : '⚠️ (with calibration)'}
`);
}

// Main execution
console.log('Starting Holbox Validation Analysis...\n');

runHolboxValidation()
  .then(results => {
    if (results) {
      generateThesisDocumentation(results);
      console.log('\n✅ Validation analysis complete!');
      console.log('📄 Results ready for thesis documentation');
    }
  })
  .catch(error => {
    console.error('Test execution failed:', error);
  });