import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Card, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../ui/EmptyState'
import { ExpenseFormModal } from './ExpenseFormModal'
import { computeBalances, simplifyDebts } from '../../lib/expenses'
import { formatDateEs } from '../../lib/dateUtils'

function euros(n: number): string {
  const sign = n > 0.005 ? '+' : n < -0.005 ? '−' : ''
  return `${sign}${Math.abs(n).toFixed(2)}€`
}

export function ExpensesView() {
  const { state, deleteExpense } = useApp()
  const [showForm, setShowForm] = useState(false)

  const balances = computeBalances(state)
  const transfers = simplifyDebts(balances)
  const expenses = [...state.expenses].sort((a, b) => b.date.localeCompare(a.date))

  function userName(id: string): string {
    return state.users.find((u) => u.id === id)?.name ?? '—'
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink-900">Gastos compartidos</p>
          <p className="text-xs text-ink-500">Como un Tricount: se apunta, se reparte, se compensa más adelante.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          + Gasto
        </Button>
      </div>

      <Card>
        <CardTitle>⚖️ Balance de cada uno</CardTitle>
        <ul className="flex flex-col gap-2">
          {state.users.map((u) => {
            const balance = balances[u.id] ?? 0
            const tone = balance > 0.005 ? 'text-ok-600' : balance < -0.005 ? 'text-danger-600' : 'text-ink-500'
            return (
              <li key={u.id} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                  <Avatar name={u.name} avatar={u.avatar} size="sm" />
                  {u.name}
                </span>
                <span className={`text-sm font-extrabold ${tone}`}>{euros(balance)}</span>
              </li>
            )
          })}
        </ul>
      </Card>

      <Card>
        <CardTitle>🔁 Quién debe a quién</CardTitle>
        {transfers.length === 0 ? (
          <EmptyState icon="✨" text="Todo el mundo está en paz. Nadie debe nada ahora mismo." />
        ) : (
          <ul className="flex flex-col gap-2">
            {transfers.map((t, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm">
                <span>
                  <strong>{userName(t.from)}</strong> le debe a <strong>{userName(t.to)}</strong>
                </span>
                <span className="font-extrabold text-brand-500">{t.amount.toFixed(2)}€</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle>🧾 Historial de gastos</CardTitle>
        {expenses.length === 0 ? (
          <EmptyState icon="💶" text="Todavía no se ha registrado ningún gasto." />
        ) : (
          <ul className="flex flex-col gap-3">
            {expenses.map((e) => (
              <li key={e.id} className="border-t border-brand-100 pt-3 first:border-0 first:pt-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-ink-900">{e.description}</p>
                    <p className="text-xs text-ink-500">
                      {formatDateEs(e.date)} · pagó {userName(e.paidBy)} · repartido entre{' '}
                      {e.splitBetween.map(userName).join(', ')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm font-extrabold text-ink-900">{e.amount.toFixed(2)}€</span>
                    <button
                      onClick={() => {
                        if (window.confirm('¿Eliminar este gasto? Recalculará los balances.')) deleteExpense(e.id)
                      }}
                      className="text-danger-500 hover:text-danger-600"
                      aria-label="Eliminar gasto"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {showForm && <ExpenseFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
