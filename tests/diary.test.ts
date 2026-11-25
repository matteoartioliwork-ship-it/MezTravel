import assert from 'node:assert/strict'
import { test } from 'node:test'
import { attachments, fileIds } from '../src/backup.ts'
import { countryCards, countryCodes, worldwide } from '../src/emergency.ts'
import { fitSize } from '../src/photos.ts'
import { countOutside, diaryText, parseData, setDiaryText, type Trip } from '../src/trips.ts'

const trip: Trip = {
  id: 't', name: 'n', destination: '', startDate: '2027-04-01', endDate: '2027-04-03',
  activities: [], items: [], updatedAt: 'x',
}

test('écrit, remplace et efface une page de journal', () => {
  let t = setDiaryText(trip, '2027-04-01', 'Arrivée')
  t = setDiaryText(t, '2027-04-02', 'Temple')
  t = setDiaryText(t, '2027-04-01', 'Arrivée !')
  assert.equal(diaryText(t, '2027-04-01'), 'Arrivée !')
  assert.equal(setDiaryText(t, '2027-04-01', '').diary!.length, 1)
  assert.equal(diaryText(trip, '2027-04-01'), '')
})

test('compte le journal et les photos hors des nouvelles dates', () => {
  const t = { ...setDiaryText(trip, '2027-04-03', 'x'), photos: [{ id: 'p', date: '2027-04-03', caption: '' }] }
  assert.equal(countOutside(t, '2027-04-01', '2027-04-02'), 2)
})

test('la copie et la suppression incluent les photos et les PDF', () => {
  const t: Trip = {
    ...trip,
    photos: [{ id: 'photo', date: '2027-04-02', caption: '' }],
    bookings: [{
      id: 'b', type: 'ticket', title: 'x', date: '2027-04-01', time: '', endDate: '', endTime: '',
      notes: '', file: { id: 'pdf', name: 'a.pdf' },
    }],
  }
  assert.deepEqual(fileIds([t]), ['pdf', 'photo'])
  assert.equal(attachments([t])[1].name, '2027-04-02.jpg')
  assert.ok(parseData(JSON.stringify({ version: 1, trips: [t] })))
  assert.equal(parseData(JSON.stringify({ version: 1, trips: [{ ...t, photos: [{ id: 'p' }] }] })), null)
})

test('réduit les grandes photos sans déformer ni agrandir', () => {
  assert.deepEqual(fitSize(4032, 3024), { width: 1600, height: 1200 })
  assert.deepEqual(fitSize(3024, 4032), { width: 1200, height: 1600 })
  assert.deepEqual(fitSize(800, 600), { width: 800, height: 600 })
  assert.deepEqual(fitSize(10000, 1), { width: 1600, height: 1 })
})

test('chaque numéro d’urgence correspond au numéro affiché et a une source officielle', () => {
  const offices = Object.values(countryCards).flatMap((c) => [...c.italy, ...c.switzerland])
  const phones = [
    ...Object.values(countryCards).flatMap((c) => c.localNumbers),
    ...offices.flatMap((o) => o.phones),
    worldwide.italy.phone,
    ...worldwide.switzerland.phones,
  ]
  for (const phone of phones) {
    assert.equal(phone.dial, phone.display.replace(/ /g, ''), phone.display)
  }
  const official = /^https:\/\/([\w-]+\.)*(esteri\.it|eda\.admin\.ch|japan\.travel|kaiho\.mlit\.go\.jp)\//
  for (const source of [...offices.map((o) => o.source), ...countryCards.JP.localNumbers.map((n) => n.source)]) {
    assert.match(source.url, official)
  }
})

test('la liste des pays n’a ni doublon ni code mal formé', () => {
  assert.equal(new Set(countryCodes).size, countryCodes.length)
  assert.ok(countryCodes.every((c) => /^[A-Z]{2}$/.test(c)))
  assert.ok(['JP', 'IT', 'CH', 'US', 'FR'].every((c) => countryCodes.includes(c)))
})
