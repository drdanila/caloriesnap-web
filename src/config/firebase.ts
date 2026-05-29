import { initializeApp } from 'firebase/app'
import { getAuth, initializeAuth, browserLocalPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

console.log('🔥 Firebase config:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  projectId: firebaseConfig.projectId,
  apiKey: firebaseConfig.apiKey?.substring(0, 20) + '...',
  authDomain: firebaseConfig.authDomain,
  appId: firebaseConfig.appId,
})

const app = initializeApp(firebaseConfig)

export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence
})

export const db = getFirestore(app)

console.log('✅ Firebase initialized')
