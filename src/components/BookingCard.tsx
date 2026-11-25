import type { ReactNode } from 'react'
import { download } from '../files'
import { formatDate, type Dictionary, type Language } from '../i18n'
import { calendarFile, type CalendarEvent } from '../reminders'
import type { Booking, BookingRole } from '../trips'

export function bookingLabel(t: Dictionary, booking: Booking, role: BookingRole): string {
  if (booking.type === 'stay') {
    return { start: t.checkIn, end: t.checkOut, during: t.stay }[role]
  }
  if (booking.type === 'flight' || booking.type === 'transport') {
    return `${t[booking.type]} · ${role === 'end' ? t.arrival : t.departure}`
  }
  return t[booking.type]
}

export function addToCalendar(name: string, events: CalendarEvent[]) {
  // Téléchargement direct : sur iPhone, cela ouvre l'aperçu du calendrier.
  download(new File([calendarFile(events)], `${name}.ics`, { type: 'text/calendar' }))
}

export function bookingEvents(t: Dictionary, booking: Booking): CalendarEvent[] {
  const event = (role: 'start' | 'end', date: string, time: string) => ({
    uid: `${booking.id}-${role}`,
    title: `${bookingLabel(t, booking, role)}: ${booking.title}`,
    date,
    time,
    description: booking.notes,
  })
  const events = [event('start', booking.date, booking.time)]
  if (booking.endDate) events.push(event('end', booking.endDate, booking.endTime))
  return events
}

type Props = {
  t: Dictionary
  language: Language
  booking: Booking
  onOpenPdf: (file: { id: string; name: string }) => void
  children?: ReactNode
}

export default function BookingCard({ t, language, booking, onOpenPdf, children }: Props) {
  const when = (date: string, time: string) =>
    `${formatDate(date, language)}${time ? ` · ${time}` : ''}`

  return (
    <article className="card">
      <p className="muted">{t[booking.type]}</p>
      <strong>{booking.title}</strong>
      <p>
        {when(booking.date, booking.time)}
        {booking.endDate && ` → ${when(booking.endDate, booking.endTime)}`}
      </p>
      {booking.notes && <p className="notes">{booking.notes}</p>}
      <div className="actions">
        {booking.file && (
          <button type="button" className="primary" onClick={() => onOpenPdf(booking.file!)}>
            {t.openPdf}
          </button>
        )}
        <button type="button" onClick={() => addToCalendar('meztravel', bookingEvents(t, booking))}>
          {t.toCalendar}
        </button>
        {children}
      </div>
    </article>
  )
}
