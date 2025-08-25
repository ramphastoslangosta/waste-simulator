// Collection Module - Pure functions for waste collection and logistics calculations
// Extracted from useWasteSimulation.tsx for better testability and maintainability

import { GenerationResults } from './generation';

export interface CollectionInputs {
  rsuSystem: {
    logistics: {
      vehicles: number;
      vehicleCapacity: number;
      tripsPerVehicle: number;
    };
    separation: {
      informalRecoveryRateCollection: number;
    };
    leaks: {
      collectionLeak: number;
    };
  };
}

export interface CollectionResults {
  collectionCapacity: number;
  collectionDeficit: number;
  collectedWasteTotal: number;
  collectedRatio: number;
  collectedByMaterial: { [material: string]: number };
  informalRecoveryCollectionByMaterial: { [material: string]: number };
  wasteAfterInformalRec1: { [material: string]: number };
  informalRecoveryCollection: number;
  leakCollection: number;
  toTransferStationByMaterial: { [material: string]: number };
  toTransferStationTotal: number;
}

const materialTypes = ['organicos', 'pet', 'aluminio', 'carton', 'vidrio', 'rechazo', 'peligrosos'];
const valorizableTypes = ['pet', 'aluminio', 'carton', 'vidrio'];

/**
 * Process collection and logistics calculations
 * Pure function that takes generation results and collection inputs
 */
export function processCollection(
  generationResults: GenerationResults,
  inputs: CollectionInputs
): CollectionResults {
  const { genByMaterial, genRSU } = generationResults;
  
  // Calculate collection capacity and deficit
  const collectionCapacity = inputs.rsuSystem.logistics.vehicles * 
                            inputs.rsuSystem.logistics.vehicleCapacity * 
                            inputs.rsuSystem.logistics.tripsPerVehicle;
  const collectionDeficit = Math.max(0, genRSU - collectionCapacity);
  const collectedWasteTotal = genRSU - collectionDeficit;
  
  // Calculate collection ratio and material distribution
  const collectedRatio = genRSU > 0 ? collectedWasteTotal / genRSU : 0;
  const collectedByMaterial: { [material: string]: number } = {};
  materialTypes.forEach(m => {
    collectedByMaterial[m] = genByMaterial[m] * collectedRatio;
  });

  // Calculate informal recovery during collection
  const informalRecoveryCollectionByMaterial: { [material: string]: number } = {};
  const wasteAfterInformalRec1: { [material: string]: number } = {};
  
  valorizableTypes.forEach(m => {
    const recovered = collectedByMaterial[m] * (inputs.rsuSystem.separation.informalRecoveryRateCollection / 100);
    informalRecoveryCollectionByMaterial[m] = recovered;
    wasteAfterInformalRec1[m] = collectedByMaterial[m] - recovered;
  });
  
  ['organicos', 'rechazo', 'peligrosos'].forEach(m => {
    wasteAfterInformalRec1[m] = collectedByMaterial[m];
  });
  
  const informalRecoveryCollection = Object.values(informalRecoveryCollectionByMaterial)
    .reduce((a, b) => a + b, 0);

  // Calculate leaks during collection
  const wasteBeforeLeak = Object.values(wasteAfterInformalRec1).reduce((a, b) => a + b, 0);
  const leakCollection = wasteBeforeLeak * (inputs.rsuSystem.leaks.collectionLeak / 100);
  const leakRatio = wasteBeforeLeak > 0 ? leakCollection / wasteBeforeLeak : 0;
  
  // Calculate material going to transfer station
  const toTransferStationByMaterial: { [material: string]: number } = {};
  materialTypes.forEach(m => {
    toTransferStationByMaterial[m] = (wasteAfterInformalRec1[m] || 0) * (1 - leakRatio);
  });
  const toTransferStationTotal = Object.values(toTransferStationByMaterial).reduce((a, b) => a + b, 0);

  return {
    collectionCapacity,
    collectionDeficit,
    collectedWasteTotal,
    collectedRatio,
    collectedByMaterial,
    informalRecoveryCollectionByMaterial,
    wasteAfterInformalRec1,
    informalRecoveryCollection,
    leakCollection,
    toTransferStationByMaterial,
    toTransferStationTotal,
  };
}