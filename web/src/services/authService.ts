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

// Установленное PWA (standalone): popup открывается во внешнем браузере и не
// может вернуть результат в контекст приложения — там нужен redirect.
function isStandalonePWA() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as any).standalone === true
  )
}

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase auth is not initialized')
  }

  // В обычной вкладке (включая мобильный Safari/Chrome) popup надёжнее: у него
  // нет зависимости от sessionStorage через полный редирект, поэтому он не
  // ловит auth/missing-initial-state на iOS Safari. Redirect используем только
  // в standalone-PWA, где popup не вернёт результат.
  if (isStandalonePWA()) {
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
    const result = await getRedirectResult(auth)
    if (result) {
      console.log('[auth] redirect sign-in completed, user:', result.user.email)
    }
    return result
  } catch (error: any) {
    console.error('[auth] redirect sign-in error:', error?.code, error?.message)
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
