// Carte du jour avec Leaflet et les tuiles OpenStreetMap.
// Règles des tuiles : https://operations.osmfoundation.org/policies/tiles/
// Source toujours visible, aucun préchargement ni téléchargement pour le hors ligne.
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef } from 'react'
import type { Dictionary } from '../i18n'
import type { Activity } from '../trips'

type Props = { t: Dictionary; stops: Activity[] }

export default function DayMap({ t, stops }: Props) {
  return (
    <section className="card">
      <h2>{t.mapTitle}</h2>
      {stops.length === 0 ? (
        <p>{t.mapEmpty}</p>
      ) : (
        <>
          <LeafletMap t={t} stops={stops} />
          <p className="muted">
            {t.mapNote} {t.mapOffline}
          </p>
          <p className="muted">
            <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noreferrer">
              {t.reportMap}
            </a>
          </p>
        </>
      )}
    </section>
  )
}

function LeafletMap({ t, stops }: Props) {
  const container = useRef<HTMLDivElement>(null)
  // La carte n'est reconstruite que si les étapes changent vraiment.
  const signature = JSON.stringify(stops.map((s) => [s.title, s.location?.lat, s.location?.lon]))

  useEffect(() => {
    const map = L.map(container.current!, { scrollWheelZoom: false })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map)

    const points: L.LatLngTuple[] = []
    stops.forEach((stop, index) => {
      const point: L.LatLngTuple = [stop.location!.lat, stop.location!.lon]
      points.push(point)
      // textContent : le titre saisi n'est jamais interprété comme du code.
      const popup = document.createElement('strong')
      popup.textContent = `${index + 1}. ${stop.title}`
      L.marker(point, {
        title: popup.textContent,
        icon: L.divIcon({
          className: 'map-pin',
          html: `<span>${index + 1}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        }),
      })
        .bindPopup(popup)
        .addTo(map)
    })

    if (points.length > 1) {
      L.polyline(points, { color: '#c8102e', weight: 3, dashArray: '6 8' }).addTo(map)
    }
    map.fitBounds(L.latLngBounds(points), { padding: [30, 30], maxZoom: 15 })

    return () => {
      map.remove()
    }
  }, [signature])

  return <div ref={container} className="map" role="region" aria-label={t.mapTitle} />
}
