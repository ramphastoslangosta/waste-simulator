/**
 * Mass Conservation Validation Tests
 * 
 * Validates that the fundamental physics law of mass conservation holds:
 * G_total = Material_disposed + Material_recovered + Material_valorized + Leaks_total
 * 
 * This is critical for scientific credibility of the waste management simulation model.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { useWasteSimulation } from '../../hooks/useWasteSimulation.tsx';
import { renderHook } from '@testing-library/react';
import { validateMassConservation } from '../../utils/validation/massValidator.js';
import { baselineScenario, extremeScenario, valorizationScenario } from './helpers/testScenarios.js';

describe('Mass Conservation Validation', () => {
  let simulationResults;

  describe('Baseline Scenarios', () => {
    test('validates mass conservation in high season baseline scenario', () => {
      const { result } = renderHook(() => useWasteSimulation(baselineScenario));
      const highSeasonKPIs = result.current.high;
      
      const validation = validateMassConservation(highSeasonKPIs, baselineScenario, 'high');
      
      expect(validation.isValid).toBe(true);
      expect(validation.massBalance.error).toBeLessThan(0.01); // Less than 1% error
      expect(validation.massBalance.totalGenerated).toBeGreaterThan(0);
      expect(validation.massBalance.totalAccounted).toBeGreaterThan(0);
    });

    test('validates mass conservation in low season baseline scenario', () => {
      const { result } = renderHook(() => useWasteSimulation(baselineScenario));
      const lowSeasonKPIs = result.current.low;
      
      const validation = validateMassConservation(lowSeasonKPIs, baselineScenario, 'low');
      
      expect(validation.isValid).toBe(true);
      expect(validation.massBalance.error).toBeLessThan(0.01); // Less than 1% error
      expect(validation.massBalance.totalGenerated).toBeGreaterThan(0);
      expect(validation.massBalance.totalAccounted).toBeGreaterThan(0);
    });
  });

  describe('Valorization Scenarios', () => {
    test('validates mass conservation with all valorization processes active', () => {
      const { result } = renderHook(() => useWasteSimulation(valorizationScenario));
      const highSeasonKPIs = result.current.high;
      
      const validation = validateMassConservation(highSeasonKPIs, valorizationScenario, 'high');
      
      expect(validation.isValid).toBe(true);
      expect(validation.massBalance.error).toBeLessThan(0.01);
      expect(validation.components.valorized).toBeGreaterThan(0); // Should have valorization
    });

    test('validates that valorization reduces disposal but maintains mass balance', () => {
      const { result: baseline } = renderHook(() => useWasteSimulation(baselineScenario));
      const { result: valorization } = renderHook(() => useWasteSimulation(valorizationScenario));
      
      const baselineValidation = validateMassConservation(baseline.current.high, baselineScenario, 'high');
      const valorizationValidation = validateMassConservation(valorization.current.high, valorizationScenario, 'high');
      
      // Both should be valid
      expect(baselineValidation.isValid).toBe(true);
      expect(valorizationValidation.isValid).toBe(true);
      
      // Valorization should reduce disposal
      expect(valorizationValidation.components.disposed).toBeLessThan(baselineValidation.components.disposed);
      
      // But both should have same total generation (approximately)
      expect(Math.abs(
        valorizationValidation.massBalance.totalGenerated - baselineValidation.massBalance.totalGenerated
      )).toBeLessThan(0.1);
    });
  });

  describe('Extreme Scenarios', () => {
    test('validates mass conservation under extreme generation (5x normal)', () => {
      const { result } = renderHook(() => useWasteSimulation(extremeScenario));
      const highSeasonKPIs = result.current.high;
      
      const validation = validateMassConservation(highSeasonKPIs, extremeScenario, 'high');
      
      expect(validation.isValid).toBe(true);
      expect(validation.massBalance.error).toBeLessThan(0.05); // Allow slightly higher error for extreme cases
      
      // Should have significant collection deficits
      expect(validation.components.collectionDeficit).toBeGreaterThan(0);
    });

    test('detects and reports mass balance violations', () => {
      // This test would use a deliberately broken scenario
      // For now, we'll test the validation logic itself
      const mockBrokenKPIs = {
        rsu: {
          totalGeneration: 100,
          toDisposal: 50,
          recoveryByStage: { source: 10, plant: 5, informal: 5 },
          totalLeak: 10
        },
        valorization: { composted: 0, biogas: 0, pyrolyzed: 0 }
      };
      
      const validation = validateMassConservation(mockBrokenKPIs, baselineScenario, 'high');
      
      // This should fail (100 ≠ 50 + 20 + 0 + 10 = 80)
      expect(validation.isValid).toBe(false);
      expect(validation.massBalance.error).toBeGreaterThan(0.1);
      expect(validation.errors).toContain('Mass balance violation detected');
    });
  });

  describe('Component-Level Validation', () => {
    test('validates that all mass components are properly accounted for', () => {
      const { result } = renderHook(() => useWasteSimulation(baselineScenario));
      const kpis = result.current.high;
      
      const validation = validateMassConservation(kpis, baselineScenario, 'high');
      
      // All components should be >= 0
      expect(validation.components.generated).toBeGreaterThanOrEqual(0);
      expect(validation.components.disposed).toBeGreaterThanOrEqual(0);
      expect(validation.components.recovered).toBeGreaterThanOrEqual(0);
      expect(validation.components.valorized).toBeGreaterThanOrEqual(0);
      expect(validation.components.leaked).toBeGreaterThanOrEqual(0);
      expect(validation.components.collectionDeficit).toBeGreaterThanOrEqual(0);
      
      // Total accounted should equal sum of components
      const sumComponents = validation.components.disposed + 
                           validation.components.recovered + 
                           validation.components.valorized + 
                           validation.components.leaked + 
                           validation.components.collectionDeficit;
      
      expect(Math.abs(validation.components.generated - sumComponents)).toBeLessThan(0.01);
    });

    test('validates material flow consistency across stages', () => {
      const { result } = renderHook(() => useWasteSimulation(baselineScenario));
      const kpis = result.current.high;
      
      // Material entering each stage should equal material leaving + inventory change
      // This is a simplified check - full implementation would be more detailed
      const collectedWaste = kpis.rsu.totalGeneration - (kpis.rsu.collectionDeficit || 0);
      const materialAfterCollection = collectedWaste - (kpis.rsu.totalLeak || 0);
      
      expect(materialAfterCollection).toBeGreaterThanOrEqual(0);
      expect(collectedWaste).toBeGreaterThanOrEqual(materialAfterCollection);
    });
  });

  describe('Temporal Consistency', () => {
    test('validates that mass conservation holds over simulation period', () => {
      // Test that the 30-day simulation maintains mass conservation
      // and that the 7-day averaging doesn't introduce errors
      const { result } = renderHook(() => useWasteSimulation(baselineScenario));
      
      // Both seasons should maintain mass conservation
      const highValidation = validateMassConservation(result.current.high, baselineScenario, 'high');
      const lowValidation = validateMassConservation(result.current.low, baselineScenario, 'low');
      
      expect(highValidation.isValid).toBe(true);
      expect(lowValidation.isValid).toBe(true);
      
      // Proportional relationships should be maintained
      const highGeneration = highValidation.massBalance.totalGenerated;
      const lowGeneration = lowValidation.massBalance.totalGenerated;
      
      // High season should generate more waste due to tourism
      expect(highGeneration).toBeGreaterThan(lowGeneration);
    });
  });

  describe('Performance and Edge Cases', () => {
    test('validation completes within acceptable time limits', () => {
      const startTime = performance.now();
      
      const { result } = renderHook(() => useWasteSimulation(baselineScenario));
      const validation = validateMassConservation(result.current.high, baselineScenario, 'high');
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
      expect(validation.isValid).toBe(true);
    });

    test('handles zero generation scenarios gracefully', () => {
      const zeroScenario = {
        ...baselineScenario,
        generation: {
          hotels: { ...baselineScenario.generation.hotels, rate: 0 },
          restaurants: { ...baselineScenario.generation.restaurants, rate: 0 },
          homes: { ...baselineScenario.generation.homes, rate: 0 },
          commerce: { ...baselineScenario.generation.commerce, rate: 0 }
        }
      };
      
      const { result } = renderHook(() => useWasteSimulation(zeroScenario));
      const validation = validateMassConservation(result.current.high, zeroScenario, 'high');
      
      expect(validation.isValid).toBe(true);
      expect(validation.massBalance.totalGenerated).toBe(0);
      expect(validation.components.disposed).toBe(0);
    });
  });
});

/**
 * Integration test that validates mass conservation across different parameter sets
 */
describe('Mass Conservation Integration Tests', () => {
  test('validates conservation across multiple realistic scenarios', () => {
    const scenarios = [baselineScenario, valorizationScenario];
    const results = [];
    
    scenarios.forEach((scenario, index) => {
      const { result } = renderHook(() => useWasteSimulation(scenario));
      
      const highValidation = validateMassConservation(result.current.high, scenario, 'high');
      const lowValidation = validateMassConservation(result.current.low, scenario, 'low');
      
      results.push({ 
        scenario: index, 
        high: highValidation, 
        low: lowValidation 
      });
      
      expect(highValidation.isValid).toBe(true);
      expect(lowValidation.isValid).toBe(true);
    });
    
    // All scenarios should maintain mass conservation
    expect(results.every(r => r.high.isValid && r.low.isValid)).toBe(true);
  });
});