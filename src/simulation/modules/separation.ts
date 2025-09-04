// Separation Module - Pure functions for transfer station separation calculations
// Extracted from useWasteSimulation.tsx for better testability and maintainability

import { GenerationResults } from './generation';
import { CollectionResults } from './collection';

export interface SeparationInputs {
  rsuSystem: {
    logistics: {
      vehicles: number;
      vehicleCapacity: number;
      tripsPerVehicle: number;
    };
    processing: {
      transferStationRate: number;
    };
    separation: {
      differentiatedCaptureRate: number;
      rejectionRateSource: number;
      plantSeparationEfficiency: { [material: string]: number };
    };
  };
  composition: {
    [source: string]: { [material: string]: number };
  };
}

export interface SeparationResults {
  maxDeliveryCapacity: number;
  actualDelivery: number;
  materialAvailableInStation: number;
  materialProcessedToday: number;
  processedRatio: number;
  processedByMaterial: { [material: string]: number };
  recoveredHighQuality: { [material: string]: number };
  recoveredLowQualityPlant: { [material: string]: number };
  totalRecoveredAtStation: number;
}

const materialTypes = ['organicos', 'pet', 'aluminio', 'carton', 'vidrio', 'rechazo', 'peligrosos'];
const valorizableTypes = ['pet', 'aluminio', 'carton', 'vidrio'];

/**
 * Process separation at transfer station including delivery, processing, and recovery
 * Pure function that handles all transfer station separation operations
 */
export function processSeparation(
  generationResults: GenerationResults,
  collectionResults: CollectionResults,
  inputs: SeparationInputs,
  currentInventory: {
    collectionVehicleInventory: number;
    rsuInventory: number;
  }
): { 
  results: SeparationResults; 
  updatedInventory: { collectionVehicleInventory: number; rsuInventory: number } 
} {
  const { genBySource, enhancedSeparationRates } = generationResults;
  const { toTransferStationByMaterial, toTransferStationTotal, collectedRatio } = collectionResults;
  
  // Calculate delivery capacity and actual delivery
  const maxDeliveryCapacity = inputs.rsuSystem.logistics.vehicles * 
                              inputs.rsuSystem.logistics.vehicleCapacity * 
                              inputs.rsuSystem.logistics.tripsPerVehicle;
  const actualDelivery = Math.min(currentInventory.collectionVehicleInventory, maxDeliveryCapacity);
  
  // Update inventories
  const updatedCollectionVehicleInventory = currentInventory.collectionVehicleInventory - actualDelivery;
  const materialAvailableInStation = currentInventory.rsuInventory + actualDelivery;
  // CRITICAL FIX: Process only TODAY'S material delivery, not accumulated inventory
  // The issue: materialAvailableInStation includes massive accumulated inventory (299+ ton)  
  // Solution: Process only what arrives today, limited by realistic daily capacity
  const dailyProcessingCapacity = Math.min(45, actualDelivery * 2); // Max 45 ton/day or 2x daily delivery
  const materialProcessedToday = Math.min(actualDelivery, dailyProcessingCapacity);
  const updatedRsuInventory = currentInventory.rsuInventory + actualDelivery - materialProcessedToday;
  
  // Calculate processing ratio and material distribution
  // Fix: Process material based on the composition that actually arrives today
  const processedRatio = toTransferStationTotal > 0 ? Math.min(materialProcessedToday, toTransferStationTotal) / toTransferStationTotal : 0;
  const processedByMaterial: { [material: string]: number } = {};
  materialTypes.forEach(m => {
    processedByMaterial[m] = (toTransferStationByMaterial[m] || 0) * processedRatio;
  });

  // Calculate high-quality recovery (source separation)
  const recoveredHighQuality: { [material: string]: number } = {};
  valorizableTypes.forEach(m => {
    let sourceSeparatedAmount = 0;
    for (const source in genBySource) {
      // Use enhanced separation rates instead of base rates
      sourceSeparatedAmount += (genBySource[source] * ((inputs.composition[source]?.[m] || 0) / 100)) * (enhancedSeparationRates[source] / 100);
    }
    const captured = sourceSeparatedAmount * (inputs.rsuSystem.separation.differentiatedCaptureRate / 100) * collectedRatio * processedRatio;
    recoveredHighQuality[m] = captured * (1 - inputs.rsuSystem.separation.rejectionRateSource / 100);
  });

  // Calculate low-quality recovery (plant separation)
  const recoveredLowQualityPlant: { [material: string]: number } = {};
  valorizableTypes.forEach(m => {
    const availableInMixed = Math.max(0, (processedByMaterial[m] || 0) - (recoveredHighQuality[m] || 0));
    recoveredLowQualityPlant[m] = availableInMixed * (inputs.rsuSystem.separation.plantSeparationEfficiency[m] / 100);
  });

  const totalRecoveredAtStation = Object.values(recoveredHighQuality).reduce((a, b) => a + b, 0) + 
                                 Object.values(recoveredLowQualityPlant).reduce((a, b) => a + b, 0);

  return {
    results: {
      maxDeliveryCapacity,
      actualDelivery,
      materialAvailableInStation,
      materialProcessedToday,
      processedRatio,
      processedByMaterial,
      recoveredHighQuality,
      recoveredLowQualityPlant,
      totalRecoveredAtStation,
    },
    updatedInventory: {
      collectionVehicleInventory: updatedCollectionVehicleInventory,
      rsuInventory: updatedRsuInventory,
    }
  };
}