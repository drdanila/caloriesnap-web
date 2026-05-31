import { describe, it, expect, vi } from 'vitest'
import type { DocumentData } from 'firebase/firestore'

// mealService.ts imports `db` from ../config/firebase, whose module body calls
// initializeApp(). Stub it so importing the service never touches real Firebase.
vi.mock('../config/firebase', () => ({ db: {} }))

import { mapMealDoc } from './mealService'

describe('mapMealDoc', () => {
  it('converts a Firestore Timestamp createdAt to a Date', () => {
    const when = new Date('2026-05-31T10:00:00Z')
    const data: DocumentData = {
      userId: 'u1',
      dishName: 'Oatmeal',
      calories: 350,
      createdAt: { toDate: () => when }, // Timestamp-like
    }
    const meal = mapMealDoc('doc-1', data)
    expect(meal.createdAt).toBeInstanceOf(Date)
    expect(meal.createdAt).toEqual(when)
  })

  it('falls back to a fresh Date when createdAt is missing', () => {
    const before = Date.now()
    const meal = mapMealDoc('doc-2', { userId: 'u1', dishName: 'Salad', calories: 120 })
    const after = Date.now()
    expect(meal.createdAt).toBeInstanceOf(Date)
    expect(meal.createdAt.getTime()).toBeGreaterThanOrEqual(before)
    expect(meal.createdAt.getTime()).toBeLessThanOrEqual(after)
  })

  it('uses the doc id argument, overriding any id field in the data', () => {
    const meal = mapMealDoc('real-id', { id: 'stale-id', userId: 'u1', calories: 1 } as DocumentData)
    expect(meal.id).toBe('real-id')
  })

  it('passes other fields through unchanged (including optional/null ones)', () => {
    const data: DocumentData = {
      userId: 'u1',
      dishName: 'Steak',
      calories: 600,
      caloriesMin: 550,
      caloriesMax: 650,
      protein: 50,
      fat: 40,
      carbs: 0,
      confidence: 92,
      portionSize: null,
      createdAt: { toDate: () => new Date('2026-01-01T00:00:00Z') },
    }
    const meal = mapMealDoc('doc-3', data)
    expect(meal).toMatchObject({
      id: 'doc-3',
      userId: 'u1',
      dishName: 'Steak',
      calories: 600,
      caloriesMin: 550,
      caloriesMax: 650,
      protein: 50,
      fat: 40,
      carbs: 0,
      confidence: 92,
      portionSize: null,
    })
  })
})
