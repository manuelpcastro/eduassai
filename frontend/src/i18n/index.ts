import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import es from './locales/es.json'

/**
 * Supported languages. To add one: create `locales/<code>.json` with the same
 * keys as `es.json`, then add an entry here.
 * `speechLang` is the BCP 47 tag used by the browser's text-to-speech voice.
 */
export const LANGUAGES = [
  { code: 'es', label: 'Español', speechLang: 'es-ES' },
  { code: 'en', label: 'English', speechLang: 'en-GB' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']

export const DEFAULT_LANGUAGE: LanguageCode = 'es'
const STORAGE_KEY = 'eduassai.language'

function readStoredLanguage(): LanguageCode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (LANGUAGES.some((l) => l.code === stored)) return stored as LanguageCode
  } catch {
    // Storage can be unavailable (private mode); fall back to the default.
  }
  return DEFAULT_LANGUAGE
}

export function speechLangFor(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.speechLang ?? code
}

void i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
  lng: readStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
  try {
    localStorage.setItem(STORAGE_KEY, lng)
  } catch {
    // Ignore: the choice just won't be remembered.
  }
})
document.documentElement.lang = i18n.language

export default i18n
