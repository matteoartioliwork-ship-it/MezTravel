import { formatDate, type Dictionary, type Language } from '../i18n'
import { link } from '../route'
import { dueReminders } from '../reminders'
import { today, type Trip } from '../trips'
import { bookingLabel } from './BookingCard'

type Props = { t: Dictionary; language: Language; trips: Trip[] }

export default function Reminders({ t, language, trips }: Props) {
  const now = today()
  const reminders = dueReminders(trips, now)
  if (reminders.length === 0) return null

  return (
    <section className="card warning">
      <h2>{t.reminders}</h2>
      <ul className="plain">
        {reminders.map((r) => {
          const id = r.kind === 'todo' ? r.todo.id : `${r.booking.id}-${r.kind}`
          const text =
            r.kind === 'todo'
              ? `${t.toBook}: ${r.todo.text}`
              : `${bookingLabel(t, r.booking, r.kind)}: ${r.booking.title}${r.time ? ` · ${r.time}` : ''}`
          return (
            <li key={`${r.trip.id}-${id}`} className="reminder">
              <a href={link(r.trip.id, 'bookings')}>{text}</a>
              <p className="muted">
                {r.kind === 'todo' && r.date < now && <strong className="error">{t.overdue} · </strong>}
                {r.date === now ? t.today : formatDate(r.date, language)} · {r.trip.name}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
