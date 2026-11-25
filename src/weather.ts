// Météo avec Open-Meteo (gratuit pour un usage non commercial, données CC BY 4.0).
import { readCache, writeCache } from './cache.ts'

export const forecastDays = 16
const freshMs = 60 * 60 * 1000
const dayInMs = 24 * 60 * 60 * 1000

export type DayForecast = { code: number; min: number; max: number; rain: number | null }
export type Forecast = { fetchedAt: number; days: Record<string, DayForecast> }

// On évite d'envoyer une position quand aucune prévision n'est possible.
// Une marge d'un jour couvre le décalage horaire avec la destination.
export function forecastStatus(date: string, now: string): 'past' | 'tooFar' | 'possible' {
  const ahead = (Date.parse(date) - Date.parse(now)) / dayInMs
  if (ahead < -1) return 'past'
  return ahead > forecastDays ? 'tooFar' : 'possible'
}

export type WeatherKind =
  | 'clear' | 'partly' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'showers' | 'storm' | 'unknown'

// Codes météo WMO utilisés par Open-Meteo.
export function weatherKind(code: number): WeatherKind {
  if (code === 0) return 'clear'
  if (code === 1 || code === 2) return 'partly'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if (code >= 61 && code <= 67) return 'rain'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if (code >= 80 && code <= 82) return 'showers'
  if (code >= 95 && code <= 99) return 'storm'
  return 'unknown'
}

export function parseForecast(value: any): Record<string, DayForecast> {
  const daily = value?.daily
  const days: Record<string, DayForecast> = {}
  if (!Array.isArray(daily?.time)) return days
  daily.time.forEach((date: string, i: number) => {
    const code = daily.weather_code?.[i]
    const min = daily.temperature_2m_min?.[i]
    const max = daily.temperature_2m_max?.[i]
    const rain = daily.precipitation_probability_max?.[i]
    // Les derniers jours peuvent être incomplets (valeurs nulles) : on les ignore.
    if ([code, min, max].every((n) => typeof n === 'number')) {
      days[date] = { code, min, max, rain: typeof rain === 'number' ? rain : null }
    }
  })
  return days
}

// En cas de panne ou sans internet, rend la dernière prévision connue (avec son heure).
export async function loadForecast(lat: number, lon: number): Promise<Forecast> {
  // Deux décimales (environ 1 km) suffisent pour la météo.
  const latitude = lat.toFixed(2)
  const longitude = lon.toFixed(2)
  const key = `meztravel.weather.${latitude},${longitude}`
  const saved = readCache<Forecast>(key)
  if (saved && Date.now() - saved.fetchedAt < freshMs) return saved

  try {
    const params = new URLSearchParams({
      latitude,
      longitude,
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: String(forecastDays),
    })
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`Open-Meteo ${response.status}`)
    const forecast = { fetchedAt: Date.now(), days: parseForecast(await response.json()) }
    writeCache(key, forecast)
    return forecast
  } catch (error) {
    if (saved) return saved
    throw error
  }
}
