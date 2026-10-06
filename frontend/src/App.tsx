import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { LoginPage } from './auth/LoginPage'
import { Layout } from './components/Layout'
import { BeforeAfterPage, CustomBeforeAfterPage } from './modules/before-after/BeforeAfterPage'
import { ScenarioEditorPage } from './modules/before-after/ScenarioEditorPage'
import { ScenarioListPage } from './modules/before-after/ScenarioListPage'
import { HomePage } from './pages/HomePage'
import { PrivacyPage } from './pages/PrivacyPage'

// HashRouter keeps deep links working on GitHub Pages, which has no
// server-side fallback to index.html.
export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="entrar" element={<LoginPage />} />
        <Route path="privacidad" element={<PrivacyPage />} />
        <Route path="antes-despues" element={<ScenarioListPage />} />
        <Route path="antes-despues/crear" element={<ScenarioEditorPage />} />
        <Route path="antes-despues/mis/:customId" element={<CustomBeforeAfterPage mode="practice" />} />
        <Route path="antes-despues/mis/:customId/presentar" element={<CustomBeforeAfterPage mode="present" />} />
        <Route path="antes-despues/mis/:customId/editar" element={<ScenarioEditorPage />} />
        <Route path="antes-despues/:scenarioId" element={<BeforeAfterPage mode="practice" />} />
        <Route path="antes-despues/:scenarioId/presentar" element={<BeforeAfterPage mode="present" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
