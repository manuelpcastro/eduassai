import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../auth/AuthContext'
import { PictureView } from './PictureView'
import { SCENARIOS, toPlayable } from './scenarios'
import { useSituations } from './situations'
import type { PlayableScenario } from './types'

export function ScenarioListPage() {
  const { t } = useTranslation()
  const auth = useAuth()
  const situations = useSituations()
  const [moving, setMoving] = useState<'idle' | 'busy' | 'error'>('idle')

  async function moveToAccount() {
    setMoving('busy')
    try {
      await situations.moveDeviceRecordsToAccount()
      setMoving('idle')
    } catch {
      setMoving('error')
    }
  }

  return (
    <>
      <h1>{t('beforeAfter.chooseTitle')}</h1>
      <p className="subtitle">{t('beforeAfter.chooseSubtitle')}</p>

      <h2>{t('beforeAfter.mySituations')}</h2>

      {auth.enabled && !auth.loading && !auth.user && (
        <p className="notice">
          {t('account.savedOnDevice')}{' '}
          <Link to="/entrar" state={{ from: '/antes-despues' }}>
            {t('account.signInToSave')}
          </Link>
        </p>
      )}
      {situations.deviceCount > 0 && (
        <div className="notice">
          <p>{t('account.deviceItems', { count: situations.deviceCount })}</p>
          <button type="button" className="secondary-button" disabled={moving === 'busy'} onClick={moveToAccount}>
            {t('account.moveToAccount')}
          </button>
          {moving === 'error' && <p className="form-message">{t('account.moveError')}</p>}
        </div>
      )}
      {situations.status === 'error' && <p className="notice">{t('account.loadError')}</p>}

      <ul className="tile-grid">
        {situations.items.map((s) => (
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
