/**
 * Mass Conservation Validator
 * 
 * Implements the fundamental physics principle of mass conservation for waste flows:
 * G_total = Material_disposed + Material_recovered + Material_valorized + Leaks_total
 * 
 * This validator is critical for ensuring scientific credibility of the simulation model.
 */

/**
 * Validates mass conservation for a given simulation result
 * @param {Object} kpis - Simulation results (high or low season)
 * @param {Object} inputs - Input parameters used for simulation
 * @param {string} season - 'high' or 'low'
 * @returns {Object} Validation result with detailed analysis
 */
export function validateMassConservation(kpis, inputs, season = 'high') {
  try {
    // Extract components from KPIs
    const components = extractMassComponents(kpis);
    
    // Calculate mass balance
    const massBalance = calculateMassBalance(components);
    
    // Determine if validation passes
    const isValid = assessValidation(massBalance);
    
    // Generate detailed report
    const report = generateValidationReport(components, massBalance, isValid, season);
    
    return {
      isValid,
      massBalance,
      components,
      errors: report.errors,
      warnings: report.warnings,
      timestamp: new Date().toISOString(),
      season,
      metadata: {
        simulationInputs: inputs,
        validationVersion: '1.0.0'
      }
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message,
      errors: [`Validation failed: ${error.message}`],
      timestamp: new Date().toISOString(),
      season
    };
  }
}

/**
 * Extracts mass components from simulation KPIs
 * @param {Object} kpis - Simulation KPIs
 * @returns {Object} Mass components breakdown
 */
function extractMassComponents(kpis) {
  // Total generation (Input to system)
  const generated = kpis.rsu?.totalGeneration || 0;
  
  // Material that exits the system through disposal
  const disposed = kpis.rsu?.toDisposal || 0;
  
  // Material recovered through formal and informal channels
  const recoveredSource = kpis.rsu?.recoveryByStage?.source || 0;
  const recoveredPlant = kpis.rsu?.recoveryByStage?.plant || 0;
  const recoveredInformal = kpis.rsu?.recoveryByStage?.informal || 0;
  const recovered = recoveredSource + recoveredPlant + recoveredInformal;
  
  // Material processed through valorization
  const valorizedCompost = kpis.valorization?.composted || 0;
  const valorizedBiogas = kpis.valorization?.biogas || 0;
  const valorizedPyrolysis = kpis.valorization?.pyrolyzed || 0;
  const valorized = valorizedCompost + valorizedBiogas + valorizedPyrolysis;
  
  // System losses (leaks)
  const leaked = kpis.rsu?.totalLeak || 0;
  
  // Collection deficit (material not collected)
  const collectionDeficit = kpis.rsu?.collectionDeficit || 0;
  
  // Material accumulated/not transported (bottleneck effect)
  // This accounts for material that is collected and processed but cannot be transported due to capacity limitations
  const materialAccumulated = kpis.rsu?.untransportedMaterial || 0;
  
  return {
    generated,
    disposed,
    recovered,
    valorized,
    leaked,
    collectionDeficit,
    materialAccumulated,
    // Detailed breakdown
    recoveryBreakdown: {
      source: recoveredSource,
      plant: recoveredPlant,
      informal: recoveredInformal
    },
    valorizationBreakdown: {
      composted: valorizedCompost,
      biogas: valorizedBiogas,
      pyrolyzed: valorizedPyrolysis
    }
  };
}

/**
 * Calculates mass balance and error metrics
 * @param {Object} components - Mass components
 * @returns {Object} Mass balance calculation
 */
function calculateMassBalance(components) {
  const { generated, disposed, recovered, valorized, leaked, collectionDeficit, materialAccumulated } = components;
  
  // Total material accounted for (includes accumulated material from bottlenecks)
  const totalAccounted = disposed + recovered + valorized + leaked + collectionDeficit + materialAccumulated;
  
  // Mass balance error
  const absoluteError = Math.abs(generated - totalAccounted);
  const relativeError = generated > 0 ? (absoluteError / generated) : 0;
  const percentageError = relativeError * 100;
  
  // Mass balance equation components
  const leftSide = generated; // Input
  const rightSide = totalAccounted; // Output + losses
  
  return {
    totalGenerated: generated,
    totalAccounted,
    absoluteError,
    relativeError,
    percentageError,
    error: relativeError, // For backward compatibility
    equation: {
      leftSide,
      rightSide,
      difference: leftSide - rightSide
    }
  };
}

/**
 * Assesses whether validation passes based on mass balance
 * @param {Object} massBalance - Mass balance calculation
 * @returns {boolean} Whether validation passes
 */
function assessValidation(massBalance) {
  const MAX_ACCEPTABLE_ERROR = 0.02; // 2% maximum acceptable error
  const MAX_ABSOLUTE_ERROR = 0.01; // 0.01 ton maximum absolute error for small values
  
  // For very small values, use absolute error threshold
  if (massBalance.totalGenerated < 1.0) {
    return massBalance.absoluteError <= MAX_ABSOLUTE_ERROR;
  }
  
  // For normal values, use relative error threshold
  return massBalance.relativeError <= MAX_ACCEPTABLE_ERROR;
}

