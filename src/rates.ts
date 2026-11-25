// Taux de change : ExchangeRate-API, accès libre.
// Conditions : https://www.exchangerate-api.com/docs/free
// - source citée sur les pages qui utilisent les taux ;
// - taux gardés en mémoire jusqu'à la mise à jour suivante (une par jour) ;
// - aucune redistribution : la liste des taux n'est ni publiée ni mise dans la copie.
import { readCache, writeCache } from './cache.ts'

export type Rates = {
  updatedAt: number // date des taux, en millisecondes
  fetchedAt: number
  nextUpdateAt: number
  perUsd: Record<string, number>
}

const cacheKey = 'meztravel.rates'
const hourInMs = 60 * 60 * 1000

export function parseRates(value: any, now: number): Rates | null {
  if (value?.result !== 'success' || value.base_code !== 'USD') return null
  const perUsd: Record<string, number> = {}
  for (const [code, rate] of Object.entries(value.rates ?? {})) {
    if (/^[A-Z]{3}$/.test(code) && typeof rate === 'number' && rate > 0) perUsd[code] = rate
  }
  if (!perUsd.USD) return null
  return {
    perUsd,
    fetchedAt: now,
    updatedAt: (value.time_last_update_unix ?? now / 1000) * 1000,
    nextUpdateAt: (value.time_next_update_unix ?? now / 1000 + 86400) * 1000,
  }
}

// Combien d'unités de « to » pour une unité de « from ».
export function rateBetween(rates: Rates, from: string, to: string): number | null {
  if (from === to) return 1
  const a = rates.perUsd[from]
  const b = rates.perUsd[to]
  return a && b ? b / a : null
}

export function isFresh(rates: Rates, now: number): boolean {
  // Au maximum une demande par heure, même si la mise à jour annoncée est passée.
  return now < rates.nextUpdateAt || now - rates.fetchedAt < hourInMs
}

let pending: Promise<Rates> | null = null

async function fetchRates(): Promise<Rates> {
  const saved = readCache<Rates>(cacheKey)
  if (saved && isFresh(saved, Date.now())) return saved
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`Rates ${response.status}`)
    const rates = parseRates(await response.json(), Date.now())
    if (!rates) throw new Error('Rates: unexpected answer')
    writeCache(cacheKey, rates)
    return rates
  } catch (error) {
    // Sans internet : les derniers taux connus, affichés avec leur date.
    if (saved) return saved
    throw error
  }
}

export function loadRates(): Promise<Rates> {
  pending ??= fetchRates().finally(() => (pending = null))
  return pending
}
