import { createContext, useContext } from 'react'

export interface AuthUser {
  id: string
  email: string
}

export type SignUpResult = 'signedIn' | 'confirmEmail'

export interface AuthState {
  /** False when no backend is configured (device mode): no accounts at all. */
  enabled: boolean
  /** True until the stored session has been checked. */
  loading: boolean
  user: AuthUser | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

const notAvailable = () => Promise.reject(new Error('Accounts are not enabled'))

export const DEVICE_MODE_AUTH: AuthState = {
  enabled: false,
  loading: false,
  user: null,
  signIn: notAvailable,
  signUp: notAvailable,
  signOut: async () => {},
}

export const AuthContext = createContext<AuthState>(DEVICE_MODE_AUTH)

export function useAuth(): AuthState {
  return useContext(AuthContext)
}
