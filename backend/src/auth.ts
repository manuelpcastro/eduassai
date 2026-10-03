import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose'

export interface AuthUser {
  id: string
}

/** Turns a bearer token into a user, or throws if it isn't valid. */
export type VerifyToken = (token: string) => Promise<AuthUser>

const jwksCache = new Map<string, JWTVerifyGetKey>()

/**
 * Verifies Supabase Auth access tokens. Projects using asymmetric signing keys
 * (the default) are checked against the project's public JWKS; projects still
 * on the legacy shared secret can pass `jwtSecret` instead.
 */
export function supabaseVerifier(options: { supabaseUrl: string; jwtSecret?: string }): VerifyToken {
  const issuer = `${options.supabaseUrl.replace(/\/$/, '')}/auth/v1`
  let key: JWTVerifyGetKey | Uint8Array
  if (options.jwtSecret) {
    key = new TextEncoder().encode(options.jwtSecret)
  } else {
    const jwksUrl = `${issuer}/.well-known/jwks.json`
    let jwks = jwksCache.get(jwksUrl)
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(jwksUrl))
      jwksCache.set(jwksUrl, jwks)
    }
    key = jwks
  }
  return jwtVerifier(key, { issuer, audience: 'authenticated' })
}

export function jwtVerifier(
  key: JWTVerifyGetKey | Uint8Array,
  claims: { issuer: string; audience: string },
): VerifyToken {
  return async (token) => {
    const { payload } =
      key instanceof Uint8Array ? await jwtVerify(token, key, claims) : await jwtVerify(token, key, claims)
    if (!payload.sub) throw new Error('Token has no subject')
    return { id: payload.sub }
  }
}
