// Éléments communs au convertisseur et aux dépenses.
import { useEffect, useState } from 'react'
import type { Dictionary, Language } from '../i18n'
import { loadRates, type Rates } from '../rates'

const commonCurrencies = ['CHF', 'EUR', 'USD', 'JPY', 'GBP']

export function useRates(): Rates | 'loading' | 'error' {
  const [rates, setRates] = useState<Rates | 'loading' | 'error'>('loading')
  useEffect(() => {
    let active = true
    loadRates().then(
      (result) => active && setRates(result),
      () => active && setRates('error'),
    )
    return () => {
      active = false
    }
  }, [])
  return rates
}

// Sans taux disponibles, on propose les monnaies que le téléphone connaît.
function allCurrencies(rates: Rates | 'loading' | 'error'): string[] {
  if (typeof rates === 'object') return Object.keys(rates.perUsd).sort()
  return Intl.supportedValuesOf?.('currency') ?? commonCurrencies
}

type SelectProps = {
  language: Language
  rates: Rates | 'loading' | 'error'
  value: string
  onChange: (currency: string) => void
  disabled?: boolean
}

export function CurrencySelect({ language, rates, value, onChange, disabled }: SelectProps) {
  const names = new Intl.DisplayNames([language], { type: 'currency' })
  const all = allCurrencies(rates)
  const option = (code: string) => (
    <option key={code} value={code}>
      {code} – {names.of(code)}
    </option>
  )
  return (
    <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
      {!all.includes(value) && !commonCurrencies.includes(value) && option(value)}
      <optgroup label="★">{commonCurrencies.map(option)}</optgroup>
      <optgroup label="A–Z">{all.filter((c) => !commonCurrencies.includes(c)).map(option)}</optgroup>
    </select>
  )
}

export function RatesSource({ t, language, rates }: { t: Dictionary; language: Language; rates: Rates }) {
  const date = new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(rates.updatedAt)
  return (
    <>
      <p className="muted">
        {t.ratesOf} {date}. {t.ratesNote}
      </p>
      <p className="muted">
        <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">
          Rates By Exchange Rate API
        </a>
      </p>
    </>
  )
}
