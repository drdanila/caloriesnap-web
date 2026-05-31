import { describe, it, expect } from 'vitest'
import { pluralMeals } from './plural'

describe('pluralMeals (ru)', () => {
  it('uses the singular form for 1, 21, 31 (mod-10 == 1, except 11)', () => {
    expect(pluralMeals(1, 'ru')).toBe('блюдо')
    expect(pluralMeals(21, 'ru')).toBe('блюдо')
    expect(pluralMeals(101, 'ru')).toBe('блюдо')
  })

  it('uses the few form for 2–4, 22–24 (except the teens)', () => {
    expect(pluralMeals(2, 'ru')).toBe('блюда')
    expect(pluralMeals(3, 'ru')).toBe('блюда')
    expect(pluralMeals(4, 'ru')).toBe('блюда')
    expect(pluralMeals(22, 'ru')).toBe('блюда')
  })

  it('uses the many form for 0, 5–20, 11–14', () => {
    expect(pluralMeals(0, 'ru')).toBe('блюд')
    expect(pluralMeals(5, 'ru')).toBe('блюд')
    expect(pluralMeals(11, 'ru')).toBe('блюд')
    expect(pluralMeals(12, 'ru')).toBe('блюд')
    expect(pluralMeals(14, 'ru')).toBe('блюд')
    expect(pluralMeals(25, 'ru')).toBe('блюд')
  })
})

describe('pluralMeals (en)', () => {
  it('uses the singular only for exactly 1', () => {
    expect(pluralMeals(1, 'en')).toBe('meal')
    expect(pluralMeals(0, 'en')).toBe('meals')
    expect(pluralMeals(2, 'en')).toBe('meals')
    expect(pluralMeals(21, 'en')).toBe('meals')
  })
})
