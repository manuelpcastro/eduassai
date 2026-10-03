import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { deleteCustomScenario, getCustomScenario, newCustomId, saveCustomScenario } from './customScenarios'
import { StepEditor, type StepDraft } from './StepEditor'

const EMPTY: StepDraft = { text: '', picture: null }

/** Create (no id in the URL) or edit a parent/teacher-made situation. */
export function ScenarioEditorPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { customId } = useParams()
  const existing = getCustomScenario(customId)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [before, setBefore] = useState<StepDraft>(existing?.before ?? EMPTY)
  const [after, setAfter] = useState<StepDraft>(existing?.after ?? EMPTY)
  const [saveError, setSaveError] = useState(false)

  if (customId && !existing) return <Navigate to="/antes-despues" replace />

  const isReady = (s: StepDraft) => s.text.trim() !== '' && s.picture !== null
  const canSave = isReady(before) && isReady(after)

  function save() {
    if (!before.picture || !after.picture) return
    const id = existing?.id ?? newCustomId()
    try {
      saveCustomScenario({
        id,
        title: title.trim() || t('editor.defaultTitle'),
        before: { text: before.text.trim(), picture: before.picture },
        after: { text: after.text.trim(), picture: after.picture },
      })
    } catch {
      setSaveError(true)
      return
    }
    navigate(`/antes-despues/mis/${id}`)
  }

  function remove() {
    if (!existing || !window.confirm(t('editor.confirmDelete'))) return
    deleteCustomScenario(existing.id)
    navigate('/antes-despues')
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
        {saveError && <p className="search-status">{t('editor.saveError')}</p>}
        <button type="button" className="action-button" disabled={!canSave} onClick={save}>
          {t('editor.save')}
        </button>
        <Link to="/antes-despues" className="secondary-button">
          {t('editor.cancel')}
        </Link>
        {existing && (
          <button type="button" className="secondary-button danger" onClick={remove}>
            <span aria-hidden="true">🗑️ </span>
            {t('editor.delete')}
          </button>
        )}
      </div>
      <p className="hint">{t('editor.storageNote')}</p>
    </>
  )
}
