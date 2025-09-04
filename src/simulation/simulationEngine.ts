// Simulation Engine - Central orchestrator for waste management simulation
// Coordinates all simulation modules in proper sequence for daily calculations

import { calculateGeneration, GenerationResults } from './modules/generation';
import { processCollection, CollectionResults } from './modules/collection';
import { processSeparation, SeparationResults } from './modules/separation';
import { processValorization, ValorizationResults } from './modules/valorization';
import { updateInventoriesAndFlows, InventoryResults, InventoryState } from './modules/inventory';
import { calculateEconomics, EconomicsResults } from './modules/economics';

export interface SimulationInputs {
  general: {
    fixedPopulation: number;
    highSeasonOccupancy: number;
    lowSeasonOccupancy: number;
  };
  generation: {
    hotels: { units: number; rate: number; sourceSeparationRate: number };
    restaurants: { units: number; rate: number; sourceSeparationRate: number };
    homes: { units: number; rate: number; sourceSeparationRate: number };
    commerce: { units: number; rate: number; sourceSeparationRate: number };
  };
  composition: {
    [source: string]: { [material: string]: number };
  };
  rsuSystem: {
    initialInventory?: {
      transferStation?: number;
      collectionVehicles?: number;
      finalTransportVehicles?: number;
      disposalSite?: number;
    };
    logistics: {
      vehicles: number;
      vehicleCapacity: number;
      tripsPerVehicle: number;
    };
    processing: {
      transferStationRate: number;
      transferStationCapacity: number;
      finalTransportCapacity: number;
    };
    separation: {
      differentiatedCaptureRate: number;
      rejectionRateSource: number;
      plantSeparationEfficiency: { [material: string]: number };
      informalRecoveryRateCollection: number;
      informalRecoveryRateDisposal: number;
    };
    leaks: {
      collectionLeak: number;
      transferStationLeak: number;
      finalTransportLeak: number;
      disposalLeak: number;
    };
    economics: {
      collectionCost: number;
      transferStationCost: number;
      finalTransportCost: number;
      disposalCost: number;
      income: { [material: string]: number };
    };
    valorization?: {
      enableComposting?: boolean;
      compostingEfficiency?: number;
      compostingCost?: number;
      compostIncome?: number;
      enableBiogas?: boolean;
      biogasEfficiency?: number;
      biogasCost?: number;
      biogasIncome?: number;
      enablePlasticPyrolysis?: boolean;
      pyrolysisEfficiency?: number;
      pyrolysisCost?: number;
      pyrolysisIncome?: number;
    };
  };
  separationScenarios?: {
    educationProgram?: {
      enableEducation: boolean;
      educationCostPerCapita: number;
      [key: string]: any;
    };
    incentiveProgram?: {
      enableIncentives: boolean;
      incentiveCostPerTon: number;
      [key: string]: any;
    };
    containerProgram?: {
      enableContainers: boolean;
      containerCostPerUnit: number;
      [key: string]: any;
    };
  };
  specialWasteGeneration: {
    sargassumHigh: number;
    sargassumLow: number;
    construction: number;
  };
  sargassumManagement: {
    collectionCost: number;
    disposalCost: number;
  };
  rcdManagement: {
    collectionCost: number;
    disposalCost: number;
  };
}

export interface DailyResults {
  totalGeneration: number;
  sargassumGeneration: number;
  rcdGeneration: number;
  sargassumCost: number;
  rcdCost: number;
  totalSystemCost: number;
  valorization: {
    composted: number;
    biogas: number;
    pyrolyzed: number;
  };
  valorizationCosts: number;
  valorizationIncomes: number;
  separationProgramCosts: number;
  enhancedSeparationRates: { [source: string]: number };
  rsu: {
    totalGeneration: number;
    collectionDeficit: number;
    totalLeak: number;
    finalInventory: number;
    inventoryWaitTime: number;
    inventoryLevels: InventoryState;
    recoveryByStage: {
      source: number;
      plant: number;
      informal: number;
    };
    toDisposal: number;
    totalRsuIncome: number;
    totalRsuCosts: number;
    netCostPerDay: number;
    incomeByMaterial: { [material: string]: number };
    genBySource: { [source: string]: number };
    calculations: {
      genBySource: { [source: string]: number };
      collectionCapacity: number;
      collectedWasteTotal: number;
      informalRecoveryCollection: number;
      leakCollection: number;
      toTransferStationTotal: number;
      materialProcessedToday: number;
      totalRecoveredAtStation: number;
      leakTransferStation: number;
      toFinalTransport: number;
      actualFinalTransport: number;
      untransportedMaterial: number;
      leakFinalTransport: number;
      toDisposalSite: number;
      informalRecoveryDisposal: number;
      leakDisposal: number;
      totalCollectionCost: number;
      totalTransferCost: number;
      totalFinalTransportCost: number;
      totalDisposalCost: number;
    };
  };
}

