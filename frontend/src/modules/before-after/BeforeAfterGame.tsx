import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SpeakButton } from '../../components/SpeakButton'
import { clearSlot, evaluate, newGame, placeCard, resetSlots, type Step } from './game'
import { PictureView } from './PictureView'
import type { PlayableScenario } from './types'

interface Props {
  scenario: PlayableScenario
  /** Called when the child presses "Next" after a correct answer. */
  onNext: () => void
  isLast: boolean
}

const SLOT_STEPS: [Step, Step] = ['before', 'after']

export function BeforeAfterGame({ scenario, onNext, isLast }: Props) {
  const { t } = useTranslation()
  const [state, setState] = useState(() => newGame())
  const result = evaluate(state)
  const locked = result !== 'incomplete'

  const text = (step: Step) => scenario[step].text

  return (
    <div className="game">
      <p className="instruction">
        {t('beforeAfter.instruction')}
        <SpeakButton text={t('beforeAfter.instruction')} />
      </p>

      <div className="slots">
        {SLOT_STEPS.map((slotStep, index) => {
          const placed = state.slots[index]
          const slotName = t(`beforeAfter.${slotStep}`)
          return (
            <div key={slotStep} className="slot-column">
              {index === 1 && (
                <span className="slot-arrow" aria-hidden="true">
                  ➜
                </span>
              )}
              <div className={`slot slot-${slotStep}`}>
                <span className="slot-label">{slotName}</span>
                {placed ? (
                  <button
                    type="button"
                    className="card card-placed"
                    disabled={locked}
                    onClick={() => setState((s) => clearSlot(s, index as 0 | 1))}
                    aria-label={t('beforeAfter.slotWith', { slot: slotName, text: text(placed) })}
                  >
                    <PictureView picture={scenario[placed].picture} className="card-picture" />
                    <span className="card-text">{text(placed)}</span>
                  </button>
                ) : (
                  <div className="slot-empty" aria-label={t('beforeAfter.slotLabel', { slot: slotName })}>
                    {t('beforeAfter.emptySlot')}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <ul className="tray" aria-label={t('beforeAfter.cardsLabel')}>
        {state.cardOrder.map((step) => {
          const isPlaced = state.slots.includes(step)
          return (
            <li key={step} className="tray-item">
              {isPlaced ? (
                // Keep the space so the layout never jumps around.
                <div className="card-placeholder" aria-hidden="true" />
              ) : (
                <div className="card-wrap">
                  <button
                    type="button"
                    className="card"
                    disabled={locked}
                    onClick={() => setState((s) => placeCard(s, step))}
                  >
                    <PictureView picture={scenario[step].picture} className="card-picture" />
                    <span className="card-text">{text(step)}</span>
                  </button>
                  <SpeakButton text={text(step)} className="card-speak" />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <div className="feedback" role="status" aria-live="polite">
        {result === 'correct' && (
          <div className="feedback-box feedback-correct">
            <p className="feedback-title">
              <span aria-hidden="true">⭐ </span>
              {t('beforeAfter.correct')}
            </p>
            <p>
              {t('beforeAfter.correctDetail', {
                before: text('before').toLowerCase(),
                after: text('after').toLowerCase(),
              })}
            </p>
            <button type="button" className="action-button" onClick={onNext}>
              {isLast ? t('beforeAfter.backToList') : t('beforeAfter.next')} <span aria-hidden="true">➜</span>
            </button>
          </div>
        )}
        {result === 'incorrect' && (
          <div className="feedback-box feedback-retry">
            <p className="feedback-title">{t('beforeAfter.tryAgain')}</p>
            <button type="button" className="action-button" onClick={() => setState(resetSlots)}>
              <span aria-hidden="true">↺ </span>
              {t('beforeAfter.retry')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
