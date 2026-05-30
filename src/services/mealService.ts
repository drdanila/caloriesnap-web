import { db } from '../config/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Query,
  DocumentData,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc
} from 'firebase/firestore'

export interface Meal {
  id: string
  userId: string
  dishName: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber?: number
  confidence: number
  portionSize: string
  ingredients?: string[]
  notes?: string
  imageUrl?: string
  createdAt: Date
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const maxW = 1920
      const scale = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85).split(',')[1])
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to compress image'))
    }
    img.src = url
  })
}

export async function analyzeMealImage(imageFile: File, userId: string) {
  const base64 = await compressImage(imageFile)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  try {
    const response = await fetch(
      `${apiUrl}/analyze`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          userId,
          // compressImage всегда перекодирует в JPEG, поэтому шлём image/jpeg,
          // а не оригинальный imageFile.type (webp/png/heic) — иначе Claude
          // отклоняет запрос с 400 (media_type не совпадает с байтами).
          mimeType: 'image/jpeg',
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.details || errorData.error || 'Ошибка анализа')
    }
    return response.json()
  } catch (error) {
    console.error('Error analyzing meal:', error)
    throw error
  }
}

export async function fetchUserMeals(userId: string): Promise<Meal[]> {
  const mealsCollection = collection(db, 'meals')
  const q: Query<DocumentData> = query(
    mealsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date()
  })) as Meal[]
}

export async function saveMeal(mealData: Omit<Meal, 'id' | 'createdAt'>): Promise<string> {
  try {
    const mealsCollection = collection(db, 'meals')
    const docRef = await addDoc(mealsCollection, {
      ...mealData,
      createdAt: serverTimestamp()
    })

    return docRef.id
  } catch (error: any) {
    console.error('Error saving meal:', error)
    throw error
  }
}

export async function deleteMeal(mealId: string): Promise<void> {
  try {
    const mealRef = doc(db, 'meals', mealId)
    await deleteDoc(mealRef)
  } catch (error: any) {
    console.error('Error deleting meal:', error)
    throw error
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
