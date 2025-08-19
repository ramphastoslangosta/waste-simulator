/**
 * Physical Constraints Validation Tests
 * 
 * Validates that all system capacities are respected and inventories remain within physical limits:
 * - Collection capacity: vehicles * vehicleCapacity * tripsPerVehicle
 * - Transfer station capacity: transferStationCapacity
 * - Final transport capacity: finalTransportCapacity
 * - All inventories >= 0 and <= their respective physical limits
 * 
 * Critical for ensuring model physical feasibility and preventing impossible scenarios.
 */

import { renderHook } from '@testing-library/react';
import { useWasteSimulation } from '../../hooks/useWasteSimulation';
import { validatePhysicalConstraints } from '../../utils/validation/constraintValidator';

// Test scenarios with different capacity stress levels
const baselineScenario = {
    general: { highSeasonOccupancy: 80, lowSeasonOccupancy: 40, fixedPopulation: 2500 },
    generation: {
        hotels: { units: 50, rate: 1.5, sourceSeparationRate: 0 },
        restaurants: { units: 30, rate: 2.0, sourceSeparationRate: 0 },
        homes: { rate: 0.8, sourceSeparationRate: 0 },
        commerce: { units: 80, rate: 1.2, sourceSeparationRate: 0 }
    },
    composition: {
        hotels: { organicos: 40, pet: 8, aluminio: 2, carton: 15, vidrio: 5, rechazo: 28, peligrosos: 2 },
        restaurants: { organicos: 50, pet: 10, aluminio: 3, carton: 12, vidrio: 8, rechazo: 15, peligrosos: 2 },
        homes: { organicos: 45, pet: 6, aluminio: 2, carton: 10, vidrio: 7, rechazo: 28, peligrosos: 2 },
        commerce: { organicos: 35, pet: 12, aluminio: 4, carton: 20, vidrio: 9, rechazo: 18, peligrosos: 2 }
    },
    rsuSystem: {
        logistics: { vehicles: 4, vehicleCapacity: 5, tripsPerVehicle: 2 },
        processing: { transferStationRate: 50, transferStationCapacity: 150, finalTransportCapacity: 40 },
        leaks: { collectionLeak: 2, transferLeak: 1, transportLeak: 1 },
        separation: { informalRecoveryRateCollection: 15, informalRecoveryRateTransfer: 10 },
        initialInventory: { transferStation: 10, collectionVehicles: 2, finalTransportVehicles: 5, disposalSite: 0 }
    }
};

// Scenario with minimal capacities (stress test)
const minimalCapacityScenario = {
    ...baselineScenario,
    rsuSystem: {
        ...baselineScenario.rsuSystem,
        logistics: { vehicles: 1, vehicleCapacity: 2, tripsPerVehicle: 1 }, // Very low collection capacity
        processing: { transferStationRate: 10, transferStationCapacity: 20, finalTransportCapacity: 8 } // Minimal processing
    }
};

// Scenario with high generation (stress test)
const highGenerationScenario = {
    ...baselineScenario,
    general: { ...baselineScenario.general, highSeasonOccupancy: 95, fixedPopulation: 5000 },
    generation: {
        hotels: { units: 100, rate: 3.0, sourceSeparationRate: 0 },
        restaurants: { units: 60, rate: 4.0, sourceSeparationRate: 0 },
        homes: { rate: 1.5, sourceSeparationRate: 0 },
        commerce: { units: 150, rate: 2.5, sourceSeparationRate: 0 }
    }
};

// Scenario with extreme capacities
const extremeCapacityScenario = {
    ...baselineScenario,
    rsuSystem: {
        ...baselineScenario.rsuSystem,
        logistics: { vehicles: 20, vehicleCapacity: 15, tripsPerVehicle: 5 }, // Very high collection capacity
        processing: { transferStationRate: 200, transferStationCapacity: 500, finalTransportCapacity: 200 } // High processing
    }
};

