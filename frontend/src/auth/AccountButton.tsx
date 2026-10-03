import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from './AuthContext'

/** Header control: "Entrar" when signed out, "Salir" when signed in. Hidden in device mode. */
export function AccountButton() {
  const { t } = useTranslation()
  const auth = useAuth()
  if (!auth.enabled || auth.loading) return null
  if (!auth.user) {
    return (
      <Link to="/entrar" className="header-button">
        <span aria-hidden="true">👤 </span>
        {t('auth.signIn')}
      </Link>
    )
  }
  return (
    <button
      type="button"
      className="header-button"
      title={auth.user.email}
      onClick={() => void auth.signOut()}
    >
      <span aria-hidden="true">👤 </span>
      {t('auth.signOut')}
      <span className="visually-hidden"> ({auth.user.email})</span>
    </button>
  )
}
