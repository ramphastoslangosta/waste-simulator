// ========================================================================
// FILE: sensitivity-execution.js
// PURPOSE: Execute comprehensive sensitivity analysis for THESIS-004
// USAGE: node sensitivity-execution.js
// ========================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Since we're running in Node.js, we need to simulate the React hook behavior
// This is a standalone execution script for the sensitivity analysis

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the initial state
const INITIAL_INPUTS = {
    general: { fixedPopulation: 2673, highSeasonOccupancy: 90, lowSeasonOccupancy: 20 },
    generation: {
        hotels: { units: 4524, rate: 1.2, sourceSeparationRate: 25 },
        restaurants: { units: 99, rate: 114.2, sourceSeparationRate: 15 },
        homes: { rate: 0.74, sourceSeparationRate: 5 },
        commerce: { units: 482, rate: 19.77, sourceSeparationRate: 30 },
    },
    separationScenarios: {
        enableEnhancedSeparation: false,
        educationProgram: {
            enableEducation: false,
            educationImpactHotels: 15,
            educationImpactRestaurants: 20,
            educationImpactHomes: 25,
            educationImpactCommerce: 10,
            educationCostPerCapita: 50,
        },
        incentiveProgram: {
            enableIncentives: false,
            incentiveImpactHotels: 20,
            incentiveImpactRestaurants: 25,
            incentiveImpactHomes: 30,
            incentiveImpactCommerce: 15,
            incentiveCostPerTon: 200,
        },
        containerProgram: {
            enableContainers: false,
            containerImpactHotels: 10,
            containerImpactRestaurants: 15,
            containerImpactHomes: 20,
            containerImpactCommerce: 8,
            containerCostPerUnit: 300,
        },
    },
    composition: {
        hotels: { organicos: 56, pet: 6, aluminio: 2, carton: 4, vidrio: 9, rechazo: 20, peligrosos: 3 },
        restaurants: { organicos: 56, pet: 6, aluminio: 2, carton: 4, vidrio: 9, rechazo: 20, peligrosos: 3 },
        homes: { organicos: 56, pet: 6, aluminio: 2, carton: 4, vidrio: 9, rechazo: 20, peligrosos: 3 },
        commerce: { organicos: 56, pet: 6, aluminio: 2, carton: 4, vidrio: 9, rechazo: 20, peligrosos: 3 },
    },
    rsuSystem: {
        logistics: { vehicles: 4, vehicleCapacity: 5, tripsPerVehicle: 2 },
        processing: { transferStationRate: 50, transferStationCapacity: 300, finalTransportCapacity: 8 },
        initialInventory: {
            collectionVehicles: 0,
            transferStation: 0,
            finalTransportVehicles: 0,
            disposalSite: 0
        },
        separation: {
            differentiatedCaptureRate: 90,
            rejectionRateSource: 15,
            plantSeparationEfficiency: { pet: 50, aluminio: 60, carton: 40, vidrio: 30 },
            informalRecoveryRateCollection: 2,
            informalRecoveryRateDisposal: 3,
        },
        valorization: {
            enableComposting: false,
            compostingEfficiency: 80,
            compostingCost: 200,
            compostIncome: 500,
            enableBiogas: false,
            biogasEfficiency: 60,
            biogasCost: 300,
            biogasIncome: 800,
            enablePlasticPyrolysis: false,
            pyrolysisEfficiency: 70,
            pyrolysisCost: 400,
            pyrolysisIncome: 600,
        },
        economics: {
            collectionCost: 800,
            transferStationCost: 150,
            finalTransportCost: 250,
            disposalCost: 400,
            income: { pet: 2500, aluminio: 15000, carton: 1200, vidrio: 300 }
        },
        leaks: { collectionLeak: 15, transferStationLeak: 1, finalTransportLeak: 0.5, disposalLeak: 2 },
    },
    specialWasteGeneration: { sargassumHigh: 50, sargassumLow: 5, construction: 5 },
    sargassumManagement: { collectionCost: 300, disposalCost: 100 },
    rcdManagement: { collectionCost: 400, disposalCost: 200 },
};

