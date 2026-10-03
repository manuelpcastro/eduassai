import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Optional accounts. Supabase only handles sign-up and sign-in; everything
 * else goes through our own API (VITE_API_URL), which checks the user's token.
 * Without these variables the app runs with no accounts at all and keeps
 * data in the browser.
 *
 * The Supabase key is the project's publishable (anon) key, which is public by
 * design. Our data lives in a schema the API reads, not one exposed to it.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_KEY as string | undefined

/** Base URL of the EduAssAI API, without a trailing slash. */
export const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? null

export const supabase: SupabaseClient | null =
  url && key && API_URL
    ? createClient(url, key, {
        auth: {
          // PKCE puts the code in ?code=..., which doesn't clash with our #/ routes.
          flowType: 'pkce',
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null
