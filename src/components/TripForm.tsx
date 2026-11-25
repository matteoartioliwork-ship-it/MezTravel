import { useState, type FormEvent } from 'react'
import type { Dictionary } from '../i18n'
import { checkDates, type TripDetails } from '../trips'

type Props = {
  t: Dictionary
  initial?: TripDetails
  onSave: (details: TripDetails) => void
  onCancel: () => void
}

export default function TripForm({ t, initial, onSave, onCancel }: Props) {
  const [details, setDetails] = useState<TripDetails>({
    name: initial?.name ?? '',
    destination: initial?.destination ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
  })
  const [error, setError] = useState<keyof Dictionary | null>(null)

  const set = (key: keyof TripDetails, value: string) =>
    setDetails((current) => ({ ...current, [key]: value }))

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!details.name.trim()) return setError('nameRequired')
    const problem = checkDates(details.startDate, details.endDate)
    if (problem) {
      const messages = { missing: 'datesMissing', order: 'datesOrder', tooLong: 'datesTooLong' } as const
      return setError(messages[problem])
    }
    onSave({ ...details, name: details.name.trim(), destination: details.destination.trim() })
  }

  return (
    <form className="card" onSubmit={submit} noValidate>
      <h2>{initial ? t.editTrip : t.newTrip}</h2>
      <label>
        {t.tripName}
        <input value={details.name} onChange={(e) => set('name', e.target.value)} />
      </label>
      <label>
        {t.destination}
        <input value={details.destination} onChange={(e) => set('destination', e.target.value)} />
      </label>
      <label>
        {t.startDate}
        <input type="date" value={details.startDate} onChange={(e) => set('startDate', e.target.value)} />
      </label>
      <label>
        {t.endDate}
        <input
          type="date"
          value={details.endDate}
          min={details.startDate || undefined}
          onChange={(e) => set('endDate', e.target.value)}
        />
      </label>
      {error && (
        <p className="error" role="alert">
          {t[error]}
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
