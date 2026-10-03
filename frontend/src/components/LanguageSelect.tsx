import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '../i18n'

export function LanguageSelect() {
  const { t, i18n } = useTranslation()
  return (
    <label className="language-select">
      <span className="visually-hidden">{t('app.language')}</span>
      <span aria-hidden="true">🌐</span>
      <select value={i18n.resolvedLanguage} onChange={(e) => void i18n.changeLanguage(e.target.value)}>
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  )
}
