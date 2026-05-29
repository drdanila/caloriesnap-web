import { auth } from '../config/firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  console.log('🔐 Sign-in attempt:', {
    authExists: !!auth,
    providerExists: !!googleProvider,
    providerType: googleProvider?.constructor?.name,
  })

  if (!auth) {
    throw new Error('Firebase auth is not initialized')
  }

  if (!googleProvider) {
    throw new Error('Google provider is not initialized')
  }

  return signInWithPopup(auth, googleProvider)
}

export async function signOut() {
  return firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
