import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react'
import { dictionaries, Lang, TKey } from './dictionaries'

const STORAGE_KEY = 'lang'

function detectLang(): Lang {
  if (typeof window === 'undefined') return 'en'
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'ru' || saved === 'en') return saved
  return (navigator.language || '').toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

type Vars = Record<string, string | number>

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  /** Translate a key, interpolating `{var}` placeholders. */
  t: (key: TKey, vars?: Vars) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore storage failures (private mode) */
    }
  }, [])

  const t = useCallback(
    (key: TKey, vars?: Vars) => {
      let str: string = dictionaries[lang][key] ?? dictionaries.en[key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
        }
      }
      return str
    },
    [lang]
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useT() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useT must be used within <I18nProvider>')
  return ctx
}
