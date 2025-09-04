import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ScenarioManager from './ScenarioManager'

// Mock hooks
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: '1', email: 'test@example.com' }
  }))
}))

vi.mock('../../hooks/useScenarios', () => ({
  useScenarios: vi.fn(() => ({
    scenarios: [
      {
        id: '1',
        name: 'Test Scenario 1',
        description: 'Description 1',
        inputs: { test: 'data1' },
        created_at: '2023-01-01T00:00:00Z'
      },
      {
        id: '2', 
        name: 'Test Scenario 2',
        description: 'Description 2',
        inputs: { test: 'data2' },
        created_at: '2023-01-02T00:00:00Z'
      }
    ],
    loading: false,
    saveScenario: vi.fn(),
    deleteScenario: vi.fn()
  }))
}))

// Mock CSV utils
vi.mock('../../utils/csvUtils', () => ({
  exportScenariosToCSV: vi.fn(() => 'csv,content'),
  downloadCSV: vi.fn(),
  parseCSVToScenarios: vi.fn(() => [])
}))

describe('ScenarioManager', () => {
  const mockProps = {
    currentInputs: { test: 'current' },
    onLoadScenario: vi.fn(),
    onCompareScenarios: vi.fn()
  }

  it('should render scenario manager with scenarios', () => {
    render(<ScenarioManager {...mockProps} />)
    
    expect(screen.getByText('Gestión de Escenarios')).toBeInTheDocument()
    expect(screen.getByText('Test Scenario 1')).toBeInTheDocument()
    expect(screen.getByText('Test Scenario 2')).toBeInTheDocument()
  })

  it('should show comparison mode toggle when scenarios >= 2', () => {
    render(<ScenarioManager {...mockProps} />)
    
    expect(screen.getByText('Modo Comparación')).toBeInTheDocument()
  })

  it('should toggle comparison mode when button clicked', () => {
    render(<ScenarioManager {...mockProps} />)
    
    const toggleButton = screen.getByText('Modo Comparación')
    fireEvent.click(toggleButton)
    
    expect(screen.getByText('Cancelar Comparación')).toBeInTheDocument()
    // Should show checkboxes for scenarios
    expect(screen.getAllByRole('checkbox')).toHaveLength(2)
  })

  it('should enable compare button when 2 or more scenarios selected', () => {
    render(<ScenarioManager {...mockProps} />)
    
    // Enable comparison mode
    const toggleButton = screen.getByText('Modo Comparación')
    fireEvent.click(toggleButton)
    
    const checkboxes = screen.getAllByRole('checkbox')
    
    // Initially compare button should be disabled
    const compareButton = screen.getByText(/Comparar Seleccionados/)
    expect(compareButton).toBeDisabled()
    
    // Select first scenario
    fireEvent.click(checkboxes[0])
    expect(compareButton).toBeDisabled()
    
    // Select second scenario
    fireEvent.click(checkboxes[1])
    expect(compareButton).not.toBeDisabled()
  })

  it('should call onCompareScenarios when compare button clicked', () => {
    render(<ScenarioManager {...mockProps} />)
    
    // Enable comparison mode
    fireEvent.click(screen.getByText('Modo Comparación'))
    
    // Select both scenarios
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])
    
    // Click compare button
    const compareButton = screen.getByText(/Comparar Seleccionados/)
    fireEvent.click(compareButton)
    
    expect(mockProps.onCompareScenarios).toHaveBeenCalledWith(['1', '2'])
  })

  it('should hide load buttons in comparison mode', () => {
    render(<ScenarioManager {...mockProps} />)
    
    // Initially load buttons should be visible
    expect(screen.getAllByText('Cargar')).toHaveLength(2)
    
    // Enable comparison mode
    fireEvent.click(screen.getByText('Modo Comparación'))
    
    // Load buttons should be hidden
    expect(screen.queryByText('Cargar')).not.toBeInTheDocument()
  })

  it('should show selected scenario count in compare button', () => {
    render(<ScenarioManager {...mockProps} />)
    
    // Enable comparison mode
    fireEvent.click(screen.getByText('Modo Comparación'))
    
    // Initially shows 0 selected
    expect(screen.getByText('Comparar Seleccionados (0)')).toBeInTheDocument()
    
    // Select one scenario
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    
    expect(screen.getByText('Comparar Seleccionados (1)')).toBeInTheDocument()
    
    // Select second scenario
    fireEvent.click(checkboxes[1])
    
    expect(screen.getByText('Comparar Seleccionados (2)')).toBeInTheDocument()
  })

  it('should apply different styling to selected scenarios', () => {
    render(<ScenarioManager {...mockProps} />)
    
    // Enable comparison mode
    fireEvent.click(screen.getByText('Modo Comparación'))
    
    const checkboxes = screen.getAllByRole('checkbox')
    const scenarioCards = screen.getAllByText('Test Scenario 1')[0].closest('div')
    
    // Initially no special styling
    expect(scenarioCards).toHaveClass('border-slate-200')
    
    // Select scenario
    fireEvent.click(checkboxes[0])
    
    // Should have purple styling when selected
    expect(scenarioCards?.closest('div')).toHaveClass('border-purple-300', 'bg-purple-50')
  })

  it('should show guardar actual button', () => {
    render(<ScenarioManager {...mockProps} />)
    
    expect(screen.getByText('Guardar Actual')).toBeInTheDocument()
  })

  it('should show export and import buttons', () => {
    render(<ScenarioManager {...mockProps} />)
    
    expect(screen.getByText('Exportar CSV')).toBeInTheDocument()
    expect(screen.getByText('Importar CSV')).toBeInTheDocument()
  })
})