// Sensitivity analysis configuration
const SENSITIVITY_PARAMETERS = {
    'generation.hotels.rate': {
        basePath: ['generation', 'hotels', 'rate'],
        baseValue: 1.2,
        description: 'Hotel waste generation rate per room per day',
        unit: 'kg/cuarto/día'
    },
    'generation.restaurants.rate': {
        basePath: ['generation', 'restaurants', 'rate'],
        baseValue: 114.2,
        description: 'Restaurant waste generation rate per unit per day',
        unit: 'kg/unidad/día'
    },
    'general.highSeasonOccupancy': {
        basePath: ['general', 'highSeasonOccupancy'],
        baseValue: 90,
        description: 'High season occupancy rate',
        unit: '%'
    },
    'rsuSystem.processing.finalTransportCapacity': {
        basePath: ['rsuSystem', 'processing', 'finalTransportCapacity'],
        baseValue: 8,
        description: 'Final transport capacity to mainland',
        unit: 'tons/día'
    },
    'rsuSystem.leaks.collectionLeak': {
        basePath: ['rsuSystem', 'leaks', 'collectionLeak'],
        baseValue: 15,
        description: 'Collection system leak rate',
        unit: '%'
    },
    'rsuSystem.economics.collectionCost': {
        basePath: ['rsuSystem', 'economics', 'collectionCost'],
        baseValue: 800,
        description: 'Collection cost per ton',
        unit: 'pesos/ton'
    },
    'general.fixedPopulation': {
        basePath: ['general', 'fixedPopulation'],
        baseValue: 2673,
        description: 'Fixed resident population',
        unit: 'habitantes'
    }
};

