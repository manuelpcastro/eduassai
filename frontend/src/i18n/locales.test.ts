import { describe, expect, it } from 'vitest'
import en from './locales/en.json'
import es from './locales/es.json'

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

describe('locales', () => {
  it('every locale has the same keys as Spanish', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort())
  })
})
