// ========================================================================
// FILE: src/constants/improvedScenario.js
// THESIS-006: Evidence-Based Improvement Scenario Parameters
// ========================================================================

import { INITIAL_INPUTS } from './initialState.js';

/**
 * Improved Scenario Parameters for THESIS-006
 * Based on sensitivity analysis findings targeting the 3 most critical variables:
 * 1. Final Transport Capacity (30.7% system impact)
 * 2. Collection Cost Optimization (11.9% system impact)  
 * 3. Restaurant Sector Management (11.5% system impact)
 * 
 * Uses existing simulation features:
 * - Valorization scenarios (composting, biogas, pyrolysis)
 * - Separation enhancement programs (education, incentives, containers)
 * - Cost optimization through operational efficiency
 */

const IMPROVED_SCENARIO_INPUTS = {
    ...INITIAL_INPUTS,
    
    // IMPROVEMENT 1: Transport Infrastructure Enhancement
    // Target: Increase final transport capacity from 8 to 12 tons/day (+50%)
    rsuSystem: {
        ...INITIAL_INPUTS.rsuSystem,
        processing: {
            ...INITIAL_INPUTS.rsuSystem.processing,
            finalTransportCapacity: 12,        // Increased from 8 tons/day
            transferStationCapacity: 400,      // Enhanced to handle increased throughput
        },
        
        // IMPROVEMENT 2: Collection Cost Optimization
        // Target: Reduce collection cost from 800 to 600 pesos/ton (-25%)
        economics: {
            ...INITIAL_INPUTS.rsuSystem.economics,
            collectionCost: 600,               // Reduced from 800 pesos/ton through efficiency programs
            // Add amortized costs for improvements
            transportUpgradeCost: 150,          // Daily amortized cost of transport enhancement
            collectionOptimizationCost: 50,    // Daily cost of route optimization technology
        },
        
        // VALORIZATION ACTIVATION: Transfer Station Treatment
        // Enable comprehensive valorization to maximize value recovery
        valorization: {
            ...INITIAL_INPUTS.rsuSystem.valorization,
            enableComposting: true,             // Activate composting of organic waste
            compostingEfficiency: 75,           // Optimized efficiency for local conditions
            compostingCost: 250,                // Adjusted cost for integrated operations
            compostIncome: 400,                 // Conservative income estimate for local market
            
            enableBiogas: true,                 // Activate biogas generation 
            biogasEfficiency: 50,               // Conservative efficiency for pilot implementation
            biogasCost: 350,                    // Cost including equipment amortization
            biogasIncome: 600,                  // Income from energy sales/use
            
            enablePlasticPyrolysis: true,       // Activate plastic pyrolysis for high-value recovery
            pyrolysisEfficiency: 60,            // Pilot-scale efficiency
            pyrolysisCost: 450,                 // Full cost including technology
            pyrolysisIncome: 500,               // Conservative market value
        },
        
        // Enhanced material recovery through better separation
        separation: {
            ...INITIAL_INPUTS.rsuSystem.separation,
            differentiatedCaptureRate: 95,     // Improved capture through enhanced programs
            rejectionRateSource: 10,            // Reduced rejection through quality improvement
            plantSeparationEfficiency: {       // Enhanced plant efficiency through optimization
                pet: 65,                        // Improved from 50%
                aluminio: 75,                   // Improved from 60% 
                carton: 55,                     // Improved from 40%
                vidrio: 45                      // Improved from 30%
            },
        },
    },
    
    // IMPROVEMENT 3: Restaurant Sector Comprehensive Program
    // Target: Reduce generation rate and increase separation significantly
    generation: {
        ...INITIAL_INPUTS.generation,
        restaurants: {
            ...INITIAL_INPUTS.generation.restaurants,
            rate: 91.4,                         // Reduced from 114.2 kg/unit/day (-20% through source reduction)
            sourceSeparationRate: 35,           // Increased from 15% (+133% improvement)
        },
        // Also enhance other sectors through comprehensive programs
        hotels: {
            ...INITIAL_INPUTS.generation.hotels,
            sourceSeparationRate: 40,           // Increased from 25% through tourism programs
        },
        homes: {
            ...INITIAL_INPUTS.generation.homes,
            sourceSeparationRate: 15,           // Increased from 5% through education
        },
        commerce: {
            ...INITIAL_INPUTS.generation.commerce,
            sourceSeparationRate: 45,           // Increased from 30% through business programs
        },
    },
    
    // SEPARATION ENHANCEMENT PROGRAMS ACTIVATION
    // Enable all separation enhancement programs for maximum impact
    separationScenarios: {
        ...INITIAL_INPUTS.separationScenarios,
        enableEnhancedSeparation: true,        // Activate enhanced separation framework
        
        // EDUCATION PROGRAM: Community awareness and training
        educationProgram: {
            ...INITIAL_INPUTS.separationScenarios.educationProgram,
            enableEducation: true,              // Activate education program
            educationImpactHotels: 12,          // Moderate impact for organized sector
            educationImpactRestaurants: 15,     // High impact for targeted program
            educationImpactHomes: 20,           // Highest impact for residential education
            educationImpactCommerce: 10,        // Moderate impact for commercial sector
            educationCostPerCapita: 40,         // Optimized cost through efficient delivery
        },
        
        // INCENTIVE PROGRAM: Economic incentives for separation performance
        incentiveProgram: {
            ...INITIAL_INPUTS.separationScenarios.incentiveProgram,
            enableIncentives: true,             // Activate incentive program
            incentiveImpactHotels: 15,          // Economic incentives for tourism sector
            incentiveImpactRestaurants: 20,     // Strong incentives for restaurant program
            incentiveImpactHomes: 25,           // Community-level incentives
            incentiveImpactCommerce: 12,        // Business incentives program
            incentiveCostPerTon: 180,           // Optimized incentive structure
        },
        
        // CONTAINER PROGRAM: Infrastructure improvement for separation
        containerProgram: {
            ...INITIAL_INPUTS.separationScenarios.containerProgram,
            enableContainers: true,             // Activate container program
            containerImpactHotels: 8,           // Infrastructure support for hotels
            containerImpactRestaurants: 12,     // Specialized containers for restaurants
            containerImpactHomes: 15,           // Community container distribution
            containerImpactCommerce: 6,         // Commercial container upgrade
            containerCostPerUnit: 250,          // Bulk procurement cost optimization
        },
    },
};

