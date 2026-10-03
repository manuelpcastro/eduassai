/** Pure game logic for the before/after activity, kept free of React for testing. */

export type Step = 'before' | 'after'

export interface GameState {
  /** Order in which the cards are shown in the tray. */
  cardOrder: Step[]
  /** Slot 0 is "before", slot 1 is "after". */
  slots: [Step | null, Step | null]
}

export type GameResult = 'incomplete' | 'correct' | 'incorrect'

export function newGame(random: () => number = Math.random): GameState {
  return {
    cardOrder: random() < 0.5 ? ['before', 'after'] : ['after', 'before'],
    slots: [null, null],
  }
}

/** Puts a card in the first empty slot. No-op if it's already placed. */
export function placeCard(state: GameState, step: Step): GameState {
  if (state.slots.includes(step)) return state
  const index = state.slots.indexOf(null)
  if (index === -1) return state
  const slots: GameState['slots'] = [...state.slots]
  slots[index] = step
  return { ...state, slots }
}

/** Sends the card in the given slot back to the tray. */
export function clearSlot(state: GameState, index: 0 | 1): GameState {
  if (state.slots[index] === null) return state
  const slots: GameState['slots'] = [...state.slots]
  slots[index] = null
  return { ...state, slots }
}

export function resetSlots(state: GameState): GameState {
  return { ...state, slots: [null, null] }
}

export function evaluate(state: GameState): GameResult {
  const [first, second] = state.slots
  if (first === null || second === null) return 'incomplete'
  return first === 'before' && second === 'after' ? 'correct' : 'incorrect'
}
