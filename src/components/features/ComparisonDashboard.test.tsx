import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ComparisonDashboard from './ComparisonDashboard'

// Mock the useWasteSimulation hook
vi.mock('../../hooks/useWasteSimulation', () => ({
  useWasteSimulation: vi.fn(() => ({
    high: {
      totalGeneration: 10.5,
      rsu: {
        totalGeneration: 8.2,
        collectionDeficit: 0.5,
        netCostPerDay: 15000,
        recoveryByStage: {
          source: 2.1,
          plant: 1.5,
          informal: 0.8
        },
        toDisposal: 3.8,
        totalLeak: 0.2,
        incomeByMaterial: {
          pet: 500,
          aluminio: 300,
          carton: 200,
          vidrio: 100
        }
      },
      sargassumCost: 3000,
      rcdCost: 2000,
      totalSystemCost: 20000
    },
    low: {
      totalGeneration: 7.8,
      rsu: {
        totalGeneration: 6.1,
        collectionDeficit: 0.2,
        netCostPerDay: 12000,
        recoveryByStage: {
          source: 1.8,
          plant: 1.2,
          informal: 0.6
        },
        toDisposal: 2.5,
        totalLeak: 0.1,
        incomeByMaterial: {
          pet: 400,
          aluminio: 250,
          carton: 150,
          vidrio: 80
        }
      },
      sargassumCost: 2000,
      rcdCost: 1500,
      totalSystemCost: 15500
    }
  }))
}))

describe('ComparisonDashboard', () => {
  const mockScenarios = [
    {
      id: '1',
      name: 'Scenario A',
      description: 'Test scenario A',
      inputs: { test: 'data1' }
    },
    {
      id: '2', 
      name: 'Scenario B',
      description: 'Test scenario B',
      inputs: { test: 'data2' }
    }
  ]

  it('should render comparison dashboard with scenarios', () => {
    render(<ComparisonDashboard scenarios={mockScenarios} season="high" />)
    
    expect(screen.getByText('Comparación de Escenarios - Temporada Alta')).toBeInTheDocument()
    expect(screen.getByText('Scenario A')).toBeInTheDocument()
    expect(screen.getByText('Scenario B')).toBeInTheDocument()
  })

  it('should display KPI comparison cards by default', () => {
    render(<ComparisonDashboard scenarios={mockScenarios} season="high" />)
    
    expect(screen.getByText('Generación Total')).toBeInTheDocument()
    expect(screen.getByText('Generación RSU')).toBeInTheDocument()
    expect(screen.getByText('Déficit Recolección')).toBeInTheDocument()
    expect(screen.getByText('Costo Total')).toBeInTheDocument()
  })

  it('should switch to financial analysis when tab is clicked', () => {
    render(<ComparisonDashboard scenarios={mockScenarios} season="high" />)
    
    const financialTab = screen.getByText('Análisis Financiero')
    fireEvent.click(financialTab)
    
    // Should show financial analysis content
    expect(screen.getByText('Análisis Financiero Comparativo - Temporada Alta')).toBeInTheDocument()
  })

  it('should show correct season in title', () => {
    const { rerender } = render(<ComparisonDashboard scenarios={mockScenarios} season="high" />)
    expect(screen.getByText('Comparación de Escenarios - Temporada Alta')).toBeInTheDocument()
    
    rerender(<ComparisonDashboard scenarios={mockScenarios} season="low" />)
    expect(screen.getByText('Comparación de Escenarios - Temporada Baja')).toBeInTheDocument()
  })

  it('should display scenario count in subtitle', () => {
    render(<ComparisonDashboard scenarios={mockScenarios} season="high" />)
    
    expect(screen.getByText('Análisis comparativo de 2 escenarios para temporada alta')).toBeInTheDocument()
  })

  it('should render comparison summary table', () => {
    render(<ComparisonDashboard scenarios={mockScenarios} season="high" />)
    
    expect(screen.getByText('Resumen Comparativo')).toBeInTheDocument()
    expect(screen.getByText('Gen. Total')).toBeInTheDocument()
    expect(screen.getByText('Gen. RSU')).toBeInTheDocument()
  })

  it('should handle single scenario', () => {
    const singleScenario = [mockScenarios[0]]
    render(<ComparisonDashboard scenarios={singleScenario} season="high" />)
    
    expect(screen.getByText('Análisis comparativo de 1 escenarios para temporada alta')).toBeInTheDocument()
    expect(screen.getByText('Scenario A')).toBeInTheDocument()
    expect(screen.queryByText('Scenario B')).not.toBeInTheDocument()
  })

  it('should apply active tab styling correctly', () => {
    render(<ComparisonDashboard scenarios={mockScenarios} season="high" />)
    
    const kpiTab = screen.getByText('Dashboard de KPIs')
    const financialTab = screen.getByText('Análisis Financiero')
    
    // KPI tab should be active by default
    expect(kpiTab).toHaveClass('text-blue-600', 'border-b-2', 'border-blue-600', 'bg-blue-50')
    expect(financialTab).toHaveClass('text-slate-500')
    
    // Click financial tab
    fireEvent.click(financialTab)
    
    expect(financialTab).toHaveClass('text-blue-600', 'border-b-2', 'border-blue-600', 'bg-blue-50')
  })
})