import { describe, expect, it } from 'vitest'
import { clearSlot, evaluate, newGame, placeCard, resetSlots } from './game'

describe('before/after game', () => {
  it('shuffles the card order', () => {
    expect(newGame(() => 0.1).cardOrder).toEqual(['before', 'after'])
    expect(newGame(() => 0.9).cardOrder).toEqual(['after', 'before'])
  })

  it('fills slots in order and ignores duplicates', () => {
    let s = newGame()
    s = placeCard(s, 'after')
    s = placeCard(s, 'after')
    expect(s.slots).toEqual(['after', null])
    s = placeCard(s, 'before')
    expect(s.slots).toEqual(['after', 'before'])
  })

  it('evaluates the result', () => {
    let s = newGame()
    expect(evaluate(s)).toBe('incomplete')
    s = placeCard(placeCard(s, 'before'), 'after')
    expect(evaluate(s)).toBe('correct')
    s = placeCard(placeCard(resetSlots(s), 'after'), 'before')
    expect(evaluate(s)).toBe('incorrect')
  })

  it('clears a slot so the next card goes there', () => {
    let s = placeCard(placeCard(newGame(), 'after'), 'before')
    s = clearSlot(s, 0)
    expect(s.slots).toEqual([null, 'before'])
    s = placeCard(s, 'after')
    expect(s.slots).toEqual(['after', 'before'])
  })
})
