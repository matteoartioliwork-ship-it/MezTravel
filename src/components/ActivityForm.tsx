import { useState, type FormEvent } from 'react'
import type { Dictionary } from '../i18n'
import type { Activity } from '../trips'

type Props = {
  t: Dictionary
  activity: Activity
  isNew: boolean
  onSave: (activity: Activity) => void
  onCancel: () => void
}

export default function ActivityForm({ t, activity, isNew, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState(activity)
  const [missingTitle, setMissingTitle] = useState(false)

  const set = (key: 'time' | 'title' | 'place' | 'notes', value: string) =>
    setDraft((current) => ({ ...current, [key]: value }))

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!draft.title.trim()) return setMissingTitle(true)
    onSave({ ...draft, title: draft.title.trim(), place: draft.place.trim(), notes: draft.notes.trim() })
  }

  return (
    <form className="inline-form" onSubmit={submit} noValidate>
      <h3>{isNew ? t.addActivity : t.editActivity}</h3>
      <label>
        {t.title}
        <input value={draft.title} onChange={(e) => set('title', e.target.value)} />
      </label>
      <label>
        {t.time}
        <input type="time" value={draft.time} onChange={(e) => set('time', e.target.value)} />
      </label>
      <label>
        {t.place}
        <input value={draft.place} onChange={(e) => set('place', e.target.value)} />
      </label>
      <label>
        {t.notes}
        <textarea rows={3} value={draft.notes} onChange={(e) => set('notes', e.target.value)} />
      </label>
      {missingTitle && !draft.title.trim() && (
        <p className="error" role="alert">
          {t.titleRequired}
        </p>
      )}
      <div className="actions">
        <button type="submit" className="primary">
          {t.save}
        </button>
        <button type="button" onClick={onCancel}>
          {t.cancel}
        </button>
      </div>
    </form>
  )
}
