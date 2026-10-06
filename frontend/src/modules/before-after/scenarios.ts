import type { TFunction } from 'i18next'
import type { PlayableScenario } from './types'

/**
 * Built-in before/after scenarios. Texts live in the locale files under
 * `scenarios.<id>.{title,before,after}`. Pictures come from ARASAAC: the
 * keywords (Spanish) are tried in order, and the emoji is the offline fallback.
 */
interface StepDef {
  keywords: readonly string[]
  emoji: string
}

export interface Scenario {
  id: string
  before: StepDef
  after: StepDef
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'wakeBreakfast',
    before: { keywords: ['despertarse', 'despertar'], emoji: '⏰' },
    after: { keywords: ['desayunar'], emoji: '🥣' },
  },
  {
    id: 'eatBrush',
    before: { keywords: ['comer'], emoji: '🍎' },
    after: { keywords: ['lavarse los dientes', 'cepillarse los dientes'], emoji: '🪥' },
  },
  {
    id: 'seedFlower',
    before: { keywords: ['plantar', 'semilla'], emoji: '🌱' },
    after: { keywords: ['flor'], emoji: '🌻' },
  },
]

export function toPlayable(s: Scenario, t: TFunction): PlayableScenario {
  return {
    id: s.id,
    title: t(`scenarios.${s.id}.title`),
    before: { text: t(`scenarios.${s.id}.before`), picture: { kind: 'arasaacSearch', ...s.before } },
    after: { text: t(`scenarios.${s.id}.after`), picture: { kind: 'arasaacSearch', ...s.after } },
  }
}