export interface SimulationResults {
  high: DailyResults;
  low: DailyResults;
}

const SIMULATION_DAYS = 30;
const materialTypes = ['organicos', 'pet', 'aluminio', 'carton', 'vidrio', 'rechazo', 'peligrosos'];
const valorizableTypes = ['pet', 'aluminio', 'carton', 'vidrio'];

/**
 * Execute one day of simulation with all modules coordinated
 */
function runDailyStep(
  currentInventory: InventoryState,
  inputs: SimulationInputs,
  season: 'high' | 'low'
): { results: DailyResults; updatedInventory: InventoryState } {
  const occupancy = season === 'high' ? inputs.general.highSeasonOccupancy : inputs.general.lowSeasonOccupancy;
  
  // --- GENERATION MODULE ---
  const generationResults: GenerationResults = calculateGeneration(inputs, occupancy);
  const { genBySource, genByMaterial, genRSU, enhancedSeparationRates } = generationResults;

  // --- COLLECTION MODULE ---
  const collectionResults: CollectionResults = processCollection(generationResults, inputs);
  const {
    collectionCapacity,
    collectionDeficit,
    collectedWasteTotal,
    collectedRatio,
    informalRecoveryCollection,
    leakCollection,
    toTransferStationTotal,
  } = collectionResults;

  // --- SEPARATION MODULE ---
  // CRITICAL FIX: Add collected material to vehicle inventory before processing
  const updatedCollectionInventory = currentInventory.collectionVehicleInventory + toTransferStationTotal;
  
  const separationData = processSeparation(
    generationResults,
    collectionResults,
    inputs,
    { collectionVehicleInventory: updatedCollectionInventory, rsuInventory: currentInventory.rsuInventory }
  );
  const {
    materialAvailableInStation,
    materialProcessedToday,
    recoveredHighQuality,
    recoveredLowQualityPlant,
    totalRecoveredAtStation,
  } = separationData.results;
  
  // Update inventories from separation module
  const updatedFromSeparation: InventoryState = {
    collectionVehicleInventory: separationData.updatedInventory.collectionVehicleInventory,
    rsuInventory: separationData.updatedInventory.rsuInventory,
    finalTransportInventory: currentInventory.finalTransportInventory,
    disposalSiteInventory: currentInventory.disposalSiteInventory,
  };
  
  // --- VALORIZATION MODULE ---
  const valorizationResults: ValorizationResults = processValorization(
    separationData.results.processedByMaterial,
    materialProcessedToday,
    totalRecoveredAtStation,
    inputs
  );
  const {
    valorizedMaterials,
    valorizationCosts,
    valorizationIncomes,
    leakTransferStation,
    materialLeavingStation,
  } = valorizationResults;
  
  // --- INVENTORY & FINAL DISPOSAL MODULE ---
  let valorizablesToDisposal = 0;
  if(materialLeavingStation > 0) {
    const proportionOfValorizablesLeaving = valorizableTypes.reduce((sum, m) => sum + (separationData.results.processedByMaterial[m] || 0), 0) / materialProcessedToday;
    valorizablesToDisposal = materialLeavingStation * proportionOfValorizablesLeaving;
  }
  
  const inventoryResults: InventoryResults = updateInventoriesAndFlows(
    updatedFromSeparation,
    {
      materialLeavingStation,
      materialProcessedToday,
      materialAvailableInStation,
      valorizablesToDisposal
    },
    inputs
  );
  
  const { actualFinalTransport, untransportedMaterial, leakFinalTransport, toDisposalSite } = inventoryResults.finalTransportFlows;
  const { informalRecoveryDisposal, leakDisposal, finalDisposal } = inventoryResults.disposalFlows;
  
  // --- ECONOMICS MODULE ---
  const economicsResults: EconomicsResults = calculateEconomics(
    collectionResults,
    separationData.results,
    valorizationResults,
    inventoryResults,
    { materialProcessedToday, occupancy },
    inputs,
    season
  );
  
  const { totalCollectionCost, totalTransferCost, totalFinalTransportCost, totalDisposalCost, totalRsuCosts } = economicsResults.rsuCosts;
  const { incomeByMaterial, totalRsuIncome } = economicsResults.rsuIncome;
  const { netRsuCost } = economicsResults.netCosts;
  const { separationProgramCosts } = economicsResults.programCosts;
  const { sargassumCost, rcdCost } = economicsResults.specialWasteCosts;
  const { totalSystemCost } = economicsResults;
  
  // Extract special waste generations for compatibility
  const sargassumGeneration = season === 'high' ? inputs.specialWasteGeneration.sargassumHigh : inputs.specialWasteGeneration.sargassumLow;
  const rcdGeneration = inputs.specialWasteGeneration.construction;
  
  const rsuLeaks = collectionDeficit + leakCollection + leakTransferStation + leakFinalTransport + leakDisposal;
  const rsuRecovery = {
    source: Object.values(recoveredHighQuality).reduce((a, b) => a + b, 0),
    plant: Object.values(recoveredLowQualityPlant).reduce((a, b) => a + b, 0),
    informal: informalRecoveryCollection + informalRecoveryDisposal,
  };
  
  const dailyResult: DailyResults = {
    totalGeneration: genRSU + sargassumGeneration + rcdGeneration,
    sargassumGeneration, 
    rcdGeneration, 
    sargassumCost, 
    rcdCost, 
    totalSystemCost,
    valorization: valorizedMaterials,
    valorizationCosts,
    valorizationIncomes,
    separationProgramCosts,
    enhancedSeparationRates,
    rsu: {
      totalGeneration: genRSU,
      collectionDeficit,
      totalLeak: rsuLeaks,
      finalInventory: inventoryResults.inventoryLevels.rsuInventory,
      inventoryWaitTime: materialProcessedToday > 0 ? inventoryResults.inventoryLevels.rsuInventory / materialProcessedToday : 0,
      inventoryLevels: inventoryResults.inventoryLevels,
      recoveryByStage: rsuRecovery,
      toDisposal: finalDisposal,
      totalRsuIncome,
      totalRsuCosts,
      netCostPerDay: netRsuCost,
      incomeByMaterial,
      genBySource,
      calculations: {
        genBySource,
        collectionCapacity, 
        collectedWasteTotal, 
        informalRecoveryCollection, 
        leakCollection, 
        toTransferStationTotal,
        materialProcessedToday, 
        totalRecoveredAtStation, 
        leakTransferStation, 
        toFinalTransport: materialLeavingStation,
        actualFinalTransport, 
        untransportedMaterial, 
        leakFinalTransport, 
        toDisposalSite, 
        informalRecoveryDisposal, 
        leakDisposal,
        totalCollectionCost, 
        totalTransferCost, 
        totalFinalTransportCost, 
        totalDisposalCost
      }
    }
  };
  
  return {
    results: dailyResult,
    updatedInventory: inventoryResults.inventoryLevels
  };
}

