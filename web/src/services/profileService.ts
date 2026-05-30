import { db } from '../config/firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

export type Gender = 'male' | 'female'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export interface UserProfile {
  userId: string
  heightCm: number
  weightKg: number
  targetWeightKg: number
  age: number
  gender: Gender
  activityLevel: ActivityLevel
  updatedAt: Date
}

export interface NutritionTargets {
  calories: number // ккал
  protein: number // г
  fat: number // г
  carbs: number // г
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'userProfiles', userId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    userId: snap.id,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as UserProfile
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'userProfiles', profile.userId), {
      ...profile,
      updatedAt: serverTimestamp(),
    })
  } catch (error: any) {
    console.error('Error saving profile:', error)
    throw error
  }
}

// Чистая функция: считает дневную норму КБЖУ по формуле Mifflin–St Jeor.
export function calculateTargets(profile: UserProfile): NutritionTargets {
  const { heightCm, weightKg, targetWeightKg, age, gender, activityLevel } = profile

  // 1. BMR (Mifflin–St Jeor)
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  const bmr = base + (gender === 'male' ? 5 : -161)

  // 2. TDEE
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel]

  // 3. Коррекция по цели
  const diff = targetWeightKg - weightKg
  let goal = tdee
  if (diff <= -1) goal = tdee - 500 // похудение: безопасный дефицит ≈0.45 кг/нед
  else if (diff >= 1) goal = tdee + 400 // набор: умеренный профицит

  // 4. Нижний безопасный порог
  const calories = Math.max(1200, Math.round(goal))

  // 5. Макросы
  const protein = Math.round(1.8 * weightKg) // анкор по весу — сохранение мышц
  const fat = Math.round((calories * 0.25) / 9) // 25% калорий из жиров
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4)) // остаток

  return { calories, protein, fat, carbs }
}
