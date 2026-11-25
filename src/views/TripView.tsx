import { useState } from 'react'
import TripForm from '../components/TripForm'
import { formatDate, type Dictionary, type Language } from '../i18n'
import { link } from '../route'
import {
  activitiesOn,
  countOutside,
  itemsOn,
  listDays,
  today,
  type Trip,
  type TripDetails,
} from '../trips'

type Props = {
  t: Dictionary
  language: Language
  trip: Trip
  onChange: (change: (trip: Trip) => Trip) => void
  onDelete: () => void
}

export default function TripView({ t, language, trip, onChange, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const now = today()

  function save(details: TripDetails) {
    const hidden = countOutside(trip, details.startDate, details.endDate)
    const newlyHidden = hidden > countOutside(trip, trip.startDate, trip.endDate)
    if (newlyHidden && !window.confirm(`${t.confirmHide} ${hidden}`)) return
    onChange((current) => ({ ...current, ...details }))
    setEditing(false)
  }

  return (
    <>
      <a className="back" href={link()}>
        ‹ {t.myTrips}
      </a>

      {editing ? (
        <>
          <TripForm t={t} initial={trip} onSave={save} onCancel={() => setEditing(false)} />
          <button
            type="button"
            className="danger wide"
            onClick={() => window.confirm(t.confirmDeleteTrip) && onDelete()}
          >
            {t.deleteTrip}
          </button>
        </>
      ) : (
        <>
          <div className="title-row">
            <div>
              <h2 className="page-title">{trip.name}</h2>
              <p className="muted">{trip.destination}</p>
            </div>
            <button type="button" onClick={() => setEditing(true)}>
              {t.edit}
            </button>
          </div>

          {listDays(trip.startDate, trip.endDate).map((date, index) => {
            const activities = activitiesOn(trip, date)
            const missing = itemsOn(trip, date).filter((item) => !item.done).length
            return (
              <a key={date} className="card row-link" href={link(trip.id, date)}>
                <span className="muted">
                  {t.day} {index + 1}
                  {date === now && <em className="badge">{t.today}</em>}
                </span>
                <strong>{formatDate(date, language)}</strong>
                {activities.length > 0 && (
                  <span>{activities.map((a) => a.title).join(' · ')}</span>
                )}
                {(activities.length > 0 || missing > 0) && (
                  <span className="muted">
                    {t.activitiesCount}: {activities.length}
                    {missing > 0 && ` · ${t.toBringCount}: ${missing}`}
                  </span>
                )}
              </a>
            )
          })}
        </>
      )}
    </>
  )
}
