import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PictureView } from './PictureView'
import { useCustomScenarios } from './customScenarios'
import { SCENARIOS, toPlayable } from './scenarios'
import type { PlayableScenario } from './types'

export function ScenarioListPage() {
  const { t } = useTranslation()
  const custom = useCustomScenarios()
  return (
    <>
      <h1>{t('beforeAfter.chooseTitle')}</h1>
      <p className="subtitle">{t('beforeAfter.chooseSubtitle')}</p>

      <h2>{t('beforeAfter.mySituations')}</h2>
      <ul className="tile-grid">
        {custom.map((s) => (
          <li key={s.id} className="tile-with-action">
            <ScenarioTile scenario={s} to={`/antes-despues/mis/${s.id}`} />
            <Link to={`/antes-despues/mis/${s.id}/editar`} className="tile-action">
              <span aria-hidden="true">✏️ </span>
              {t('beforeAfter.edit')}
              <span className="visually-hidden">: {s.title}</span>
            </Link>
          </li>
        ))}
        <li>
          <Link to="/antes-despues/crear" className="tile tile-create">
            <span className="tile-emoji" aria-hidden="true">
              ➕
            </span>
            <span className="tile-title">{t('beforeAfter.create')}</span>
            <span className="tile-text">{t('beforeAfter.createHint')}</span>
          </Link>
        </li>
      </ul>

      <h2>{t('beforeAfter.examples')}</h2>
      <ul className="tile-grid">
        {SCENARIOS.map((s) => (
          <li key={s.id}>
            <ScenarioTile scenario={toPlayable(s, t)} to={`/antes-despues/${s.id}`} />
          </li>
        ))}
      </ul>
    </>
  )
}

function ScenarioTile({ scenario, to }: { scenario: PlayableScenario; to: string }) {
  return (
    <Link to={to} className="tile">
      <span className="tile-pictures">
        <PictureView picture={scenario.before.picture} className="tile-picture" />
        <span aria-hidden="true">➜</span>
        <PictureView picture={scenario.after.picture} className="tile-picture" />
      </span>
      <span className="tile-title">{scenario.title}</span>
    </Link>
  )
}
