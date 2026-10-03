import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './AuthContext'

type Mode = 'signIn' | 'signUp'

export function LoginPage() {
  const { t } = useTranslation()
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/antes-despues'

  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (!auth.enabled) return <Navigate to="/" replace />
  if (auth.user) return <Navigate to={from} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      if (mode === 'signIn') {
        await auth.signIn(email.trim(), password)
        navigate(from, { replace: true })
      } else if ((await auth.signUp(email.trim(), password)) === 'confirmEmail') {
        setMessage(t('auth.checkEmail'))
      } else {
        navigate(from, { replace: true })
      }
    } catch {
      setMessage(mode === 'signIn' ? t('auth.signInError') : t('auth.signUpError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <h1>{mode === 'signIn' ? t('auth.signInTitle') : t('auth.signUpTitle')}</h1>
      <p className="subtitle">{t('auth.intro')}</p>

      <form className="auth-form" onSubmit={submit}>
        <label className="field">
          <span className="field-label">{t('auth.email')}</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">{t('auth.password')}</span>
          <input
            type="password"
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'signUp' && <span className="hint">{t('auth.passwordHint')}</span>}
        </label>

        <div role="status" aria-live="polite">
          {message && <p className="form-message">{message}</p>}
        </div>

        <button type="submit" className="action-button" disabled={busy}>
          {mode === 'signIn' ? t('auth.signIn') : t('auth.signUp')}
        </button>
      </form>

      <p className="auth-switch">
        {mode === 'signIn' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
        <button
          type="button"
          className="link-button"
          onClick={() => {
            setMode(mode === 'signIn' ? 'signUp' : 'signIn')
            setMessage(null)
          }}
        >
          {mode === 'signIn' ? t('auth.signUp') : t('auth.signIn')}
        </button>
      </p>
    </div>
  )
}
