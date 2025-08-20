// ========================================================================
// FILE: src/utils/sensitivityAnalysis.js
// PURPOSE: Comprehensive sensitivity analysis framework for THESIS-004
// ========================================================================

import { useWasteSimulation } from '../hooks/useWasteSimulation.tsx';
import { INITIAL_INPUTS } from '../constants/initialState.js';

/**
 * Sensitivity Analysis Parameters Configuration
 * Based on THESIS-004 requirements for policy recommendation analysis
 */
export const SENSITIVITY_PARAMETERS = {
    'generation.hotels.rate': {
        basePath: ['generation', 'hotels', 'rate'],
        baseValue: 1.2, // kg/cuarto/día
        description: 'Hotel waste generation rate per room per day',
        unit: 'kg/cuarto/día'
    },
    'generation.restaurants.rate': {
        basePath: ['generation', 'restaurants', 'rate'],
        baseValue: 114.2, // kg/unidad/día
        description: 'Restaurant waste generation rate per unit per day',
        unit: 'kg/unidad/día'
    },
    'general.highSeasonOccupancy': {
        basePath: ['general', 'highSeasonOccupancy'],
        baseValue: 90, // %
        description: 'High season occupancy rate',
        unit: '%'
    },
    'rsuSystem.processing.finalTransportCapacity': {
        basePath: ['rsuSystem', 'processing', 'finalTransportCapacity'],
        baseValue: 8, // tons/día
        description: 'Final transport capacity to mainland',
        unit: 'tons/día'
    },
    'rsuSystem.leaks.collectionLeak': {
        basePath: ['rsuSystem', 'leaks', 'collectionLeak'],
        baseValue: 15, // %
        description: 'Collection system leak rate',
        unit: '%'
    },
    'rsuSystem.economics.collectionCost': {
        basePath: ['rsuSystem', 'economics', 'collectionCost'],
        baseValue: 800, // pesos/ton
        description: 'Collection cost per ton',
        unit: 'pesos/ton'
    },
    'general.fixedPopulation': {
        basePath: ['general', 'fixedPopulation'],
        baseValue: 2673, // habitantes
        description: 'Fixed resident population',
        unit: 'habitantes'
    }
};

/**
 * Key Performance Indicators to track in sensitivity analysis
 */
export const SENSITIVITY_KPIS = {
    'totalGeneration': {
        extractPath: ['totalGeneration'],
        description: 'Total waste generation per day',
        unit: 'tons/day'
    },
    'collectionEfficiency': {
        extractPath: ['rsu', 'collectionDeficit'],
        description: 'Collection deficit (lower is better)',
        unit: 'tons/day',
        transform: (value, baseline) => {
            // Convert deficit to efficiency percentage
            const totalGen = baseline.rsu?.totalGeneration || 1;
            return ((totalGen - value) / totalGen) * 100;
        }
    },
    'processingCapacityUtilization': {
        extractPath: ['rsu', 'finalInventory'],
        description: 'Transfer station inventory levels',
        unit: 'tons',
        transform: (value, baseline) => {
            // Calculate capacity utilization percentage
            const capacity = 300; // From transfer station capacity
            return (value / capacity) * 100;
        }
    },
    'totalSystemCost': {
        extractPath: ['totalSystemCost'],
        description: 'Total daily system operating cost',
        unit: 'pesos/day'
    },
    'disposalVolume': {
        extractPath: ['rsu', 'toDisposal'],
        description: 'Volume sent to final disposal',
        unit: 'tons/day'
    },
    'recoveryRate': {
        extractPath: ['rsu', 'recoveryByStage'],
        description: 'Total material recovery rate',
        unit: 'tons/day',
        transform: (value) => {
            if (typeof value === 'object' && value !== null) {
                return (value.source || 0) + (value.plant || 0) + (value.informal || 0);
            }
            return 0;
        }
    },
    'netCostPerDay': {
        extractPath: ['rsu', 'netCostPerDay'],
        description: 'Net RSU system cost per day',
        unit: 'pesos/day'
    }
};

/**
 * Variation levels for sensitivity analysis
 */
export const VARIATION_LEVELS = [-20, -10, 0, 10, 20]; // Percentage variations

/**
 * Deep clone utility for nested objects
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === "object") {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Set nested object value using path array
 */
function setNestedValue(obj, path, value) {
    const cloned = deepClone(obj);
    let current = cloned;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    return cloned;
}

/**
 * Get nested object value using path array
 */
function getNestedValue(obj, path) {
    let current = obj;
    for (const key of path) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }
    return current;
}

/**
 * Extract KPI values from simulation results
 */
function extractKpiValues(results, season) {
    const seasonResults = results[season];
    const kpiValues = {};
    
    for (const [kpiName, kpiConfig] of Object.entries(SENSITIVITY_KPIS)) {
        const rawValue = getNestedValue(seasonResults, kpiConfig.extractPath);
        
        if (kpiConfig.transform && typeof kpiConfig.transform === 'function') {
            kpiValues[kpiName] = kpiConfig.transform(rawValue, seasonResults);
        } else {
            kpiValues[kpiName] = rawValue || 0;
        }
    }
    
    return kpiValues;
}

