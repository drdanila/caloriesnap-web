import { describe, it, expect } from 'vitest'
import { confidenceBand, formatCalories, isLowConfidence, hasPortion } from './nutrition'

describe('confidenceBand', () => {
  it('maps the spec bands 90 / 70 / 50', () => {
    expect(confidenceBand(95).band).toBe('high')
    expect(confidenceBand(90).band).toBe('high')
    expect(confidenceBand(89).band).toBe('medium')
    expect(confidenceBand(70).band).toBe('medium')
    expect(confidenceBand(69).band).toBe('low')
    expect(confidenceBand(50).band).toBe('low')
    expect(confidenceBand(49).band).toBe('unreliable')
    expect(confidenceBand(0).band).toBe('unreliable')
  })

  it('exposes a tone and color consistent with the band', () => {
    expect(confidenceBand(95).tone).toBe('success')
    expect(confidenceBand(60).tone).toBe('warning')
    expect(confidenceBand(10).tone).toBe('danger')
    expect(confidenceBand(60).color).toBe('var(--c-warning)')
  })
})

describe('formatCalories', () => {
  it('shows a single value when there is no meaningful range', () => {
    expect(formatCalories({ calories: 471 })).toBe('471')
    expect(formatCalories({ calories: 400, caloriesMin: 400, caloriesMax: 400 })).toBe('400')
  })

  it('shows a range when min and max differ (rounded)', () => {
    expect(formatCalories({ calories: 470, caloriesMin: 420, caloriesMax: 520 })).toBe('420–520')
    expect(formatCalories({ calories: 471.6, caloriesMin: 419.4, caloriesMax: 520.5 })).toBe('419–521')
  })

  it('rounds the point value', () => {
    expect(formatCalories({ calories: 470.6 })).toBe('471')
  })

  it('treats a range that rounds to the same value as a point', () => {
    expect(formatCalories({ calories: 400, caloriesMin: 399.6, caloriesMax: 400.4 })).toBe('400')
  })
})

describe('isLowConfidence', () => {
  it('flags confidence below 50', () => {
    expect(isLowConfidence({ confidence: 40, imageQuality: 'good' })).toBe(true)
    expect(isLowConfidence({ confidence: 60, imageQuality: 'good' })).toBe(false)
  })

  it('flags poor image quality regardless of confidence', () => {
    expect(isLowConfidence({ confidence: 95, imageQuality: 'poor' })).toBe(true)
  })

  it('is not low when confidence is fine and quality is unset', () => {
    expect(isLowConfidence({ confidence: 80 })).toBe(false)
  })
})

describe('hasPortion', () => {
  it('is true for a non-empty string', () => {
    expect(hasPortion('250g')).toBe(true)
  })

  it('is false for null, empty, or whitespace', () => {
    expect(hasPortion(null)).toBe(false)
    expect(hasPortion(undefined)).toBe(false)
    expect(hasPortion('')).toBe(false)
    expect(hasPortion('   ')).toBe(false)
  })
})
