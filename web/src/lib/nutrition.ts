// Presentation helpers for meal analysis output (formatting only — no business logic).
// Shared by ResultCard and HistoryScreen so confidence banding / calorie formatting
// stay consistent. Confidence bands follow the AI-config spec: 90 / 70 / 50.
import type { Meal } from '../services/mealService'
import type { TKey } from '../i18n/dictionaries'

type BadgeTone = 'mint' | 'neutral' | 'success' | 'warning' | 'danger'
export type ConfidenceBand = 'high' | 'medium' | 'low' | 'unreliable'

export interface ConfidenceInfo {
  band: ConfidenceBand
  tone: BadgeTone
  emoji: string
  labelKey: TKey
  /** CSS custom property used for the history confidence bar fill. */
  color: string
}

/** Map a 0-100 confidence score to its band + display attributes (spec bands 90/70/50). */
export function confidenceBand(confidence: number): ConfidenceInfo {
  if (confidence >= 90) return { band: 'high', tone: 'success', emoji: '✅', labelKey: 'conf_high', color: 'var(--c-success)' }
  if (confidence >= 70) return { band: 'medium', tone: 'success', emoji: '✅', labelKey: 'conf_medium', color: 'var(--c-success)' }
  if (confidence >= 50) return { band: 'low', tone: 'warning', emoji: '⚠️', labelKey: 'conf_low', color: 'var(--c-warning)' }
  return { band: 'unreliable', tone: 'danger', emoji: '❌', labelKey: 'conf_vlow', color: 'var(--c-danger)' }
}

type CalorieFields = Pick<Meal, 'calories' | 'caloriesMin' | 'caloriesMax'>

/** Format calories as a range ("420–520") when a meaningful range exists, else the point value ("471"). */
export function formatCalories(meal: CalorieFields): string {
  const min = meal.caloriesMin
  const max = meal.caloriesMax
  if (min != null && max != null && Math.round(min) !== Math.round(max)) {
    return `${Math.round(min)}–${Math.round(max)}`
  }
  return `${Math.round(meal.calories)}`
}

/** A meal is flagged when overall confidence is below the reportable threshold or the image was poor. */
export function isLowConfidence(meal: Pick<Meal, 'confidence' | 'imageQuality'>): boolean {
  return meal.confidence < 50 || meal.imageQuality === 'poor'
}

/** Localized portion label: the model returns null when it isn't confident enough to estimate. */
export function hasPortion(portionSize: string | null | undefined): portionSize is string {
  return typeof portionSize === 'string' && portionSize.trim().length > 0
}
