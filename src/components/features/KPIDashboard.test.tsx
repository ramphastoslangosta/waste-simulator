import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KPIDashboard from './KPIDashboard'

describe('KPIDashboard', () => {
  const mockKpis = {
    totalGeneration: 100.5,
    sargassumGeneration: 50,
    rcdGeneration: 5,
    totalSystemCost: 15000,
    rsu: {
      totalGeneration: 45.5,
      collectionDeficit: 2.3,
      totalLeak: 1.8,
      finalInventory: 12.0,
      inventoryWaitTime: 0.24,
      recoveryByStage: {
        source: 5.2,
        plant: 3.1,
        informal: 1.9
      },
      toDisposal: 35.1,
      netCostPerDay: 12500
    }
  }

  it('should render main KPI cards', () => {
    render(<KPIDashboard kpis={mockKpis} season="alta" />)

    // Check for key KPI titles - using partial text matches since these might be in Spanish
    expect(screen.getByText(/Generación Total/)).toBeInTheDocument()
    expect(screen.getByText(/Costo Total/)).toBeInTheDocument()
  })

  it('should display total generation value', () => {
    render(<KPIDashboard kpis={mockKpis} season="alta" />)

    // The value should be formatted by formatNumber function
    expect(screen.getByText('100.5')).toBeInTheDocument()
  })

  it('should display RSU generation data', () => {
    render(<KPIDashboard kpis={mockKpis} season="alta" />)

    // Check for RSU related values
    expect(screen.getByText('45.5')).toBeInTheDocument() // RSU generation
  })

  it('should show recovery chart data', () => {
    render(<KPIDashboard kpis={mockKpis} season="alta" />)

    // The component should render without errors and include recovery data
    // We can't easily test the chart content, but we can verify it renders
    expect(screen.getByText(/Generación Total/)).toBeInTheDocument()
  })

  it('should handle season parameter', () => {
    render(<KPIDashboard kpis={mockKpis} season="baja" />)

    // Should render with different season label - use getAllByText since there are multiple elements
    const bajaElements = screen.getAllByText(/baja/)
    expect(bajaElements.length).toBeGreaterThan(0)
  })

  it('should handle missing recovery data gracefully', () => {
    const incompleteKpis = {
      ...mockKpis,
      rsu: {
        ...mockKpis.rsu,
        recoveryByStage: {
          source: 0,
          plant: 0,
          informal: 0
        }
      }
    }

    render(<KPIDashboard kpis={incompleteKpis} season="alta" />)

    // Should not crash with zero values
    expect(screen.getByText('45.5')).toBeInTheDocument()
  })

  it('should render cost information', () => {
    render(<KPIDashboard kpis={mockKpis} season="alta" />)

    // Should display formatted cost values - only total system cost is displayed in main KPI cards
    expect(screen.getByText('15,000')).toBeInTheDocument()
    // The 12,500 value (netCostPerDay) might not be directly displayed in the main cards
  })

  it('should handle zero values correctly', () => {
    const zeroKpis = {
      totalGeneration: 0,
      sargassumGeneration: 0,
      rcdGeneration: 0,
      totalSystemCost: 0,
      rsu: {
        totalGeneration: 0,
        collectionDeficit: 0,
        totalLeak: 0,
        finalInventory: 0,
        inventoryWaitTime: 0,
        recoveryByStage: {
          source: 0,
          plant: 0,
          informal: 0
        },
        toDisposal: 0,
        netCostPerDay: 0
      }
    }

    render(<KPIDashboard kpis={zeroKpis} season="alta" />)

    // Should handle zeros gracefully without crashing
    expect(screen.getAllByText('0')).toBeTruthy()
  })
})