/**
 * Run complete simulation for specified season
 * Orchestrates daily steps and calculates averaged final KPIs
 */
export function runSimulation(inputs: SimulationInputs, season: 'high' | 'low'): DailyResults {
  const dailyResults: DailyResults[] = [];
  
  // Initialize inventories from input parameters
  let currentInventory: InventoryState = {
    collectionVehicleInventory: inputs.rsuSystem.initialInventory?.collectionVehicles || 0,
    rsuInventory: inputs.rsuSystem.initialInventory?.transferStation || 0,
    finalTransportInventory: inputs.rsuSystem.initialInventory?.finalTransportVehicles || 0,
    disposalSiteInventory: inputs.rsuSystem.initialInventory?.disposalSite || 0,
  };
  
  // Run simulation for SIMULATION_DAYS
  for (let day = 0; day < SIMULATION_DAYS; day++) {
    const dailyStep = runDailyStep(currentInventory, inputs, season);
    dailyResults.push(dailyStep.results);
    currentInventory = dailyStep.updatedInventory;
  }
  
  // --- Average results for stability (final 7 days) ---
  const stablePeriodResults = dailyResults.slice(Math.max(0, SIMULATION_DAYS - 7));
  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const avgObj = (arrOfObjs: any[]) => {
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
  
  const finalKpis: DailyResults = {
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
      finalInventory: currentInventory.rsuInventory,
      inventoryWaitTime: avg(stablePeriodResults.map(r => r.rsu.inventoryWaitTime)),
      inventoryLevels: avgObj(stablePeriodResults.map(r => r.rsu.inventoryLevels)),
      recoveryByStage: avgObj(stablePeriodResults.map(r => r.rsu.recoveryByStage)),
      toDisposal: avg(stablePeriodResults.map(r => r.rsu.toDisposal)),
      netCostPerDay: avg(stablePeriodResults.map(r => r.rsu.netCostPerDay)),
      totalRsuIncome: avg(stablePeriodResults.map(r => r.rsu.totalRsuIncome)),
      totalRsuCosts: avg(stablePeriodResults.map(r => r.rsu.totalRsuCosts)),
      incomeByMaterial: avgObj(stablePeriodResults.map(r => r.rsu.incomeByMaterial)),
      genBySource: avgObj(stablePeriodResults.map(r => r.rsu.genBySource)),
      calculations: avgObj(stablePeriodResults.map(r => r.rsu.calculations)),
    }
  };
  
  return finalKpis;
}