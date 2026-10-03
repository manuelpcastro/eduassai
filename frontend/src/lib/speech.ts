import { speechLangFor } from '../i18n'

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Reads text aloud with the browser's built-in voice, slightly slowed down. */
export function speak(text: string, lang: string) {
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = speechLangFor(lang)
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
}
