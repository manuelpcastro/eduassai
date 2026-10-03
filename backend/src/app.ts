import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { AuthUser, VerifyToken } from './auth'
import type { Db } from './db/client'
import { recordRoutes } from './routes/records'

export interface AppDeps {
  db: Db
  verifyToken: VerifyToken
  /** Web origins allowed to call the API (the frontend's URLs). */
  allowedOrigins: string[]
}

export type AppEnv = { Variables: { db: Db; user: AuthUser } }

/**
 * The HTTP API, independent of where it runs: Cloudflare Workers
 * (src/worker.ts) or Node (src/node.ts).
 */
export function createApp(deps: AppDeps) {
  const app = new Hono<AppEnv>()

  app.use(
    '*',
    cors({
      origin: (origin) => (deps.allowedOrigins.includes(origin) ? origin : null),
      allowHeaders: ['Authorization', 'Content-Type'],
      allowMethods: ['GET', 'PUT', 'DELETE', 'OPTIONS'],
      maxAge: 86400,
    }),
  )

  app.get('/health', (c) => c.json({ ok: true }))

  // Everything under /v1 needs a signed-in user.
  app.use('/v1/*', async (c, next) => {
    const header = c.req.header('Authorization') ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) return c.json({ error: 'unauthorized' }, 401)
    try {
      c.set('user', await deps.verifyToken(token))
    } catch {
      return c.json({ error: 'unauthorized' }, 401)
    }
    c.set('db', deps.db)
    await next()
  })

  app.route('/v1/records', recordRoutes)

  app.notFound((c) => c.json({ error: 'not_found' }, 404))
  app.onError((err, c) => {
    console.error(err)
    return c.json({ error: 'internal' }, 500)
  })

  return app
}
