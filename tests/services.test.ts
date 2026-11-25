import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parsePlaces } from '../src/places.ts'
import { parseData } from '../src/trips.ts'
import { forecastStatus, parseForecast, weatherKind } from '../src/weather.ts'

const data = (location?: unknown) =>
  JSON.stringify({
    version: 1,
    trips: [
      {
        id: 't', name: 'n', destination: '', startDate: '2027-04-01', endDate: '2027-04-01',
        updatedAt: 'x', items: [],
        activities: [{ id: 'a', date: '2027-04-01', time: '', title: 'x', place: '', notes: '', location }],
      },
    ],
  })

test('les données avec ou sans point sur la carte restent lisibles', () => {
  assert.ok(parseData(data()))
  assert.ok(parseData(data({ lat: 35.7, lon: 139.8, label: 'Tokyo' })))
})

test('refuse un point impossible', () => {
  for (const bad of [null, { lat: '35', lon: 139, label: 'x' }, { lat: 91, lon: 0, label: 'x' }, { lat: 0, lon: 0 }]) {
    assert.equal(parseData(data(bad)), null, JSON.stringify(bad))
  }
})

test('lit les résultats de recherche et écarte les lignes invalides', () => {
  const rows = [{ lat: '35.71', lon: '139.79', display_name: 'Senso-ji' }, { lat: 'x', lon: '1', display_name: 'y' }]
  assert.deepEqual(parsePlaces(rows), [{ lat: 35.71, lon: 139.79, label: 'Senso-ji' }])
  assert.deepEqual(parsePlaces({ error: 'x' }), [])
})

test('ne demande la météo que lorsqu’une prévision est possible', () => {
  assert.equal(forecastStatus('2026-11-23', '2026-11-25'), 'past')
  assert.equal(forecastStatus('2026-11-24', '2026-11-25'), 'possible')
  assert.equal(forecastStatus('2026-12-11', '2026-11-25'), 'possible')
  assert.equal(forecastStatus('2027-04-01', '2026-11-25'), 'tooFar')
})

test('lit la météo et ignore les jours incomplets', () => {
  const days = parseForecast({
    daily: {
      time: ['2026-11-25', '2026-11-26'],
      weather_code: [61, null],
      temperature_2m_min: [8.2, null],
      temperature_2m_max: [14.6, null],
      precipitation_probability_max: [null, null],
    },
  })
  assert.deepEqual(days, { '2026-11-25': { code: 61, min: 8.2, max: 14.6, rain: null } })
  assert.deepEqual(parseForecast({}), {})
})

test('traduit les codes météo', () => {
  assert.deepEqual([0, 2, 3, 48, 53, 65, 75, 81, 95, 42].map(weatherKind),
    ['clear', 'partly', 'cloudy', 'fog', 'drizzle', 'rain', 'snow', 'showers', 'storm', 'unknown'])
})
