'use strict';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'unknown'];

/**
 * Normalize the raw structured analysis returned by Claude's record_meal_analysis
 * tool into the exact shape we persist to the prod `meals` collection.
 *
 * Pure function: no I/O, no mutation of the input. Guards every field so a model
 * regression cannot write malformed data — clamps numbers to valid bounds,
 * enforces min ≤ calories ≤ max, coerces enums, defaults arrays, caps text lists,
 * and maps an unknown portion to null. Does NOT add imageUrl (that is attached by
 * the caller after the image upload).
 *
 * @param {Record<string, any>} input - raw tool input (toolUse.input)
 * @returns {Record<string, any>} normalized analysis
 */
function normalizeAnalysis(input) {
  const d = { ...input };

  // Macros / calories: non-negative, default to 0 when missing/invalid.
  d.fiber = Math.max(0, d.fiber || 0);
  d.protein = Math.max(0, d.protein || 0);
  d.fat = Math.max(0, d.fat || 0);
  d.carbs = Math.max(0, d.carbs || 0);
  d.calories = Math.max(0, d.calories || 0);
  d.confidence = Math.min(100, Math.max(0, d.confidence ?? 50));

  // Calorie range: default to the point value, then enforce min <= calories <= max.
  const cMin = Math.max(0, d.caloriesMin ?? d.calories);
  const cMax = Math.max(0, d.caloriesMax ?? d.calories);
  d.caloriesMin = Math.min(cMin, d.calories);
  d.caloriesMax = Math.max(cMax, d.calories);

  d.healthScore = d.healthScore == null
    ? undefined
    : Math.min(100, Math.max(0, d.healthScore));

  // Arrays default to []; text caps enforced defensively (3 recs / 2 warnings).
  d.ingredients = Array.isArray(d.ingredients) ? d.ingredients : [];
  d.allergens = Array.isArray(d.allergens) ? d.allergens : [];
  d.tags = Array.isArray(d.tags) ? d.tags : [];
  d.recommendations = Array.isArray(d.recommendations) ? d.recommendations.slice(0, 3) : [];
  d.warnings = Array.isArray(d.warnings) ? d.warnings.slice(0, 2) : [];

  d.mealType = MEAL_TYPES.includes(d.mealType) ? d.mealType : 'unknown';
  d.imageQuality = d.imageQuality === 'poor' ? 'poor' : 'good';

  // Unknown portion -> null (UI localizes the "unknown" label).
  if (!d.portionSize || typeof d.portionSize !== 'string' || !d.portionSize.trim()) {
    d.portionSize = null;
  }

  return d;
}

module.exports = { normalizeAnalysis, MEAL_TYPES };
