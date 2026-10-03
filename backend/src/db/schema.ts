import { sql } from 'drizzle-orm'
import { index, jsonb, pgSchema, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Our tables live in their own `app` schema. On Supabase this keeps them out of
 * the auto-generated public API: only this backend reads and writes them.
 */
export const app = pgSchema('app')

/**
 * Generic per-user records shared by every module. Each module stores its data
 * as JSON tagged with `module` and `kind`; the backend validates it against the
 * collection's schema (src/collections.ts). If a module later needs relational
 * queries or constraints, give it a dedicated table next to this one.
 */
export const records = app.table(
  'records',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    /** The user's id from the auth provider (the token's `sub`). */
    ownerId: uuid('owner_id').notNull(),
    module: text('module').notNull(),
    kind: text('kind').notNull(),
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('records_owner_collection_idx').on(t.ownerId, t.module, t.kind, t.createdAt)],
)
