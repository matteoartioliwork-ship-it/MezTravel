import { useState, type ChangeEvent } from 'react'
import { saveFile } from '../files'
import type { Dictionary } from '../i18n'
import type { Update } from '../store'
import { mergeData, parseData, today, type Data } from '../trips'

type Props = { t: Dictionary; data: Data; update: Update }

export default function Backup({ t, data, update }: Props) {
  const [message, setMessage] = useState<'backupInvalid' | 'backupRestored' | null>(null)

  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return
    const incoming = parseData(await file.text().catch(() => ''))
    input.value = '' // permet de choisir à nouveau le même fichier
    if (!incoming) return setMessage('backupInvalid')
    const names = incoming.trips.map((trip) => `• ${trip.name}`).join('\n')
    if (!window.confirm(`${t.backupConfirm}\n${names}`)) return
    update((current) => mergeData(current, incoming))
    setMessage('backupRestored')
  }

  return (
    <section className="card">
      <h2>{t.backupTitle}</h2>
      <p>{t.backupText}</p>
      <div className="actions">
        <button
          type="button"
          disabled={data.trips.length === 0}
          onClick={() => saveFile(`meztravel-${today()}.json`, JSON.stringify(data, null, 2))}
        >
          {t.backupSave}
        </button>
        <label className="button">
          {t.backupRestore}
          <input type="file" accept=".json,application/json" onChange={restore} className="hidden-input" />
        </label>
      </div>
      {message && (
        <p role="status" className={message === 'backupInvalid' ? 'error' : 'success'}>
          {t[message]}
        </p>
      )}
    </section>
  )
}
