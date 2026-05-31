import type { Lang } from './dictionaries'

/**
 * Pick the correct plural form of "meal" for the given count and language.
 * RU has three forms (1 блюдо / 2–4 блюда / 5–20 блюд, repeating by mod-10/mod-100);
 * EN has two (1 meal / N meals).
 */
export function pluralMeals(count: number, lang: Lang): string {
  if (lang === 'ru') {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return 'блюдо'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'блюда'
    return 'блюд'
  }
  return count === 1 ? 'meal' : 'meals'
}
