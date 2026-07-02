import type { AppState, MonthSummary, User } from '../types'
import { generateId } from './id'

export interface CloseMonthResult {
  summary: MonthSummary
  users: User[]
}

export function closeMonth(state: AppState, month: number, year: number): CloseMonthResult {
  const pointsByUser: Record<string, number> = {}
  let winnerId: string | null = null
  let maxPoints = -1
  for (const user of state.users) {
    pointsByUser[user.id] = user.monthlyPoints
    if (user.monthlyPoints > maxPoints) {
      maxPoints = user.monthlyPoints
      winnerId = user.id
    }
  }
  if (maxPoints <= 0) winnerId = null

  const summary: MonthSummary = {
    id: generateId(),
    month,
    year,
    winnerId,
    pointsByUser,
    reward: state.settings.monthlyReward,
    closed: true,
  }

  const users = state.users.map((u) => ({ ...u, monthlyPoints: 0 }))

  return { summary, users }
}
