/**
 * Validation Helper Functions
 * 
 * Shared utilities for validation testing and mass conservation checks
 */

/**
 * Tolerance levels for different types of validation errors
 */
export const VALIDATION_TOLERANCES = {
  MASS_BALANCE_RELATIVE: 0.02, // 2% relative error for mass balance
  MASS_BALANCE_ABSOLUTE: 0.01, // 0.01 ton absolute error for small values
  CAPACITY_UTILIZATION: 1.0,   // 100% max capacity utilization
  NEGATIVE_VALUE: 0.0,          // No negative values allowed
  ZERO_GENERATION: 0.001        // Minimum generation threshold
};

/**
 * Compares two numbers with tolerance
 * @param {number} actual - Actual value
 * @param {number} expected - Expected value  
 * @param {number} tolerance - Acceptable tolerance
 * @returns {boolean} Whether values are within tolerance
 */
export function withinTolerance(actual, expected, tolerance) {
  const difference = Math.abs(actual - expected);
  
  if (expected === 0) {
    return difference <= tolerance;
  }
  
  const relativeDifference = difference / Math.abs(expected);
  return relativeDifference <= tolerance;
}

/**
 * Formats validation error messages with context
 * @param {string} errorType - Type of validation error
 * @param {Object} context - Additional context for the error
 * @returns {string} Formatted error message
 */
export function formatValidationError(errorType, context = {}) {
  const errorMessages = {
    MASS_BALANCE: `Mass balance violation: Generated ${context.generated?.toFixed(3)} ≠ Accounted ${context.accounted?.toFixed(3)} (${context.error?.toFixed(2)}% error)`,
    NEGATIVE_VALUE: `Negative value detected: ${context.field} = ${context.value}`,
    CAPACITY_EXCEEDED: `Capacity exceeded: ${context.field} usage ${context.usage?.toFixed(1)}% > 100%`,
    ZERO_GENERATION: `Unexpected zero generation in ${context.season} season`,
    INVALID_RATIO: `Invalid ratio: ${context.field} = ${context.ratio?.toFixed(2)} (should be 0-1)`,
    MISSING_DATA: `Required field missing: ${context.field}`
  };
  
  return errorMessages[errorType] || `Validation error: ${errorType}`;
}

/**
 * Extracts numeric summary from simulation results for testing
 * @param {Object} kpis - Simulation KPIs
 * @returns {Object} Numeric summary for validation
 */
export function extractValidationSummary(kpis) {
  return {
    totalGeneration: kpis.rsu?.totalGeneration || 0,
    totalDisposed: kpis.rsu?.toDisposal || 0,
    totalRecovered: (kpis.rsu?.recoveryByStage?.source || 0) + 
                   (kpis.rsu?.recoveryByStage?.plant || 0) + 
                   (kpis.rsu?.recoveryByStage?.informal || 0),
    totalValorized: (kpis.valorization?.composted || 0) + 
                   (kpis.valorization?.biogas || 0) + 
                   (kpis.valorization?.pyrolyzed || 0),
    totalLeaked: kpis.rsu?.totalLeak || 0,
    collectionDeficit: kpis.rsu?.collectionDeficit || 0,
    systemCost: kpis.totalSystemCost || 0
  };
}

/**
 * Creates a quick validation report for test assertions
 * @param {Object} summary - Validation summary
 * @returns {Object} Quick validation result
 */
export function quickValidate(summary) {
  const { totalGeneration, totalDisposed, totalRecovered, totalValorized, totalLeaked, collectionDeficit } = summary;
  
  const totalAccounted = totalDisposed + totalRecovered + totalValorized + totalLeaked + collectionDeficit;
  const error = totalGeneration > 0 ? Math.abs(totalGeneration - totalAccounted) / totalGeneration : 0;
  
  return {
    isValid: error <= VALIDATION_TOLERANCES.MASS_BALANCE_RELATIVE,
    error,
    massBalance: {
      generated: totalGeneration,
      accounted: totalAccounted,
      difference: totalGeneration - totalAccounted
    }
  };
}

