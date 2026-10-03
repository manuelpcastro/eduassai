import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import i18n from '../i18n'
import { clearRecordCache } from '../data/useRecords'

// Never reach the real ARASAAC API from tests; individual tests can override.
beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('[]', { status: 404 })))
})

afterEach(async () => {
  cleanup()
  localStorage.clear()
  clearRecordCache()
  vi.unstubAllGlobals()
  await i18n.changeLanguage('es')
})
