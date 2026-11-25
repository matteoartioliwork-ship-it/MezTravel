import { useState } from 'react'
import { readCache, writeCache } from '../cache'
import {
  checkedOn,
  countryCards,
  countryCodes,
  worldwide,
  type Office,
  type Phone,
  type Source,
} from '../emergency'
import { formatDate, type Dictionary, type Language } from '../i18n'
import { link } from '../route'
import type { Trip } from '../trips'

type Props = {
  t: Dictionary
  language: Language
  trip?: Trip
  onCountry: (code: string) => void
}

export default function EmergencyView({ t, language, trip, onCountry }: Props) {
  const [chosen, setChosen] = useState(
    () => trip?.country ?? readCache<string>('meztravel.country') ?? 'JP',
  )
  const card = countryCards[chosen]
  const names = new Intl.DisplayNames([language], { type: 'region' })
  const countries = countryCodes
    .map((code) => ({ code, name: names.of(code) ?? code }))
    .sort((a, b) => a.name.localeCompare(b.name, language))

  function choose(code: string) {
    setChosen(code)
    writeCache('meztravel.country', code)
    onCountry(code)
  }

  const source = (s: Source) => (
    <p className="muted">
      {t.sourceLabel}:{' '}
      <a href={s.url} target="_blank" rel="noreferrer">
        {s.name}
      </a>{' '}
      · {t.checkedLabel} {formatDate(checkedOn, language, true)}
    </p>
  )

  const call = (phone: Phone, key = phone.dial) => (
    <a key={key} className="button call" href={`tel:${phone.dial}`}>
      <span>{t[phone.label]}</span>
      <strong>{phone.display}</strong>
    </a>
  )

  const office = (o: Office) => (
    <article key={o.name} className="office">
      <h3>{t[o.name]}</h3>
      {o.note && <p>{t[o.note]}</p>}
      {o.phones.map((p) => call(p))}
      <p className="address">{o.address}</p>
      {o.email && <a href={`mailto:${o.email}`}>{o.email}</a>}
      {source(o.source)}
    </article>
  )

  return (
    <>
      <a className="back" href={link(trip?.id)}>
        ‹ {trip?.name ?? t.myTrips}
      </a>
      <h2 className="page-title">{t.emergencyTitle}</h2>

      <label>
        {t.countryVisited}
        <select value={chosen} onChange={(e) => choose(e.target.value)}>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <p className="card warning">{card ? t.recheckWarning : t.noCardWarning}</p>

      {card && (
        <section className="card">
          <h2>{t.localNumbers}</h2>
          {card.localNumbers.map((number) => (
            <div key={number.dial}>
              {call(number)}
              {number.label === 'visitorHotline' && <p>{t.visitorHotlineNote}</p>}
              {source(number.source)}
            </div>
          ))}
        </section>
      )}

      <section className="card">
        <h2>🇮🇹 {t.forItalians}</h2>
        {card?.italy.map(office)}
        <article className="office">
          {call(worldwide.italy.phone)}
          <p>{t.crisisNote}</p>
          {source(worldwide.italy.source)}
          {worldwide.italy.links.map((l) => (
            <p key={l.url}>
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.name}
              </a>
            </p>
          ))}
        </article>
      </section>

      <section className="card">
        <h2>🇨🇭 {t.forSwiss}</h2>
        {card?.switzerland.map(office)}
        <article className="office">
          <p>{t.helplineNote}</p>
          {worldwide.switzerland.phones.map((p) => call(p))}
          <a href={`mailto:${worldwide.switzerland.email}`}>{worldwide.switzerland.email}</a>
          {source(worldwide.switzerland.source)}
          {worldwide.switzerland.links.map((l) => (
            <p key={l.url}>
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.name}
              </a>
            </p>
          ))}
        </article>
      </section>
    </>
  )
}
