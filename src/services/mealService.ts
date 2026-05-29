import { db, storage } from '../config/firebase'
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Query,
  DocumentData,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

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

export async function analyzeMealImage(imageFile: File, userId: string) {
  const base64 = await fileToBase64(imageFile)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'

  try {
    const response = await fetch(
      `${apiUrl}/analyze`,
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.error || 'Ошибка анализа')
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

export async function saveMeal(mealData: Omit<Meal, 'id' | 'createdAt'>, imageFile: File | null): Promise<string> {
  try {
    let imageUrl: string | undefined

    // Upload image to Firebase Storage if provided
    if (imageFile) {
      try {
        const timestamp = Date.now()
        const fileName = `${mealData.userId}/${timestamp}.jpg`
        const storageRef = ref(storage, `meals/${fileName}`)

        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      } catch (storageError: any) {
        console.warn('Storage upload failed, saving meal without image:', storageError)
        // Continue without image URL
      }
    }

    const mealsCollection = collection(db, 'meals')
    const docRef = await addDoc(mealsCollection, {
      ...mealData,
      ...(imageUrl && { imageUrl }),
      createdAt: serverTimestamp()
    })

    return docRef.id
  } catch (error: any) {
    console.error('Error saving meal:', error)
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