/**
 * Generates detailed validation report with errors and warnings
 * @param {Object} components - Mass components
 * @param {Object} massBalance - Mass balance calculation
 * @param {boolean} isValid - Whether validation passed
 * @param {string} season - Season being validated
 * @returns {Object} Validation report
 */
function generateValidationReport(components, massBalance, isValid, season) {
  const errors = [];
  const warnings = [];
  
  // Check for mass balance violation
  if (!isValid) {
    errors.push(`Mass balance violation detected: ${massBalance.percentageError.toFixed(2)}% error exceeds acceptable threshold`);
    errors.push(`Generated: ${components.generated.toFixed(3)} ton/day, Accounted: ${massBalance.totalAccounted.toFixed(3)} ton/day`);
  }
  
  // Check for negative values (physically impossible)
  Object.entries(components).forEach(([key, value]) => {
    if (typeof value === 'number' && value < 0) {
      errors.push(`Negative value detected for ${key}: ${value}`);
    }
  });
  
  // Check for suspicious ratios
  if (components.generated > 0) {
    const disposalRatio = components.disposed / components.generated;
    const recoveryRatio = components.recovered / components.generated;
    const valorizationRatio = components.valorized / components.generated;
    const leakageRatio = components.leaked / components.generated;
    
    if (disposalRatio > 0.95) {
      warnings.push(`Very high disposal ratio (${(disposalRatio * 100).toFixed(1)}%) - low recovery/valorization`);
    }
    
    if (leakageRatio > 0.3) {
      warnings.push(`High system leakage (${(leakageRatio * 100).toFixed(1)}%) - check leak parameters`);
    }
    
    if (recoveryRatio + valorizationRatio < 0.05) {
      warnings.push(`Very low total recovery and valorization (${((recoveryRatio + valorizationRatio) * 100).toFixed(1)}%)`);
    }
  }
  
  // Check for collection deficits
  if (components.collectionDeficit > 0) {
    const deficitRatio = components.collectionDeficit / components.generated;
    if (deficitRatio > 0.1) {
      warnings.push(`Significant collection deficit (${(deficitRatio * 100).toFixed(1)}%) - insufficient collection capacity`);
    }
  }
  
  // Season-specific checks
  if (season === 'high' && components.generated <= 0) {
    warnings.push('Zero waste generation in high season is unusual');
  }
  
  return { errors, warnings };
}

/**
 * Validates mass conservation across multiple scenarios
 * @param {Array} scenarios - Array of {inputs, kpis} objects
 * @returns {Object} Batch validation results
 */
export function validateMassConservationBatch(scenarios) {
  const results = scenarios.map((scenario, index) => {
    const highValidation = validateMassConservation(scenario.kpis.high, scenario.inputs, 'high');
    const lowValidation = validateMassConservation(scenario.kpis.low, scenario.inputs, 'low');
    
    return {
      scenarioIndex: index,
      scenarioName: scenario.name || `Scenario ${index + 1}`,
      high: highValidation,
      low: lowValidation,
      overallValid: highValidation.isValid && lowValidation.isValid
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
      failedScenarios: results.filter(r => !r.overallValid).map(r => r.scenarioName)
    }
  };
}

/**
 * Creates a detailed mass balance report for documentation
 * @param {Object} validation - Validation result
 * @returns {string} Formatted report
 */
export function createMassBalanceReport(validation) {
  const { massBalance, components, season, isValid } = validation;
  
  let report = `
Mass Conservation Validation Report
==================================
Season: ${season.toUpperCase()}
Status: ${isValid ? 'PASS' : 'FAIL'}
Timestamp: ${validation.timestamp}

Mass Balance Equation:
Generated = Disposed + Recovered + Valorized + Leaked + Collection Deficit
${massBalance.totalGenerated.toFixed(3)} = ${components.disposed.toFixed(3)} + ${components.recovered.toFixed(3)} + ${components.valorized.toFixed(3)} + ${components.leaked.toFixed(3)} + ${components.collectionDeficit.toFixed(3)}
${massBalance.totalGenerated.toFixed(3)} = ${massBalance.totalAccounted.toFixed(3)}

Error Analysis:
- Absolute Error: ${massBalance.absoluteError.toFixed(6)} ton/day
- Relative Error: ${(massBalance.relativeError * 100).toFixed(4)}%
- Acceptable: ${isValid ? 'YES' : 'NO'} (threshold: 2.0%)

Component Breakdown:
- Generated: ${components.generated.toFixed(3)} ton/day (100.0%)
- Disposed: ${components.disposed.toFixed(3)} ton/day (${(components.disposed/components.generated*100).toFixed(1)}%)
- Recovered: ${components.recovered.toFixed(3)} ton/day (${(components.recovered/components.generated*100).toFixed(1)}%)
- Valorized: ${components.valorized.toFixed(3)} ton/day (${(components.valorized/components.generated*100).toFixed(1)}%)
- Leaked: ${components.leaked.toFixed(3)} ton/day (${(components.leaked/components.generated*100).toFixed(1)}%)
- Collection Deficit: ${components.collectionDeficit.toFixed(3)} ton/day (${(components.collectionDeficit/components.generated*100).toFixed(1)}%)
`;

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

  return report;
}