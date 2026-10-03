import { useRecords } from '../../data/useRecords'
import type { Collection } from '../../data/records'
import type { PlayableScenario } from './types'

/** A situation made by a parent or teacher. */
export type CustomScenario = PlayableScenario

export const SITUATIONS: Collection = {
  module: 'beforeAfter',
  kind: 'situation',
  // Where situations were kept before accounts existed.
  deviceKey: 'eduassai.beforeAfter.custom',
}

export function useSituations() {
  return useRecords<CustomScenario>(SITUATIONS)
}
