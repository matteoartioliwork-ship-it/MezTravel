import { saveFile } from './files'
import { languages, useLanguage } from './i18n'
import { link, useRoute } from './route'
import { rawStoredData, useStore } from './store'
import { listDays, upsert, type Trip } from './trips'
import DayView from './views/DayView'
import TripList from './views/TripList'
import TripView from './views/TripView'

export default function App() {
  const { language, setLanguage, t } = useLanguage()
  const { data, damaged, saveFailed, update } = useStore()
  const route = useRoute()

  const trip = data.trips.find((candidate) => candidate.id === route.tripId)

  function changeTrip(id: string, change: (trip: Trip) => Trip) {
    update((current) => {
      const existing = current.trips.find((candidate) => candidate.id === id)
      if (!existing) return current
      const changed = { ...change(existing), updatedAt: new Date().toISOString() }
      return { ...current, trips: upsert(current.trips, changed) }
    })
  }

  function page() {
    if (!route.tripId) {
      return <TripList t={t} language={language} data={data} update={update} />
    }
    if (trip && !route.date) {
      return (
        <TripView
          key={trip.id}
          t={t}
          language={language}
          trip={trip}
          onChange={(change) => changeTrip(trip.id, change)}
          onDelete={() => {
            update((current) => ({
              ...current,
              trips: current.trips.filter((candidate) => candidate.id !== trip.id),
            }))
            window.location.hash = link()
          }}
        />
      )
    }
    if (trip && route.date && listDays(trip.startDate, trip.endDate).includes(route.date)) {
      return (
        <DayView
          key={`${trip.id}/${route.date}`}
          t={t}
          language={language}
          trip={trip}
          date={route.date}
          onChange={(change) => changeTrip(trip.id, change)}
        />
      )
    }
    return (
      <p className="card">
        {t.notFound} <a href={link()}>{t.myTrips}</a>
      </p>
    )
  }

  return (
    <>
      <header>
        <a className="brand" href={link()}>
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" width="56" height="56" />
          <div>
            <h1>MezTravel</h1>
            <p>{t.tagline}</p>
          </div>
        </a>
        <div className="languages" role="group" aria-label={t.languageLabel}>
          {languages.map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={code === language}
              onClick={() => setLanguage(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main>
        {saveFailed && (
          <p className="card warning" role="alert">
            {t.saveFailed}
          </p>
        )}
        {damaged ? (
          <div className="card warning" role="alert">
            <p>{t.damaged}</p>
            <button type="button" onClick={() => saveFile('meztravel-damaged.json', rawStoredData())}>
              {t.damagedDownload}
            </button>
          </div>
        ) : (
          page()
        )}
      </main>
    </>
  )
}
