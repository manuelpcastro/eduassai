/** Cloudflare Workers entry point. Configuration comes from wrangler.toml and secrets. */
import { sql } from 'drizzle-orm'
import { createApp } from './app'
import { supabaseVerifier } from './auth'
import { connect } from './db/client'

export interface Env {
  /** Postgres connection string (secret). */
  DATABASE_URL: string
  /** e.g. https://abcd.supabase.co */
  SUPABASE_URL: string
  /** Only for Supabase projects still using the legacy shared JWT secret (secret). */
  SUPABASE_JWT_SECRET?: string
  /** Comma-separated list of frontend origins. */
  ALLOWED_ORIGINS: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Workers can't keep connections between requests, so each request gets
    // its own short-lived one (put Cloudflare Hyperdrive in front to pool them).
    const { db, close } = connect(env.DATABASE_URL, { max: 1 })
    const app = createApp({
      db,
      verifyToken: supabaseVerifier({ supabaseUrl: env.SUPABASE_URL, jwtSecret: env.SUPABASE_JWT_SECRET }),
      allowedOrigins: env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()),
    })
    try {
      return await app.fetch(request, env, ctx)
    } finally {
      ctx.waitUntil(close())
    }
  },

  /**
   * Daily cron (see wrangler.toml): a tiny query so a free Supabase project
   * isn't paused for inactivity during quiet weeks such as school holidays.
   */
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext) {
    const { db, close } = connect(env.DATABASE_URL, { max: 1 })
    try {
      await db.execute(sql`select 1`)
    } finally {
      ctx.waitUntil(close())
    }
  },
} satisfies ExportedHandler<Env>
