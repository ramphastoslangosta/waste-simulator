// Valorization Module - Pure functions for valorization process calculations
// Extracted from useWasteSimulation.tsx for better testability and maintainability

export interface ValorizationInputs {
  rsuSystem: {
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
    leaks: {
      transferStationLeak: number;
    };
  };
}

export interface ValorizationResults {
  valorizedMaterials: {
    composted: number;
    biogas: number;
    pyrolyzed: number;
  };
  valorizationCosts: number;
  valorizationIncomes: number;
  totalValorizedMaterials: number;
  availableOrganics: number;
  availablePlastics: number;
  leakTransferStation: number;
  materialLeavingStation: number;
}

/**
 * Process valorization operations at transfer station
 * Pure function that handles composting, biogas, and plastic pyrolysis processes
 */
export function processValorization(
  processedByMaterial: { [material: string]: number },
  materialProcessedToday: number,
  totalRecoveredAtStation: number,
  inputs: ValorizationInputs
): ValorizationResults {
  
  let valorizedMaterials = {
    composted: 0,
    biogas: 0,
    pyrolyzed: 0
  };
  let valorizationCosts = 0;
  let valorizationIncomes = 0;
  
  // Calculate available materials for valorization (after formal recovery is removed)
  // This prevents double-counting of recovered materials in both recovery and valorization
  const totalProcessedOrganics = processedByMaterial.organicos || 0;
  const totalProcessedPlastics = processedByMaterial.pet || 0;
  
  // Estimate recovered materials by type (proportional to composition)
  // Handle division by zero case when no material is processed
  const organicsRecoveredEstimate = materialProcessedToday > 0 
    ? totalRecoveredAtStation * (totalProcessedOrganics / materialProcessedToday)
    : 0;
  const plasticsRecoveredEstimate = materialProcessedToday > 0
    ? totalRecoveredAtStation * (totalProcessedPlastics / materialProcessedToday)
    : 0;
  
  // Calculate net available materials for valorization (processed - already recovered)
  const availableOrganics = Math.max(0, totalProcessedOrganics - organicsRecoveredEstimate);
  const availablePlastics = Math.max(0, totalProcessedPlastics - plasticsRecoveredEstimate);
  
  // Composting Process
  if (inputs.rsuSystem.valorization?.enableComposting && availableOrganics > 0) {
    const organicsToCompost = availableOrganics * (inputs.rsuSystem.valorization.compostingEfficiency! / 100);
    valorizedMaterials.composted = organicsToCompost;
    valorizationCosts += organicsToCompost * inputs.rsuSystem.valorization.compostingCost!;
    valorizationIncomes += organicsToCompost * inputs.rsuSystem.valorization.compostIncome!;
  }
  
  // Biogas Process (can't overlap with composting for same organics)
  if (inputs.rsuSystem.valorization?.enableBiogas && availableOrganics > 0) {
    const remainingOrganics = availableOrganics - valorizedMaterials.composted;
    if (remainingOrganics > 0) {
      const organicsForBiogas = remainingOrganics * (inputs.rsuSystem.valorization.biogasEfficiency! / 100);
      valorizedMaterials.biogas = organicsForBiogas;
      valorizationCosts += organicsForBiogas * inputs.rsuSystem.valorization.biogasCost!;
      valorizationIncomes += organicsForBiogas * inputs.rsuSystem.valorization.biogasIncome!;
    }
  }
  
  // Plastic Pyrolysis Process
  if (inputs.rsuSystem.valorization?.enablePlasticPyrolysis && availablePlastics > 0) {
    const plasticsForPyrolysis = availablePlastics * (inputs.rsuSystem.valorization.pyrolysisEfficiency! / 100);
    valorizedMaterials.pyrolyzed = plasticsForPyrolysis;
    valorizationCosts += plasticsForPyrolysis * inputs.rsuSystem.valorization.pyrolysisCost!;
    valorizationIncomes += plasticsForPyrolysis * inputs.rsuSystem.valorization.pyrolysisIncome!;
  }
  
  const totalValorizedMaterials = valorizedMaterials.composted + valorizedMaterials.biogas + valorizedMaterials.pyrolyzed;
  
  // Calculate leaks and material leaving station
  const leakTransferStation = materialProcessedToday * (inputs.rsuSystem.leaks.transferStationLeak / 100);
  const materialLeavingStation = materialProcessedToday - totalRecoveredAtStation - totalValorizedMaterials - leakTransferStation;

  return {
    valorizedMaterials,
    valorizationCosts,
    valorizationIncomes,
    totalValorizedMaterials,
    availableOrganics, // Net available after recovery (corrected)
    availablePlastics, // Net available after recovery (corrected)  
    leakTransferStation,
    materialLeavingStation,
  };
}