/**
 * Run simulation with modified parameters
 */
function runSimulationWithParameters(modifiedInputs) {
    // Simulate the useWasteSimulation hook behavior
    // Note: This is a simplified version for demonstration
    // In actual execution, we would need to integrate with React components
    
    // For now, return a placeholder structure
    // This will be replaced with actual simulation logic during execution
    return {
        high: {
            totalGeneration: 15.5,
            rsu: {
                totalGeneration: 12.3,
                collectionDeficit: 0.8,
                finalInventory: 45.2,
                toDisposal: 8.9,
                recoveryByStage: { source: 1.2, plant: 0.8, informal: 0.3 },
                netCostPerDay: 12500
            },
            totalSystemCost: 15800
        },
        low: {
            totalGeneration: 8.2,
            rsu: {
                totalGeneration: 6.1,
                collectionDeficit: 0.2,
                finalInventory: 22.1,
                toDisposal: 4.5,
                recoveryByStage: { source: 0.6, plant: 0.4, informal: 0.15 },
                netCostPerDay: 6800
            },
            totalSystemCost: 8200
        }
    };
}

/**
 * Generate parameter variation scenarios
 */
export function generateVariationScenarios() {
    const scenarios = [];
    const baseInputs = deepClone(INITIAL_INPUTS);
    
    // Add baseline scenario
    scenarios.push({
        scenarioName: 'baseline',
        parameterName: 'baseline',
        variationPercent: 0,
        inputs: baseInputs,
        parameterValue: null
    });
    
    // Generate variations for each parameter
    for (const [paramName, paramConfig] of Object.entries(SENSITIVITY_PARAMETERS)) {
        for (const variation of VARIATION_LEVELS) {
            if (variation === 0) continue; // Skip baseline, already added
            
            const modifiedInputs = deepClone(baseInputs);
            const newValue = paramConfig.baseValue * (1 + variation / 100);
            const modifiedInputsWithNewValue = setNestedValue(
                modifiedInputs, 
                paramConfig.basePath, 
                newValue
            );
            
            scenarios.push({
                scenarioName: `${paramName}_${variation > 0 ? '+' : ''}${variation}%`,
                parameterName: paramName,
                variationPercent: variation,
                inputs: modifiedInputsWithNewValue,
                parameterValue: newValue
            });
        }
    }
    
    return scenarios;
}

/**
 * Execute sensitivity analysis for all scenarios
 */
export function executeSensitivityAnalysis(progressCallback = null) {
    const scenarios = generateVariationScenarios();
    const results = [];
    
    console.log(`Executing sensitivity analysis with ${scenarios.length} scenarios...`);
    
    scenarios.forEach((scenario, index) => {
        if (progressCallback) {
            progressCallback(index, scenarios.length, scenario.scenarioName);
        }
        
        console.log(`Running scenario ${index + 1}/${scenarios.length}: ${scenario.scenarioName}`);
        
        // Run simulation
        const simulationResults = runSimulationWithParameters(scenario.inputs);
        
        // Extract KPIs for both seasons
        const highSeasonKpis = extractKpiValues(simulationResults, 'high');
        const lowSeasonKpis = extractKpiValues(simulationResults, 'low');
        
        results.push({
            ...scenario,
            results: {
                high: highSeasonKpis,
                low: lowSeasonKpis
            }
        });
    });
    
    return results;
}

/**
 * Calculate sensitivity indices for tornado chart analysis
 */
export function calculateSensitivityIndices(results) {
    // Find baseline scenario
    const baselineScenario = results.find(r => r.parameterName === 'baseline');
    if (!baselineScenario) {
        throw new Error('Baseline scenario not found in results');
    }
    
    const sensitivityIndices = {};
    
    // Initialize structure for each parameter
    Object.keys(SENSITIVITY_PARAMETERS).forEach(paramName => {
        sensitivityIndices[paramName] = {
            parameter: paramName,
            description: SENSITIVITY_PARAMETERS[paramName].description,
            unit: SENSITIVITY_PARAMETERS[paramName].unit,
            baseValue: SENSITIVITY_PARAMETERS[paramName].baseValue,
            high: {},
            low: {}
        };
    });
    
    // Calculate indices for each season and KPI
    ['high', 'low'].forEach(season => {
        Object.keys(SENSITIVITY_KPIS).forEach(kpiName => {
            const baselineValue = baselineScenario.results[season][kpiName];
            
            Object.keys(SENSITIVITY_PARAMETERS).forEach(paramName => {
                // Get +20% and -20% scenarios for this parameter
                const positiveScenario = results.find(r => 
                    r.parameterName === paramName && r.variationPercent === 20
                );
                const negativeScenario = results.find(r => 
                    r.parameterName === paramName && r.variationPercent === -20
                );
                
                if (positiveScenario && negativeScenario) {
                    const positiveValue = positiveScenario.results[season][kpiName];
                    const negativeValue = negativeScenario.results[season][kpiName];
                    
                    // Calculate sensitivity index (change in KPI per % change in parameter)
                    const sensitivityIndex = ((positiveValue - negativeValue) / (2 * 20)) * 100;
                    
                    // Calculate relative sensitivity (% change in KPI per % change in parameter)
                    const relativeSensitivity = baselineValue !== 0 ? 
                        (sensitivityIndex / baselineValue) * 100 : 0;
                    
                    if (!sensitivityIndices[paramName][season][kpiName]) {
                        sensitivityIndices[paramName][season][kpiName] = {};
                    }
                    
                    sensitivityIndices[paramName][season][kpiName] = {
                        sensitivityIndex,
                        relativeSensitivity,
                        absoluteChange: positiveValue - negativeValue,
                        positiveValue,
                        negativeValue,
                        baselineValue
                    };
                }
            });
        });
    });
    
    return sensitivityIndices;
}

