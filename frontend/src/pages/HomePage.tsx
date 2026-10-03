import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/** Each learning module adds an entry here. */
const MODULES = [{ path: '/antes-despues', key: 'beforeAfter', emoji: '⏳' }] as const

export function HomePage() {
  const { t } = useTranslation()
  return (
    <>
      <h1>{t('home.title')}</h1>
      <p className="subtitle">{t('home.subtitle')}</p>
      <ul className="tile-grid">
        {MODULES.map((m) => (
          <li key={m.key}>
            <Link to={m.path} className="tile">
              <span className="tile-emoji" aria-hidden="true">
                {m.emoji}
              </span>
              <span className="tile-title">{t(`modules.${m.key}.title`)}</span>
              <span className="tile-text">{t(`modules.${m.key}.description`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
