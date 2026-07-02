import type { AppState, Expense } from '../types'
import { generateId } from './id'
import { todayISO } from './dateUtils'

export interface NewExpenseInput {
  description: string
  amount: number
  paidBy: string
  splitBetween: string[]
}

export function createExpense(input: NewExpenseInput): Expense {
  return { id: generateId(), date: todayISO(), ...input }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

/** Saldo neto de cada persona: positivo = le deben, negativo = debe. */
export function computeBalances(state: AppState): Record<string, number> {
  const balances: Record<string, number> = {}
  for (const u of state.users) balances[u.id] = 0

  for (const e of state.expenses) {
    if (e.splitBetween.length === 0) continue
    const share = e.amount / e.splitBetween.length
    for (const participantId of e.splitBetween) {
      balances[participantId] = (balances[participantId] ?? 0) - share
    }
    balances[e.paidBy] = (balances[e.paidBy] ?? 0) + e.amount
  }

  for (const id of Object.keys(balances)) balances[id] = round2(balances[id])
  return balances
}

export interface DebtTransfer {
  from: string
  to: string
  amount: number
}

/** Reduce todas las deudas cruzadas al mínimo número de transferencias necesarias. */
export function simplifyDebts(balances: Record<string, number>): DebtTransfer[] {
  const EPSILON = 0.01
  const creditors = Object.entries(balances)
    .filter(([, b]) => b > EPSILON)
    .map(([id, b]) => ({ id, amount: b }))
    .sort((a, b) => b.amount - a.amount)
  const debtors = Object.entries(balances)
    .filter(([, b]) => b < -EPSILON)
    .map(([id, b]) => ({ id, amount: -b }))
    .sort((a, b) => b.amount - a.amount)

  const transfers: DebtTransfer[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = round2(Math.min(debtor.amount, creditor.amount))
    if (amount > EPSILON) {
      transfers.push({ from: debtor.id, to: creditor.id, amount })
    }
    debtor.amount = round2(debtor.amount - amount)
    creditor.amount = round2(creditor.amount - amount)
    if (debtor.amount <= EPSILON) i++
    if (creditor.amount <= EPSILON) j++
  }
  return transfers
}
