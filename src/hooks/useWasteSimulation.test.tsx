import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useWasteSimulation } from './useWasteSimulation'
import { INITIAL_INPUTS } from '../constants/initialState'

describe('useWasteSimulation', () => {
  const mockInputs = {
    ...INITIAL_INPUTS,
    // Simplified inputs for testing
    general: { fixedPopulation: 1000, highSeasonOccupancy: 80, lowSeasonOccupancy: 30 },
    generation: {
      hotels: { units: 100, rate: 1.0, sourceSeparationRate: 20 },
      restaurants: { units: 10, rate: 10, sourceSeparationRate: 10 },
      homes: { rate: 0.5, sourceSeparationRate: 5 },
      commerce: { units: 20, rate: 2, sourceSeparationRate: 25 },
    }
  }

  describe('Basic simulation functionality', () => {
    it('should return results for both high and low seasons', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      expect(result.current).toHaveProperty('high')
      expect(result.current).toHaveProperty('low')
      expect(result.current.high).toBeInstanceOf(Object)
      expect(result.current.low).toBeInstanceOf(Object)
    })

    it('should calculate total generation correctly', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      // High season should have higher total generation than low season
      expect(result.current.high.totalGeneration).toBeGreaterThan(
        result.current.low.totalGeneration
      )
      
      // Both should be positive numbers
      expect(result.current.high.totalGeneration).toBeGreaterThan(0)
      expect(result.current.low.totalGeneration).toBeGreaterThan(0)
    })

    it('should include RSU generation data', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      const highSeasonRSU = result.current.high.rsu
      expect(highSeasonRSU).toHaveProperty('totalGeneration')
      expect(highSeasonRSU).toHaveProperty('collectionDeficit')
      expect(highSeasonRSU).toHaveProperty('totalLeak')
      expect(highSeasonRSU).toHaveProperty('toDisposal')
      expect(highSeasonRSU).toHaveProperty('netCostPerDay')
      
      // Values should be numbers
      expect(typeof highSeasonRSU.totalGeneration).toBe('number')
      expect(typeof highSeasonRSU.netCostPerDay).toBe('number')
    })
  })

  describe('Seasonal differences', () => {
    it('should show higher generation in high season vs low season', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      expect(result.current.high.rsu.totalGeneration).toBeGreaterThan(
        result.current.low.rsu.totalGeneration
      )
    })

    it('should calculate generation by source correctly', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      const highGenBySource = result.current.high.rsu.genBySource
      const lowGenBySource = result.current.low.rsu.genBySource

      // Check all sources are present
      expect(highGenBySource).toHaveProperty('hotels')
      expect(highGenBySource).toHaveProperty('restaurants') 
      expect(highGenBySource).toHaveProperty('homes')
      expect(highGenBySource).toHaveProperty('commerce')

      // Hotels should generate more in high season (occupancy effect)
      expect(highGenBySource.hotels).toBeGreaterThan(lowGenBySource.hotels)
      
      // Homes should be the same (fixed population)
      expect(highGenBySource.homes).toBeCloseTo(lowGenBySource.homes, 5)
    })

    it('should show different sargassum generation by season', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      expect(result.current.high.sargassumGeneration).toBeGreaterThan(
        result.current.low.sargassumGeneration
      )
    })
  })

  describe('Economic calculations', () => {
    it('should calculate costs and income correctly', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      const rsuData = result.current.high.rsu
      expect(rsuData).toHaveProperty('totalRsuCosts')
      expect(rsuData).toHaveProperty('totalRsuIncome') 
      expect(rsuData).toHaveProperty('netCostPerDay')
      expect(rsuData).toHaveProperty('incomeByMaterial')

      // Costs should be positive
      expect(rsuData.totalRsuCosts).toBeGreaterThan(0)
      expect(rsuData.totalRsuIncome).toBeGreaterThanOrEqual(0)

      // Net cost should equal costs minus income
      const expectedNetCost = rsuData.totalRsuCosts - rsuData.totalRsuIncome
      expect(rsuData.netCostPerDay).toBeCloseTo(expectedNetCost, 2)
    })

    it('should calculate total system cost including special wastes', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      expect(result.current.high).toHaveProperty('totalSystemCost')
      expect(result.current.high).toHaveProperty('sargassumCost')
      expect(result.current.high).toHaveProperty('rcdCost')

      // Total should be sum of all costs
      const expectedTotal = result.current.high.rsu.netCostPerDay + 
                           result.current.high.sargassumCost + 
                           result.current.high.rcdCost

      expect(result.current.high.totalSystemCost).toBeCloseTo(expectedTotal, 2)
    })
  })

  describe('Material flow calculations', () => {
    it('should track recovery by stage', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      const recovery = result.current.high.rsu.recoveryByStage
      expect(recovery).toHaveProperty('source')
      expect(recovery).toHaveProperty('plant')
      expect(recovery).toHaveProperty('informal')

      // All recovery values should be non-negative
      expect(recovery.source).toBeGreaterThanOrEqual(0)
      expect(recovery.plant).toBeGreaterThanOrEqual(0)
      expect(recovery.informal).toBeGreaterThanOrEqual(0)
    })

    it('should maintain material balance', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      const rsuData = result.current.high.rsu
      const totalGenerated = rsuData.totalGeneration
      const totalRecovered = rsuData.recoveryByStage.source + 
                            rsuData.recoveryByStage.plant + 
                            rsuData.recoveryByStage.informal
      const totalDisposed = rsuData.toDisposal
      const totalLeaks = rsuData.totalLeak

      // Generated waste should approximately equal recovered + disposed + leaked + inventory
      const accountedWaste = totalRecovered + totalDisposed + totalLeaks + rsuData.finalInventory
      
      // Allow for small rounding differences
      expect(Math.abs(totalGenerated - accountedWaste)).toBeLessThan(0.1)
    })
  })

  describe('Edge cases and validation', () => {
    it('should handle zero occupancy gracefully', () => {
      const zeroOccupancyInputs = {
        ...mockInputs,
        general: { ...mockInputs.general, lowSeasonOccupancy: 0 }
      }

      const { result } = renderHook(() => useWasteSimulation(zeroOccupancyInputs))
      
      // Should not crash and should return valid results
      expect(result.current.low.rsu.genBySource.hotels).toBe(0)
      expect(result.current.low.totalGeneration).toBeGreaterThanOrEqual(0)
    })

    it('should handle insufficient collection capacity', () => {
      const lowCapacityInputs = {
        ...mockInputs,
        rsuSystem: {
          ...mockInputs.rsuSystem,
          logistics: { vehicles: 1, vehicleCapacity: 0.1, tripsPerVehicle: 1 }
        }
      }

      const { result } = renderHook(() => useWasteSimulation(lowCapacityInputs))
      
      // Should show collection deficit when capacity is very low
      expect(result.current.high.rsu.collectionDeficit).toBeGreaterThanOrEqual(0)
      
      // Alternative: check that total generation is greater than collection capacity
      const totalGeneration = result.current.high.rsu.totalGeneration
      const collectionCapacity = lowCapacityInputs.rsuSystem.logistics.vehicles * 
                                 lowCapacityInputs.rsuSystem.logistics.vehicleCapacity * 
                                 lowCapacityInputs.rsuSystem.logistics.tripsPerVehicle
      
      if (totalGeneration > collectionCapacity) {
        expect(result.current.high.rsu.collectionDeficit).toBeGreaterThan(0)
      }
    })

    it('should recalculate when inputs change', () => {
      const { result, rerender } = renderHook(
        ({ inputs }) => useWasteSimulation(inputs),
        { initialProps: { inputs: mockInputs } }
      )

      const initialGeneration = result.current.high.totalGeneration

      // Change inputs
      const newInputs = {
        ...mockInputs,
        general: { ...mockInputs.general, highSeasonOccupancy: 100 }
      }

      rerender({ inputs: newInputs })

      // Results should change
      expect(result.current.high.totalGeneration).not.toBe(initialGeneration)
      expect(result.current.high.totalGeneration).toBeGreaterThan(initialGeneration)
    })
  })

  describe('Data structure validation', () => {
    it('should return consistent data structure', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      // Both seasons should have the same structure
      const highKeys = Object.keys(result.current.high).sort()
      const lowKeys = Object.keys(result.current.low).sort()
      
      expect(highKeys).toEqual(lowKeys)

      // RSU data should have consistent structure
      const highRsuKeys = Object.keys(result.current.high.rsu).sort()
      const lowRsuKeys = Object.keys(result.current.low.rsu).sort()
      
      expect(highRsuKeys).toEqual(lowRsuKeys)
    })

    it('should include calculation details for debugging', () => {
      const { result } = renderHook(() => useWasteSimulation(mockInputs))

      const calculations = result.current.high.rsu.calculations
      expect(calculations).toHaveProperty('genBySource')
      expect(calculations).toHaveProperty('collectionCapacity')
      expect(calculations).toHaveProperty('collectedWasteTotal')
      expect(calculations).toHaveProperty('materialProcessedToday')
    })
  })
})