import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

/** Any Drizzle Postgres database: postgres.js in production, PGlite in tests. */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>

/**
 * Connects to Postgres. With Supabase use the pooler's "transaction" connection
 * string (port 6543), which doesn't support prepared statements.
 */
export function connect(databaseUrl: string, options: { max?: number } = {}) {
  const client = postgres(databaseUrl, { prepare: false, max: options.max ?? 5 })
  return { db: drizzle(client, { schema }) as unknown as Db, close: () => client.end() }
}
