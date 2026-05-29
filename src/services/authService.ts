import { auth } from '../config/firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export async function signInWithGoogle() {
  console.log('🔐 Sign-in attempt:', {
    authExists: !!auth,
    providerExists: !!googleProvider,
    providerType: googleProvider?.constructor?.name,
    authApp: auth?.app?.options?.projectId,
  })

  if (!auth) {
    throw new Error('Firebase auth is not initialized')
  }

  if (!googleProvider) {
    throw new Error('Google provider is not initialized')
  }

  try {
    const result = await signInWithPopup(auth, googleProvider)
    console.log('✅ Sign-in successful:', result.user?.email)
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

export async function signOut() {
  return firebaseSignOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
