import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { newRecordId } from '../../data/records'
import { useSituations, type CustomScenario } from './situations'
import { StepEditor, type StepDraft } from './StepEditor'

const EMPTY: StepDraft = { text: '', picture: null }

/** Create (no id in the URL) or edit a parent/teacher-made situation. */
export function ScenarioEditorPage() {
  const { t } = useTranslation()
  const { customId } = useParams()
  const situations = useSituations()
  if (customId && situations.status === 'loading') return <p className="loading">{t('app.loading')}</p>
  const existing = situations.items.find((s) => s.id === customId)
  if (customId && !existing) return <Navigate to="/antes-despues" replace />
  // key: start fresh if the situation being edited changes.
  return <Editor key={customId ?? 'new'} existing={existing} />
}

function Editor({ existing }: { existing: CustomScenario | undefined }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const situations = useSituations()

  const [title, setTitle] = useState(existing?.title ?? '')
  const [before, setBefore] = useState<StepDraft>(existing?.before ?? EMPTY)
  const [after, setAfter] = useState<StepDraft>(existing?.after ?? EMPTY)
  const [saveError, setSaveError] = useState(false)
  const [busy, setBusy] = useState(false)

  const isReady = (s: StepDraft) => s.text.trim() !== '' && s.picture !== null
  const canSave = isReady(before) && isReady(after)

  async function save() {
    if (!before.picture || !after.picture) return
    const id = existing?.id ?? newRecordId()
    setBusy(true)
    setSaveError(false)
    try {
      await situations.save({
        id,
        title: title.trim() || t('editor.defaultTitle'),
        before: { text: before.text.trim(), picture: before.picture },
        after: { text: after.text.trim(), picture: after.picture },
      })
    } catch {
      setSaveError(true)
      setBusy(false)
      return
    }
    navigate(`/antes-despues/mis/${id}`)
  }

  async function remove() {
    if (!existing || !window.confirm(t('editor.confirmDelete'))) return
    setBusy(true)
    try {
      await situations.remove(existing.id)
      navigate('/antes-despues')
    } catch {
      setSaveError(true)
      setBusy(false)
    }
  }

  return (
    <>
      <h1>{existing ? t('editor.editTitle') : t('editor.createTitle')}</h1>
      <p className="subtitle">{t('editor.intro')}</p>

      <label className="field field-title">
        <span className="field-label">{t('editor.situationName')}</span>
        <input
          type="text"
          value={title}
          maxLength={40}
          placeholder={t('editor.situationPlaceholder')}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>

      <div className="editor-steps">
        <StepEditor step="before" value={before} onChange={setBefore} />
        <StepEditor step="after" value={after} onChange={setAfter} />
      </div>

      <div className="editor-actions">
        {!canSave && <p className="search-status">{t('editor.missing')}</p>}
        {saveError && (
          <p className="form-message">{situations.inAccount ? t('editor.saveErrorAccount') : t('editor.saveError')}</p>
        )}
        <button type="button" className="action-button" disabled={!canSave || busy} onClick={save}>
          {t('editor.save')}
        </button>
        <Link to="/antes-despues" className="secondary-button">
          {t('editor.cancel')}
        </Link>
        {existing && (
          <button type="button" className="secondary-button danger" disabled={busy} onClick={remove}>
            <span aria-hidden="true">🗑️ </span>
            {t('editor.delete')}
          </button>
        )}
      </div>
      <p className="hint">{situations.inAccount ? t('editor.storageAccount') : t('editor.storageNote')}</p>
    </>
  )
}
