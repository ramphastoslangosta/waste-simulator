/**
 * Physical Constraints Validator
 * 
 * Validates that all system capacities and physical limits are respected:
 * - Collection capacity: vehicles * vehicleCapacity * tripsPerVehicle
 * - Transfer station capacity: transferStationCapacity  
 * - Final transport capacity: finalTransportCapacity
 * - All inventories >= 0 and <= their respective physical limits
 * 
 * This validator ensures the simulation remains physically feasible.
 */

/**
 * Validates physical constraints for a given simulation result
 * @param {Object} kpis - Simulation results (high or low season)
 * @param {Object} inputs - Input parameters used for simulation
 * @param {string} season - 'high' or 'low'
 * @returns {Object} Validation result with detailed constraint analysis
 */
export function validatePhysicalConstraints(kpis, inputs, season = 'high') {
  try {
    // Extract capacity parameters
    const capacities = extractCapacities(inputs);
    
    // Validate collection constraints
    const collectionConstraints = validateCollectionConstraints(kpis, capacities, inputs);
    
    // Validate transfer station constraints
    const transferStationConstraints = validateTransferStationConstraints(kpis, capacities, inputs);
    
    // Validate final transport constraints
    const finalTransportConstraints = validateFinalTransportConstraints(kpis, capacities, inputs);
    
    // Validate inventory constraints
    const inventoryConstraints = validateInventoryConstraints(kpis, capacities, inputs);
    
    // Perform bottleneck analysis
    const bottleneckAnalysis = analyzeBottlenecks(
      collectionConstraints, 
      transferStationConstraints, 
      finalTransportConstraints, 
      inventoryConstraints
    );
    
    // Determine overall validity
    const overallValid = assessOverallValidity(
      collectionConstraints,
      transferStationConstraints, 
      finalTransportConstraints,
      inventoryConstraints
    );
    
    // Generate detailed report
    const report = generateConstraintReport(
      collectionConstraints,
      transferStationConstraints,
      finalTransportConstraints,
      inventoryConstraints,
      bottleneckAnalysis,
      overallValid,
      season
    );
    
    return {
      overallValid,
      collectionConstraints,
      transferStationConstraints,
      finalTransportConstraints,
      inventoryConstraints,
      bottleneckAnalysis,
      errors: report.errors,
      warnings: report.warnings,
      recommendations: report.recommendations,
      timestamp: new Date().toISOString(),
      season,
      metadata: {
        capacities,
        simulationInputs: inputs,
        validationVersion: '1.0.0'
      }
    };
  } catch (error) {
    return {
      overallValid: false,
      error: error.message,
      errors: [`Physical constraints validation failed: ${error.message}`],
      timestamp: new Date().toISOString(),
      season
    };
  }
}

/**
 * Extracts capacity parameters from inputs
 * @param {Object} inputs - Simulation input parameters
 * @returns {Object} Capacity parameters
 */
function extractCapacities(inputs) {
  const logistics = inputs.rsuSystem?.logistics || {};
  const processing = inputs.rsuSystem?.processing || {};
  
  return {
    // Collection capacity (ton/day)
    collectionCapacity: (logistics.vehicles || 0) * (logistics.vehicleCapacity || 0) * (logistics.tripsPerVehicle || 0),
    
    // Transfer station capacity (ton)
    transferStationCapacity: processing.transferStationCapacity || 0,
    
    // Final transport capacity (ton/day)
    finalTransportCapacity: processing.finalTransportCapacity || 0,
    
    // Processing rate (ton/day)
    transferStationRate: processing.transferStationRate || 0,
    
    // Individual components for analysis
    vehicles: logistics.vehicles || 0,
    vehicleCapacity: logistics.vehicleCapacity || 0,
    tripsPerVehicle: logistics.tripsPerVehicle || 0
  };
}

/**
 * Validates collection system constraints
 * @param {Object} kpis - Simulation KPIs
 * @param {Object} capacities - System capacities
 * @param {Object} inputs - Input parameters
 * @returns {Object} Collection constraints validation
 */
