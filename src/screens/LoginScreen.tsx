import { useState } from 'react'
import { signInWithGoogle, signInDev } from '../services/authService'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import InstallBanner from '../components/InstallBanner'
import './LoginScreen.css'

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)
  const { showBanner, isIOS, install, dismiss } = useInstallPrompt()

  const handleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
      alert('Failed to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDevSignIn = async () => {
    try {
      setLoading(true)
      await signInDev()
    } catch (error) {
      console.error('Dev sign in error:', error)
      alert('Dev sign-in failed. Включите Anonymous Auth в Firebase Console.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="logo">🥗</div>
        <h1>CalorieSnap</h1>
        <p className="tagline">Photograph your meal. Know what you eat.</p>

        <ul className="features">
          <li>📸 Snap a photo of your meal</li>
          <li>🤖 Get instant AI analysis</li>
          <li>📊 Track macros and calories</li>
          <li>📅 View your meal history</li>
        </ul>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="signin-button"
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="11" fill="white" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3m0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22" fill="#EA4335" />
          </svg>
          {loading ? 'Входим...' : 'Войти через Google'}
        </button>

        {import.meta.env.DEV && (
          <button onClick={handleDevSignIn} disabled={loading} className="dev-signin-button">
            🔧 Dev вход (без Google)
          </button>
        )}

        {showBanner && <InstallBanner isIOS={isIOS} onInstall={install} onDismiss={dismiss} />}
      </div>
    </div>
  )
}
