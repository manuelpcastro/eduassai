import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BeforeAfterGame } from './BeforeAfterGame'
import { useSituations } from './situations'
import { SCENARIOS, toPlayable } from './scenarios'
import type { PlayableScenario } from './types'

const LIST_PATH = '/antes-despues'

/** Plays one of the built-in situations. */
export function BeforeAfterPage() {
  const { t } = useTranslation()
  const { scenarioId } = useParams()
  return (
    <GameScreen
      scenarios={SCENARIOS.map((s) => toPlayable(s, t))}
      currentId={scenarioId}
      pathFor={(id) => `${LIST_PATH}/${id}`}
    />
  )
}

/** Plays one of the situations created on this device. */
export function CustomBeforeAfterPage() {
  const { customId } = useParams()
  const { t } = useTranslation()
  const { status, items } = useSituations()
  if (status === 'loading') return <p className="loading">{t('app.loading')}</p>
  return <GameScreen scenarios={items} currentId={customId} pathFor={(id) => `${LIST_PATH}/mis/${id}`} />
}

interface GameScreenProps {
  scenarios: PlayableScenario[]
  currentId: string | undefined
  pathFor: (id: string) => string
}

function GameScreen({ scenarios, currentId, pathFor }: GameScreenProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const index = scenarios.findIndex((s) => s.id === currentId)
  if (index === -1) return <Navigate to={LIST_PATH} replace />

  const scenario = scenarios[index]
  const isLast = index === scenarios.length - 1

  return (
    <>
      <div className="game-header">
        <h1>{scenario.title}</h1>
        <span className="progress">{t('beforeAfter.progress', { current: index + 1, total: scenarios.length })}</span>
      </div>
      {/* key resets the game state when moving to another scenario */}
      <BeforeAfterGame
        key={scenario.id}
        scenario={scenario}
        isLast={isLast}
        onNext={() => navigate(isLast ? LIST_PATH : pathFor(scenarios[index + 1].id))}
      />
    </>
  )
}