function validateCollectionConstraints(kpis, capacities, inputs) {
  const totalGeneration = kpis.rsu?.totalGeneration || 0;
  const collectedTotal = kpis.rsu?.collectedTotal || 0;
  const collectionDeficit = kpis.rsu?.collectionDeficit || 0;
  const collectionCapacity = capacities.collectionCapacity;
  
  // Calculate utilization rate
  const utilizationRate = collectionCapacity > 0 ? (totalGeneration / collectionCapacity) : 0;
  
  // Check if capacity is exceeded
  const hasCapacityExceeded = totalGeneration > collectionCapacity;
  
  // Validate collection deficit calculation
  const expectedDeficit = Math.max(0, totalGeneration - collectionCapacity);
  const deficitError = Math.abs(collectionDeficit - expectedDeficit);
  const deficitErrorRate = expectedDeficit > 0 ? (deficitError / expectedDeficit) : 0;
  
  // Validate collected amount
  const expectedCollected = totalGeneration - collectionDeficit;
  const collectedError = Math.abs(collectedTotal - expectedCollected);
  const collectedErrorRate = expectedCollected > 0 ? (collectedError / expectedCollected) : 0;
  
  const isValid = !hasCapacityExceeded || (hasCapacityExceeded && collectionDeficit > 0);
  
  return {
    isValid,
    hasCapacityExceeded,
    utilizationRate,
    totalGeneration,
    collectionCapacity,
    collectedTotal,
    collectionDeficit,
    expectedDeficit,
    deficitError,
    deficitErrorRate,
    collectedError,
    collectedErrorRate,
    capacityComponents: {
      vehicles: capacities.vehicles,
      vehicleCapacity: capacities.vehicleCapacity,
      tripsPerVehicle: capacities.tripsPerVehicle
    }
  };
}

/**
 * Validates transfer station constraints
 * @param {Object} kpis - Simulation KPIs
 * @param {Object} capacities - System capacities
 * @param {Object} inputs - Input parameters
 * @returns {Object} Transfer station constraints validation
 */
function validateTransferStationConstraints(kpis, capacities, inputs) {
  const finalInventory = kpis.rsu?.finalInventory || 0;
  const inventoryLevels = kpis.rsu?.inventoryLevels || {};
  const transferStationInventory = inventoryLevels.transferStation || finalInventory;
  const transferStationCapacity = capacities.transferStationCapacity;
  const transferStationRate = capacities.transferStationRate;
  
  // Calculate utilization rate
  const utilizationRate = transferStationCapacity > 0 ? (transferStationInventory / transferStationCapacity) : 0;
  
  // Check if capacity is exceeded
  const hasCapacityExceeded = transferStationInventory > transferStationCapacity;
  
  // Check processing rate adequacy
  const materialToProcess = kpis.rsu?.toTransferStation || 0;
  const processingUtilization = transferStationRate > 0 ? (materialToProcess / transferStationRate) : 0;
  const hasProcessingBottleneck = processingUtilization > 1.0;
  
  const isValid = !hasCapacityExceeded && utilizationRate <= 1.0;
  
  return {
    isValid,
    hasCapacityExceeded,
    hasProcessingBottleneck,
    utilizationRate,
    processingUtilization,
    transferStationInventory,
    transferStationCapacity,
    transferStationRate,
    materialToProcess,
    inventoryExcess: Math.max(0, transferStationInventory - transferStationCapacity)
  };
}

/**
 * Validates final transport constraints
 * @param {Object} kpis - Simulation KPIs
 * @param {Object} capacities - System capacities
 * @param {Object} inputs - Input parameters
 * @returns {Object} Final transport constraints validation
 */
function validateFinalTransportConstraints(kpis, capacities, inputs) {
  const toDisposal = kpis.rsu?.toDisposal || 0;
  const finalTransportCapacity = capacities.finalTransportCapacity;
  const finalTransportInventory = kpis.rsu?.inventoryLevels?.finalTransportVehicles || 0;
  
  // Calculate utilization rate based on daily transport needs
  const dailyTransportNeed = toDisposal; // Assuming daily disposal rate
  const utilizationRate = finalTransportCapacity > 0 ? (dailyTransportNeed / finalTransportCapacity) : 0;
  
  // Check if capacity is exceeded
  const hasCapacityExceeded = dailyTransportNeed > finalTransportCapacity;
  
  // Check for transport bottleneck
  const hasTransportBottleneck = utilizationRate > 1.0;
  
  const isValid = !hasCapacityExceeded && utilizationRate <= 1.0;
  
  return {
    isValid,
    hasCapacityExceeded,
    hasTransportBottleneck,
    utilizationRate,
    dailyTransportNeed,
    finalTransportCapacity,
    finalTransportInventory,
    dailyCapacity: finalTransportCapacity,
    transportExcess: Math.max(0, dailyTransportNeed - finalTransportCapacity)
  };
}

