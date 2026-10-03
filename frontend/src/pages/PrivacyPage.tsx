import { useTranslation } from 'react-i18next'

const SECTIONS = ['photos', 'device', 'account', 'pictograms'] as const

export function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <div className="text-page">
      <h1>{t('privacy.title')}</h1>
      <p className="subtitle">{t('privacy.intro')}</p>
      {SECTIONS.map((s) => (
        <section key={s}>
          <h2>{t(`privacy.${s}.title`)}</h2>
          <p>{t(`privacy.${s}.text`)}</p>
        </section>
      ))}
    </div>
  )
}
