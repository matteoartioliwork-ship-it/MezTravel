import { useEffect, useState } from 'react'
import { readCache, writeCache } from '../cache'
import { CurrencySelect, RatesSource, useRates } from '../components/Money'
import type { Dictionary, Language } from '../i18n'
import { convert, formatAmount, parseAmount } from '../money'
import { rateBetween } from '../rates'
import { link } from '../route'

type Props = { t: Dictionary; language: Language }

const alsoShown = ['CHF', 'EUR', 'USD', 'JPY']

export default function ConverterView({ t, language }: Props) {
  const rates = useRates()
  const saved = readCache<{ from: string; to: string }>('meztravel.converter')
  const [from, setFrom] = useState(saved?.from ?? 'JPY')
  const [to, setTo] = useState(saved?.to ?? 'CHF')
  const [text, setText] = useState('1000')

  useEffect(() => writeCache('meztravel.converter', { from, to }), [from, to])

  const amount = parseAmount(text, from)

  function result(target: string): string | null {
    if (typeof rates !== 'object' || amount === null) return null
    const rate = rateBetween(rates, from, target)
    return rate === null ? null : formatAmount(convert(amount, rate, target), target, language)
  }

  return (
    <>
      <a className="back" href={link()}>
        ‹ {t.myTrips}
      </a>
      <h2 className="page-title">{t.converter}</h2>

      <section className="card">
        <label>
          {t.amount}
          <input inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <label>
          {t.fromCurrency}
          <CurrencySelect language={language} rates={rates} value={from} onChange={setFrom} />
        </label>
        <button
          type="button"
          className="wide"
          onClick={() => {
            setFrom(to)
            setTo(from)
          }}
        >
          ⇅ {t.swap}
        </button>
        <label>
          {t.toCurrency}
          <CurrencySelect language={language} rates={rates} value={to} onChange={setTo} />
        </label>

        {rates === 'loading' && <p role="status">{t.ratesLoading}</p>}
        {rates === 'error' && (
          <p role="alert" className="error">
            {t.ratesError}
          </p>
        )}
        {amount === null && text.trim() !== '' && <p className="error">{t.amountInvalid}</p>}
        {typeof rates === 'object' && amount !== null && (
          <>
            {/* Le montant relu est affiché pour repérer une saisie mal comprise. */}
            <p className="muted">{formatAmount(amount, from, language)} =</p>
            <p className="big-result" role="status">
              {result(to) ?? t.rateMissing}
            </p>
            <ul className="plain">
              {alsoShown
                .filter((c) => c !== from && c !== to)
                .map((c) => (
                  <li key={c}>{result(c)}</li>
                ))}
            </ul>
            <RatesSource t={t} language={language} rates={rates} />
          </>
        )}
      </section>
    </>
  )
}