/**
 * Validates inventory constraints
 * @param {Object} kpis - Simulation KPIs
 * @param {Object} capacities - System capacities
 * @param {Object} inputs - Input parameters
 * @returns {Object} Inventory constraints validation
 */
function validateInventoryConstraints(kpis, capacities, inputs) {
  const inventoryLevels = kpis.rsu?.inventoryLevels || {};
  const transferStationCapacity = capacities.transferStationCapacity;
  
  // Check all inventories are non-negative
  const negativeInventories = [];
  const excessiveInventories = [];
  
  Object.entries(inventoryLevels).forEach(([type, value]) => {
    if (value < 0) {
      negativeInventories.push({ type, value });
    }
    
    // Check specific capacity limits
    if (type === 'transferStation' && value > transferStationCapacity) {
      excessiveInventories.push({ 
        type, 
        value, 
        capacity: transferStationCapacity, 
        excess: value - transferStationCapacity 
      });
    }
  });
  
  const allNonNegative = negativeInventories.length === 0;
  const allWithinLimits = excessiveInventories.length === 0;
  const isValid = allNonNegative && allWithinLimits;
  
  return {
    isValid,
    allNonNegative,
    allWithinLimits,
    inventoryLevels,
    negativeInventories,
    excessiveInventories,
    totalInventory: Object.values(inventoryLevels).reduce((sum, value) => sum + value, 0),
    inventoryBreakdown: inventoryLevels
  };
}

/**
 * Analyzes system bottlenecks
 * @param {Object} collectionConstraints - Collection validation results
 * @param {Object} transferStationConstraints - Transfer station validation results  
 * @param {Object} finalTransportConstraints - Final transport validation results
 * @param {Object} inventoryConstraints - Inventory validation results
 * @returns {Object} Bottleneck analysis
 */
function analyzeBottlenecks(collectionConstraints, transferStationConstraints, finalTransportConstraints, inventoryConstraints) {
  const bottlenecks = [];
  const utilizationRates = [];
  
  // Analyze collection bottleneck
  if (collectionConstraints.utilizationRate > 0.8) {
    bottlenecks.push({
      type: 'collection',
      severity: collectionConstraints.utilizationRate > 1.0 ? 'critical' : 'warning',
      utilizationRate: collectionConstraints.utilizationRate,
      description: `Collection capacity utilization: ${(collectionConstraints.utilizationRate * 100).toFixed(1)}%`
    });
  }
  utilizationRates.push({ type: 'collection', rate: collectionConstraints.utilizationRate });
  
  // Analyze transfer station bottleneck
  if (transferStationConstraints.utilizationRate > 0.8) {
    bottlenecks.push({
      type: 'transferStation',
      severity: transferStationConstraints.utilizationRate > 1.0 ? 'critical' : 'warning',
      utilizationRate: transferStationConstraints.utilizationRate,
      description: `Transfer station capacity utilization: ${(transferStationConstraints.utilizationRate * 100).toFixed(1)}%`
    });
  }
  utilizationRates.push({ type: 'transferStation', rate: transferStationConstraints.utilizationRate });
  
  // Analyze processing bottleneck
  if (transferStationConstraints.processingUtilization > 0.8) {
    bottlenecks.push({
      type: 'processing',
      severity: transferStationConstraints.processingUtilization > 1.0 ? 'critical' : 'warning',
      utilizationRate: transferStationConstraints.processingUtilization,
      description: `Processing rate utilization: ${(transferStationConstraints.processingUtilization * 100).toFixed(1)}%`
    });
  }
  
  // Analyze final transport bottleneck
  if (finalTransportConstraints.utilizationRate > 0.8) {
    bottlenecks.push({
      type: 'finalTransport',
      severity: finalTransportConstraints.utilizationRate > 1.0 ? 'critical' : 'warning',
      utilizationRate: finalTransportConstraints.utilizationRate,
      description: `Final transport capacity utilization: ${(finalTransportConstraints.utilizationRate * 100).toFixed(1)}%`
    });
  }
  utilizationRates.push({ type: 'finalTransport', rate: finalTransportConstraints.utilizationRate });
  
  // Identify primary bottleneck
  const primaryBottleneck = bottlenecks.reduce((max, current) => 
    current.utilizationRate > (max?.utilizationRate || 0) ? current : max, null
  );
  
  return {
    identifiedBottlenecks: bottlenecks,
    bottleneckCount: bottlenecks.length,
    primaryBottleneck,
    utilizationRates,
    systemStress: Math.max(...utilizationRates.map(u => u.rate)),
    hasBottlenecks: bottlenecks.length > 0,
    hasCriticalBottlenecks: bottlenecks.some(b => b.severity === 'critical')
  };
}

