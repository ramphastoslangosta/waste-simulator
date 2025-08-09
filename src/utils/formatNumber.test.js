import { describe, it, expect } from 'vitest'
import { formatNumber } from './formatNumber'

describe('formatNumber', () => {
  it('should format integers without decimals', () => {
    expect(formatNumber(1000, 0)).toBe('1,000')
    expect(formatNumber(1234567, 0)).toBe('1,234,567')
    expect(formatNumber(0, 0)).toBe('0')
  })

  it('should format decimals with specified precision', () => {
    expect(formatNumber(1234.56, 2)).toBe('1,234.56')  // Spanish locale preserves decimals
    expect(formatNumber(1000.1, 1)).toBe('1,000.1')
    expect(formatNumber(0.123, 3)).toBe('0.123')
  })

  it('should handle edge cases', () => {
    expect(formatNumber(null)).toBe('0')
    expect(formatNumber(undefined)).toBe('0')
    expect(formatNumber(NaN)).toBe('0')
    expect(formatNumber(-1000, 0)).toBe('-1,000')
  })

  it('should handle very small numbers with appropriate decimals', () => {
    expect(formatNumber(0.001, 3)).toBe('0.001')
    expect(formatNumber(0.0001, 0)).toBe('0')  // Rounds to 0 with 0 decimals
  })

  it('should handle very large numbers', () => {
    expect(formatNumber(1000000000, 0)).toBe('1,000,000,000')
  })

  it('should use default decimals parameter', () => {
    expect(formatNumber(1234.567)).toBe('1,235')  // Default 0 decimals, rounded
  })
})