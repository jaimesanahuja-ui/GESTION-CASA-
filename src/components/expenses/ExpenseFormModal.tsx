import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'

export function ExpenseFormModal({ onClose }: { onClose: () => void }) {
  const { state, addExpense } = useApp()
  const activeUsers = state.users.filter((u) => u.active)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(activeUsers[0]?.id ?? '')
  const [splitBetween, setSplitBetween] = useState<string[]>(activeUsers.map((u) => u.id))

  const amountNumber = Number(amount.replace(',', '.'))
  const valid = description.trim() && amountNumber > 0 && paidBy && splitBetween.length > 0

  function toggleParticipant(id: string) {
    setSplitBetween((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function submit() {
    if (!valid) return
    addExpense({ description: description.trim(), amount: round2(amountNumber), paidBy, splitBetween })
    onClose()
  }

  return (
    <Modal title="💶 Nuevo gasto" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">¿Qué se ha comprado?</label>
          <input
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
            placeholder="Ej: compra del súper"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Importe (€)</label>
          <input
            type="text"
            inputMode="decimal"
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">¿Quién ha pagado?</label>
          <select
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
          >
            {activeUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">¿Entre quiénes se reparte?</label>
          <div className="flex flex-col gap-2">
            {activeUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => toggleParticipant(u.id)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  splitBetween.includes(u.id) ? 'border-brand-500 bg-brand-50' : 'border-brand-100 bg-white'
                }`}
              >
                {u.name}
                <span>{splitBetween.includes(u.id) ? '✅' : '—'}</span>
              </button>
            ))}
          </div>
          {splitBetween.length > 0 && amountNumber > 0 && (
            <p className="mt-2 text-xs text-ink-500">
              {(amountNumber / splitBetween.length).toFixed(2)}€ por persona.
            </p>
          )}
        </div>

        <Button disabled={!valid} onClick={submit}>
          Añadir gasto
        </Button>
      </div>
    </Modal>
  )
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}
