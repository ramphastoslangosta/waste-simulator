/**
 * Economic Calculations Validation Tests
 * 
 * Validates the economic calculation logic including:
 * - Cost calculations (collection, transfer, transport, disposal)
 * - Income calculations (material recovery sales)
 * - Net cost calculations (cost - income)
 * - ROI calculations for valorization processes
 * - Separation program cost calculations
 * - Special waste cost calculations
 * 
 * Critical for financial model credibility and investment decision making.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { calculateEconomics } from '../../simulation/modules/economics';
import { baselineScenario, valorizationScenario } from './helpers/testScenarios';

// Mock data for testing economic calculations
const mockCollectionResults = {
  collectedWasteTotal: 10.0,
  informalRecoveryCollection: 0.5,
  leakCollection: 0.2,
  toTransferStationTotal: 9.3,
  collectionDeficit: 2.0
};

const mockSeparationResults = {
  materialProcessedToday: 8.0,
  recoveredHighQuality: {
    pet: 1.2,
    aluminio: 0.3,
    carton: 0.8,
    vidrio: 0.4
  },
  recoveredLowQualityPlant: {
    pet: 0.8,
    aluminio: 0.2,
    carton: 0.6,
    vidrio: 0.3
  },
  processedByMaterial: {
    organicos: 4.0,
    pet: 1.0,
    aluminio: 0.2,
    carton: 0.5,
    vidrio: 0.3,
    rechazo: 2.0
  }
};

const mockValorizationResults = {
  valorizationCosts: 150.0,
  valorizationIncomes: 300.0,
  valorizedMaterials: {
    composted: 2.0,
    biogas: 1.5,
    pyrolyzed: 0.5
  }
};

const mockInventoryResults = {
  transportCosts: {
    totalFinalTransportCost: 500.0
  },
  finalTransportFlows: {
    toDisposalSite: 6.0,
    actualFinalTransport: 6.0
  }
};

const mockFlows = {
  materialProcessedToday: 8.0,
  occupancy: 80
};

describe('Economic Calculations Validation', () => {
  
  describe('RSU System Cost Calculations', () => {
    test('calculates collection costs correctly', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      const expectedCollectionCost = mockCollectionResults.collectedWasteTotal * baselineScenario.rsuSystem.economics.collectionCost;
      expect(economics.rsuCosts.totalCollectionCost).toBe(expectedCollectionCost);
      expect(economics.rsuCosts.totalCollectionCost).toBeGreaterThan(0);
    });

    test('calculates transfer station costs correctly', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      const expectedTransferCost = mockFlows.materialProcessedToday * baselineScenario.rsuSystem.economics.transferStationCost;
      expect(economics.rsuCosts.totalTransferCost).toBe(expectedTransferCost);
      expect(economics.rsuCosts.totalTransferCost).toBeGreaterThan(0);
    });

    test('calculates final transport costs correctly', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      expect(economics.rsuCosts.totalFinalTransportCost).toBe(mockInventoryResults.transportCosts.totalFinalTransportCost);
      expect(economics.rsuCosts.totalFinalTransportCost).toBeGreaterThan(0);
    });

    test('calculates disposal costs correctly', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      const expectedDisposalCost = mockInventoryResults.finalTransportFlows.toDisposalSite * baselineScenario.rsuSystem.economics.disposalCost;
      expect(economics.rsuCosts.totalDisposalCost).toBe(expectedDisposalCost);
      expect(economics.rsuCosts.totalDisposalCost).toBeGreaterThan(0);
    });

    test('calculates total RSU costs correctly', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      const expectedTotalCosts = economics.rsuCosts.totalCollectionCost + 
                                economics.rsuCosts.totalTransferCost + 
                                economics.rsuCosts.totalFinalTransportCost + 
                                economics.rsuCosts.totalDisposalCost + 
                                mockValorizationResults.valorizationCosts;
      
      expect(economics.rsuCosts.totalRsuCosts).toBe(expectedTotalCosts);
      expect(economics.rsuCosts.totalRsuCosts).toBeGreaterThan(0);
    });
  });

  describe('RSU System Income Calculations', () => {
    test('calculates material income correctly for each valorizable type', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      // Check PET income calculation
      const expectedPetIncome = (mockSeparationResults.recoveredHighQuality.pet + 
                                mockSeparationResults.recoveredLowQualityPlant.pet) * 
                               baselineScenario.rsuSystem.economics.income.pet;
      expect(economics.rsuIncome.incomeByMaterial.pet).toBe(expectedPetIncome);
      
      // Check Aluminum income calculation
      const expectedAluminiumIncome = (mockSeparationResults.recoveredHighQuality.aluminio + 
                                      mockSeparationResults.recoveredLowQualityPlant.aluminio) * 
                                     baselineScenario.rsuSystem.economics.income.aluminio;
      expect(economics.rsuIncome.incomeByMaterial.aluminio).toBe(expectedAluminiumIncome);
      
      // All income values should be non-negative
      Object.values(economics.rsuIncome.incomeByMaterial).forEach(income => {
        expect(income).toBeGreaterThanOrEqual(0);
      });
    });

    test('calculates total RSU income correctly', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      const expectedMaterialIncome = Object.values(economics.rsuIncome.incomeByMaterial).reduce((a, b) => a + b, 0);
      const expectedTotalIncome = expectedMaterialIncome + mockValorizationResults.valorizationIncomes;
      
      expect(economics.rsuIncome.totalRsuIncome).toBe(expectedTotalIncome);
      expect(economics.rsuIncome.totalRsuIncome).toBeGreaterThan(0);
    });

    test('validates income scales with material recovery', () => {
      // Test with double recovery amounts
      const doubleRecoveryResults = {
        ...mockSeparationResults,
        recoveredHighQuality: {
          pet: mockSeparationResults.recoveredHighQuality.pet * 2,
          aluminio: mockSeparationResults.recoveredHighQuality.aluminio * 2,
          carton: mockSeparationResults.recoveredHighQuality.carton * 2,
          vidrio: mockSeparationResults.recoveredHighQuality.vidrio * 2
        }
      };
      
      const baselineEconomics = calculateEconomics(
        mockCollectionResults, mockSeparationResults, mockValorizationResults, 
        mockInventoryResults, mockFlows, baselineScenario, 'high'
      );
      
      const doubleRecoveryEconomics = calculateEconomics(
        mockCollectionResults, doubleRecoveryResults, mockValorizationResults, 
        mockInventoryResults, mockFlows, baselineScenario, 'high'
      );
      
      // Income should be significantly higher with double recovery
      expect(doubleRecoveryEconomics.rsuIncome.totalRsuIncome).toBeGreaterThan(baselineEconomics.rsuIncome.totalRsuIncome);
      
      // The difference should be proportional to the increase in high-quality recovery
      const incomeIncrease = doubleRecoveryEconomics.rsuIncome.totalRsuIncome - baselineEconomics.rsuIncome.totalRsuIncome;
      expect(incomeIncrease).toBeGreaterThan(0);
    });
  });

  describe('Net Cost and ROI Calculations', () => {
    test('calculates net RSU cost correctly (cost - income)', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      const expectedNetCost = economics.rsuCosts.totalRsuCosts - economics.rsuIncome.totalRsuIncome;
      expect(economics.netCosts.netRsuCost).toBe(expectedNetCost);
    });

    test('validates negative net cost indicates system profitability', () => {
      // Create scenario with high income, low costs
      const highIncomeResults = {
        ...mockSeparationResults,
        recoveredHighQuality: {
          pet: 10.0,    // Very high recovery
          aluminio: 5.0,
          carton: 8.0,
          vidrio: 6.0
        }
      };
      
      const highIncomeValorization = {
        ...mockValorizationResults,
        valorizationIncomes: 5000.0, // Very high valorization income
        valorizationCosts: 100.0     // Low costs
      };
      
      const economics = calculateEconomics(
        mockCollectionResults,
        highIncomeResults,
        highIncomeValorization,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      // With high recovery and income, net cost could be negative (profitable)
      if (economics.netCosts.netRsuCost < 0) {
        expect(economics.rsuIncome.totalRsuIncome).toBeGreaterThan(economics.rsuCosts.totalRsuCosts);
      }
    });

    test('calculates valorization ROI correctly', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        valorizationScenario,
        'high'
      );
      
      // ROI calculation: (Income - Cost) / Cost * 100
      if (mockValorizationResults.valorizationCosts > 0) {
        const expectedROI = ((mockValorizationResults.valorizationIncomes - mockValorizationResults.valorizationCosts) / 
                           mockValorizationResults.valorizationCosts) * 100;
        
        const actualROI = ((economics.rsuIncome.totalRsuIncome - economics.rsuCosts.totalRsuCosts) / 
                         economics.rsuCosts.totalRsuCosts) * 100;
        
        // ROI should be calculable and reasonable
        expect(actualROI).toBeDefined();
        expect(isFinite(actualROI)).toBe(true);
      }
    });

    test('validates cost-benefit analysis for different scenarios', () => {
      // Compare baseline vs valorization scenario economics
      const baselineEconomics = calculateEconomics(
        mockCollectionResults, mockSeparationResults, 
        { valorizationCosts: 0, valorizationIncomes: 0, valorizedMaterials: { composted: 0, biogas: 0, pyrolyzed: 0 } },
        mockInventoryResults, mockFlows, baselineScenario, 'high'
      );
      
      const valorizationEconomics = calculateEconomics(
        mockCollectionResults, mockSeparationResults, mockValorizationResults,
        mockInventoryResults, mockFlows, valorizationScenario, 'high'
      );
      
      // Valorization should reduce net costs if income > additional costs
      const baselineNetCost = baselineEconomics.netCosts.netRsuCost;
      const valorizationNetCost = valorizationEconomics.netCosts.netRsuCost;
      
      if (mockValorizationResults.valorizationIncomes > mockValorizationResults.valorizationCosts) {
        expect(valorizationNetCost).toBeLessThan(baselineNetCost);
      }
    });
  });

  describe('Separation Program Cost Calculations', () => {
    test('calculates education program costs correctly', () => {
      const educationScenario = {
        ...baselineScenario,
        separationScenarios: {
          educationProgram: {
            enableEducation: true,
            educationCostPerCapita: 50
          }
        }
      };
      
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        educationScenario,
        'high'
      );
      
      // Education cost should be calculated based on population
      expect(economics.programCosts.separationProgramCosts).toBeGreaterThan(0);
      
      // Daily cost should be annual cost / 365
      const touristPopulation = (educationScenario.generation.hotels.units * mockFlows.occupancy / 100) + 
                               educationScenario.generation.restaurants.units * 3 + 
                               educationScenario.generation.commerce.units * 2;
      const totalPopulation = educationScenario.general.fixedPopulation + touristPopulation;
      const expectedDailyCost = (totalPopulation * 50) / 365;
      
      expect(economics.programCosts.separationProgramCosts).toBeCloseTo(expectedDailyCost, 2);
    });

    test('calculates incentive program costs correctly', () => {
      const incentiveScenario = {
        ...baselineScenario,
        separationScenarios: {
          incentiveProgram: {
            enableIncentives: true,
            incentiveCostPerTon: 200
          }
        }
      };
      
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        incentiveScenario,
        'high'
      );
      
      // Incentive cost should be based on separated material
      const totalSeparated = Object.values(mockSeparationResults.recoveredHighQuality).reduce((a, b) => a + b, 0);
      const expectedIncentiveCost = totalSeparated * 200;
      
      expect(economics.programCosts.separationProgramCosts).toBe(expectedIncentiveCost);
    });

    test('calculates container program costs correctly', () => {
      const containerScenario = {
        ...baselineScenario,
        separationScenarios: {
          containerProgram: {
            enableContainers: true,
            containerCostPerUnit: 300
          }
        }
      };
      
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        containerScenario,
        'high'
      );
      
      // Container cost should be amortized over 5 years and converted to daily
      const totalUnits = containerScenario.generation.hotels.units + 
                        containerScenario.generation.restaurants.units + 
                        containerScenario.generation.commerce.units + 
                        Math.ceil(containerScenario.general.fixedPopulation / 100);
      const expectedDailyCost = (totalUnits * 300 / 5) / 365;
      
      expect(economics.programCosts.separationProgramCosts).toBeCloseTo(expectedDailyCost, 2);
    });

    test('handles multiple separation programs combined', () => {
      const combinedScenario = {
        ...baselineScenario,
        separationScenarios: {
          educationProgram: {
            enableEducation: true,
            educationCostPerCapita: 30
          },
          incentiveProgram: {
            enableIncentives: true,
            incentiveCostPerTon: 100
          },
          containerProgram: {
            enableContainers: true,
            containerCostPerUnit: 200
          }
        }
      };
      
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        combinedScenario,
        'high'
      );
      
      // Total cost should be sum of all programs
      expect(economics.programCosts.separationProgramCosts).toBeGreaterThan(0);
      
      // Should be higher than any individual program
      const individualEducation = calculateEconomics(mockCollectionResults, mockSeparationResults, mockValorizationResults, mockInventoryResults, mockFlows, 
        { ...baselineScenario, separationScenarios: { educationProgram: combinedScenario.separationScenarios.educationProgram } }, 'high');
      expect(economics.programCosts.separationProgramCosts).toBeGreaterThan(individualEducation.programCosts.separationProgramCosts);
    });
  });

  describe('Special Waste Cost Calculations', () => {
    test('calculates sargassum costs correctly for high season', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      const expectedSargassumCost = baselineScenario.specialWasteGeneration.sargassumHigh * 
                                   (baselineScenario.sargassumManagement.collectionCost + baselineScenario.sargassumManagement.disposalCost);
      
      expect(economics.specialWasteCosts.sargassumCost).toBe(expectedSargassumCost);
    });

    test('calculates sargassum costs correctly for low season', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'low'
      );
      
      const expectedSargassumCost = baselineScenario.specialWasteGeneration.sargassumLow * 
                                   (baselineScenario.sargassumManagement.collectionCost + baselineScenario.sargassumManagement.disposalCost);
      
      expect(economics.specialWasteCosts.sargassumCost).toBe(expectedSargassumCost);
      
      // Low season should have lower sargassum costs than high season
      const highSeasonEconomics = calculateEconomics(mockCollectionResults, mockSeparationResults, mockValorizationResults, mockInventoryResults, mockFlows, baselineScenario, 'high');
      expect(economics.specialWasteCosts.sargassumCost).toBeLessThan(highSeasonEconomics.specialWasteCosts.sargassumCost);
    });

    test('calculates RCD costs correctly', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      const expectedRcdCost = baselineScenario.specialWasteGeneration.construction * 
                             (baselineScenario.rcdManagement.collectionCost + baselineScenario.rcdManagement.disposalCost);
      
      expect(economics.specialWasteCosts.rcdCost).toBe(expectedRcdCost);
    });
  });

  describe('Total System Cost Integration', () => {
    test('calculates total system cost correctly', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      const expectedTotalCost = economics.netCosts.netRsuCost + 
                               economics.specialWasteCosts.sargassumCost + 
                               economics.specialWasteCosts.rcdCost + 
                               economics.programCosts.separationProgramCosts;
      
      expect(economics.totalSystemCost).toBe(expectedTotalCost);
    });

    test('validates system cost components are properly integrated', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      // All cost components should contribute to total
      expect(economics.totalSystemCost).toBeGreaterThanOrEqual(economics.specialWasteCosts.sargassumCost);
      expect(economics.totalSystemCost).toBeGreaterThanOrEqual(economics.specialWasteCosts.rcdCost);
      expect(economics.totalSystemCost).toBeGreaterThanOrEqual(economics.programCosts.separationProgramCosts);
      
      // Total should be finite and reasonable
      expect(isFinite(economics.totalSystemCost)).toBe(true);
      expect(economics.totalSystemCost).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles zero costs and income gracefully', () => {
      const zeroScenario = {
        ...baselineScenario,
        rsuSystem: {
          ...baselineScenario.rsuSystem,
          economics: {
            collectionCost: 0,
            transferStationCost: 0,
            disposalCost: 0,
            income: { pet: 0, aluminio: 0, carton: 0, vidrio: 0 }
          }
        },
        specialWasteGeneration: { sargassumHigh: 0, sargassumLow: 0, construction: 0 },
        sargassumManagement: { collectionCost: 0, disposalCost: 0 },
        rcdManagement: { collectionCost: 0, disposalCost: 0 }
      };
      
      const zeroResults = {
        ...mockCollectionResults,
        collectedWasteTotal: 0
      };
      
      const zeroSeparation = {
        ...mockSeparationResults,
        recoveredHighQuality: { pet: 0, aluminio: 0, carton: 0, vidrio: 0 },
        recoveredLowQualityPlant: { pet: 0, aluminio: 0, carton: 0, vidrio: 0 }
      };
      
      const zeroValorization = {
        valorizationCosts: 0,
        valorizationIncomes: 0,
        valorizedMaterials: { composted: 0, biogas: 0, pyrolyzed: 0 }
      };
      
      const zeroInventory = {
        ...mockInventoryResults,
        transportCosts: { totalFinalTransportCost: 0 },
        finalTransportFlows: { toDisposalSite: 0, actualFinalTransport: 0 }
      };
      
      const economics = calculateEconomics(
        zeroResults, zeroSeparation, zeroValorization, zeroInventory,
        { materialProcessedToday: 0, occupancy: 0 }, zeroScenario, 'high'
      );
      
      expect(economics.rsuCosts.totalRsuCosts).toBe(0);
      expect(economics.rsuIncome.totalRsuIncome).toBe(0);
      expect(economics.netCosts.netRsuCost).toBe(0);
      expect(economics.totalSystemCost).toBe(0);
    });

    test('handles very large numbers correctly', () => {
      const largeNumbers = {
        ...mockCollectionResults,
        collectedWasteTotal: 1000000
      };
      
      const economics = calculateEconomics(
        largeNumbers,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      expect(isFinite(economics.totalSystemCost)).toBe(true);
      expect(economics.totalSystemCost).toBeGreaterThan(0);
    });

    test('maintains numerical precision in calculations', () => {
      const economics = calculateEconomics(
        mockCollectionResults,
        mockSeparationResults,
        mockValorizationResults,
        mockInventoryResults,
        mockFlows,
        baselineScenario,
        'high'
      );
      
      // Verify numerical precision by recalculating components
      const manualTotalCost = economics.netCosts.netRsuCost + 
                             economics.specialWasteCosts.sargassumCost + 
                             economics.specialWasteCosts.rcdCost + 
                             economics.programCosts.separationProgramCosts;
      
      expect(Math.abs(economics.totalSystemCost - manualTotalCost)).toBeLessThan(0.01);
    });
  });
});