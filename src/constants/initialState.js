// ========================================================================
// FILE: src/constants/initialState.js
// ========================================================================
export const INITIAL_INPUTS = {
    general: { fixedPopulation: 2500, highSeasonOccupancy: 90, lowSeasonOccupancy: 20 },
    generation: {
        hotels: { units: 3000, rate: 1.5, sourceSeparationRate: 25 },
        restaurants: { units: 200, rate: 30, sourceSeparationRate: 15 },
        homes: { rate: 0.9, sourceSeparationRate: 5 },
        commerce: { units: 300, rate: 8, sourceSeparationRate: 30 },
    },
    // Waste Separation at Generation Scenarios
    separationScenarios: {
        enableEnhancedSeparation: false,     // Enable enhanced separation program
        educationProgram: {
            enableEducation: false,          // Enable education and awareness program
            educationImpactHotels: 15,       // Additional % increase in separation for hotels
            educationImpactRestaurants: 20,  // Additional % increase in separation for restaurants  
            educationImpactHomes: 25,        // Additional % increase in separation for homes
            educationImpactCommerce: 10,     // Additional % increase in separation for commerce
            educationCostPerCapita: 50,      // MXN/person/year - Cost of education program
        },
        incentiveProgram: {
            enableIncentives: false,         // Enable economic incentive program
            incentiveImpactHotels: 20,       // Additional % increase in separation for hotels
            incentiveImpactRestaurants: 25,  // Additional % increase in separation for restaurants
            incentiveImpactHomes: 30,        // Additional % increase in separation for homes
            incentiveImpactCommerce: 15,     // Additional % increase in separation for commerce
            incentiveCostPerTon: 200,        // MXN/ton - Cost of incentive program per ton of separated waste
        },
        containerProgram: {
            enableContainers: false,         // Enable improved container distribution
            containerImpactHotels: 10,       // Additional % increase in separation for hotels
            containerImpactRestaurants: 15,  // Additional % increase in separation for restaurants
            containerImpactHomes: 20,        // Additional % increase in separation for homes
            containerImpactCommerce: 8,      // Additional % increase in separation for commerce
            containerCostPerUnit: 300,       // MXN/unit - Cost per container set (hotels: cuartos, rest/com: locales, homes: per 100 hab)
        },
    },
    composition: {
        hotels: { organicos: 45, pet: 12, aluminio: 5, carton: 10, vidrio: 3, rechazo: 20, peligrosos: 5 },
        restaurants: { organicos: 70, pet: 5, aluminio: 3, carton: 8, vidrio: 4, rechazo: 8, peligrosos: 2 },
        homes: { organicos: 60, pet: 10, aluminio: 2, carton: 8, vidrio: 5, rechazo: 12, peligrosos: 3 },
        commerce: { organicos: 20, pet: 25, aluminio: 10, carton: 20, vidrio: 5, rechazo: 18, peligrosos: 2 },
    },
    rsuSystem: {
        logistics: { vehicles: 4, vehicleCapacity: 5, tripsPerVehicle: 2 },
        processing: { transferStationRate: 50, transferStationCapacity: 150, finalTransportCapacity: 40 },
        initialInventory: {
            collectionVehicles: 0,           // ton - Initial waste in collection vehicles at day 0
            transferStation: 0,              // ton - Initial waste inventory at transfer station at day 0  
            finalTransportVehicles: 0,       // ton - Initial waste in final transport vehicles at day 0
            disposalSite: 0                  // ton - Initial waste inventory at disposal site at day 0
        },
        separation: {
            differentiatedCaptureRate: 90,
            rejectionRateSource: 15,
            plantSeparationEfficiency: { pet: 50, aluminio: 60, carton: 40, vidrio: 30 },
            informalRecoveryRateCollection: 2,
            informalRecoveryRateDisposal: 3,
        },
        // Waste Valorization Scenarios at Transfer Station
        valorization: {
            enableComposting: false,         // Enable composting of organic waste
            compostingEfficiency: 80,        // % of organics that can be successfully composted
            compostingCost: 200,             // MXN/ton - Cost of composting process
            compostIncome: 500,              // MXN/ton - Income from compost sales
            enableBiogas: false,             // Enable biogas generation from organics
            biogasEfficiency: 60,            // % of organics that can be processed for biogas
            biogasCost: 300,                 // MXN/ton - Cost of biogas process
            biogasIncome: 800,               // MXN/ton - Income from biogas sales
            enablePlasticPyrolysis: false,   // Enable pyrolysis of plastic waste
            pyrolysisEfficiency: 70,         // % of plastics that can be pyrolyzed
            pyrolysisCost: 400,              // MXN/ton - Cost of pyrolysis process
            pyrolysisIncome: 600,            // MXN/ton - Income from pyrolysis products
        },
        economics: {
            collectionCost: 800,
            transferStationCost: 150,
            finalTransportCost: 250,
            disposalCost: 400,
            income: { pet: 2500, aluminio: 15000, carton: 1200, vidrio: 300 }
        },
        leaks: { collectionLeak: 2, transferStationLeak: 1, finalTransportLeak: 0.5, disposalLeak: 5 },
    },
    specialWasteGeneration: { sargassumHigh: 50, sargassumLow: 5, construction: 5 },
    sargassumManagement: { collectionCost: 300, disposalCost: 100 },
    rcdManagement: { collectionCost: 400, disposalCost: 200 },
};