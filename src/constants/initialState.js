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
    composition: {
        hotels: { organicos: 45, pet: 12, aluminio: 5, carton: 10, vidrio: 3, rechazo: 20, peligrosos: 5 },
        restaurants: { organicos: 70, pet: 5, aluminio: 3, carton: 8, vidrio: 4, rechazo: 8, peligrosos: 2 },
        homes: { organicos: 60, pet: 10, aluminio: 2, carton: 8, vidrio: 5, rechazo: 12, peligrosos: 3 },
        commerce: { organicos: 20, pet: 25, aluminio: 10, carton: 20, vidrio: 5, rechazo: 18, peligrosos: 2 },
    },
    rsuSystem: {
        logistics: { vehicles: 4, vehicleCapacity: 5, tripsPerVehicle: 2 },
        processing: { transferStationRate: 50, transferStationCapacity: 150, finalTransportCapacity: 40 },
        separation: {
            differentiatedCaptureRate: 90,
            rejectionRateSource: 15,
            plantSeparationEfficiency: { pet: 50, aluminio: 60, carton: 40, vidrio: 30 },
            informalRecoveryRateCollection: 2,
            informalRecoveryRateDisposal: 3,
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