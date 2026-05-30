import { useT } from '../i18n/I18nProvider'
import { Lang } from '../i18n/dictionaries'
import './LanguageToggle.css'

const OPTIONS: { value: Lang; flag: string; label: string }[] = [
  { value: 'ru', flag: '🇷🇺', label: 'Русский' },
  { value: 'en', flag: '🇬🇧', label: 'English' },
]

/** Compact flag switch — sits on the mint app header next to the sign-out button. */
export function LanguageToggle() {
  const { lang, setLang } = useT()
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {OPTIONS.map((opt) => {
        const active = lang === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            className={`lang-toggle__flag${active ? ' is-active' : ''}`}
            aria-pressed={active}
            aria-label={opt.label}
            title={opt.label}
            onClick={() => setLang(opt.value)}
          >
            <span aria-hidden="true">{opt.flag}</span>
          </button>
        )
      })}
    </div>
  )
}
