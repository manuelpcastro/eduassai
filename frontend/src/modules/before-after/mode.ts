import { useState } from 'react'

/**
 * practice: the child places the cards (a small activity).
 * present: the situation is shown already in order, for a teacher or parent to
 * explain it; nothing to solve.
 */
export type Mode = 'practice' | 'present'

const STORAGE_KEY = 'eduassai.beforeAfter.mode'

function readMode(): Mode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'present' ? 'present' : 'practice'
  } catch {
    return 'practice'
  }
}

/** The last mode chosen on this device, so a teacher doesn't have to pick it every time. */
export function useMode(): [Mode, (mode: Mode) => void] {
  const [mode, setModeState] = useState<Mode>(readMode)
  function setMode(next: Mode) {
    setModeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore: it just won't be remembered.
    }
  }
  return [mode, setMode]
}

export function modeSuffix(mode: Mode) {
  return mode === 'present' ? '/presentar' : ''
}
