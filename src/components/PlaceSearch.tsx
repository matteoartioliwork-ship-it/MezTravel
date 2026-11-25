import { useState } from 'react'
import type { Dictionary, Language } from '../i18n'
import { searchPlaces } from '../places'
import type { Location } from '../trips'

type Props = {
  t: Dictionary
  language: Language
  query: string
  location?: Location
  onChoose: (location: Location | undefined) => void
}

type Search =
  | { state: 'idle' | 'loading' | 'error' | 'empty' }
  | { state: 'results'; query: string; results: Location[] }

export default function PlaceSearch({ t, language, query, location, onChoose }: Props) {
  const [search, setSearch] = useState<Search>({ state: 'idle' })

  async function run() {
    setSearch({ state: 'loading' })
    try {
      const results = await searchPlaces(query, language)
      setSearch(results.length ? { state: 'results', query, results } : { state: 'empty' })
    } catch {
      setSearch({ state: 'error' })
    }
  }

  if (location) {
    return (
      <div className="place-search">
        <p className="success">✓ {t.onMap}</p>
        <p className="muted">{location.label}</p>
        <button
          type="button"
          onClick={() => {
            onChoose(undefined)
            setSearch({ state: 'idle' })
          }}
        >
          {t.removeFromMap}
        </button>
      </div>
    )
  }

  return (
    <div className="place-search">
      <button type="button" disabled={!query.trim() || search.state === 'loading'} onClick={run}>
        {search.state === 'loading' ? t.searching : t.searchOnMap}
      </button>
      <p className="muted">{t.searchHint}</p>
      {search.state === 'empty' && <p role="status">{t.noResults}</p>}
      {search.state === 'error' && (
        <p role="alert" className="error">
          {t.searchError}
        </p>
      )}
      {/* Les résultats disparaissent si le texte a changé depuis la recherche. */}
      {search.state === 'results' && search.query === query && (
        <>
          <p>{t.chooseResult}</p>
          <ul className="plain results">
            {search.results.map((result) => (
              <li key={`${result.lat},${result.lon},${result.label}`}>
                <button type="button" onClick={() => onChoose(result)}>
                  {result.label}
                </button>
              </li>
            ))}
          </ul>
          <p className="muted">
            ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              OpenStreetMap
            </a>
          </p>
        </>
      )}
    </div>
  )
}