describe('Physical Constraints Validation', () => {
    
    describe('Collection Capacity Constraints', () => {
        test('validates collection capacity is never exceeded in baseline scenario', () => {
            const { result } = renderHook(() => useWasteSimulation(baselineScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, baselineScenario, 'high');
            const lowSeasonValidation = validatePhysicalConstraints(result.current.low, baselineScenario, 'low');
            
            expect(highSeasonValidation.collectionConstraints.isValid).toBe(true);
            expect(lowSeasonValidation.collectionConstraints.isValid).toBe(true);
            
            // Check that collection deficit only occurs when generation exceeds capacity
            const highCollectionCapacity = baselineScenario.rsuSystem.logistics.vehicles * 
                                         baselineScenario.rsuSystem.logistics.vehicleCapacity * 
                                         baselineScenario.rsuSystem.logistics.tripsPerVehicle;
            
            if (result.current.high.rsu.totalGeneration > highCollectionCapacity) {
                expect(result.current.high.rsu.collectionDeficit).toBeGreaterThan(0);
            } else {
                expect(result.current.high.rsu.collectionDeficit).toBe(0);
            }
        });

        test('detects collection capacity violations in minimal capacity scenario', () => {
            const { result } = renderHook(() => useWasteSimulation(minimalCapacityScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, minimalCapacityScenario, 'high');
            
            // With minimal capacity, high season should likely exceed collection capacity
            const collectionCapacity = minimalCapacityScenario.rsuSystem.logistics.vehicles * 
                                      minimalCapacityScenario.rsuSystem.logistics.vehicleCapacity * 
                                      minimalCapacityScenario.rsuSystem.logistics.tripsPerVehicle;
            
            expect(collectionCapacity).toBeLessThan(5); // Very low capacity
            expect(result.current.high.rsu.collectionDeficit).toBeGreaterThanOrEqual(0);
            
            if (result.current.high.rsu.totalGeneration > collectionCapacity) {
                expect(highSeasonValidation.collectionConstraints.hasCapacityExceeded).toBe(true);
            }
        });

        test('handles extreme generation loads correctly', () => {
            const { result } = renderHook(() => useWasteSimulation(highGenerationScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, highGenerationScenario, 'high');
            
            // High generation should stress the system
            expect(result.current.high.rsu.totalGeneration).toBeGreaterThan(20); // Should be high generation
            expect(highSeasonValidation.collectionConstraints.utilizationRate).toBeGreaterThan(0.5); // High utilization
            
            // Collection deficit should be properly calculated
            const actualCollectionDeficit = result.current.high.rsu.collectionDeficit;
            expect(actualCollectionDeficit).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Transfer Station Capacity Constraints', () => {
        test('validates transfer station capacity limits in baseline scenario', () => {
            const { result } = renderHook(() => useWasteSimulation(baselineScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, baselineScenario, 'high');
            const lowSeasonValidation = validatePhysicalConstraints(result.current.low, baselineScenario, 'low');
            
            expect(highSeasonValidation.transferStationConstraints.isValid).toBe(true);
            expect(lowSeasonValidation.transferStationConstraints.isValid).toBe(true);
            
            // Final inventory should never exceed capacity
            const transferCapacity = baselineScenario.rsuSystem.processing.transferStationCapacity;
            expect(result.current.high.rsu.finalInventory).toBeLessThanOrEqual(transferCapacity);
            expect(result.current.low.rsu.finalInventory).toBeLessThanOrEqual(transferCapacity);
        });

        test('detects transfer station overloads in minimal capacity scenario', () => {
            const { result } = renderHook(() => useWasteSimulation(minimalCapacityScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, minimalCapacityScenario, 'high');
            
            // Check if transfer station is stressed
            const transferCapacity = minimalCapacityScenario.rsuSystem.processing.transferStationCapacity;
            const utilizationRate = result.current.high.rsu.finalInventory / transferCapacity;
            
            expect(highSeasonValidation.transferStationConstraints.utilizationRate).toBe(utilizationRate);
            expect(highSeasonValidation.transferStationConstraints.utilizationRate).toBeGreaterThanOrEqual(0);
            expect(highSeasonValidation.transferStationConstraints.utilizationRate).toBeLessThanOrEqual(1);
        });

        test('validates transfer station inventory levels remain within bounds', () => {
            const { result } = renderHook(() => useWasteSimulation(extremeCapacityScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, extremeCapacityScenario, 'high');
            
            // With extreme capacity, should have no capacity issues
            expect(highSeasonValidation.transferStationConstraints.isValid).toBe(true);
            expect(highSeasonValidation.transferStationConstraints.utilizationRate).toBeLessThan(0.5); // Low utilization
        });
    });

    describe('Final Transport Capacity Constraints', () => {
        test('validates final transport capacity is respected', () => {
            const { result } = renderHook(() => useWasteSimulation(baselineScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, baselineScenario, 'high');
            const lowSeasonValidation = validatePhysicalConstraints(result.current.low, baselineScenario, 'low');
            
            expect(highSeasonValidation.finalTransportConstraints.isValid).toBe(true);
            expect(lowSeasonValidation.finalTransportConstraints.isValid).toBe(true);
            
            // Final transport should handle material appropriately
            const transportCapacity = baselineScenario.rsuSystem.processing.finalTransportCapacity;
            expect(highSeasonValidation.finalTransportConstraints.dailyCapacity).toBe(transportCapacity);
        });

        test('detects final transport bottlenecks in high generation scenario', () => {
            const { result } = renderHook(() => useWasteSimulation(highGenerationScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, highGenerationScenario, 'high');
            
            // Check if final transport is a bottleneck
            const transportCapacity = highGenerationScenario.rsuSystem.processing.finalTransportCapacity;
            expect(highSeasonValidation.finalTransportConstraints.utilizationRate).toBeGreaterThanOrEqual(0);
            expect(highSeasonValidation.finalTransportConstraints.utilizationRate).toBeLessThanOrEqual(1);
            
            // Material should not disappear - check flow consistency
            const toDisposal = result.current.high.rsu.toDisposal;
            expect(toDisposal).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Inventory Constraints', () => {
        test('validates all inventories remain non-negative', () => {
            const { result } = renderHook(() => useWasteSimulation(baselineScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, baselineScenario, 'high');
            const lowSeasonValidation = validatePhysicalConstraints(result.current.low, baselineScenario, 'low');
            
            expect(highSeasonValidation.inventoryConstraints.allNonNegative).toBe(true);
            expect(lowSeasonValidation.inventoryConstraints.allNonNegative).toBe(true);
            
            // Check specific inventory levels
            const highInventories = result.current.high.rsu.inventoryLevels;
            const lowInventories = result.current.low.rsu.inventoryLevels;
            
            Object.values(highInventories).forEach(inventory => {
                expect(inventory).toBeGreaterThanOrEqual(0);
            });
            
            Object.values(lowInventories).forEach(inventory => {
                expect(inventory).toBeGreaterThanOrEqual(0);
            });
        });

        test('validates inventories respect physical capacity limits', () => {
            const { result } = renderHook(() => useWasteSimulation(baselineScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, baselineScenario, 'high');
            
            expect(highSeasonValidation.inventoryConstraints.allWithinLimits).toBe(true);
            
            // Transfer station inventory should not exceed capacity
            const transferStationInventory = result.current.high.rsu.inventoryLevels.transferStation;
            const transferStationCapacity = baselineScenario.rsuSystem.processing.transferStationCapacity;
            expect(transferStationInventory).toBeLessThanOrEqual(transferStationCapacity);
        });

        test('detects inventory limit violations in stress scenarios', () => {
            const { result } = renderHook(() => useWasteSimulation(minimalCapacityScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, minimalCapacityScenario, 'high');
            
            // Check if inventories are properly bounded
            const inventories = result.current.high.rsu.inventoryLevels;
            const transferCapacity = minimalCapacityScenario.rsuSystem.processing.transferStationCapacity;
            
            expect(inventories.transferStation).toBeLessThanOrEqual(transferCapacity);
            expect(inventories.transferStation).toBeGreaterThanOrEqual(0);
            
            // All inventories should be within reasonable bounds
            Object.entries(inventories).forEach(([type, value]) => {
                expect(value).toBeGreaterThanOrEqual(0);
                expect(value).toBeLessThan(1000); // Sanity check - no inventory should be extremely high
            });
        });
    });

    describe('System-wide Constraint Integration', () => {
        test('validates overall system feasibility in baseline scenario', () => {
            const { result } = renderHook(() => useWasteSimulation(baselineScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, baselineScenario, 'high');
            const lowSeasonValidation = validatePhysicalConstraints(result.current.low, baselineScenario, 'low');
            
            expect(highSeasonValidation.overallValid).toBe(true);
            expect(lowSeasonValidation.overallValid).toBe(true);
            
            // System should not have any critical constraint violations
            expect(highSeasonValidation.errors.length).toBe(0);
            expect(lowSeasonValidation.errors.length).toBe(0);
        });

        test('provides detailed constraint analysis for decision making', () => {
            const { result } = renderHook(() => useWasteSimulation(highGenerationScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, highGenerationScenario, 'high');
            
            // Should provide utilization rates for all capacities
            expect(highSeasonValidation.collectionConstraints.utilizationRate).toBeDefined();
            expect(highSeasonValidation.transferStationConstraints.utilizationRate).toBeDefined();
            expect(highSeasonValidation.finalTransportConstraints.utilizationRate).toBeDefined();
            
            // Should identify bottlenecks
            const bottlenecks = highSeasonValidation.bottleneckAnalysis;
            expect(bottlenecks).toBeDefined();
            expect(Array.isArray(bottlenecks.identifiedBottlenecks)).toBe(true);
        });

        test('handles edge cases with zero capacities gracefully', () => {
            const zeroCapacityScenario = {
                ...baselineScenario,
                rsuSystem: {
                    ...baselineScenario.rsuSystem,
                    logistics: { vehicles: 0, vehicleCapacity: 0, tripsPerVehicle: 0 },
                    processing: { transferStationRate: 0, transferStationCapacity: 0, finalTransportCapacity: 0 }
                }
            };

            const { result } = renderHook(() => useWasteSimulation(zeroCapacityScenario));
            
            const highSeasonValidation = validatePhysicalConstraints(result.current.high, zeroCapacityScenario, 'high');
            
            // Should handle zero capacities without crashing
            expect(highSeasonValidation).toBeDefined();
            expect(highSeasonValidation.overallValid).toBe(false); // System should be invalid with zero capacity
            expect(highSeasonValidation.errors.length).toBeGreaterThan(0); // Should report errors
        });
    });
});