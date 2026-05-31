import { describe, it, expect, vi } from 'vitest'

// profileService.ts imports `db` from ../config/firebase, whose module body calls
// initializeApp(). Stub it so importing the service never touches real Firebase.
vi.mock('../config/firebase', () => ({ db: {} }))

import {
  calculateTargets,
  ACTIVITY_MULTIPLIERS,
  type UserProfile,
} from './profileService'

// Sensible defaults; each test overrides only what it exercises.
function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    userId: 'u1',
    heightCm: 180,
    weightKg: 80,
    targetWeightKg: 80, // maintenance unless overridden
    age: 30,
    gender: 'male',
    activityLevel: 'moderate',
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('ACTIVITY_MULTIPLIERS (locked)', () => {
  it('matches the locked Mifflin–St Jeor activity factors', () => {
    expect(ACTIVITY_MULTIPLIERS).toEqual({
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    })
  })
})

describe('calculateTargets — full computations (formula is LOCKED)', () => {
  it('male, moderate, maintenance', () => {
    // base 1775, bmr 1780, tdee 2759
    expect(calculateTargets(makeProfile())).toEqual({
      calories: 2759,
      protein: 144,
      fat: 77,
      carbs: 373,
    })
  })

  it('female applies the −161 BMR offset (vs +5 for male)', () => {
    // same body as the male case → bmr 1614, tdee 2501.7 → 2502 kcal
    expect(calculateTargets(makeProfile({ gender: 'female' }))).toEqual({
      calories: 2502,
      protein: 144,
      fat: 70,
      carbs: 324,
    })
  })

  it('weight loss (diff ≤ −1) subtracts 500 kcal — female, light', () => {
    const p = makeProfile({
      heightCm: 170,
      weightKg: 90,
      targetWeightKg: 75,
      age: 35,
      gender: 'female',
      activityLevel: 'light',
    })
    // bmr 1626.5, tdee 2236.44, −500 → 1736
    expect(calculateTargets(p)).toEqual({
      calories: 1736,
      protein: 162,
      fat: 48,
      carbs: 164,
    })
  })

  it('weight gain (diff ≥ +1) adds 400 kcal — male, active', () => {
    const p = makeProfile({
      heightCm: 185,
      weightKg: 70,
      targetWeightKg: 78,
      age: 25,
      gender: 'male',
      activityLevel: 'active',
    })
    // bmr 1736.25, tdee 2995.03, +400 → 3395
    expect(calculateTargets(p)).toEqual({
      calories: 3395,
      protein: 126,
      fat: 94,
      carbs: 511,
    })
  })

  it('very_active multiplier (1.9) — male, maintenance', () => {
    const p = makeProfile({
      heightCm: 175,
      weightKg: 75,
      targetWeightKg: 75,
      age: 28,
      activityLevel: 'very_active',
    })
    // bmr 1708.75, tdee 3246.63 → 3247
    expect(calculateTargets(p)).toEqual({
      calories: 3247,
      protein: 135,
      fat: 90,
      carbs: 474,
    })
  })

  it('enforces the 1200 kcal floor for an aggressive deficit — sedentary', () => {
    const p = makeProfile({
      heightCm: 150,
      weightKg: 45,
      targetWeightKg: 40,
      age: 60,
      gender: 'female',
      activityLevel: 'sedentary',
    })
    // tdee 1111.8, −500 → 611.8, floored to 1200
    expect(calculateTargets(p).calories).toBe(1200)
  })
})

describe('calculateTargets — goal-correction boundaries', () => {
  // Same body (tdee = 2759 exactly), only targetWeightKg varies.
  const cal = (targetWeightKg: number) =>
    calculateTargets(makeProfile({ targetWeightKg })).calories

  it('diff exactly −1 counts as loss (−500)', () => {
    expect(cal(79)).toBe(2259) // 2759 − 500
  })

  it('diff exactly +1 counts as gain (+400)', () => {
    expect(cal(81)).toBe(3159) // 2759 + 400
  })

  it('the (−1, +1) band is maintenance (no correction)', () => {
    expect(cal(79.5)).toBe(2759)
    expect(cal(80.5)).toBe(2759)
  })
})

describe('calculateTargets — invariants', () => {
  it('never returns negative carbs (max(0, …) floor)', () => {
    const profiles = [
      makeProfile(),
      makeProfile({ gender: 'female', weightKg: 120, activityLevel: 'sedentary' }),
      makeProfile({ weightKg: 45, age: 60, activityLevel: 'sedentary', targetWeightKg: 40 }),
    ]
    for (const p of profiles) {
      expect(calculateTargets(p).carbs).toBeGreaterThanOrEqual(0)
    }
  })
})
