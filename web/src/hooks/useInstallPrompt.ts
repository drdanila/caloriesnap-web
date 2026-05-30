import { useEffect, useState } from 'react'

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa-dismissed') === '1')
  const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      setDeferredPrompt(null)
    }
  }

  const dismiss = () => {
    localStorage.setItem('pwa-dismissed', '1')
    setDismissed(true)
  }

  const showBanner = !dismissed && !isStandalone && (deferredPrompt || isIOS)
  return { showBanner, isIOS, install, dismiss }
}
