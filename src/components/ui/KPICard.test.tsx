import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KPICard from './KPICard'

describe('KPICard', () => {
  const mockProps = {
    title: 'Total Generation',
    value: '1,234.56',
    unit: 'tons/day',
    description: 'Daily waste generation',
    color: 'text-blue-600'
  }

  it('should render title, value, and unit correctly', () => {
    render(<KPICard {...mockProps} />)
    
    expect(screen.getByText('Total Generation')).toBeInTheDocument()
    expect(screen.getByText('1,234.56')).toBeInTheDocument()
    expect(screen.getByText('tons/day')).toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(<KPICard {...mockProps} />)
    
    expect(screen.getByText('Daily waste generation')).toBeInTheDocument()
  })

  it('should apply custom color class', () => {
    render(<KPICard {...mockProps} color="text-red-600" />)
    
    // The color class is applied to the <p> element containing the value
    const valueContainer = screen.getByText('1,234.56').closest('p')
    expect(valueContainer).toHaveClass('text-red-600')
  })

  it('should use default blue color when no color specified', () => {
    const { color: _color, ...propsWithoutColor } = mockProps
    render(<KPICard {...propsWithoutColor} />)
    
    // The default color class is applied to the <p> element containing the value
    const valueContainer = screen.getByText('1,234.56').closest('p')
    expect(valueContainer).toHaveClass('text-blue-600')
  })

  it('should render without description', () => {
    const { description: _description, ...propsWithoutDescription } = mockProps
    render(<KPICard {...propsWithoutDescription} />)
    
    expect(screen.getByText('Total Generation')).toBeInTheDocument()
    expect(screen.getByText('1,234.56')).toBeInTheDocument()
  })

  it('should handle different value formats', () => {
    render(<KPICard {...mockProps} value="1,000,000" />)
    
    expect(screen.getByText('1,000,000')).toBeInTheDocument()
  })

  it('should handle small decimal values', () => {
    render(<KPICard {...mockProps} value="0.123" />)
    
    expect(screen.getByText('0.123')).toBeInTheDocument()
  })

  it('should render empty string values', () => {
    render(<KPICard {...mockProps} value="" />)
    
    expect(screen.getByText('Total Generation')).toBeInTheDocument()
    expect(screen.getByText('tons/day')).toBeInTheDocument()
  })
})