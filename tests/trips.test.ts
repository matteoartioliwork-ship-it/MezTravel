import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  activitiesOn,
  checkDates,
  countOutside,
  emptyData,
  listDays,
  mergeData,
  parseData,
  today,
  type Trip,
} from '../src/trips.ts'

const trip = (changes: Partial<Trip> = {}): Trip => ({
  id: 'a',
  name: 'Japon',
  destination: 'Tokyo',
  startDate: '2027-04-01',
  endDate: '2027-04-03',
  activities: [],
  items: [],
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...changes,
})

const activity = (id: string, time: string, date = '2027-04-01') => ({
  id,
  date,
  time,
  title: id,
  place: '',
  notes: '',
})

test('liste les jours, bornes comprises', () => {
  assert.deepEqual(listDays('2027-04-01', '2027-04-03'), ['2027-04-01', '2027-04-02', '2027-04-03'])
  assert.deepEqual(listDays('2027-04-01', '2027-04-01'), ['2027-04-01'])
})

test('gère les changements de mois, d’heure et les années bissextiles', () => {
  assert.equal(listDays('2027-03-27', '2027-03-29').length, 3)
  assert.deepEqual(listDays('2028-02-28', '2028-03-01'), ['2028-02-28', '2028-02-29', '2028-03-01'])
})

test('refuse les dates impossibles', () => {
  assert.equal(checkDates('', '2027-04-01'), 'missing')
  assert.equal(checkDates('2027-02-31', '2027-04-01'), 'missing')
  assert.equal(checkDates('2027-04-02', '2027-04-01'), 'order')
  assert.equal(checkDates('2027-01-01', '2028-01-02'), 'tooLong')
  assert.equal(checkDates('2027-01-01', '2028-01-01'), null)
})

test('donne la date locale du jour', () => {
  assert.equal(today(new Date(2027, 0, 5, 23, 30)), '2027-01-05')
})

test('trie par heure, sans heure à la fin', () => {
  const t = trip({ activities: [activity('libre', ''), activity('soir', '19:00'), activity('matin', '08:00')] })
  assert.deepEqual(activitiesOn(t, '2027-04-01').map((a) => a.id), ['matin', 'soir', 'libre'])
})

test('compte les éléments hors des nouvelles dates', () => {
  const t = trip({ activities: [activity('x', '', '2027-04-03')] })
  assert.equal(countOutside(t, '2027-04-01', '2027-04-02'), 1)
  assert.equal(countOutside(t, '2027-04-01', '2027-04-03'), 0)
})

test('relit une copie valide et refuse les fichiers abîmés', () => {
  const data = { version: 1, trips: [trip({ activities: [activity('x', '10:00')] })] }
  assert.deepEqual(parseData(JSON.stringify(data)), data)
  for (const bad of [
    'pas du json',
    'null',
    '{}',
    JSON.stringify({ version: 2, trips: [] }),
    JSON.stringify({ version: 1, trips: [null] }),
    JSON.stringify({ version: 1, trips: [trip({ endDate: '2020-01-01' })] }),
    JSON.stringify({ version: 1, trips: [{ ...trip(), activities: [{ id: 'x' }] }] }),
  ]) {
    assert.equal(parseData(bad), null, bad)
  }
})

test('une restauration ajoute et remplace sans rien supprimer', () => {
  const current = { version: 1 as const, trips: [trip(), trip({ id: 'b' })] }
  const merged = mergeData(current, { version: 1, trips: [trip({ name: 'Copie' }), trip({ id: 'c' })] })
  assert.deepEqual(merged.trips.map((t) => [t.id, t.name]), [['a', 'Copie'], ['b', 'Japon'], ['c', 'Japon']])
  assert.deepEqual(mergeData(current, emptyData), current)
})
