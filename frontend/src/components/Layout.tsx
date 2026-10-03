import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AccountButton } from '../auth/AccountButton'
import { LanguageSelect } from './LanguageSelect'

export function Layout() {
  const { t } = useTranslation()
  return (
    <>
      <header className="top-bar">
        <Link to="/" className="home-link">
          <span aria-hidden="true">🏠</span> {t('app.home')}
        </Link>
        <span className="brand">{t('app.name')}</span>
        <div className="top-bar-end">
          <AccountButton />
          <LanguageSelect />
        </div>
      </header>
      <main className="page">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          <span aria-hidden="true">🔒 </span>
          {t('privacy.footer')} <Link to="/privacidad">{t('privacy.title')}</Link>
        </p>
        {t('app.arasaacCredit')}{' '}
        <a href="https://arasaac.org" target="_blank" rel="noreferrer">
          arasaac.org
        </a>
      </footer>
    </>
  )
}