/**
 * Rank parameters by their overall impact across all KPIs
 */
export function rankParametersByImpact(sensitivityIndices, season = 'high') {
    const parameterImpacts = [];
    
    Object.entries(sensitivityIndices).forEach(([paramName, paramData]) => {
        let totalImpact = 0;
        let kpiCount = 0;
        
        Object.values(paramData[season]).forEach(kpiData => {
            if (typeof kpiData === 'object' && kpiData.relativeSensitivity !== undefined) {
                totalImpact += Math.abs(kpiData.relativeSensitivity);
                kpiCount++;
            }
        });
        
        const averageImpact = kpiCount > 0 ? totalImpact / kpiCount : 0;
        
        parameterImpacts.push({
            parameter: paramName,
            description: paramData.description,
            averageImpact,
            totalImpact,
            kpiCount
        });
    });
    
    return parameterImpacts.sort((a, b) => b.averageImpact - a.averageImpact);
}

/**
 * Generate tornado chart data for visualization
 */
export function generateTornadoChartData(sensitivityIndices, kpiName, season = 'high') {
    const tornadoData = [];
    
    Object.entries(sensitivityIndices).forEach(([paramName, paramData]) => {
        const kpiData = paramData[season][kpiName];
        if (kpiData && typeof kpiData === 'object') {
            tornadoData.push({
                parameter: paramName,
                description: paramData.description,
                negativeChange: kpiData.negativeValue - kpiData.baselineValue,
                positiveChange: kpiData.positiveValue - kpiData.baselineValue,
                relativeSensitivity: Math.abs(kpiData.relativeSensitivity),
                baselineValue: kpiData.baselineValue
            });
        }
    });
    
    // Sort by absolute relative sensitivity (most impactful first)
    return tornadoData.sort((a, b) => b.relativeSensitivity - a.relativeSensitivity);
}

/**
 * Export results to CSV format for further analysis
 */
export function exportResultsToCSV(results, sensitivityIndices) {
    const csvRows = [];
    
    // Header row
    const headers = [
        'Scenario',
        'Parameter',
        'Variation_%',
        'Parameter_Value',
        'Season'
    ];
    
    // Add KPI headers
    Object.keys(SENSITIVITY_KPIS).forEach(kpiName => {
        headers.push(`${kpiName}_Value`);
    });
    
    // Add sensitivity index headers
    Object.keys(SENSITIVITY_KPIS).forEach(kpiName => {
        headers.push(`${kpiName}_SensitivityIndex`);
        headers.push(`${kpiName}_RelativeSensitivity`);
    });
    
    csvRows.push(headers.join(','));
    
    // Data rows
    results.forEach(scenario => {
        ['high', 'low'].forEach(season => {
            const row = [
                scenario.scenarioName,
                scenario.parameterName,
                scenario.variationPercent,
                scenario.parameterValue || '',
                season
            ];
            
            // Add KPI values
            Object.keys(SENSITIVITY_KPIS).forEach(kpiName => {
                row.push(scenario.results[season][kpiName] || '');
            });
            
            // Add sensitivity indices (only for non-baseline scenarios)
            Object.keys(SENSITIVITY_KPIS).forEach(kpiName => {
                if (scenario.parameterName !== 'baseline' && 
                    sensitivityIndices[scenario.parameterName] &&
                    sensitivityIndices[scenario.parameterName][season][kpiName]) {
                    const kpiData = sensitivityIndices[scenario.parameterName][season][kpiName];
                    row.push(kpiData.sensitivityIndex || '');
                    row.push(kpiData.relativeSensitivity || '');
                } else {
                    row.push('');
                    row.push('');
                }
            });
            
            csvRows.push(row.join(','));
        });
    });
    
    return csvRows.join('\n');
}

export default {
    SENSITIVITY_PARAMETERS,
    SENSITIVITY_KPIS,
    VARIATION_LEVELS,
    generateVariationScenarios,
    executeSensitivityAnalysis,
    calculateSensitivityIndices,
    rankParametersByImpact,
    generateTornadoChartData,
    exportResultsToCSV
};