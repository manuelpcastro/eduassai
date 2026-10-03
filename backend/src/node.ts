/**
 * Runs the API on Node for local development: `npm run dev`.
 *
 * - DATABASE_URL set: uses that Postgres database.
 * - Otherwise: an in-memory Postgres (PGlite) with the migrations applied,
 *   so nothing needs installing. Data is lost when the server stops.
 *
 * Sign-in tokens are checked against SUPABASE_URL, as in production.
 */
import { serve } from '@hono/node-server'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { createApp } from './app'
import { supabaseVerifier, type VerifyToken } from './auth'
import { connect, type Db } from './db/client'
import * as schema from './db/schema'

async function database(): Promise<Db> {
  if (process.env.DATABASE_URL) return connect(process.env.DATABASE_URL).db
  console.log('No DATABASE_URL: using an in-memory database.')
  const db = drizzle(new PGlite(), { schema })
  await migrate(db, { migrationsFolder: './drizzle'})
  return db as unknown as Db
}

const supabaseUrl = process.env.SUPABASE_URL
const verifyToken: VerifyToken = supabaseUrl
  ? supabaseVerifier({ supabaseUrl, jwtSecret: process.env.SUPABASE_JWT_SECRET })
  : async () => {
      throw new Error('SUPABASE_URL is not set')
    }
if (!supabaseUrl) console.warn('SUPABASE_URL is not set: every signed-in request will be rejected.')

const port = Number(process.env.PORT ?? 8787)
const app = createApp({
  db: await database(),
  verifyToken,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(','),
})
serve({ fetch: app.fetch, port })
console.log(`EduAssAI API on http://localhost:${port}`)
