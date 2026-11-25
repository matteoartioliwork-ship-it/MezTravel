// Rappels affichés dans l'app et fichiers de calendrier (.ics) pour l'iPhone.
import type { Booking, Todo, Trip } from './trips.ts'

export const soonDays = 7
const dayInMs = 24 * 60 * 60 * 1000

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * dayInMs).toISOString().slice(0, 10)
}

export type Reminder =
  | { kind: 'todo'; trip: Trip; date: string; todo: Todo }
  | { kind: 'start' | 'end'; trip: Trip; date: string; time: string; booking: Booking }

// Choses à réserver en retard ou à faire bientôt ; réservations d'aujourd'hui et de demain.
export function dueReminders(trips: Trip[], now: string): Reminder[] {
  const reminders: Reminder[] = []
  const tomorrow = addDays(now, 1)
  for (const trip of trips) {
    for (const todo of trip.todos ?? []) {
      if (!todo.done && todo.dueDate && todo.dueDate <= addDays(now, soonDays)) {
        reminders.push({ kind: 'todo', trip, date: todo.dueDate, todo })
      }
    }
    for (const booking of trip.bookings ?? []) {
      if (booking.date === now || booking.date === tomorrow) {
        reminders.push({ kind: 'start', trip, date: booking.date, time: booking.time, booking })
      }
      if (booking.endDate && (booking.endDate === now || booking.endDate === tomorrow)) {
        reminders.push({ kind: 'end', trip, date: booking.endDate, time: booking.endTime, booking })
      }
    }
  }
  return reminders.sort((a, b) => a.date.localeCompare(b.date))
}

export type CalendarEvent = {
  uid: string
  title: string
  date: string
  time: string // vide : toute la journée
  description: string
}

const escapeText = (text: string) =>
  text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1')

// Les lignes d'un calendrier ne doivent pas dépasser 75 octets.
function fold(line: string): string {
  const encoder = new TextEncoder()
  let result = ''
  let size = 0
  for (const character of line) {
    const bytes = encoder.encode(character).length
    if (size + bytes > 74) {
      result += '\r\n '
      size = 1
    }
    result += character
    size += bytes
  }
  return result
}

const compact = (date: string) => date.replaceAll('-', '')

// Heures « flottantes » (sans fuseau) : l'heure saisie reste l'heure du lieu
// affichée par le téléphone.
export function calendarFile(events: CalendarEvent[], now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z'
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MezTravel//MezTravel//IT']
  for (const event of events) {
    lines.push('BEGIN:VEVENT', `UID:${event.uid}@meztravel`, `DTSTAMP:${stamp}`)
    if (event.time) {
      lines.push(`DTSTART:${compact(event.date)}T${event.time.replace(':', '')}00`, 'DURATION:PT30M')
    } else {
      lines.push(
        `DTSTART;VALUE=DATE:${compact(event.date)}`,
        `DTEND;VALUE=DATE:${compact(addDays(event.date, 1))}`,
      )
    }
    lines.push(`SUMMARY:${escapeText(event.title)}`)
    if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`)
    // Avec une heure : 2 heures avant. Toute la journée : à 9 h.
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(event.title)}`,
      `TRIGGER:${event.time ? '-PT2H' : 'PT9H'}`,
      'END:VALARM',
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(fold).join('\r\n') + '\r\n'
}
