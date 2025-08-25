// Economics Module - Pure functions for economic calculations (costs, income, ROI)
// Extracted from useWasteSimulation.tsx for better testability and maintainability

import { CollectionResults } from './collection';
import { SeparationResults } from './separation';
import { ValorizationResults } from './valorization';
import { InventoryResults } from './inventory';

export interface EconomicsInputs {
  general: {
    fixedPopulation: number;
  };
  generation: {
    hotels: { units: number };
    restaurants: { units: number };
    commerce: { units: number };
  };
  rsuSystem: {
    economics: {
      collectionCost: number;
      transferStationCost: number;
      disposalCost: number;
      income: { [material: string]: number };
    };
  };
  separationScenarios?: {
    educationProgram?: {
      enableEducation: boolean;
      educationCostPerCapita: number;
    };
    incentiveProgram?: {
      enableIncentives: boolean;
      incentiveCostPerTon: number;
    };
    containerProgram?: {
      enableContainers: boolean;
      containerCostPerUnit: number;
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

export interface EconomicsResults {
  rsuCosts: {
    totalCollectionCost: number;
    totalTransferCost: number;
    totalFinalTransportCost: number;
    totalDisposalCost: number;
    totalRsuCosts: number;
  };
  rsuIncome: {
    incomeByMaterial: { [material: string]: number };
    totalRsuIncome: number;
  };
  netCosts: {
    netRsuCost: number;
  };
  programCosts: {
    separationProgramCosts: number;
  };
  specialWasteCosts: {
    sargassumCost: number;
    rcdCost: number;
  };
  totalSystemCost: number;
}

const valorizableTypes = ['pet', 'aluminio', 'carton', 'vidrio'];

/**
 * Calculate comprehensive economic metrics for the waste management system
 * Pure function that handles all cost and income calculations
 */
export function calculateEconomics(
  collectionResults: CollectionResults,
  separationResults: SeparationResults,
  valorizationResults: ValorizationResults,
  inventoryResults: InventoryResults,
  flows: {
    materialProcessedToday: number;
    occupancy: number;
  },
  inputs: EconomicsInputs,
  season: 'high' | 'low'
): EconomicsResults {
  
  // --- RSU SYSTEM COSTS ---
  const totalCollectionCost = collectionResults.collectedWasteTotal * inputs.rsuSystem.economics.collectionCost;
  const totalTransferCost = flows.materialProcessedToday * inputs.rsuSystem.economics.transferStationCost;
  const { totalFinalTransportCost } = inventoryResults.transportCosts;
  const totalDisposalCost = inventoryResults.finalTransportFlows.toDisposalSite * inputs.rsuSystem.economics.disposalCost;
  const totalRsuCosts = totalCollectionCost + totalTransferCost + totalFinalTransportCost + totalDisposalCost + valorizationResults.valorizationCosts;

  // --- RSU SYSTEM INCOME ---
  const incomeByMaterial: { [material: string]: number } = {};
  valorizableTypes.forEach(m => {
    incomeByMaterial[m] = ((separationResults.recoveredHighQuality[m] || 0) + 
                          (separationResults.recoveredLowQualityPlant[m] || 0)) * 
                          inputs.rsuSystem.economics.income[m];
  });
  const totalRsuIncome = Object.values(incomeByMaterial).reduce((a, b) => a + b, 0) + valorizationResults.valorizationIncomes;
  const netRsuCost = totalRsuCosts - totalRsuIncome;

  // --- SEPARATION SCENARIO COSTS ---
  let separationProgramCosts = 0;
  
  // Education Program Costs
  if (inputs.separationScenarios?.educationProgram?.enableEducation) {
    const touristPopulation = (inputs.generation.hotels.units * flows.occupancy / 100) + 
                            inputs.generation.restaurants.units * 3 + // Estimate 3 people per restaurant
                            inputs.generation.commerce.units * 2; // Estimate 2 people per commerce
    const totalEducationCost = (inputs.general.fixedPopulation + touristPopulation) * 
                              inputs.separationScenarios.educationProgram.educationCostPerCapita;
    separationProgramCosts += totalEducationCost / 365; // Convert annual to daily cost
  }
  
  // Incentive Program Costs
  if (inputs.separationScenarios?.incentiveProgram?.enableIncentives) {
    const totalSeparatedMaterial = Object.values(separationResults.recoveredHighQuality).reduce((a, b) => a + b, 0);
    separationProgramCosts += totalSeparatedMaterial * inputs.separationScenarios.incentiveProgram.incentiveCostPerTon;
  }
  
  // Container Program Costs (one-time cost amortized over 5 years)
  if (inputs.separationScenarios?.containerProgram?.enableContainers) {
    const totalUnits = inputs.generation.hotels.units + inputs.generation.restaurants.units + 
                     inputs.generation.commerce.units + Math.ceil(inputs.general.fixedPopulation / 100);
    const annualContainerCost = totalUnits * inputs.separationScenarios.containerProgram.containerCostPerUnit / 5; // 5-year amortization
    separationProgramCosts += annualContainerCost / 365; // Convert annual to daily cost
  }

  // --- SPECIAL WASTE COSTS ---
  const sargassumGeneration = season === 'high' ? inputs.specialWasteGeneration.sargassumHigh : inputs.specialWasteGeneration.sargassumLow;
  const rcdGeneration = inputs.specialWasteGeneration.construction;
  const sargassumCost = sargassumGeneration * (inputs.sargassumManagement.collectionCost + inputs.sargassumManagement.disposalCost);
  const rcdCost = rcdGeneration * (inputs.rcdManagement.collectionCost + inputs.rcdManagement.disposalCost);

  // --- TOTAL SYSTEM COST ---
  const totalSystemCost = netRsuCost + sargassumCost + rcdCost + separationProgramCosts;
  
  return {
    rsuCosts: {
      totalCollectionCost,
      totalTransferCost,
      totalFinalTransportCost,
      totalDisposalCost,
      totalRsuCosts,
    },
    rsuIncome: {
      incomeByMaterial,
      totalRsuIncome,
    },
    netCosts: {
      netRsuCost,
    },
    programCosts: {
      separationProgramCosts,
    },
    specialWasteCosts: {
      sargassumCost,
      rcdCost,
    },
    totalSystemCost,
  };
}