/**
 * Assesses overall system validity
 * @param {Object} collectionConstraints - Collection validation results
 * @param {Object} transferStationConstraints - Transfer station validation results
 * @param {Object} finalTransportConstraints - Final transport validation results
 * @param {Object} inventoryConstraints - Inventory validation results
 * @returns {boolean} Overall system validity
 */
function assessOverallValidity(collectionConstraints, transferStationConstraints, finalTransportConstraints, inventoryConstraints) {
  return collectionConstraints.isValid && 
         transferStationConstraints.isValid && 
         finalTransportConstraints.isValid && 
         inventoryConstraints.isValid;
}

/**
 * Generates detailed constraint validation report
 * @param {Object} collectionConstraints - Collection validation results
 * @param {Object} transferStationConstraints - Transfer station validation results
 * @param {Object} finalTransportConstraints - Final transport validation results
 * @param {Object} inventoryConstraints - Inventory validation results
 * @param {Object} bottleneckAnalysis - Bottleneck analysis results
 * @param {boolean} overallValid - Overall system validity
 * @param {string} season - Season being validated
 * @returns {Object} Detailed validation report
 */
function generateConstraintReport(collectionConstraints, transferStationConstraints, finalTransportConstraints, inventoryConstraints, bottleneckAnalysis, overallValid, season) {
  const errors = [];
  const warnings = [];
  const recommendations = [];
  
  // Collection constraint errors and warnings
  if (!collectionConstraints.isValid) {
    errors.push(`Collection capacity exceeded: ${collectionConstraints.totalGeneration.toFixed(2)} ton/day generated vs ${collectionConstraints.collectionCapacity.toFixed(2)} ton/day capacity`);
    recommendations.push(`Increase collection capacity by adding vehicles, increasing vehicle capacity, or more trips per vehicle`);
  }
  
  if (collectionConstraints.utilizationRate > 0.8 && collectionConstraints.utilizationRate <= 1.0) {
    warnings.push(`High collection capacity utilization: ${(collectionConstraints.utilizationRate * 100).toFixed(1)}%`);
  }
  
  // Transfer station constraint errors and warnings
  if (!transferStationConstraints.isValid) {
    errors.push(`Transfer station capacity exceeded: ${transferStationConstraints.transferStationInventory.toFixed(2)} ton vs ${transferStationConstraints.transferStationCapacity.toFixed(2)} ton capacity`);
    recommendations.push(`Increase transfer station capacity or processing rate to handle incoming material`);
  }
  
  if (transferStationConstraints.hasProcessingBottleneck) {
    warnings.push(`Processing bottleneck: ${(transferStationConstraints.processingUtilization * 100).toFixed(1)}% utilization`);
    recommendations.push(`Increase transfer station processing rate from ${transferStationConstraints.transferStationRate} ton/day`);
  }
  
  // Final transport constraint errors and warnings
  if (!finalTransportConstraints.isValid) {
    errors.push(`Final transport capacity exceeded: ${finalTransportConstraints.dailyTransportNeed.toFixed(2)} ton/day needed vs ${finalTransportConstraints.finalTransportCapacity.toFixed(2)} ton/day capacity`);
    recommendations.push(`Increase final transport capacity to handle disposal needs`);
  }
  
  // Inventory constraint errors and warnings
  if (!inventoryConstraints.allNonNegative) {
    inventoryConstraints.negativeInventories.forEach(inventory => {
      errors.push(`Negative inventory detected: ${inventory.type} = ${inventory.value.toFixed(2)} ton`);
    });
  }
  
  if (!inventoryConstraints.allWithinLimits) {
    inventoryConstraints.excessiveInventories.forEach(inventory => {
      errors.push(`Inventory exceeds capacity: ${inventory.type} = ${inventory.value.toFixed(2)} ton vs ${inventory.capacity.toFixed(2)} ton capacity`);
    });
  }
  
  // Bottleneck warnings and recommendations
  if (bottleneckAnalysis.hasCriticalBottlenecks) {
    bottleneckAnalysis.identifiedBottlenecks
      .filter(b => b.severity === 'critical')
      .forEach(bottleneck => {
        warnings.push(`Critical bottleneck in ${bottleneck.type}: ${bottleneck.description}`);
      });
  }
  
  if (bottleneckAnalysis.primaryBottleneck) {
    recommendations.push(`Primary system bottleneck: ${bottleneckAnalysis.primaryBottleneck.type} (${(bottleneckAnalysis.primaryBottleneck.utilizationRate * 100).toFixed(1)}% utilization)`);
  }
  
  // General recommendations based on system stress
  if (bottleneckAnalysis.systemStress > 0.9) {
    recommendations.push(`System operating under high stress (${(bottleneckAnalysis.systemStress * 100).toFixed(1)}% peak utilization) - consider capacity expansion`);
  } else if (bottleneckAnalysis.systemStress < 0.3) {
    recommendations.push(`System under-utilized (${(bottleneckAnalysis.systemStress * 100).toFixed(1)}% peak utilization) - consider optimization or cost reduction`);
  }
  
  return { errors, warnings, recommendations };
}

