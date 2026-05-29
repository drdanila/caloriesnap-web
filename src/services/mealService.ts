import { db } from '../config/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Query,
  DocumentData
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
  createdAt: Date
}

export async function analyzeMealImage(imageFile: File, userId: string) {
  const base64 = await fileToBase64(imageFile)

  try {
    const response = await fetch(
      'https://us-central1-eatappmain-e7503.cloudfunctions.net/analyzeMeal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64.split(',')[1],
          userId,
          mimeType: imageFile.type,
        })
      }
    )

    if (!response.ok) throw new Error('Analysis failed')
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

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
