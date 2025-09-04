/**
 * Test Scenarios for Mass Conservation Validation
 * 
 * Provides standardized test scenarios for validating mass conservation
 * across different system configurations and parameter sets.
 */

import { INITIAL_INPUTS } from '../../../constants/initialState.js';

/**
 * Baseline scenario using default parameters
 * This represents a realistic base case for Isla Holbox
 */
export const baselineScenario = {
  ...INITIAL_INPUTS
};

/**
 * Scenario with all valorization processes enabled
 * Tests mass conservation when material is diverted to valorization
 */
export const valorizationScenario = {
  ...INITIAL_INPUTS,
  rsuSystem: {
    ...INITIAL_INPUTS.rsuSystem,
    valorization: {
      enableComposting: true,
      compostingEfficiency: 80,
      compostingCost: 200,
      compostIncome: 500,
      enableBiogas: true,
      biogasEfficiency: 60,
      biogasCost: 300,
      biogasIncome: 800,
      enablePlasticPyrolysis: true,
      pyrolysisEfficiency: 70,
      pyrolysisCost: 400,
      pyrolysisIncome: 600,
    }
  },
  separationScenarios: {
    educationProgram: {
      enableEducation: true,
      educationImpactHotels: 15,
      educationImpactRestaurants: 12,
      educationImpactHomes: 8,
      educationImpactCommerce: 10,
      educationCostPerCapita: 50,
    },
    incentiveProgram: {
      enableIncentives: true,
      incentiveImpactHotels: 10,
      incentiveImpactRestaurants: 8,
      incentiveImpactHomes: 5,
      incentiveImpactCommerce: 7,
      incentiveCostPerTon: 200,
    },
    containerProgram: {
      enableContainers: true,
      containerImpactHotels: 5,
      containerImpactRestaurants: 4,
      containerImpactHomes: 3,
      containerImpactCommerce: 4,
      containerCostPerUnit: 300,
    }
  }
};

/**
 * Extreme scenario with high generation and limited capacities
 * Tests mass conservation under stress conditions
 */
export const extremeScenario = {
  ...INITIAL_INPUTS,
  generation: {
    hotels: {
      ...INITIAL_INPUTS.generation.hotels,
      rate: INITIAL_INPUTS.generation.hotels.rate * 5, // 5x normal generation
    },
    restaurants: {
      ...INITIAL_INPUTS.generation.restaurants,
      rate: INITIAL_INPUTS.generation.restaurants.rate * 5,
    },
    homes: {
      ...INITIAL_INPUTS.generation.homes,
      rate: INITIAL_INPUTS.generation.homes.rate * 3, // 3x for homes (less extreme)
    },
    commerce: {
      ...INITIAL_INPUTS.generation.commerce,
      rate: INITIAL_INPUTS.generation.commerce.rate * 4,
    }
  },
  rsuSystem: {
    ...INITIAL_INPUTS.rsuSystem,
    logistics: {
      ...INITIAL_INPUTS.rsuSystem.logistics,
      vehicles: Math.max(1, Math.floor(INITIAL_INPUTS.rsuSystem.logistics.vehicles / 2)), // Half the vehicles
    },
    processing: {
      ...INITIAL_INPUTS.rsuSystem.processing,
      transferStationRate: INITIAL_INPUTS.rsuSystem.processing.transferStationRate * 0.7, // Reduced capacity
      finalTransportCapacity: INITIAL_INPUTS.rsuSystem.processing.finalTransportCapacity * 0.8,
    }
  }
};

/**
 * Zero generation scenario for edge case testing
 * Tests that the system handles zero input gracefully
 */
export const zeroGenerationScenario = {
  ...INITIAL_INPUTS,
  generation: {
    hotels: { ...INITIAL_INPUTS.generation.hotels, rate: 0 },
    restaurants: { ...INITIAL_INPUTS.generation.restaurants, rate: 0 },
    homes: { ...INITIAL_INPUTS.generation.homes, rate: 0 },
    commerce: { ...INITIAL_INPUTS.generation.commerce, rate: 0 }
  }
};

/**
 * High leakage scenario
 * Tests mass conservation when system has significant losses
 */
export const highLeakageScenario = {
  ...INITIAL_INPUTS,
  rsuSystem: {
    ...INITIAL_INPUTS.rsuSystem,
    leaks: {
      collectionLeak: 15, // High leakage rates
      transferStationLeak: 10,
      finalTransportLeak: 8,
      disposalLeak: 5,
    },
    separation: {
      ...INITIAL_INPUTS.rsuSystem.separation,
      informalRecoveryRateCollection: 25, // High informal recovery
      informalRecoveryRateDisposal: 20,
    }
  }
};

/**
 * Maximum efficiency scenario
 * Tests conservation when system operates at peak efficiency
 */
export const maxEfficiencyScenario = {
  ...INITIAL_INPUTS,
  rsuSystem: {
    ...INITIAL_INPUTS.rsuSystem,
    separation: {
      ...INITIAL_INPUTS.rsuSystem.separation,
      plantSeparationEfficiency: {
        pet: 95,
        aluminio: 98,
        carton: 90,
        vidrio: 95,
      }
    },
    leaks: {
      collectionLeak: 1, // Minimal leakage
      transferStationLeak: 1,
      finalTransportLeak: 1,
      disposalLeak: 1,
    }
  },
  generation: {
    hotels: {
      ...INITIAL_INPUTS.generation.hotels,
      sourceSeparationRate: 90, // High separation rates
    },
    restaurants: {
      ...INITIAL_INPUTS.generation.restaurants,
      sourceSeparationRate: 85,
    },
    homes: {
      ...INITIAL_INPUTS.generation.homes,
      sourceSeparationRate: 70,
    },
    commerce: {
      ...INITIAL_INPUTS.generation.commerce,
      sourceSeparationRate: 80,
    }
  }
};

/**
 * Collection of all test scenarios for batch testing
 */
export const allTestScenarios = {
  baseline: baselineScenario,
  valorization: valorizationScenario,
  extreme: extremeScenario,
  zeroGeneration: zeroGenerationScenario,
  highLeakage: highLeakageScenario,
  maxEfficiency: maxEfficiencyScenario,
};

/**
 * Get scenario by name with validation
 * @param {string} scenarioName - Name of the scenario
 * @returns {Object} Scenario configuration
 */
export function getTestScenario(scenarioName) {
  if (!allTestScenarios[scenarioName]) {
    throw new Error(`Test scenario '${scenarioName}' not found. Available scenarios: ${Object.keys(allTestScenarios).join(', ')}`);
  }
  return allTestScenarios[scenarioName];
}

/**
 * Create a custom scenario by merging with baseline
 * @param {Object} overrides - Parameters to override in baseline
 * @returns {Object} Custom scenario configuration
 */
export function createCustomScenario(overrides) {
  return {
    ...baselineScenario,
    ...overrides,
  };
}