/**
 * Creates a detailed physical constraints report for documentation
 * @param {Object} validation - Validation result
 * @returns {string} Formatted report
 */
export function createPhysicalConstraintsReport(validation) {
  const { season, overallValid, metadata } = validation;
  const capacities = metadata?.capacities || {};
  
  let report = `
Physical Constraints Validation Report
=====================================
Season: ${season.toUpperCase()}
Status: ${overallValid ? 'PASS' : 'FAIL'}
Timestamp: ${validation.timestamp}

System Capacities:
- Collection Capacity: ${capacities.collectionCapacity?.toFixed(2) || 'N/A'} ton/day
  (${capacities.vehicles || 0} vehicles × ${capacities.vehicleCapacity || 0} ton × ${capacities.tripsPerVehicle || 0} trips)
- Transfer Station Capacity: ${capacities.transferStationCapacity?.toFixed(2) || 'N/A'} ton
- Final Transport Capacity: ${capacities.finalTransportCapacity?.toFixed(2) || 'N/A'} ton/day
- Processing Rate: ${capacities.transferStationRate?.toFixed(2) || 'N/A'} ton/day

Constraint Analysis:
==================

Collection System:
- Valid: ${validation.collectionConstraints?.isValid ? 'YES' : 'NO'}
- Utilization: ${(validation.collectionConstraints?.utilizationRate * 100)?.toFixed(1) || 'N/A'}%
- Generation: ${validation.collectionConstraints?.totalGeneration?.toFixed(3) || 'N/A'} ton/day
- Collection Deficit: ${validation.collectionConstraints?.collectionDeficit?.toFixed(3) || 'N/A'} ton/day

Transfer Station:
- Valid: ${validation.transferStationConstraints?.isValid ? 'YES' : 'NO'}
- Utilization: ${(validation.transferStationConstraints?.utilizationRate * 100)?.toFixed(1) || 'N/A'}%
- Current Inventory: ${validation.transferStationConstraints?.transferStationInventory?.toFixed(3) || 'N/A'} ton
- Processing Utilization: ${(validation.transferStationConstraints?.processingUtilization * 100)?.toFixed(1) || 'N/A'}%

Final Transport:
- Valid: ${validation.finalTransportConstraints?.isValid ? 'YES' : 'NO'}
- Utilization: ${(validation.finalTransportConstraints?.utilizationRate * 100)?.toFixed(1) || 'N/A'}%
- Daily Need: ${validation.finalTransportConstraints?.dailyTransportNeed?.toFixed(3) || 'N/A'} ton/day

Inventory Status:
- All Non-negative: ${validation.inventoryConstraints?.allNonNegative ? 'YES' : 'NO'}
- All Within Limits: ${validation.inventoryConstraints?.allWithinLimits ? 'YES' : 'NO'}
- Total System Inventory: ${validation.inventoryConstraints?.totalInventory?.toFixed(3) || 'N/A'} ton

Bottleneck Analysis:
==================
System Stress Level: ${(validation.bottleneckAnalysis?.systemStress * 100)?.toFixed(1) || 'N/A'}%
Identified Bottlenecks: ${validation.bottleneckAnalysis?.bottleneckCount || 0}
`;

  if (validation.bottleneckAnalysis?.primaryBottleneck) {
    report += `Primary Bottleneck: ${validation.bottleneckAnalysis.primaryBottleneck.type} (${(validation.bottleneckAnalysis.primaryBottleneck.utilizationRate * 100).toFixed(1)}%)\n`;
  }

  if (validation.errors && validation.errors.length > 0) {
    report += '\nErrors:\n';
    validation.errors.forEach(error => {
      report += `- ${error}\n`;
    });
  }

  if (validation.warnings && validation.warnings.length > 0) {
    report += '\nWarnings:\n';
    validation.warnings.forEach(warning => {
      report += `- ${warning}\n`;
    });
  }

  if (validation.recommendations && validation.recommendations.length > 0) {
    report += '\nRecommendations:\n';
    validation.recommendations.forEach(recommendation => {
      report += `- ${recommendation}\n`;
    });
  }

  return report;
}

