import { z } from 'zod'

/**
 * Every kind of record the API accepts, by module. Adding a module's data is a
 * matter of adding its schema here (and a matching Collection in the frontend);
 * no database change is needed. Unknown collections are rejected.
 */
export interface CollectionDef {
  schema: z.ZodType
  /** Upper bound per user, to keep a single account from growing without limit. */
  maxRecords: number
}

const picture = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('arasaac'), id: z.number().int().positive() }).strict(),
  z.object({ kind: z.literal('emoji'), emoji: z.string().min(1).max(16) }).strict(),
  z
    .object({
      kind: z.literal('photo'),
      // Photos are small JPEG data URLs, resized in the browser.
      src: z.string().startsWith('data:image/').max(400_000),
    })
    .strict(),
])

const step = z.object({ text: z.string().trim().min(1).max(80), picture }).strict()

export const COLLECTIONS: Record<string, Record<string, CollectionDef>> = {
  beforeAfter: {
    situation: {
      schema: z.object({ title: z.string().trim().min(1).max(80), before: step, after: step }).strict(),
      maxRecords: 500,
    },
  },
}

export function findCollection(module: string, kind: string): CollectionDef | undefined {
  return Object.hasOwn(COLLECTIONS, module) && Object.hasOwn(COLLECTIONS[module], kind)
    ? COLLECTIONS[module][kind]
    : undefined
}
