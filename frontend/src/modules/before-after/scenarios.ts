/**
 * Before/after scenarios. Texts live in the locale files under
 * `scenarios.<id>.{title,before,after}`; only language-neutral data goes here.
 */
export interface Scenario {
  id: string
  beforeEmoji: string
  afterEmoji: string
}

export const SCENARIOS: Scenario[] = [
  { id: 'socksShoes', beforeEmoji: '🧦', afterEmoji: '👟' },
  { id: 'washEat', beforeEmoji: '🧼', afterEmoji: '🍽️' },
  { id: 'wakeBreakfast', beforeEmoji: '⏰', afterEmoji: '🥣' },
  { id: 'eatBrush', beforeEmoji: '🍎', afterEmoji: '🪥' },
  { id: 'coatOutside', beforeEmoji: '🧥', afterEmoji: '🌳' },
  { id: 'doorHome', beforeEmoji: '🚪', afterEmoji: '🏠' },
  { id: 'fillDrink', beforeEmoji: '🚰', afterEmoji: '🥛' },
  { id: 'seedFlower', beforeEmoji: '🌱', afterEmoji: '🌻' },
]

export function findScenario(id: string | undefined): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id)
}
