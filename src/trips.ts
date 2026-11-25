// Données des voyages et règles de calcul, sans dépendance à l'écran (donc testables).
// Chaque élément a un identifiant unique et chaque voyage une date de modification :
// cela servira pour le partage entre téléphones.

export type Activity = {
  id: string
  date: string // AAAA-MM-JJ
  time: string // HH:MM, ou vide si l'heure n'est pas fixée
  title: string
  place: string
  notes: string
  // Point sur la carte, absent des données et copies créées avant la phase 2.
  location?: Location
}

export type Location = {
  lat: number
  lon: number
  label: string // adresse renvoyée par la recherche
}

export type Item = {
  id: string
  date: string
  text: string
  done: boolean
}

export type TripDetails = {
  name: string
  destination: string
  startDate: string
  endDate: string
}

export type Trip = TripDetails & {
  id: string
  activities: Activity[]
  items: Item[]
  updatedAt: string
}

export type Data = { version: 1; trips: Trip[] }

export const emptyData: Data = { version: 1, trips: [] }

export const maxDays = 366
const dayInMs = 24 * 60 * 60 * 1000

function toTime(date: string): number {
  return Date.parse(`${date}T00:00:00Z`)
}

export function isDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const time = toTime(value)
  // Rejette par exemple le 31 février.
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === value
}

export type DateProblem = 'missing' | 'order' | 'tooLong' | null

export function checkDates(startDate: string, endDate: string): DateProblem {
  if (!isDate(startDate) || !isDate(endDate)) return 'missing'
  if (endDate < startDate) return 'order'
  if ((toTime(endDate) - toTime(startDate)) / dayInMs + 1 > maxDays) return 'tooLong'
  return null
}

// Les calculs se font en UTC pour éviter les décalages dus aux changements d'heure.
export function listDays(startDate: string, endDate: string): string[] {
  if (checkDates(startDate, endDate)) return []
  const days: string[] = []
  for (let time = toTime(startDate); time <= toTime(endDate); time += dayInMs) {
    days.push(new Date(time).toISOString().slice(0, 10))
  }
  return days
}

// Date du jour selon l'horloge du téléphone.
export function today(now = new Date()): string {
  const two = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`
}

// Par heure ; les activités sans heure viennent à la fin, dans l'ordre de saisie.
export function activitiesOn(trip: Trip, date: string): Activity[] {
  return trip.activities
    .filter((a) => a.date === date)
    .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
}

export function itemsOn(trip: Trip, date: string): Item[] {
  return trip.items.filter((i) => i.date === date)
}

// Nombre d'éléments qui ne seraient plus visibles avec ces dates.
export function countOutside(trip: Trip, startDate: string, endDate: string): number {
  return [...trip.activities, ...trip.items].filter((e) => e.date < startDate || e.date > endDate)
    .length
}

// Ajoute l'élément, ou remplace celui qui a le même identifiant.
export function upsert<T extends { id: string }>(list: T[], element: T): T[] {
  return list.some((e) => e.id === element.id)
    ? list.map((e) => (e.id === element.id ? element : e))
    : [...list, element]
}

type Json = Record<string, unknown>

function isObject(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasStrings(value: unknown, keys: string[]): value is Json {
  return isObject(value) && keys.every((key) => typeof value[key] === 'string')
}

export function isLocation(value: unknown): value is Location {
  return (
    hasStrings(value, ['label']) &&
    typeof value.lat === 'number' &&
    typeof value.lon === 'number' &&
    Math.abs(value.lat) <= 90 &&
    Math.abs(value.lon) <= 180
  )
}

function isActivity(value: unknown): boolean {
  return (
    hasStrings(value, ['id', 'date', 'time', 'title', 'place', 'notes']) &&
    isDate(value.date as string) &&
    (value.location === undefined || isLocation(value.location))
  )
}

function isItem(value: unknown): boolean {
  return (
    hasStrings(value, ['id', 'date', 'text']) &&
    isDate(value.date as string) &&
    typeof value.done === 'boolean'
  )
}

function isTrip(value: unknown): boolean {
  return (
    hasStrings(value, ['id', 'name', 'destination', 'startDate', 'endDate', 'updatedAt']) &&
    checkDates(value.startDate as string, value.endDate as string) === null &&
    Array.isArray(value.activities) &&
    value.activities.every(isActivity) &&
    Array.isArray(value.items) &&
    value.items.every(isItem)
  )
}

// Lit un texte JSON (mémoire du téléphone ou copie de sécurité). null = illisible.
export function parseData(text: string): Data | null {
  try {
    const value: unknown = JSON.parse(text)
    if (isObject(value) && value.version === 1 && Array.isArray(value.trips)) {
      if (value.trips.every(isTrip)) return value as Data
    }
  } catch {
    // Le texte n'est pas du JSON.
  }
  return null
}

// Une restauration ne supprime jamais un voyage absent de la copie.
export function mergeData(current: Data, incoming: Data): Data {
  return { version: 1, trips: incoming.trips.reduce(upsert, current.trips) }
}
