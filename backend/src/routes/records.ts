import { and, asc, count, eq, sql } from 'drizzle-orm'
import { Hono } from 'hono'
import { z } from 'zod'
import { findCollection } from '../collections'
import { records } from '../db/schema'
import type { AppEnv } from '../app'

const MAX_BODY_BYTES = 1_000_000

/** CRUD for the signed-in user's records in one collection: /v1/records/:module/:kind[/:id] */
export const recordRoutes = new Hono<AppEnv>()

recordRoutes.use('/:module/:kind/*', async (c, next) => {
  if (!findCollection(c.req.param('module'), c.req.param('kind'))) {
    return c.json({ error: 'unknown_collection' }, 404)
  }
  await next()
})

recordRoutes.get('/:module/:kind', async (c) => {
  const { module, kind } = c.req.param()
  if (!findCollection(module, kind)) return c.json({ error: 'unknown_collection' }, 404)
  const rows = await c.var.db
    .select({ id: records.id, data: records.data, createdAt: records.createdAt, updatedAt: records.updatedAt })
    .from(records)
    .where(and(eq(records.ownerId, c.var.user.id), eq(records.module, module), eq(records.kind, kind)))
    .orderBy(asc(records.createdAt), asc(records.id))
  return c.json({ records: rows })
})

const idParam = z.uuid()

recordRoutes.put('/:module/:kind/:id', async (c) => {
  const { module, kind, id } = c.req.param()
  const collection = findCollection(module, kind)!
  if (!idParam.safeParse(id).success) return c.json({ error: 'invalid_id' }, 400)

  const raw = await c.req.text()
  if (raw.length > MAX_BODY_BYTES) return c.json({ error: 'too_large' }, 413)
  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return c.json({ error: 'invalid_json' }, 400)
  }
  const parsed = z.object({ data: collection.schema }).safeParse(body)
  if (!parsed.success) return c.json({ error: 'invalid_data', issues: parsed.error.issues }, 400)

  const userId = c.var.user.id
  const db = c.var.db
  const ownedHere = and(eq(records.ownerId, userId), eq(records.module, module), eq(records.kind, kind))

  const [existing] = await db
    .select({ id: records.id })
    .from(records)
    .where(and(eq(records.id, id), ownedHere))
  if (!existing) {
    const [{ total }] = await db.select({ total: count() }).from(records).where(ownedHere)
    if (total >= collection.maxRecords) return c.json({ error: 'limit_reached' }, 409)
  }

  // On an id clash only the owner's own record in the same collection is updated;
  // anything else returns no row and is reported as a conflict.
  const [saved] = await db
    .insert(records)
    .values({ id, ownerId: userId, module, kind, data: parsed.data.data })
    .onConflictDoUpdate({
      target: records.id,
      set: { data: parsed.data.data, updatedAt: sql`now()` },
      setWhere: ownedHere,
    })
    .returning({ id: records.id, data: records.data, createdAt: records.createdAt, updatedAt: records.updatedAt })
  if (!saved) return c.json({ error: 'conflict' }, 409)
  return c.json({ record: saved })
})

recordRoutes.delete('/:module/:kind/:id', async (c) => {
  const { module, kind, id } = c.req.param()
  if (!idParam.safeParse(id).success) return c.json({ error: 'invalid_id' }, 400)
  await c.var.db
    .delete(records)
    .where(
      and(eq(records.id, id), eq(records.ownerId, c.var.user.id), eq(records.module, module), eq(records.kind, kind)),
    )
  return c.body(null, 204)
})
