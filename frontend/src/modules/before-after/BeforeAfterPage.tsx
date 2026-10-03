import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BeforeAfterGame } from './BeforeAfterGame'
import { SCENARIOS, findScenario } from './scenarios'

export function BeforeAfterPage() {
  const { t } = useTranslation()
  const { scenarioId } = useParams()
  const navigate = useNavigate()
  const scenario = findScenario(scenarioId)
  if (!scenario) return <Navigate to="/antes-despues" replace />

  const index = SCENARIOS.indexOf(scenario)
  const isLast = index === SCENARIOS.length - 1

  return (
    <>
      <div className="game-header">
        <h1>{t(`scenarios.${scenario.id}.title`)}</h1>
        <span className="progress">{t('beforeAfter.progress', { current: index + 1, total: SCENARIOS.length })}</span>
      </div>
      {/* key resets the game state when moving to another scenario */}
      <BeforeAfterGame
        key={scenario.id}
        scenario={scenario}
        isLast={isLast}
        onNext={() => navigate(isLast ? '/antes-despues' : `/antes-despues/${SCENARIOS[index + 1].id}`)}
      />
    </>
  )
}
