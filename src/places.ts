// Recherche de lieux avec Nominatim (OpenStreetMap).
// Règles du service : https://operations.osmfoundation.org/policies/nominatim/
// - recherche uniquement à la demande (jamais pendant la frappe) ;
// - au maximum une requête par seconde ;
// - résultats gardés en mémoire pour ne pas répéter une requête ;
// - source affichée à côté des résultats.
import { readCache, writeCache } from './cache.ts'
import { isLocation, type Location } from './trips.ts'

const endpoint = 'https://nominatim.openstreetmap.org/search'
const minDelayMs = 1100
const keptSearches = 50

let nextAllowed = 0

export function parsePlaces(value: unknown): Location[] {
  if (!Array.isArray(value)) return []
  return value
    .map((row) => ({
      lat: Number.parseFloat(row?.lat),
      lon: Number.parseFloat(row?.lon),
      label: row?.display_name,
    }))
    .filter(isLocation)
}

export async function searchPlaces(query: string, language: string): Promise<Location[]> {
  const key = `${language}|${query.trim().toLowerCase()}`
  const cache = readCache<[string, Location[]][]>('meztravel.places') ?? []
  const known = cache.find(([k]) => k === key)
  if (known) return known[1]

  const wait = Math.max(0, nextAllowed - Date.now())
  nextAllowed = Date.now() + wait + minDelayMs
  await new Promise((resolve) => setTimeout(resolve, wait))

  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '5',
    'accept-language': language,
    q: query.trim(),
  })
  const response = await fetch(`${endpoint}?${params}`, { signal: AbortSignal.timeout(10_000) })
  if (!response.ok) throw new Error(`Nominatim ${response.status}`)
  const results = parsePlaces(await response.json())
  writeCache('meztravel.places', [[key, results], ...cache].slice(0, keptSearches))
  return results
}
