// Vitest's API must be ESM-imported; Vitest transforms this file and interops the
// CJS source module (lib/normalizeAnalysis.js exports via module.exports).
import { describe, it, expect } from 'vitest';
import { normalizeAnalysis } from './lib/normalizeAnalysis.js';

// Minimal valid-ish raw input; tests override only the field under test.
const base = () => ({
  dishName: 'Test dish',
  calories: 500,
  protein: 20,
  fat: 10,
  carbs: 60,
  confidence: 80,
});

describe('normalizeAnalysis — macros & calories', () => {
  it('clamps negative macros/calories/fiber to 0', () => {
    const d = normalizeAnalysis({ ...base(), calories: -100, protein: -5, fat: -1, carbs: -2, fiber: -3 });
    expect(d.calories).toBe(0);
    expect(d.protein).toBe(0);
    expect(d.fat).toBe(0);
    expect(d.carbs).toBe(0);
    expect(d.fiber).toBe(0);
  });

  it('defaults missing macros/fiber to 0', () => {
    const d = normalizeAnalysis({ dishName: 'x', calories: 300, confidence: 70 });
    expect(d.protein).toBe(0);
    expect(d.fat).toBe(0);
    expect(d.carbs).toBe(0);
    expect(d.fiber).toBe(0);
  });
});

describe('normalizeAnalysis — confidence', () => {
  it('defaults undefined confidence to 50', () => {
    expect(normalizeAnalysis({ ...base(), confidence: undefined }).confidence).toBe(50);
  });
  it('clamps confidence above 100 to 100 and below 0 to 0', () => {
    expect(normalizeAnalysis({ ...base(), confidence: 150 }).confidence).toBe(100);
    expect(normalizeAnalysis({ ...base(), confidence: -10 }).confidence).toBe(0);
  });
  it('keeps a 0 confidence (does not fall back to 50)', () => {
    expect(normalizeAnalysis({ ...base(), confidence: 0 }).confidence).toBe(0);
  });
});

describe('normalizeAnalysis — calorie range', () => {
  it('defaults min and max to the point value when absent', () => {
    const d = normalizeAnalysis({ ...base(), calories: 500 });
    expect(d.caloriesMin).toBe(500);
    expect(d.caloriesMax).toBe(500);
  });

  it('keeps a sensible range as-is', () => {
    const d = normalizeAnalysis({ ...base(), calories: 470, caloriesMin: 420, caloriesMax: 520 });
    expect(d.caloriesMin).toBe(420);
    expect(d.caloriesMax).toBe(520);
  });

  it('forces min <= calories <= max even if the model returns them inverted', () => {
    const d = normalizeAnalysis({ ...base(), calories: 500, caloriesMin: 600, caloriesMax: 400 });
    expect(d.caloriesMin).toBeLessThanOrEqual(d.calories);
    expect(d.caloriesMax).toBeGreaterThanOrEqual(d.calories);
    expect(d.caloriesMin).toBe(500); // min(600, 500)
    expect(d.caloriesMax).toBe(500); // max(400, 500)
  });

  it('clamps negative bounds to 0 before comparing', () => {
    const d = normalizeAnalysis({ ...base(), calories: 0, caloriesMin: -50, caloriesMax: -10 });
    expect(d.caloriesMin).toBe(0);
    expect(d.caloriesMax).toBe(0);
  });
});

describe('normalizeAnalysis — healthScore', () => {
  it('maps null/undefined to undefined', () => {
    expect(normalizeAnalysis({ ...base(), healthScore: null }).healthScore).toBeUndefined();
    expect(normalizeAnalysis({ ...base() }).healthScore).toBeUndefined();
  });
  it('clamps to 0..100', () => {
    expect(normalizeAnalysis({ ...base(), healthScore: 120 }).healthScore).toBe(100);
    expect(normalizeAnalysis({ ...base(), healthScore: -1 }).healthScore).toBe(0);
  });
  it('keeps a valid score (including 0)', () => {
    expect(normalizeAnalysis({ ...base(), healthScore: 73 }).healthScore).toBe(73);
    expect(normalizeAnalysis({ ...base(), healthScore: 0 }).healthScore).toBe(0);
  });
});

describe('normalizeAnalysis — arrays', () => {
  it('defaults non-arrays to []', () => {
    const d = normalizeAnalysis({ ...base(), ingredients: 'nope', allergens: null, tags: undefined, recommendations: 5, warnings: {} });
    expect(d.ingredients).toEqual([]);
    expect(d.allergens).toEqual([]);
    expect(d.tags).toEqual([]);
    expect(d.recommendations).toEqual([]);
    expect(d.warnings).toEqual([]);
  });

  it('caps recommendations at 3 and warnings at 2', () => {
    const d = normalizeAnalysis({
      ...base(),
      recommendations: ['a', 'b', 'c', 'd', 'e'],
      warnings: ['w1', 'w2', 'w3'],
    });
    expect(d.recommendations).toEqual(['a', 'b', 'c']);
    expect(d.warnings).toEqual(['w1', 'w2']);
  });

  it('preserves valid ingredient/allergen/tag arrays', () => {
    const d = normalizeAnalysis({ ...base(), ingredients: ['egg', 'flour'], allergens: ['Глютен'], tags: ['high-protein'] });
    expect(d.ingredients).toEqual(['egg', 'flour']);
    expect(d.allergens).toEqual(['Глютен']);
    expect(d.tags).toEqual(['high-protein']);
  });
});

describe('normalizeAnalysis — enums', () => {
  it('coerces an invalid mealType to "unknown"', () => {
    expect(normalizeAnalysis({ ...base(), mealType: 'brunch' }).mealType).toBe('unknown');
    expect(normalizeAnalysis({ ...base() }).mealType).toBe('unknown');
  });
  it('passes a valid mealType through', () => {
    expect(normalizeAnalysis({ ...base(), mealType: 'lunch' }).mealType).toBe('lunch');
  });
  it('coerces imageQuality: only "poor" stays poor, everything else is "good"', () => {
    expect(normalizeAnalysis({ ...base(), imageQuality: 'poor' }).imageQuality).toBe('poor');
    expect(normalizeAnalysis({ ...base(), imageQuality: 'blurry' }).imageQuality).toBe('good');
    expect(normalizeAnalysis({ ...base() }).imageQuality).toBe('good');
  });
});

describe('normalizeAnalysis — portionSize', () => {
  it('maps empty, whitespace, non-string, and null to null', () => {
    expect(normalizeAnalysis({ ...base(), portionSize: '' }).portionSize).toBeNull();
    expect(normalizeAnalysis({ ...base(), portionSize: '   ' }).portionSize).toBeNull();
    expect(normalizeAnalysis({ ...base(), portionSize: 250 }).portionSize).toBeNull();
    expect(normalizeAnalysis({ ...base(), portionSize: null }).portionSize).toBeNull();
    expect(normalizeAnalysis({ ...base() }).portionSize).toBeNull();
  });
  it('preserves a measurable portion string', () => {
    expect(normalizeAnalysis({ ...base(), portionSize: '250g' }).portionSize).toBe('250g');
  });
});

describe('normalizeAnalysis — purity & shape', () => {
  it('does not mutate the input object', () => {
    const input = { ...base(), calories: -5 };
    const snapshot = JSON.stringify(input);
    normalizeAnalysis(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });
  it('never includes imageUrl (added by the caller after upload)', () => {
    expect('imageUrl' in normalizeAnalysis(base())).toBe(false);
  });
});
