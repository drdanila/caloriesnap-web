import { useState } from 'react'
import { signInWithGoogle } from '../services/authService'
import './LoginScreen.css'

export default function LoginScreen() {
  const [loading, setLoading] = useState(false)

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
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      </div>
    </div>
  )
}
