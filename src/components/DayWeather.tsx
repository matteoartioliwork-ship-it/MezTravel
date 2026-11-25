import { useEffect, useState } from 'react'
import type { Dictionary, Language } from '../i18n'
import { today, type Activity } from '../trips'
import { forecastStatus, loadForecast, weatherKind, type Forecast, type WeatherKind } from '../weather'

type Props = { t: Dictionary; language: Language; date: string; stop?: Activity }

const icons: Record<WeatherKind, string> = {
  clear: '☀️', partly: '🌤️', cloudy: '☁️', fog: '🌫️', drizzle: '🌦️',
  rain: '🌧️', snow: '🌨️', showers: '🌦️', storm: '⛈️', unknown: '🌡️',
}

export default function DayWeather({ t, language, date, stop }: Props) {
  const status = forecastStatus(date, today())

  function content() {
    if (status === 'past') return <p>{t.weatherPast}</p>
    if (status === 'tooFar') return <p>{t.weatherTooFar}</p>
    if (!stop?.location) return <p>{t.weatherNeedsPlace}</p>
    const { lat, lon } = stop.location
    return (
      <Loaded
        key={`${lat},${lon}`}
        t={t}
        language={language}
        date={date}
        lat={lat}
        lon={lon}
        name={stop.place || stop.title}
      />
    )
  }

  return (
    <section className="card">
      <h2>{t.weatherTitle}</h2>
      {content()}
    </section>
  )
}

type LoadedProps = {
  t: Dictionary
  language: Language
  date: string
  lat: number
  lon: number
  name: string
}

function Loaded({ t, language, date, lat, lon, name }: LoadedProps) {
  const [forecast, setForecast] = useState<Forecast | 'loading' | 'error'>('loading')

  useEffect(() => {
    let active = true
    loadForecast(lat, lon).then(
      (result) => active && setForecast(result),
      () => active && setForecast('error'),
    )
    return () => {
      active = false
    }
  }, [lat, lon])

  if (forecast === 'loading') return <p role="status">{t.weatherLoading}</p>
  if (forecast === 'error') return <p role="alert">{t.weatherError}</p>
  const day = forecast.days[date]
  if (!day) return <p>{t.weatherTooFar}</p>

  const kind = weatherKind(day.code)
  const updated = new Intl.DateTimeFormat(language, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(forecast.fetchedAt)

  return (
    <>
      <div className="weather">
        <span className="weather-icon" aria-hidden="true">
          {icons[kind]}
        </span>
        <div>
          <strong>
            {t[kind]} · {Math.round(day.min)}° / {Math.round(day.max)}°C
          </strong>
          {day.rain !== null && (
            <p>
              {t.weatherRain}: {day.rain}%
            </p>
          )}
        </div>
      </div>
      <p className="muted">
        {t.weatherAt} {name} · {t.weatherUpdated} {updated}
      </p>
      <p className="muted">
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Weather data by Open-Meteo.com
        </a>{' '}
        (
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
          CC BY 4.0
        </a>
        )
      </p>
    </>
  )
}
