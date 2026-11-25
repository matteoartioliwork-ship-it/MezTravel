import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileIds, fromBase64, readBackup, toBase64, writeBackup } from '../src/backup.ts'
import { findDates, rankDates, suggestDates } from '../src/findDates.ts'
import { calendarFile, dueReminders } from '../src/reminders.ts'
import { bookingsOn, parseData, type Booking, type Trip } from '../src/trips.ts'

const dates = (text: string) => findDates(text).map((f) => f.date)

const booking = (changes: Partial<Booking> = {}): Booking => ({
  id: 'b', type: 'stay', title: 'Hotel', date: '2027-04-01', time: '15:00',
  endDate: '2027-04-04', endTime: '11:00', notes: '', ...changes,
})

const trip = (changes: Partial<Trip> = {}): Trip => ({
  id: 't', name: 'Japon', destination: '', startDate: '2027-04-01', endDate: '2027-04-10',
  activities: [], items: [], updatedAt: 'x', ...changes,
})

test('reconnaît les dates écrites en plusieurs langues', () => {
  for (const text of [
    'Check-in: 2027-04-03', 'Date 2027/4/3', '2027年4月3日', 'sabato 3 aprile 2027',
    'Saturday, April 3, 2027', 'Sat 03 Apr 2027', 'samedi 3 avril 2027', '3rd April 2027', '03-APR-2027',
  ]) {
    assert.deepEqual(dates(text), ['2027-04-03'], text)
  }
  assert.deepEqual(dates('1er février 2027, 2 août 2027, 5 juillet 2027, 6 juin 2027'),
    ['2027-02-01', '2027-08-02', '2027-07-05', '2027-06-06'])
  assert.deepEqual(dates('15 giugno 2027 7 luglio 2027 8 settembre 2027'),
    ['2027-06-15', '2027-07-07', '2027-09-08'])
})

test('signale les dates ambiguës et ne les propose pas d’office', () => {
  const found = findDates('Arrivo 03/04/2027')
  assert.deepEqual(found.map((f) => [f.date, f.ambiguous]), [['2027-04-03', true], ['2027-03-04', true]])
  assert.deepEqual(suggestDates(found, '2027-03-01', '2027-04-30'), [])
  assert.deepEqual(findDates('25/04/2027').map((f) => [f.date, f.ambiguous]), [['2027-04-25', false]])
})

test('ignore les dates impossibles, incomplètes et les autres nombres', () => {
  assert.deepEqual(dates('31/02/2027, 3 aprile, ref 12-3456-7890, 2 marzipan 2027, 10 market 2027'), [])
})

test('met d’abord les dates du voyage', () => {
  const found = findDates('Emesso il 10 gennaio 2027. Check-in 2 aprile 2027, check-out 5 aprile 2027')
  assert.deepEqual(rankDates(found, '2027-04-01', '2027-04-10').map((f) => f.date),
    ['2027-04-02', '2027-04-05', '2027-01-10'])
  assert.deepEqual(suggestDates(found, '2027-04-01', '2027-04-10'), ['2027-04-02', '2027-04-05'])
  assert.ok(found[1].excerpt.includes('Check-in'))
})

test('place un hébergement sur l’arrivée, les nuits et le départ', () => {
  const t = trip({ bookings: [booking()] })
  assert.deepEqual(
    ['2027-03-31', '2027-04-01', '2027-04-02', '2027-04-04', '2027-04-05'].map((d) => bookingsOn(t, d).map((b) => b.role)),
    [[], ['start'], ['during'], ['end'], []],
  )
  const flight = trip({ bookings: [booking({ type: 'flight', endDate: '2027-04-01' })] })
  assert.equal(bookingsOn(flight, '2027-04-01').length, 1)
})

test('rappelle les retards, les échéances proches, aujourd’hui et demain', () => {
  const todo = (id: string, dueDate: string, done = false) => ({ id, text: id, dueDate, done })
  const t = trip({
    bookings: [booking()],
    todos: [todo('retard', '2027-03-01'), todo('proche', '2027-04-07'), todo('loin', '2027-04-09'),
      todo('fait', '2027-03-01', true), todo('libre', '')],
  })
  assert.deepEqual(
    dueReminders([t], '2027-03-31').map((r) => (r.kind === 'todo' ? r.todo.id : r.kind)),
    ['retard', 'start', 'proche'],
  )
})

test('écrit un fichier de calendrier correct', () => {
  const ics = calendarFile(
    [
      { uid: 'a', title: 'Check-in: Hotel, Tokyo; 東京'.repeat(4), date: '2027-04-01', time: '15:05', description: 'riga 1\nriga 2' },
      { uid: 'b', title: 'Da prenotare', date: '2027-12-31', time: '', description: '' },
    ],
    new Date('2026-11-25T10:00:00Z'),
  )
  assert.ok(ics.includes('DTSTART:20270401T150500\r\n'))
  assert.ok(ics.includes('DTSTART;VALUE=DATE:20271231\r\nDTEND;VALUE=DATE:20280101\r\n'))
  assert.ok(ics.includes('DESCRIPTION:riga 1\\nriga 2'))
  assert.ok(ics.replaceAll('\r\n ', '').includes('Hotel\\, Tokyo\\; 東京'))
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, line)
})

test('la copie garde les PDF et lit les anciennes copies', () => {
  const bytes = new Uint8Array(100_000).map((_, i) => i % 256)
  const data = { version: 1 as const, trips: [trip({ bookings: [booking({ file: { id: 'f', name: 'x.pdf' } })] })] }
  const text = writeBackup({ data, files: { f: { name: 'x.pdf', base64: toBase64(bytes) } } })
  const read = readBackup(text)!
  assert.deepEqual(read.data, data)
  assert.deepEqual(fromBase64(read.files.f.base64), bytes)
  assert.deepEqual(fileIds(read.data.trips), ['f'])
  assert.deepEqual(readBackup(JSON.stringify({ version: 1, trips: [trip()] }))!.files, {})
  assert.equal(readBackup(JSON.stringify({ version: 1, trips: [], files: { f: { name: 'x', base64: '***' } } })), null)
})

test('refuse des réservations abîmées', () => {
  for (const bad of [booking({ type: 'x' as Booking['type'] }), booking({ date: '' }), { id: 'b' }]) {
    assert.equal(parseData(JSON.stringify({ version: 1, trips: [trip({ bookings: [bad as Booking] })] })), null)
  }
})
