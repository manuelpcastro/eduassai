import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BeforeAfterGame } from './BeforeAfterGame'
import { BeforeAfterPresentation } from './BeforeAfterPresentation'
import { modeSuffix, useMode, type Mode } from './mode'
import { useSituations } from './situations'
import { SCENARIOS, toPlayable } from './scenarios'
import type { PlayableScenario } from './types'

const LIST_PATH = '/antes-despues'

interface PageProps {
  mode: Mode
}

/** One of the built-in situations. */
export function BeforeAfterPage({ mode }: PageProps) {
  const { t } = useTranslation()
  const { scenarioId } = useParams()
  return (
    <GameScreen
      mode={mode}
      scenarios={SCENARIOS.map((s) => toPlayable(s, t))}
      currentId={scenarioId}
      pathFor={(id, m) => `${LIST_PATH}/${id}${modeSuffix(m)}`}
    />
  )
}

/** One of the user's own situations. */
export function CustomBeforeAfterPage({ mode }: PageProps) {
  const { customId } = useParams()
  const { t } = useTranslation()
  const { status, items } = useSituations()
  if (status === 'loading') return <p className="loading">{t('app.loading')}</p>
  return (
    <GameScreen
      mode={mode}
      scenarios={items}
      currentId={customId}
      pathFor={(id, m) => `${LIST_PATH}/mis/${id}${modeSuffix(m)}`}
    />
  )
}

interface GameScreenProps {
  mode: Mode
  scenarios: PlayableScenario[]
  currentId: string | undefined
  pathFor: (id: string, mode: Mode) => string
}

function GameScreen({ mode, scenarios, currentId, pathFor }: GameScreenProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [, setPreferredMode] = useMode()
  const index = scenarios.findIndex((s) => s.id === currentId)
  if (index === -1) return <Navigate to={LIST_PATH} replace />

  const scenario = scenarios[index]
  const isLast = index === scenarios.length - 1
  const onNext = () => navigate(isLast ? LIST_PATH : pathFor(scenarios[index + 1].id, mode))
  const otherMode: Mode = mode === 'present' ? 'practice' : 'present'

  return (
    <>
      <div className="game-header">
        <h1>{scenario.title}</h1>
        <span className="progress">{t('beforeAfter.progress', { current: index + 1, total: scenarios.length })}</span>
        <Link
          to={pathFor(scenario.id, otherMode)}
          replace
          className="secondary-button mode-switch"
          onClick={() => setPreferredMode(otherMode)}
        >
          {t(`beforeAfter.mode.${otherMode}Action`)}
        </Link>
      </div>
      {/* key resets the state when moving to another scenario */}
      {mode === 'present' ? (
        <BeforeAfterPresentation key={scenario.id} scenario={scenario} isLast={isLast} onNext={onNext} />
      ) : (
        <BeforeAfterGame key={scenario.id} scenario={scenario} isLast={isLast} onNext={onNext} />
      )}
    </>
  )
}
