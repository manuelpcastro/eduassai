/**
 * Client for the ARASAAC pictogram API (https://arasaac.org).
 * Pictograms are by Sergio Palao, owned by the Gobierno de Aragón and licensed
 * CC BY-NC-SA 4.0; the attribution is shown in the page footer.
 */
const API = 'https://api.arasaac.org/v1'
const STATIC = 'https://static.arasaac.org/pictograms'

export interface PictogramResult {
  id: number
  keyword: string
}

interface ApiPictogram {
  _id: number
  keywords?: { keyword: string }[]
}

export function pictogramUrl(id: number, size: 300 | 500 = 300): string {
  return `${STATIC}/${id}/${id}_${size}.png`
}

async function fetchPictograms(path: string, signal?: AbortSignal): Promise<PictogramResult[]> {
  const res = await fetch(`${API}${path}`, { signal })
  // The API answers 404 when nothing matches.
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`ARASAAC request failed: ${res.status}`)
  const data = (await res.json()) as ApiPictogram[]
  return data.map((p) => ({ id: p._id, keyword: p.keywords?.[0]?.keyword ?? '' }))
}

export function searchPictograms(text: string, locale: string, signal?: AbortSignal) {
  return fetchPictograms(`/pictograms/${locale}/search/${encodeURIComponent(text.trim())}`, signal)
}

function bestSearch(text: string, locale: string) {
  return fetchPictograms(`/pictograms/${locale}/bestsearch/${encodeURIComponent(text.trim())}`)
}

const CACHE_PREFIX = 'eduassai.pictogram.'
const pending = new Map<string, Promise<number | null>>()

/**
 * Finds a pictogram id for the first keyword that has a match, trying an exact
 * match before a broad search. Results are cached so each lookup happens once.
 */
export function findPictogram(keywords: readonly string[], locale = 'es'): Promise<number | null> {
  const cacheKey = `${CACHE_PREFIX}${locale}.${keywords.join('|')}`
  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) return Promise.resolve(Number(cached))
  } catch {
    // Storage unavailable: just don't cache.
  }
  let promise = pending.get(cacheKey)
  if (!promise) {
    promise = (async () => {
      for (const keyword of keywords) {
        const best = await bestSearch(keyword, locale)
        const found = best[0] ?? (await searchPictograms(keyword, locale))[0]
        if (found) {
          try {
            localStorage.setItem(cacheKey, String(found.id))
          } catch {
            // Ignore.
          }
          return found.id
        }
      }
      return null
    })().catch(() => {
      // Offline or API down: let a later render try again.
      pending.delete(cacheKey)
      return null
    })
    pending.set(cacheKey, promise)
  }
  return promise
}
