import { auth } from '../config/firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase auth is not initialized')
  }

  if (!googleProvider) {
    throw new Error('Google provider is not initialized')
  }

  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result
  } catch (error: any) {
    console.error('❌ Sign-in failed:', {
      code: error?.code,
      message: error?.message,
      customData: error?.customData,
    })
    throw error
  }
}

// Dev-only: вход без Google через анонимную авторизацию Firebase.
// Даёт реальный auth-токен, поэтому правила Firestore работают как обычно.
export async function signInDev() {
  if (!import.meta.env.DEV) {
    throw new Error('Dev sign-in is only available in development')
  }
  return signInAnonymously(auth)
}

export async function signOut() {
  return firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