const SENSITIVITY_KPIS = {
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
            const totalGen = baseline.rsu?.totalGeneration || 1;
            return ((totalGen - value) / totalGen) * 100;
        }
    },
    'processingCapacityUtilization': {
        extractPath: ['rsu', 'finalInventory'],
        description: 'Transfer station inventory levels',
        unit: 'tons',
        transform: (value, baseline) => {
            const capacity = 300;
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

const VARIATION_LEVELS = [-20, -10, 0, 10, 20];

// Utility functions
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

function setNestedValue(obj, path, value) {
    const cloned = deepClone(obj);
    let current = cloned;
    for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    return cloned;
}

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

// Simplified simulation engine (extracted from useWasteSimulation hook)
function calculateKpisForSeason(inputs, currentSeason) {
    const SIMULATION_DAYS = 30;
    const dailyResults = [];
    
    let rsuInventory = inputs.rsuSystem.initialInventory?.transferStation || 0;
    let collectionVehicleInventory = inputs.rsuSystem.initialInventory?.collectionVehicles || 0;
    let finalTransportInventory = inputs.rsuSystem.initialInventory?.finalTransportVehicles || 0;
    let disposalSiteInventory = inputs.rsuSystem.initialInventory?.disposalSite || 0;
    
    const materialTypes = ['organicos', 'pet', 'aluminio', 'carton', 'vidrio', 'rechazo', 'peligrosos'];
    const valorizableTypes = ['pet', 'aluminio', 'carton', 'vidrio'];

    for (let day = 0; day < SIMULATION_DAYS; day++) {
        const occupancy = currentSeason === 'high' ? inputs.general.highSeasonOccupancy : inputs.general.lowSeasonOccupancy;
        
        // Enhanced separation scenarios
        const getEnhancedSeparationRate = (baseRate, source) => {
            let enhancedRate = baseRate;
            
            if (inputs.separationScenarios?.educationProgram?.enableEducation) {
                const educationImpact = inputs.separationScenarios.educationProgram[`educationImpact${source.charAt(0).toUpperCase() + source.slice(1)}`] || 0;
                enhancedRate += educationImpact;
            }
            
            if (inputs.separationScenarios?.incentiveProgram?.enableIncentives) {
                const incentiveImpact = inputs.separationScenarios.incentiveProgram[`incentiveImpact${source.charAt(0).toUpperCase() + source.slice(1)}`] || 0;
                enhancedRate += incentiveImpact;
            }
            
            if (inputs.separationScenarios?.containerProgram?.enableContainers) {
                const containerImpact = inputs.separationScenarios.containerProgram[`containerImpact${source.charAt(0).toUpperCase() + source.slice(1)}`] || 0;
                enhancedRate += containerImpact;
            }
            
            return Math.min(enhancedRate, 95);
        };
        
        const enhancedSeparationRates = {
            hotels: getEnhancedSeparationRate(inputs.generation.hotels.sourceSeparationRate, 'hotels'),
            restaurants: getEnhancedSeparationRate(inputs.generation.restaurants.sourceSeparationRate, 'restaurants'),
            homes: getEnhancedSeparationRate(inputs.generation.homes.sourceSeparationRate, 'homes'),
            commerce: getEnhancedSeparationRate(inputs.generation.commerce.sourceSeparationRate, 'commerce'),
        };
        
        // RSU Generation
        const genBySource = {
            hotels: (inputs.generation.hotels.units * occupancy / 100) * inputs.generation.hotels.rate / 1000,
            restaurants: (inputs.generation.restaurants.units * inputs.generation.restaurants.rate) / 1000,
            homes: (inputs.general.fixedPopulation * inputs.generation.homes.rate) / 1000,
            commerce: (inputs.generation.commerce.units * inputs.generation.commerce.rate) / 1000,
        };
        
        const genByMaterial = { organicos: 0, pet: 0, aluminio: 0, carton: 0, vidrio: 0, rechazo: 0, peligrosos: 0 };
        for (const source in genBySource) {
            for (const material of materialTypes) {
                genByMaterial[material] += genBySource[source] * ((inputs.composition[source]?.[material] || 0) / 100);
            }
        }
        const genRSU = Object.values(genByMaterial).reduce((a, b) => a + b, 0);

        // Collection
        const collectionCapacity = inputs.rsuSystem.logistics.vehicles * inputs.rsuSystem.logistics.vehicleCapacity * inputs.rsuSystem.logistics.tripsPerVehicle;
        const collectionDeficit = Math.max(0, genRSU - collectionCapacity);
        const collectedWasteTotal = genRSU - collectionDeficit;
        
        const collectedRatio = genRSU > 0 ? collectedWasteTotal / genRSU : 0;
        const collectedByMaterial = {};
        materialTypes.forEach(m => collectedByMaterial[m] = genByMaterial[m] * collectedRatio);

        // Informal recovery at collection
        const informalRecoveryCollectionByMaterial = {};
        const wasteAfterInformalRec1 = {};
        valorizableTypes.forEach(m => {
            const recovered = collectedByMaterial[m] * (inputs.rsuSystem.separation.informalRecoveryRateCollection / 100);
            informalRecoveryCollectionByMaterial[m] = recovered;
            wasteAfterInformalRec1[m] = collectedByMaterial[m] - recovered;
        });
        ['organicos', 'rechazo', 'peligrosos'].forEach(m => wasteAfterInformalRec1[m] = collectedByMaterial[m]);
        const informalRecoveryCollection = Object.values(informalRecoveryCollectionByMaterial).reduce((a, b) => a + b, 0);

        // Collection leaks
        const wasteBeforeLeak = Object.values(wasteAfterInformalRec1).reduce((a, b) => a + b, 0);
        const leakCollection = wasteBeforeLeak * (inputs.rsuSystem.leaks.collectionLeak / 100);
        const leakRatio = wasteBeforeLeak > 0 ? leakCollection / wasteBeforeLeak : 0;
        
        const toTransferStationByMaterial = {};
        materialTypes.forEach(m => toTransferStationByMaterial[m] = (wasteAfterInformalRec1[m] || 0) * (1 - leakRatio));
        const toTransferStationTotal = Object.values(toTransferStationByMaterial).reduce((a, b) => a + b, 0);

        // Transfer station processing
        collectionVehicleInventory += toTransferStationTotal;
        const maxDeliveryCapacity = inputs.rsuSystem.logistics.vehicles * inputs.rsuSystem.logistics.vehicleCapacity * inputs.rsuSystem.logistics.tripsPerVehicle;
        const actualDelivery = Math.min(collectionVehicleInventory, maxDeliveryCapacity);
        collectionVehicleInventory -= actualDelivery;
        
        const materialAvailableInStation = rsuInventory + actualDelivery;
        const materialProcessedToday = Math.min(materialAvailableInStation, inputs.rsuSystem.processing.transferStationRate);
        
        const recoveredHighQuality = {};
        const recoveredLowQualityPlant = {};
        
        const processedRatio = toTransferStationTotal > 0 ? materialProcessedToday / toTransferStationTotal : 0;
        const processedByMaterial = {};
        materialTypes.forEach(m => processedByMaterial[m] = (toTransferStationByMaterial[m] || 0) * processedRatio);

        // Source separation recovery
        valorizableTypes.forEach(m => {
            let sourceSeparatedAmount = 0;
            for (const source in genBySource) {
                sourceSeparatedAmount += (genBySource[source] * ((inputs.composition[source]?.[m] || 0) / 100)) * (enhancedSeparationRates[source] / 100);
            }
            const captured = sourceSeparatedAmount * (inputs.rsuSystem.separation.differentiatedCaptureRate / 100) * collectedRatio * processedRatio;
            recoveredHighQuality[m] = captured * (1 - inputs.rsuSystem.separation.rejectionRateSource / 100);
        });

        // Plant separation recovery
        valorizableTypes.forEach(m => {
            const availableInMixed = Math.max(0, (processedByMaterial[m] || 0) - (recoveredHighQuality[m] || 0));
            recoveredLowQualityPlant[m] = availableInMixed * (inputs.rsuSystem.separation.plantSeparationEfficiency[m] / 100);
        });

        const totalRecoveredAtStation = Object.values(recoveredHighQuality).reduce((a,b)=>a+b,0) + Object.values(recoveredLowQualityPlant).reduce((a,b)=>a+b,0);
        
        // Valorization processes
        let valorizedMaterials = {
            composted: 0,
            biogas: 0,
            pyrolyzed: 0
        };
        let valorizationCosts = 0;
        let valorizationIncomes = 0;
        
        const availableOrganics = processedByMaterial.organicos || 0;
        const availablePlastics = (processedByMaterial.pet || 0);
        
        if (inputs.rsuSystem.valorization?.enableComposting && availableOrganics > 0) {
            const organicsToCompost = availableOrganics * (inputs.rsuSystem.valorization.compostingEfficiency / 100);
            valorizedMaterials.composted = organicsToCompost;
            valorizationCosts += organicsToCompost * inputs.rsuSystem.valorization.compostingCost;
            valorizationIncomes += organicsToCompost * inputs.rsuSystem.valorization.compostIncome;
        }
        
        if (inputs.rsuSystem.valorization?.enableBiogas && availableOrganics > 0) {
            const remainingOrganics = availableOrganics - valorizedMaterials.composted;
            if (remainingOrganics > 0) {
                const organicsForBiogas = remainingOrganics * (inputs.rsuSystem.valorization.biogasEfficiency / 100);
                valorizedMaterials.biogas = organicsForBiogas;
                valorizationCosts += organicsForBiogas * inputs.rsuSystem.valorization.biogasCost;
                valorizationIncomes += organicsForBiogas * inputs.rsuSystem.valorization.biogasIncome;
            }
        }
        
        if (inputs.rsuSystem.valorization?.enablePlasticPyrolysis && availablePlastics > 0) {
            const plasticsForPyrolysis = availablePlastics * (inputs.rsuSystem.valorization.pyrolysisEfficiency / 100);
            valorizedMaterials.pyrolyzed = plasticsForPyrolysis;
            valorizationCosts += plasticsForPyrolysis * inputs.rsuSystem.valorization.pyrolysisCost;
            valorizationIncomes += plasticsForPyrolysis * inputs.rsuSystem.valorization.pyrolysisIncome;
        }
        
        const totalValorizedMaterials = valorizedMaterials.composted + valorizedMaterials.biogas + valorizedMaterials.pyrolyzed;
        
        // Transfer station to final transport
        const leakTransferStation = materialProcessedToday * (inputs.rsuSystem.leaks.transferStationLeak / 100);
        const materialLeavingStation = materialProcessedToday - totalRecoveredAtStation - totalValorizedMaterials - leakTransferStation;

        finalTransportInventory += materialLeavingStation;
        const actualFinalTransport = Math.min(finalTransportInventory, inputs.rsuSystem.processing.finalTransportCapacity);
        finalTransportInventory -= actualFinalTransport;
        const untransportedMaterial = materialLeavingStation - actualFinalTransport;
        
        const leakFinalTransport = actualFinalTransport * (inputs.rsuSystem.leaks.finalTransportLeak / 100);
        const arrivedAtDisposal = actualFinalTransport - leakFinalTransport;
        
        disposalSiteInventory += arrivedAtDisposal;
        const toDisposalSite = arrivedAtDisposal;
        
        // Informal recovery at disposal
        let valorizablesToDisposal = 0;
        if(materialLeavingStation > 0) {
            const proportionOfValorizablesLeaving = valorizableTypes.reduce((sum, m) => sum + (processedByMaterial[m] || 0), 0) / materialProcessedToday;
            valorizablesToDisposal = toDisposalSite * proportionOfValorizablesLeaving;
        }
        const informalRecoveryDisposal = valorizablesToDisposal * (inputs.rsuSystem.separation.informalRecoveryRateDisposal / 100);
        
        const leakDisposal = toDisposalSite * (inputs.rsuSystem.leaks.disposalLeak / 100);
        const finalDisposal = toDisposalSite - informalRecoveryDisposal - leakDisposal;

        rsuInventory = materialAvailableInStation - materialProcessedToday + untransportedMaterial;
        rsuInventory = Math.min(rsuInventory, inputs.rsuSystem.processing.transferStationCapacity);

        // Economic calculations
        const totalCollectionCost = collectedWasteTotal * inputs.rsuSystem.economics.collectionCost;
        const totalTransferCost = materialProcessedToday * inputs.rsuSystem.economics.transferStationCost;
        const totalFinalTransportCost = actualFinalTransport * inputs.rsuSystem.economics.finalTransportCost;
        const totalDisposalCost = toDisposalSite * inputs.rsuSystem.economics.disposalCost;
        const totalRsuCosts = totalCollectionCost + totalTransferCost + totalFinalTransportCost + totalDisposalCost + valorizationCosts;

        const incomeByMaterial = {};
        valorizableTypes.forEach(m => {
            incomeByMaterial[m] = ((recoveredHighQuality[m] || 0) + (recoveredLowQualityPlant[m] || 0)) * inputs.rsuSystem.economics.income[m];
        });
        const totalRsuIncome = Object.values(incomeByMaterial).reduce((a, b) => a + b, 0) + valorizationIncomes;
        const netRsuCost = totalRsuCosts - totalRsuIncome;

        const rsuLeaks = collectionDeficit + leakCollection + leakTransferStation + leakFinalTransport + leakDisposal;
        const rsuRecovery = {
            source: Object.values(recoveredHighQuality).reduce((a, b) => a + b, 0),
            plant: Object.values(recoveredLowQualityPlant).reduce((a, b) => a + b, 0),
            informal: informalRecoveryCollection + informalRecoveryDisposal,
        };
        
        // Separation program costs
        let separationProgramCosts = 0;
        
        if (inputs.separationScenarios?.educationProgram?.enableEducation) {
            const annualEducationCost = inputs.general.fixedPopulation * inputs.separationScenarios.educationProgram.educationCostPerCapita;
            const touristPopulation = (inputs.generation.hotels.units * occupancy / 100) + 
                                    inputs.generation.restaurants.units * 3 +
                                    inputs.generation.commerce.units * 2;
            const totalEducationCost = (inputs.general.fixedPopulation + touristPopulation) * inputs.separationScenarios.educationProgram.educationCostPerCapita;
            separationProgramCosts += totalEducationCost / 365;
        }
        
        if (inputs.separationScenarios?.incentiveProgram?.enableIncentives) {
            const totalSeparatedMaterial = Object.values(recoveredHighQuality).reduce((a, b) => a + b, 0);
            separationProgramCosts += totalSeparatedMaterial * inputs.separationScenarios.incentiveProgram.incentiveCostPerTon;
        }
        
        if (inputs.separationScenarios?.containerProgram?.enableContainers) {
            const totalUnits = inputs.generation.hotels.units + inputs.generation.restaurants.units + 
                             inputs.generation.commerce.units + Math.ceil(inputs.general.fixedPopulation / 100);
            const annualContainerCost = totalUnits * inputs.separationScenarios.containerProgram.containerCostPerUnit / 5;
            separationProgramCosts += annualContainerCost / 365;
        }
        
        // Special wastes
        const sargassumGeneration = currentSeason === 'high' ? inputs.specialWasteGeneration.sargassumHigh : inputs.specialWasteGeneration.sargassumLow;
        const rcdGeneration = inputs.specialWasteGeneration.construction;
        const sargassumCost = sargassumGeneration * (inputs.sargassumManagement.collectionCost + inputs.sargassumManagement.disposalCost);
        const rcdCost = rcdGeneration * (inputs.rcdManagement.collectionCost + inputs.rcdManagement.disposalCost);

        const totalSystemCost = netRsuCost + sargassumCost + rcdCost + separationProgramCosts;
        
        dailyResults.push({
            totalGeneration: genRSU + sargassumGeneration + rcdGeneration,
            sargassumGeneration, rcdGeneration, sargassumCost, rcdCost, totalSystemCost,
            valorization: valorizedMaterials,
            valorizationCosts,
            valorizationIncomes,
            separationProgramCosts,
            enhancedSeparationRates,
            rsu: {
                totalGeneration: genRSU,
                collectionDeficit,
                totalLeak: rsuLeaks,
                finalInventory: rsuInventory,
                inventoryWaitTime: materialProcessedToday > 0 ? rsuInventory / materialProcessedToday : 0,
                inventoryLevels: {
                    collectionVehicles: collectionVehicleInventory,
                    transferStation: rsuInventory,
                    finalTransportVehicles: finalTransportInventory,
                    disposalSite: disposalSiteInventory
                },
                recoveryByStage: rsuRecovery,
                toDisposal: finalDisposal,
                totalRsuIncome,
                totalRsuCosts,
                netCostPerDay: netRsuCost,
                incomeByMaterial,
                genBySource,
            }
        });
    }

    // Average results over last 7 days for stability
    const stablePeriodResults = dailyResults.slice(Math.max(0, SIMULATION_DAYS - 7));
    const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const avgObj = (arrOfObjs) => {
        const sums = arrOfObjs.reduce((acc, obj) => {
            for (const key in obj) {
                acc[key] = (acc[key] || 0) + obj[key];
            }
            return acc;
        }, {});
        if (arrOfObjs.length > 0) {
            for (const key in sums) {
                sums[key] /= arrOfObjs.length;
            }
        }
        return sums;
    };

    return {
        totalGeneration: avg(stablePeriodResults.map(r => r.totalGeneration)),
        sargassumGeneration: avg(stablePeriodResults.map(r => r.sargassumGeneration)),
        rcdGeneration: avg(stablePeriodResults.map(r => r.rcdGeneration)),
        sargassumCost: avg(stablePeriodResults.map(r => r.sargassumCost)),
        rcdCost: avg(stablePeriodResults.map(r => r.rcdCost)),
        totalSystemCost: avg(stablePeriodResults.map(r => r.totalSystemCost)),
        valorization: avgObj(stablePeriodResults.map(r => r.valorization)),
        valorizationCosts: avg(stablePeriodResults.map(r => r.valorizationCosts)),
        valorizationIncomes: avg(stablePeriodResults.map(r => r.valorizationIncomes)),
        separationProgramCosts: avg(stablePeriodResults.map(r => r.separationProgramCosts)),
        enhancedSeparationRates: avgObj(stablePeriodResults.map(r => r.enhancedSeparationRates)),
        rsu: {
            totalGeneration: avg(stablePeriodResults.map(r => r.rsu.totalGeneration)),
            collectionDeficit: avg(stablePeriodResults.map(r => r.rsu.collectionDeficit)),
            totalLeak: avg(stablePeriodResults.map(r => r.rsu.totalLeak)),
            finalInventory: rsuInventory,
            inventoryWaitTime: avg(stablePeriodResults.map(r => r.rsu.inventoryWaitTime)),
            inventoryLevels: avgObj(stablePeriodResults.map(r => r.rsu.inventoryLevels)),
            recoveryByStage: avgObj(stablePeriodResults.map(r => r.rsu.recoveryByStage)),
            toDisposal: avg(stablePeriodResults.map(r => r.rsu.toDisposal)),
            netCostPerDay: avg(stablePeriodResults.map(r => r.rsu.netCostPerDay)),
            totalRsuIncome: avg(stablePeriodResults.map(r => r.rsu.totalRsuIncome)),
            totalRsuCosts: avg(stablePeriodResults.map(r => r.rsu.totalRsuCosts)),
            incomeByMaterial: avgObj(stablePeriodResults.map(r => r.rsu.incomeByMaterial)),
            genBySource: avgObj(stablePeriodResults.map(r => r.rsu.genBySource)),
        }
    };
}

function runSimulationWithParameters(inputs) {
    return {
        high: calculateKpisForSeason(inputs, 'high'),
        low: calculateKpisForSeason(inputs, 'low'),
    };
}

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

function generateVariationScenarios() {
    const scenarios = [];
    const baseInputs = deepClone(INITIAL_INPUTS);
    
    scenarios.push({
        scenarioName: 'baseline',
        parameterName: 'baseline',
        variationPercent: 0,
        inputs: baseInputs,
        parameterValue: null
    });
    
    for (const [paramName, paramConfig] of Object.entries(SENSITIVITY_PARAMETERS)) {
        for (const variation of VARIATION_LEVELS) {
            if (variation === 0) continue;
            
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

function executeSensitivityAnalysis() {
    const scenarios = generateVariationScenarios();
    const results = [];
    
    console.log(`\n🚀 THESIS-004 Sensitivity Analysis Execution`);
    console.log(`📊 Running ${scenarios.length} scenarios...`);
    console.log(`🎯 Parameters: ${Object.keys(SENSITIVITY_PARAMETERS).length}`);
    console.log(`📈 KPIs tracked: ${Object.keys(SENSITIVITY_KPIS).length}`);
    console.log(`🔄 Variation levels: ${VARIATION_LEVELS.filter(v => v !== 0).join('%, ')}%\n`);
    
    scenarios.forEach((scenario, index) => {
        process.stdout.write(`\r🔄 Progress: ${index + 1}/${scenarios.length} - ${scenario.scenarioName}`);
        
        const simulationResults = runSimulationWithParameters(scenario.inputs);
        
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
    
    console.log(`\n✅ Analysis completed successfully!\n`);
    return results;
}

function calculateSensitivityIndices(results) {
    const baselineScenario = results.find(r => r.parameterName === 'baseline');
    if (!baselineScenario) {
        throw new Error('Baseline scenario not found in results');
    }
    
    const sensitivityIndices = {};
    
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
    
    ['high', 'low'].forEach(season => {
        Object.keys(SENSITIVITY_KPIS).forEach(kpiName => {
            const baselineValue = baselineScenario.results[season][kpiName];
            
            Object.keys(SENSITIVITY_PARAMETERS).forEach(paramName => {
                const positiveScenario = results.find(r => 
                    r.parameterName === paramName && r.variationPercent === 20
                );
                const negativeScenario = results.find(r => 
                    r.parameterName === paramName && r.variationPercent === -20
                );
                
                if (positiveScenario && negativeScenario) {
                    const positiveValue = positiveScenario.results[season][kpiName];
                    const negativeValue = negativeScenario.results[season][kpiName];
                    
                    const sensitivityIndex = ((positiveValue - negativeValue) / (2 * 20)) * 100;
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

function rankParametersByImpact(sensitivityIndices, season = 'high') {
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

function exportResultsToCSV(results, sensitivityIndices) {
    const csvRows = [];
    
    const headers = [
        'Scenario',
        'Parameter',
        'Variation_%',
        'Parameter_Value',
        'Season'
    ];
    
    Object.keys(SENSITIVITY_KPIS).forEach(kpiName => {
        headers.push(`${kpiName}_Value`);
    });
    
    Object.keys(SENSITIVITY_KPIS).forEach(kpiName => {
        headers.push(`${kpiName}_SensitivityIndex`);
        headers.push(`${kpiName}_RelativeSensitivity`);
    });
    
    csvRows.push(headers.join(','));
    
    results.forEach(scenario => {
        ['high', 'low'].forEach(season => {
            const row = [
                scenario.scenarioName,
                scenario.parameterName,
                scenario.variationPercent,
                scenario.parameterValue || '',
                season
            ];
            
            Object.keys(SENSITIVITY_KPIS).forEach(kpiName => {
                row.push(scenario.results[season][kpiName] || '');
            });
            
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

// Main execution
async function main() {
    try {
        console.log('🎯 THESIS-004: Comprehensive Sensitivity Analysis for Isla Holbox Waste Management');
        console.log('=' .repeat(80));
        
        // Execute sensitivity analysis
        const results = executeSensitivityAnalysis();
        
        // Calculate sensitivity indices
        console.log('📊 Calculating sensitivity indices...');
        const sensitivityIndices = calculateSensitivityIndices(results);
        
        // Rank parameters by impact
        console.log('🏆 Ranking parameters by impact...');
        const highSeasonRanking = rankParametersByImpact(sensitivityIndices, 'high');
        const lowSeasonRanking = rankParametersByImpact(sensitivityIndices, 'low');
        
        // Export results to CSV
        console.log('📁 Exporting results to CSV...');
        const csvData = exportResultsToCSV(results, sensitivityIndices);
        
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Save CSV file
        const csvPath = path.join(dataDir, 'sensitivity-results.csv');
        fs.writeFileSync(csvPath, csvData);
        
        // Save detailed results as JSON
        const resultsPath = path.join(dataDir, 'sensitivity-analysis-detailed.json');
        const detailedResults = {
            metadata: {
                timestamp: new Date().toISOString(),
                parameters: SENSITIVITY_PARAMETERS,
                kpis: SENSITIVITY_KPIS,
                variations: VARIATION_LEVELS,
                totalScenarios: results.length
            },
            results,
            sensitivityIndices,
            rankings: {
                high: highSeasonRanking,
                low: lowSeasonRanking
            }
        };
        fs.writeFileSync(resultsPath, JSON.stringify(detailedResults, null, 2));
        
        // Display summary
        console.log('\n📋 SENSITIVITY ANALYSIS SUMMARY');
        console.log('=' .repeat(50));
        console.log(`✅ Total scenarios executed: ${results.length}`);
        console.log(`📊 Parameters analyzed: ${Object.keys(SENSITIVITY_PARAMETERS).length}`);
        console.log(`📈 KPIs tracked: ${Object.keys(SENSITIVITY_KPIS).length}`);
        console.log(`📁 Results saved to: ${csvPath}`);
        console.log(`📄 Detailed analysis: ${resultsPath}`);
        
        console.log('\n🏆 TOP 5 MOST INFLUENTIAL PARAMETERS (High Season):');
        console.log('-'.repeat(50));
        highSeasonRanking.slice(0, 5).forEach((param, index) => {
            console.log(`${index + 1}. ${param.parameter}`);
            console.log(`   ${param.description}`);
            console.log(`   Average Impact: ${param.averageImpact.toFixed(2)}%`);
            console.log('');
        });
        
        console.log('🎯 Analysis completed! Ready for THESIS-004 policy recommendations.');
        
    } catch (error) {
        console.error('❌ Error executing sensitivity analysis:', error);
        process.exit(1);
    }
}

// Execute if run directly
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFilePath) {
    main().catch(console.error);
}