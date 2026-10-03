import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { clearRecordCache } from '../data/useRecords'
import { supabase } from '../lib/supabase'
import { AuthContext, DEVICE_MODE_AUTH, type AuthState, type AuthUser } from './AuthContext'

function toUser(session: Session | null): AuthUser | null {
  return session ? { id: session.user.id, email: session.user.email ?? '' } : null
}

/** Where the confirmation email sends people back to: the site root. */
function redirectUrl() {
  return `${window.location.origin}${window.location.pathname}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(supabase !== null)

  useEffect(() => {
    if (!supabase) return
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // Keep the same object while the user doesn't change, so data isn't reloaded
      // on every token refresh.
      setUser((prev) => {
        const next = toUser(session)
        if (prev?.id === next?.id) return prev
        // Another user (or nobody): drop the previous user's data.
        clearRecordCache()
        return next
      })
      setLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const value = useMemo<AuthState>(() => {
    const client = supabase
    if (!client) return DEVICE_MODE_AUTH
    return {
      enabled: true,
      loading,
      user,
      async signIn(email, password) {
        const { error } = await client.auth.signInWithPassword({ email, password })
        if (error) throw error
      },
      async signUp(email, password) {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl() },
        })
        if (error) throw error
        return data.session ? 'signedIn' : 'confirmEmail'
      },
      async signOut() {
        await client.auth.signOut()
      },
    }
  }, [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
