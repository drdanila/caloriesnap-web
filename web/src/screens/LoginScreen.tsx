import { useState } from 'react'
import { signInWithGoogle, signInDev } from '../services/authService'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import InstallBanner from '../components/InstallBanner'
import { Button, Card } from '../ui'
import { useT } from '../i18n/I18nProvider'
import './LoginScreen.css'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#EA4335" d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z" />
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72l2.84 2.2c1.66-1.53 2.76-3.78 2.76-6.56z" />
      <path fill="#FBBC05" d="M3.88 10.78A5.4 5.4 0 0 1 3.6 9c0-.62.11-1.22.28-1.78L.96 4.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.13-3.74L.96 13.04C2.44 15.98 5.48 18 9 18z" />
    </svg>
  )
}

const FEATURES: { emoji: string; key: 'feature_photo' | 'feature_ai' | 'feature_macros' | 'feature_history' }[] = [
  { emoji: '📸', key: 'feature_photo' },
  { emoji: '🤖', key: 'feature_ai' },
  { emoji: '📊', key: 'feature_macros' },
  { emoji: '📅', key: 'feature_history' },
]

export default function LoginScreen() {
  const { t } = useT()
  const [loading, setLoading] = useState(false)
  const { showBanner, isIOS, install, dismiss } = useInstallPrompt()

  const handleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in error:', error)
      alert(t('signInError'))
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
      alert(t('devSignInError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <Card padding="lg" className="login-card">
        <div className="login-logo">🥗</div>
        <h1 className="login-title">{t('brand')}</h1>
        <p className="login-tagline">{t('tagline')}</p>

        <ul className="login-features">
          {FEATURES.map((f) => (
            <li key={f.key}>
              <span className="login-feature-emoji">{f.emoji}</span>
              {t(f.key)}
            </li>
          ))}
        </ul>

        <Button fullWidth size="lg" loading={loading} leftIcon={<GoogleIcon />} onClick={handleSignIn}>
          {loading ? t('signingIn') : t('signIn')}
        </Button>

        {import.meta.env.DEV && (
          <Button variant="ghost" fullWidth disabled={loading} onClick={handleDevSignIn} className="login-dev">
            🔧 {t('devSignIn')}
          </Button>
        )}

        {showBanner && <InstallBanner isIOS={isIOS} onInstall={install} onDismiss={dismiss} />}
      </Card>
    </div>
  )
}
