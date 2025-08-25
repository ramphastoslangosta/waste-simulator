// Generation Module - Pure functions for waste generation calculations
// Extracted from useWasteSimulation.tsx for better testability and maintainability

export interface GenerationInputs {
  general: {
    fixedPopulation: number;
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
  separationScenarios?: {
    educationProgram?: { enableEducation: boolean; [key: string]: any };
    incentiveProgram?: { enableIncentives: boolean; [key: string]: any };
    containerProgram?: { enableContainers: boolean; [key: string]: any };
  };
}

export interface GenerationResults {
  genBySource: { [source: string]: number };
  genByMaterial: { [material: string]: number };
  genRSU: number;
  enhancedSeparationRates: { [source: string]: number };
}

const materialTypes = ['organicos', 'pet', 'aluminio', 'carton', 'vidrio', 'rechazo', 'peligrosos'];

/**
 * Calculate enhanced separation rates based on improvement programs
 */
function getEnhancedSeparationRate(baseRate: number, source: string, inputs: GenerationInputs): number {
  let enhancedRate = baseRate;
  
  // Education Program Impact
  if (inputs.separationScenarios?.educationProgram?.enableEducation) {
    const educationImpact = inputs.separationScenarios.educationProgram[`educationImpact${source.charAt(0).toUpperCase() + source.slice(1)}`] || 0;
    enhancedRate += educationImpact;
  }
  
  // Incentive Program Impact
  if (inputs.separationScenarios?.incentiveProgram?.enableIncentives) {
    const incentiveImpact = inputs.separationScenarios.incentiveProgram[`incentiveImpact${source.charAt(0).toUpperCase() + source.slice(1)}`] || 0;
    enhancedRate += incentiveImpact;
  }
  
  // Container Program Impact
  if (inputs.separationScenarios?.containerProgram?.enableContainers) {
    const containerImpact = inputs.separationScenarios.containerProgram[`containerImpact${source.charAt(0).toUpperCase() + source.slice(1)}`] || 0;
    enhancedRate += containerImpact;
  }
  
  return Math.min(enhancedRate, 95); // Cap at 95% maximum separation rate
}

/**
 * Calculate waste generation by source and material for RSU (Urban Solid Waste)
 * Pure function that takes inputs and occupancy and returns generation results
 */
export function calculateGeneration(inputs: GenerationInputs, occupancy: number): GenerationResults {
  // Apply enhanced separation rates
  const enhancedSeparationRates = {
    hotels: getEnhancedSeparationRate(inputs.generation.hotels.sourceSeparationRate, 'hotels', inputs),
    restaurants: getEnhancedSeparationRate(inputs.generation.restaurants.sourceSeparationRate, 'restaurants', inputs),
    homes: getEnhancedSeparationRate(inputs.generation.homes.sourceSeparationRate, 'homes', inputs),
    commerce: getEnhancedSeparationRate(inputs.generation.commerce.sourceSeparationRate, 'commerce', inputs),
  };
  
  // Calculate generation by source
  const genBySource = {
    hotels: (inputs.generation.hotels.units * occupancy / 100) * inputs.generation.hotels.rate / 1000,
    restaurants: (inputs.generation.restaurants.units * inputs.generation.restaurants.rate) / 1000,
    homes: (inputs.general.fixedPopulation * inputs.generation.homes.rate) / 1000,
    commerce: (inputs.generation.commerce.units * inputs.generation.commerce.rate) / 1000,
  };
  
  // Calculate generation by material type
  const genByMaterial: { [material: string]: number } = {};
  materialTypes.forEach(material => genByMaterial[material] = 0);
  
  for (const source in genBySource) {
    for (const material of materialTypes) {
      genByMaterial[material] += genBySource[source] * ((inputs.composition[source]?.[material] || 0) / 100);
    }
  }
  
  const genRSU = Object.values(genByMaterial).reduce((a, b) => a + b, 0);
  
  return {
    genBySource,
    genByMaterial,
    genRSU,
    enhancedSeparationRates
  };
}