/**
 * Calculate the total additional costs for the improved scenario
 * Used for ROI analysis and economic comparison
 */
const calculateImprovedScenarioCosts = () => {
    const dailyCosts = {
        // Infrastructure costs (amortized)
        transportUpgrade: 150,                  // Daily amortized cost of vessel and equipment
        collectionOptimization: 50,             // Technology and efficiency systems
        
        // Program operational costs
        educationProgram: (40 * 2673) / 365,    // Annual education cost per capita
        incentiveProgram: 0,                     // Variable cost based on separated tonnage
        containerProgram: 0,                     // One-time investment, amortized in container cost
        
        // Valorization operational costs (net costs calculated in simulation)
        valorization: 0,                        // Included in valorization cost calculations
    };
    
    const totalDailyCost = Object.values(dailyCosts).reduce((sum, cost) => sum + cost, 0);
    
    return {
        daily: dailyCosts,
        totalDaily: totalDailyCost,
        annual: totalDailyCost * 365
    };
};

/**
 * Comparison parameters for baseline vs improved scenario analysis
 * Used in simulation dashboard and thesis documentation
 */
const SCENARIO_COMPARISON = {
    baseline: {
        name: "Current System (Baseline)",
        description: "Validated current system with calibrated parameters",
        inputs: INITIAL_INPUTS
    },
    improved: {
        name: "Evidence-Based Improvement Scenario",
        description: "Integrated improvements targeting highest-impact variables",
        inputs: IMPROVED_SCENARIO_INPUTS
    }
};

/**
 * Expected improvements based on sensitivity analysis projections
 * Used for validation of simulation results
 */
const EXPECTED_IMPROVEMENTS = {
    collectionEfficiency: {
        baseline: 28.88,    // %
        target: 43.2,       // % (+49.6% improvement)
        tolerance: 3.0      // ± percentage points
    },
    totalSystemCost: {
        baseline: 41625,    // pesos/day
        target: 37800,      // pesos/day (-9.2% improvement)
        tolerance: 2000     // ± pesos/day
    },
    processingCapacityUtilization: {
        baseline: 97.33,    // %
        target: 68.5,       // % (-29.6% improvement)
        tolerance: 5.0      // ± percentage points
    },
    recoveryRate: {
        baseline: 5.55,     // %
        target: 8.2,        // % (+47.7% improvement)
        tolerance: 0.8      // ± percentage points
    },
    totalGeneration: {
        baseline: 27.70,    // tons/day
        target: 26.24,      // tons/day (-5.3% improvement)
        tolerance: 1.0      // ± tons/day
    }
};

/**
 * Implementation phases for gradual rollout
 * Used for implementation planning and risk management
 */
const IMPLEMENTATION_PHASES = {
    phase1: {
        name: "Foundation (Months 1-6)",
        description: "Transport enhancement + Collection optimization + Restaurant pilot",
        parameters: {
            // Partial implementation parameters
            finalTransportCapacity: 10,        // Intermediate upgrade
            collectionCost: 700,               // Partial optimization
            restaurantRate: 103,               // Moderate reduction
            enableComposting: true,            // Start with composting only
            enableEducation: true,             // Begin education program
        }
    },
    phase2: {
        name: "Expansion (Months 7-12)",
        description: "Full restaurant program + Enhanced valorization + Incentive programs",
        parameters: {
            // Near-full implementation
            finalTransportCapacity: 11,        // Near-target capacity
            collectionCost: 650,               // Advanced optimization
            restaurantRate: 97,                // Advanced reduction
            enableBiogas: true,                // Add biogas processing
            enableIncentives: true,            // Add economic incentives
        }
    },
    phase3: {
        name: "Optimization (Months 13-18)",
        description: "Full system optimization + Advanced features + Performance tuning",
        parameters: IMPROVED_SCENARIO_INPUTS   // Full implementation
    }
};

export { 
    IMPROVED_SCENARIO_INPUTS, 
    calculateImprovedScenarioCosts, 
    SCENARIO_COMPARISON, 
    EXPECTED_IMPROVEMENTS, 
    IMPLEMENTATION_PHASES 
};

export default IMPROVED_SCENARIO_INPUTS;