/**
 * Validates that all capacity constraints are respected
 * @param {Object} kpis - Simulation KPIs
 * @param {Object} inputs - Input parameters
 * @returns {Object} Capacity validation result
 */
export function validateCapacityConstraints(kpis, inputs) {
  const violations = [];
  const warnings = [];
  
  // Check collection capacity
  const collectionCapacity = inputs.rsuSystem?.logistics?.vehicles * 
                            inputs.rsuSystem?.logistics?.vehicleCapacity * 
                            inputs.rsuSystem?.logistics?.tripsPerVehicle || 0;
  
  const generatedWaste = kpis.rsu?.totalGeneration || 0;
  const collectionUtilization = collectionCapacity > 0 ? generatedWaste / collectionCapacity : 0;
  
  if (collectionUtilization > 1.0) {
    violations.push({
      type: 'CAPACITY_EXCEEDED',
      field: 'collection',
      utilization: collectionUtilization * 100,
      capacity: collectionCapacity,
      demand: generatedWaste
    });
  }
  
  // Check transfer station capacity
  const transferCapacity = inputs.rsuSystem?.processing?.transferStationCapacity || 0;
  const inventoryLevel = kpis.rsu?.inventoryLevels?.transferStation || 0;
  
  if (transferCapacity > 0 && inventoryLevel > transferCapacity) {
    violations.push({
      type: 'CAPACITY_EXCEEDED',
      field: 'transferStation',
      utilization: (inventoryLevel / transferCapacity) * 100,
      capacity: transferCapacity,
      inventory: inventoryLevel
    });
  }
  
  return {
    isValid: violations.length === 0,
    violations,
    warnings,
    summary: {
      collectionUtilization: collectionUtilization * 100,
      transferStationUtilization: transferCapacity > 0 ? (inventoryLevel / transferCapacity) * 100 : 0
    }
  };
}

/**
 * Test helper to run simulation and validate results
 * @param {Object} inputs - Simulation inputs
 * @param {Function} useWasteSimulation - Simulation hook
 * @returns {Object} Test results with validation
 */
export function runValidatedSimulation(inputs, useWasteSimulation) {
  try {
    // This would normally be called within a renderHook in tests
    const results = useWasteSimulation(inputs);
    
    const highSummary = extractValidationSummary(results.high);
    const lowSummary = extractValidationSummary(results.low);
    
    const highValidation = quickValidate(highSummary);
    const lowValidation = quickValidate(lowSummary);
    
    const highCapacity = validateCapacityConstraints(results.high, inputs);
    const lowCapacity = validateCapacityConstraints(results.low, inputs);
    
    return {
      success: true,
      results,
      validation: {
        high: { ...highValidation, capacity: highCapacity },
        low: { ...lowValidation, capacity: lowCapacity }
      },
      summary: {
        allValid: highValidation.isValid && lowValidation.isValid && 
                 highCapacity.isValid && lowCapacity.isValid,
        massBalanceValid: highValidation.isValid && lowValidation.isValid,
        capacityValid: highCapacity.isValid && lowCapacity.isValid
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      validation: null
    };
  }
}

/**
 * Creates performance benchmarks for validation tests
 * @param {Function} validationFunction - Function to benchmark
 * @param {Array} testInputs - Array of test inputs
 * @returns {Object} Performance results
 */
export function benchmarkValidation(validationFunction, testInputs) {
  const results = [];
  const startTime = performance.now();
  
  testInputs.forEach((input, index) => {
    const testStart = performance.now();
    const result = validationFunction(input);
    const testEnd = performance.now();
    
    results.push({
      index,
      executionTime: testEnd - testStart,
      isValid: result.isValid,
      error: result.error
    });
  });
  
  const endTime = performance.now();
  const totalTime = endTime - startTime;
  
  return {
    totalExecutionTime: totalTime,
    averageExecutionTime: totalTime / testInputs.length,
    results,
    performance: {
      fastest: Math.min(...results.map(r => r.executionTime)),
      slowest: Math.max(...results.map(r => r.executionTime)),
      allPassed: results.every(r => r.isValid)
    }
  };
}