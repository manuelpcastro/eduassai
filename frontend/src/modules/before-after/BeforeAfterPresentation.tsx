import { useTranslation } from 'react-i18next'
import { SpeakButton } from '../../components/SpeakButton'
import { canSpeak, speak } from '../../lib/speech'
import type { Step } from './game'
import { PictureView } from './PictureView'
import { fullSentence, stepSentence } from './sentence'
import type { PlayableScenario } from './types'

interface Props {
  scenario: PlayableScenario
  onNext: () => void
  isLast: boolean
}

const STEPS: Step[] = ['before', 'after']

/** The situation shown already in order, for an adult to explain. Nothing to solve. */
export function BeforeAfterPresentation({ scenario, onNext, isLast }: Props) {
  const { t, i18n } = useTranslation()
  const sentence = fullSentence(t, scenario)

  return (
    <div className="game presentation">
      <div className="slots">
        {STEPS.map((step, index) => {
          const slotName = t(`beforeAfter.${step}`)
          const { text, picture } = scenario[step]
          return (
            <div key={step} className="slot-column">
              {index === 1 && (
                <span className="slot-arrow" aria-hidden="true">
                  ➜
                </span>
              )}
              <div className={`slot slot-${step}`}>
                <span className="slot-label">{slotName}</span>
                <div className="card-wrap card-static-wrap">
                  <div className="card card-static">
                    <PictureView picture={picture} className="card-picture" />
                    <span className="card-text">{text}</span>
                  </div>
                  <SpeakButton
                    text={stepSentence(t, step, text)}
                    label={t('beforeAfter.listenItem', { text: `${slotName}: ${text}` })}
                    className="card-speak"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="presentation-sentence">
        <p className="sentence">{sentence}</p>
        {canSpeak() && (
          <button type="button" className="action-button" onClick={() => speak(sentence, i18n.language)}>
            <span aria-hidden="true">🔊 </span>
            {t('beforeAfter.listen')}
          </button>
        )}
        <button type="button" className="secondary-button" onClick={onNext}>
          {isLast ? t('beforeAfter.backToList') : t('beforeAfter.next')} <span aria-hidden="true">➜</span>
        </button>
      </div>
    </div>
  )
}
