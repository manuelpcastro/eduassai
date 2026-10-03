import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
        <LanguageSelect />
      </header>
      <main className="page">
        <Outlet />
      </main>
    </>
  )
}
