import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import { generateKeyPair, SignJWT } from 'jose'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from '../src/app'
import { jwtVerifier } from '../src/auth'
import type { Db } from '../src/db/client'
import * as schema from '../src/db/schema'

const ISSUER = 'https://test.supabase.co/auth/v1'
const ALICE = '11111111-1111-4111-8111-111111111111'
const BOB = '22222222-2222-4222-8222-222222222222'
const ORIGIN = 'https://manuelpcastro.github.io'

let app: ReturnType<typeof createApp>
let db: Db
let privateKey: CryptoKey

const situation = {
  title: 'A dormir',
  before: { text: 'Ponerse el pijama', picture: { kind: 'arasaac', id: 2462 } },
  after: { text: 'Dormir', picture: { kind: 'photo', photoId: '33333333-3333-4333-8333-333333333333' } },
}

async function token(sub: string, overrides: { issuer?: string; key?: CryptoKey } = {}) {
  return new SignJWT({ role: 'authenticated' })
    .setProtectedHeader({ alg: 'ES256' })
    .setSubject(sub)
    .setIssuer(overrides.issuer ?? ISSUER)
    .setAudience('authenticated')
    .setExpirationTime('1h')
    .sign(overrides.key ?? privateKey)
}

interface ListBody {
  records: { id: string; data: typeof situation }[]
}

async function list(user: string): Promise<ListBody['records']> {
  return ((await (await call('GET', base, user)).json()) as ListBody).records
}

async function call(method: string, path: string, user: string | null, body?: unknown) {
  const headers: Record<string, string> = { Origin: ORIGIN }
  if (user) headers.Authorization = `Bearer ${await token(user)}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  return app.request(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
}

const base = '/v1/records/beforeAfter/situation'
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

beforeAll(async () => {
  const keys = await generateKeyPair('ES256')
  privateKey = keys.privateKey
  const pg = drizzle(new PGlite(), { schema })
  await migrate(pg, { migrationsFolder: './drizzle'})
  db = pg as unknown as Db
  app = createApp({
    db,
    verifyToken: jwtVerifier(async () => keys.publicKey, { issuer: ISSUER, audience: 'authenticated' }),
    allowedOrigins: [ORIGIN],
  })
})

beforeEach(async () => {
  await db.delete(schema.records)
})

describe('API', () => {
  it('answers health checks without signing in', async () => {
    const res = await call('GET', '/health', null)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('rejects requests without a valid token', async () => {
    expect((await call('GET', base, null)).status).toBe(401)
    const other = await generateKeyPair('ES256')
    const forged = await token(ALICE, { key: other.privateKey })
    const res = await app.request(base, { headers: { Authorization: `Bearer ${forged}` } })
    expect(res.status).toBe(401)
    const wrongIssuer = await token(ALICE, { issuer: 'https://evil.example/auth/v1' })
    expect((await app.request(base, { headers: { Authorization: `Bearer ${wrongIssuer}` } })).status).toBe(401)
  })

  it('saves, lists, updates and deletes the user’s records', async () => {
    expect((await call('PUT', `${base}/${id(1)}`, ALICE, { data: situation })).status).toBe(200)
    const updated = { ...situation, title: 'Hora de dormir' }
    expect((await call('PUT', `${base}/${id(1)}`, ALICE, { data: updated })).status).toBe(200)

    const records = await list(ALICE)
    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({ id: id(1), data: updated })

    expect((await call('DELETE', `${base}/${id(1)}`, ALICE)).status).toBe(204)
    expect(await list(ALICE)).toEqual([])
  })

  it('keeps each user’s records private', async () => {
    await call('PUT', `${base}/${id(1)}`, ALICE, { data: situation })

    expect(await list(BOB)).toEqual([])
    // Bob can neither overwrite nor delete Alice's record, even knowing its id.
    const overwrite = await call('PUT', `${base}/${id(1)}`, BOB, { data: { ...situation, title: 'Hacked' } })
    expect(overwrite.status).toBe(409)
    await call('DELETE', `${base}/${id(1)}`, BOB)

    expect((await list(ALICE))[0].data.title).toBe('A dormir')
  })

  it('validates data against the collection schema', async () => {
    const bad = [
      { ...situation, title: '' },
      { ...situation, extra: true },
      // Photos must never be uploaded, only referenced.
      { ...situation, before: { text: 'x', picture: { kind: 'photo', src: 'data:image/jpeg;base64,AAAA' } } },
      {
        ...situation,
        before: { text: 'x', picture: { kind: 'photo', photoId: '33333333-3333-4333-8333-333333333333', src: 'data:' } },
      },
    ]
    for (const data of bad) {
      expect((await call('PUT', `${base}/${id(2)}`, ALICE, { data })).status).toBe(400)
    }
    expect((await call('PUT', `${base}/not-a-uuid`, ALICE, { data: situation })).status).toBe(400)
  })

  it('rejects unknown collections', async () => {
    expect((await call('GET', '/v1/records/nope/thing', ALICE)).status).toBe(404)
    expect((await call('PUT', `/v1/records/nope/thing/${id(3)}`, ALICE, { data: {} })).status).toBe(404)
  })

  it('only allows the configured frontend origins', async () => {
    const res = await app.request(base, {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'GET' },
    })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
    const ok = await app.request(base, {
      method: 'OPTIONS',
      headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'PUT' },
    })
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
  })
})
