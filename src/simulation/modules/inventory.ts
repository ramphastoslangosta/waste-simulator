// Inventory Module - Pure functions for inventory dynamics and final disposal calculations
// Extracted from useWasteSimulation.tsx for better testability and maintainability

export interface InventoryInputs {
  rsuSystem: {
    initialInventory?: {
      collectionVehicles?: number;
      transferStation?: number;
      finalTransportVehicles?: number;
      disposalSite?: number;
    };
    processing: {
      finalTransportCapacity: number;
      transferStationCapacity: number;
    };
    separation: {
      informalRecoveryRateDisposal: number;
    };
    leaks: {
      finalTransportLeak: number;
      disposalLeak: number;
    };
    economics: {
      finalTransportCost: number;
    };
  };
}

export interface InventoryState {
  collectionVehicleInventory: number;
  rsuInventory: number;
  finalTransportInventory: number;
  disposalSiteInventory: number;
}

export interface InventoryResults {
  inventoryLevels: InventoryState;
  finalTransportFlows: {
    actualFinalTransport: number;
    untransportedMaterial: number;
    leakFinalTransport: number;
    arrivedAtDisposal: number;
    toDisposalSite: number;
  };
  disposalFlows: {
    informalRecoveryDisposal: number;
    leakDisposal: number;
    finalDisposal: number;
  };
  transportCosts: {
    totalFinalTransportCost: number;
  };
}

/**
 * Update inventories and calculate final disposal flows
 * Pure function that handles inventory dynamics across all system stages
 */
export function updateInventoriesAndFlows(
  currentInventory: InventoryState,
  flows: {
    materialLeavingStation: number;
    materialProcessedToday: number;
    materialAvailableInStation: number;
    valorizablesToDisposal: number;
  },
  inputs: InventoryInputs
): InventoryResults {
  
  // Calculate final transport flows
  let finalTransportInventory = currentInventory.finalTransportInventory + flows.materialLeavingStation;
  const actualFinalTransport = Math.min(finalTransportInventory, inputs.rsuSystem.processing.finalTransportCapacity);
  finalTransportInventory -= actualFinalTransport;
  const untransportedMaterial = flows.materialLeavingStation - actualFinalTransport;
  
  const leakFinalTransport = actualFinalTransport * (inputs.rsuSystem.leaks.finalTransportLeak / 100);
  const arrivedAtDisposal = actualFinalTransport - leakFinalTransport;
  
  // Update disposal site inventory
  const disposalSiteInventory = currentInventory.disposalSiteInventory + arrivedAtDisposal;
  const toDisposalSite = arrivedAtDisposal; // For compatibility with existing calculations
  
  // Calculate disposal flows
  const informalRecoveryDisposal = flows.valorizablesToDisposal * (inputs.rsuSystem.separation.informalRecoveryRateDisposal / 100);
  const leakDisposal = toDisposalSite * (inputs.rsuSystem.leaks.disposalLeak / 100);
  const finalDisposal = toDisposalSite - informalRecoveryDisposal - leakDisposal;
  
  // Update RSU inventory with material that couldn't be transported
  const rsuInventory = Math.min(
    flows.materialAvailableInStation - flows.materialProcessedToday + untransportedMaterial,
    inputs.rsuSystem.processing.transferStationCapacity
  );
  
  // Calculate transport costs
  const totalFinalTransportCost = actualFinalTransport * inputs.rsuSystem.economics.finalTransportCost;
  
  return {
    inventoryLevels: {
      collectionVehicleInventory: currentInventory.collectionVehicleInventory,
      rsuInventory,
      finalTransportInventory,
      disposalSiteInventory,
    },
    finalTransportFlows: {
      actualFinalTransport,
      untransportedMaterial,
      leakFinalTransport,
      arrivedAtDisposal,
      toDisposalSite,
    },
    disposalFlows: {
      informalRecoveryDisposal,
      leakDisposal,
      finalDisposal,
    },
    transportCosts: {
      totalFinalTransportCost,
    },
  };
}