/**
 * Validates physical constraints across multiple scenarios
 * @param {Array} scenarios - Array of {inputs, kpis} objects
 * @returns {Object} Batch validation results
 */
export function validatePhysicalConstraintsBatch(scenarios) {
  const results = scenarios.map((scenario, index) => {
    const highValidation = validatePhysicalConstraints(scenario.kpis.high, scenario.inputs, 'high');
    const lowValidation = validatePhysicalConstraints(scenario.kpis.low, scenario.inputs, 'low');
    
    return {
      scenarioIndex: index,
      scenarioName: scenario.name || `Scenario ${index + 1}`,
      high: highValidation,
      low: lowValidation,
      overallValid: highValidation.overallValid && lowValidation.overallValid
    };
  });
  
  const allValid = results.every(r => r.overallValid);
  const validCount = results.filter(r => r.overallValid).length;
  
  return {
    allValid,
    validCount,
    totalCount: results.length,
    results,
    summary: {
      passRate: (validCount / results.length) * 100,
      failedScenarios: results.filter(r => !r.overallValid).map(r => r.scenarioName),
      commonBottlenecks: analyzeCommonBottlenecks(results)
    }
  };
}

/**
 * Analyzes common bottlenecks across scenarios
 * @param {Array} results - Batch validation results
 * @returns {Object} Common bottleneck analysis
 */
function analyzeCommonBottlenecks(results) {
  const bottleneckCounts = {};
  
  results.forEach(result => {
    [result.high, result.low].forEach(validation => {
      if (validation.bottleneckAnalysis?.identifiedBottlenecks) {
        validation.bottleneckAnalysis.identifiedBottlenecks.forEach(bottleneck => {
          bottleneckCounts[bottleneck.type] = (bottleneckCounts[bottleneck.type] || 0) + 1;
        });
      }
    });
  });
  
  const totalValidations = results.length * 2; // high + low for each scenario
  const commonBottlenecks = Object.entries(bottleneckCounts)
    .map(([type, count]) => ({
      type,
      count,
      frequency: count / totalValidations
    }))
    .filter(b => b.frequency > 0.3) // Appears in >30% of validations
    .sort((a, b) => b.frequency - a.frequency);
  
  return {
    commonBottlenecks,
    mostCommonBottleneck: commonBottlenecks[0] || null,
    bottleneckFrequencies: bottleneckCounts
  };
}