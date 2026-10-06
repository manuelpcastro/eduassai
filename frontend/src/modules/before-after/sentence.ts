import type { TFunction } from 'i18next'
import type { Step } from './game'
import type { PlayableScenario } from './types'

/** "Lavarse las manos" -> "lavarse las manos", to fit inside a sentence. */
function lowerFirst(text: string) {
  return text.charAt(0).toLocaleLowerCase() + text.slice(1)
}

/** The whole situation as one sentence, e.g. "Ahora toca lavarse las manos, después comer." */
export function fullSentence(t: TFunction, scenario: Pick<PlayableScenario, 'before' | 'after'>) {
  return t('beforeAfter.sentence', {
    before: lowerFirst(scenario.before.text),
    after: lowerFirst(scenario.after.text),
  })
}

/** One card's part of the sentence, e.g. "Ahora toca lavarse las manos." */
export function stepSentence(t: TFunction, step: Step, text: string) {
  return t(step === 'before' ? 'beforeAfter.sentenceNow' : 'beforeAfter.sentenceAfter', { text: lowerFirst(text) })
}
