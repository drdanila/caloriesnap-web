import { useT } from '../i18n/I18nProvider'
import { Lang } from '../i18n/dictionaries'
import { SegmentedControl } from './SegmentedControl'

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
]

export function LanguageToggle() {
  const { lang, setLang } = useT()
  return (
    <SegmentedControl
      options={OPTIONS}
      value={lang}
      onChange={setLang}
      ariaLabel="Language"
    />
  )
}
