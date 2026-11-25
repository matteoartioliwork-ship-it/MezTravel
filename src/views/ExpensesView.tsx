import { useState, type FormEvent } from 'react'
import ExpenseForm from '../components/ExpenseForm'
import { CurrencySelect, useRates } from '../components/Money'
import { formatDate, type Dictionary, type Language } from '../i18n'
import { balances, formatAmount, inBase, settle, type Transfer } from '../money'
import { link } from '../route'
import { today, upsert, type Expense, type Trip } from '../trips'

type Props = {
  t: Dictionary
  language: Language
  trip: Trip
  onChange: (change: (trip: Trip) => Trip) => void
}

export default function ExpensesView({ t, language, trip, onChange }: Props) {
  const rates = useRates()
  const [draft, setDraft] = useState<Expense | null>(null)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState(false)

  const base = trip.currency ?? 'CHF'
  const members = trip.members ?? []
  const expenses = [...(trip.expenses ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  const totals = balances(trip, base)
  const transfers = settle(totals)
  const nameOf = (id: string) => members.find((m) => m.id === id)?.name ?? '?'
  const money = (amount: number) => formatAmount(amount, base, language)
  const spent = expenses.filter((e) => !e.repayment).reduce((sum, e) => sum + inBase(e, base), 0)
  const isNew = draft !== null && !expenses.some((e) => e.id === draft.id)

  function addMember(event: FormEvent) {
    event.preventDefault()
    const clean = name.trim()
    if (!clean) return
    if (members.some((m) => m.name.toLowerCase() === clean.toLowerCase())) return setNameError(true)
    const member = { id: crypto.randomUUID(), name: clean }
    onChange((current) => ({ ...current, members: [...(current.members ?? []), member] }))
    setName('')
  }

  const isUsed = (id: string) =>
    expenses.some((e) => e.payerId === id || e.shares.some((s) => s.memberId === id))

  function save(expense: Expense) {
    // La monnaie des comptes est fixée avec la première dépense.
    onChange((current) => ({
      ...current,
      currency: base,
      expenses: upsert(current.expenses ?? [], expense),
    }))
    setDraft(null)
  }

  function remove(expense: Expense) {
    if (!window.confirm(t.confirmDeleteExpense)) return
    onChange((current) => ({
      ...current,
      expenses: (current.expenses ?? []).filter((e) => e.id !== expense.id),
    }))
  }

  function markPaid(transfer: Transfer) {
    const text = `${nameOf(transfer.from)} → ${nameOf(transfer.to)}: ${money(transfer.amount)}`
    if (!window.confirm(`${t.confirmPaid}\n${text}`)) return
    save({
      id: crypto.randomUUID(),
      date: today(),
      title: t.repayment,
      amount: transfer.amount,
      currency: base,
      rate: 1,
      payerId: transfer.from,
      shares: [{ memberId: transfer.to, amount: transfer.amount }],
      repayment: true,
    })
  }

  function newExpense(): Expense {
    const last = expenses.find((e) => !e.repayment)
    return {
      id: crypto.randomUUID(),
      date: today(),
      title: '',
      amount: 0,
      currency: last?.currency ?? base,
      rate: 1,
      payerId: members[0].id,
      shares: [],
    }
  }

  return (
    <>
      <a className="back" href={link(trip.id)}>
        ‹ {trip.name}
      </a>
      <h2 className="page-title">{t.expensesTitle}</h2>

      {draft ? (
        <ExpenseForm
          key={draft.id}
          t={t}
          language={language}
          base={base}
          members={members}
          rates={rates}
          expense={draft}
          isNew={isNew}
          onSave={save}
          onCancel={() => setDraft(null)}
        />
      ) : (
        <>
          <section className="card">
            <h2>{t.members}</h2>
            {members.length === 0 && <p>{t.noMembers}</p>}
            <ul className="plain">
              {members.map((m) => (
                <li key={m.id} className="item">
                  <span>{m.name}</span>
                  {!isUsed(m.id) && (
                    <button
                      type="button"
                      aria-label={`${t.remove}: ${m.name}`}
                      onClick={() =>
                        onChange((current) => ({
                          ...current,
                          members: (current.members ?? []).filter((x) => x.id !== m.id),
                        }))
                      }
                    >
                      ✕
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <form className="add-row" onSubmit={addMember}>
              <input
                value={name}
                placeholder={t.memberName}
                aria-label={t.memberName}
                onChange={(e) => {
                  setName(e.target.value)
                  setNameError(false)
                }}
              />
              <button type="submit" className="primary">
                {t.add}
              </button>
            </form>
            {nameError && (
              <p className="error" role="alert">
                {t.memberExists}
              </p>
            )}
          </section>

          <section className="card">
            <label>
              {t.baseCurrency}
              <CurrencySelect
                language={language}
                rates={rates}
                value={base}
                disabled={expenses.length > 0}
                onChange={(currency) => onChange((current) => ({ ...current, currency }))}
              />
            </label>
            <p className="muted">{expenses.length > 0 ? t.baseLocked : t.baseHint}</p>
          </section>

          {members.length > 0 && (
            <button type="button" className="primary wide" onClick={() => setDraft(newExpense())}>
              + {t.addExpense}
            </button>
          )}

          {expenses.length > 0 && (
            <section className="card">
              <h2>{t.accounts}</h2>
              <p>
                {t.totalSpent}: <strong>{money(spent)}</strong>
              </p>
              <ul className="plain">
                {members.map((m) => {
                  const value = totals.get(m.id) ?? 0
                  return (
                    <li key={m.id} className="item">
                      <span>{m.name}</span>
                      <span className={value < 0 ? 'error' : undefined}>
                        {value > 0 && `${t.toReceive} ${money(value)}`}
                        {value < 0 && `${t.toGive} ${money(-value)}`}
                        {value === 0 && t.even}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <h3>{t.whoPaysWhom}</h3>
              {transfers.length === 0 && <p>{t.allSettled}</p>}
              <ul className="plain">
                {transfers.map((transfer) => (
                  <li key={`${transfer.from}-${transfer.to}`} className="todo">
                    <p>
                      <strong>
                        {nameOf(transfer.from)} → {nameOf(transfer.to)}: {money(transfer.amount)}
                      </strong>
                    </p>
                    <button type="button" onClick={() => markPaid(transfer)}>
                      {t.markPaid}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="muted">{t.noPayments}</p>
            </section>
          )}

          {expenses.map((expense) => (
            <article key={expense.id} className="card">
              <p className="muted">{formatDate(expense.date, language)}</p>
              <strong>{expense.title}</strong>
              <p>
                {formatAmount(expense.amount, expense.currency, language)}
                {expense.currency !== base && ` ≈ ${money(inBase(expense, base))}`}
              </p>
              <p className="muted">
                {expense.repayment
                  ? `${nameOf(expense.payerId)} → ${nameOf(expense.shares[0]?.memberId)}`
                  : `${t.paidBy} ${nameOf(expense.payerId)} · ${t.splitBetween}: ${expense.shares
                      .map((s) => `${nameOf(s.memberId)} ${formatAmount(s.amount, expense.currency, language)}`)
                      .join(', ')}`}
              </p>
              <div className="actions">
                {!expense.repayment && (
                  <button type="button" onClick={() => setDraft(expense)}>
                    {t.edit}
                  </button>
                )}
                <button type="button" onClick={() => remove(expense)}>
                  {t.remove}
                </button>
              </div>
            </article>
          ))}
        </>
      )}
    </>
  )
}
