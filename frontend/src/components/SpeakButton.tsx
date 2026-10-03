import { useTranslation } from 'react-i18next'
import { canSpeak, speak } from '../lib/speech'

interface Props {
  text: string
  /** Accessible label; defaults to "Listen: <text>". */
  label?: string
  className?: string
}

/** Reads text aloud with the browser's voice, for children who don't read yet. */
export function SpeakButton({ text, label, className }: Props) {
  const { t, i18n } = useTranslation()
  if (!canSpeak()) return null
  return (
    <button
      type="button"
      className={`speak-button ${className ?? ''}`}
      onClick={(e) => {
        e.stopPropagation()
        speak(text, i18n.language)
      }}
      aria-label={label ?? t('beforeAfter.listenItem', { text })}
      title={t('beforeAfter.listen')}
    >
      <span aria-hidden="true">🔊</span>
    </button>
  )
}
