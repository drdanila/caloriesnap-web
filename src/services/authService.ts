import { auth } from '../config/firebase'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// На мобильных (особенно iOS Safari и в режиме PWA standalone) signInWithPopup
// блокируется/не работает — там используем редирект.
function isMobile() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const iOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const android = /Android/i.test(ua)
  const standalone =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  return iOS || android || standalone
}

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase auth is not initialized')
  }

  if (isMobile()) {
    return signInWithRedirect(auth, googleProvider)
  }

  try {
    const result = await signInWithPopup(auth, googleProvider)
    return result
  } catch (error: any) {
    // Попап заблокирован или не поддерживается — откатываемся на редирект.
    if (
      error?.code === 'auth/popup-blocked' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      return signInWithRedirect(auth, googleProvider)
    }
    console.error('Sign-in failed:', {
      code: error?.code,
      message: error?.message,
      customData: error?.customData,
    })
    throw error
  }
}

// Завершает вход через редирект (вызывается при загрузке приложения).
export async function completeRedirectSignIn() {
  try {
    return await getRedirectResult(auth)
  } catch (error) {
    console.error('Redirect sign-in error:', error)
    return null
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
