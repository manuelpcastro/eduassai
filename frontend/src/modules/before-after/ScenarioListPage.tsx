import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { SCENARIOS } from './scenarios'

export function ScenarioListPage() {
  const { t } = useTranslation()
  return (
    <>
      <h1>{t('beforeAfter.chooseTitle')}</h1>
      <p className="subtitle">{t('beforeAfter.chooseSubtitle')}</p>
      <ul className="tile-grid">
        {SCENARIOS.map((s) => (
          <li key={s.id}>
            <Link to={`/antes-despues/${s.id}`} className="tile">
              <span className="tile-emoji" aria-hidden="true">
                {s.beforeEmoji} {s.afterEmoji}
              </span>
              <span className="tile-title">{t(`scenarios.${s.id}.title`)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
