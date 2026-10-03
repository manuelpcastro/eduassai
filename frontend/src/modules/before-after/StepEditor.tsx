import { useId, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { pictogramUrl, searchPictograms, type PictogramResult } from '../../lib/arasaac'
import { resizeImage } from '../../lib/images'
import { PictureView } from './PictureView'
import type { Picture } from './types'

export interface StepDraft {
  text: string
  picture: Picture | null
}

interface Props {
  step: 'before' | 'after'
  value: StepDraft
  onChange: (value: StepDraft) => void
}

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; results: PictogramResult[] }
  | { status: 'error' }

const MAX_RESULTS = 24

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Lets an adult choose the picture and text for the Antes or Después card. */
export function StepEditor({ step, value, onChange }: Props) {
  const { t, i18n } = useTranslation()
  const ids = useId()
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState<SearchState>({ status: 'idle' })
  const [photoError, setPhotoError] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const label = t(`beforeAfter.${step}`)

  async function runSearch(e: FormEvent) {
    e.preventDefault()
    const text = query.trim() || value.text.trim()
    if (!text) return
    setQuery(text)
    setSearch({ status: 'loading' })
    try {
      const results = await searchPictograms(text, i18n.language)
      setSearch({ status: 'done', results: results.slice(0, MAX_RESULTS) })
    } catch {
      setSearch({ status: 'error' })
    }
  }

  function choosePictogram(result: PictogramResult) {
    onChange({
      text: value.text || capitalize(result.keyword),
      picture: { kind: 'arasaac', id: result.id },
    })
  }

  async function choosePhoto(file: File | undefined) {
    if (!file) return
    setPhotoError(false)
    try {
      onChange({ ...value, picture: { kind: 'photo', src: await resizeImage(file) } })
    } catch {
      setPhotoError(true)
    }
  }

  return (
    <section className={`step-editor slot-${step}`} aria-labelledby={`${ids}-title`}>
      <h2 id={`${ids}-title`} className="slot-label">
        {label}
      </h2>

      <div className="step-preview">
        {value.picture ? (
          <PictureView picture={value.picture} className="card-picture" />
        ) : (
          <span className="step-preview-empty">{t('editor.noPicture')}</span>
        )}
      </div>

      <label className="field">
        <span className="field-label">{t('editor.cardText')}</span>
        <input
          type="text"
          value={value.text}
          maxLength={60}
          placeholder={t(`editor.textPlaceholder.${step}`)}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
        />
      </label>

      <form className="search-form" onSubmit={runSearch} role="search">
        <label className="field">
          <span className="field-label">{t('editor.searchLabel')}</span>
          <span className="search-row">
            <input
              type="search"
              value={query}
              placeholder={t('editor.searchPlaceholder')}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="secondary-button">
              <span aria-hidden="true">🔍 </span>
              {t('editor.search')}
            </button>
          </span>
        </label>
      </form>

      <div aria-live="polite">
        {search.status === 'loading' && <p className="search-status">{t('editor.searching')}</p>}
        {search.status === 'error' && <p className="search-status">{t('editor.searchError')}</p>}
        {search.status === 'done' && search.results.length === 0 && (
          <p className="search-status">{t('editor.noResults')}</p>
        )}
        {search.status === 'done' && search.results.length > 0 && (
          <ul className="picto-results" aria-label={t('editor.resultsLabel', { step: label })}>
            {search.results.map((r) => {
              const selected = value.picture?.kind === 'arasaac' && value.picture.id === r.id
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className={`picto-option ${selected ? 'is-selected' : ''}`}
                    aria-pressed={selected}
                    aria-label={r.keyword || String(r.id)}
                    onClick={() => choosePictogram(r)}
                  >
                    <img src={pictogramUrl(r.id)} alt="" loading="lazy" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="photo-row">
        <span className="field-label">{t('editor.orPhoto')}</span>
        <button type="button" className="secondary-button" onClick={() => fileInput.current?.click()}>
          <span aria-hidden="true">📷 </span>
          {t('editor.usePhoto')}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            void choosePhoto(e.target.files?.[0])
            e.target.value = ''
          }}
        />
        {photoError && <p className="search-status">{t('editor.photoError')}</p>}
      </div>
    </section>
  )
}
