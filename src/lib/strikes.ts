import type { Penalty, Settings, User } from '../types'
import { generateId } from './id'
import { todayISO } from './dateUtils'

export interface StrikeResult {
  user: User
  penalty: Penalty | null
}

/** Suma un strike. Si llega al umbral, genera una penalización pendiente (los strikes NO
 * se resetean hasta que la penalización se marca como cumplida). */
export function giveStrike(user: User, settings: Settings, hasPendingPenalty: boolean): StrikeResult {
  const strikes = user.strikes + 1
  const updatedUser = { ...user, strikes }
  let penalty: Penalty | null = null
  if (strikes >= settings.strikesThreshold && !hasPendingPenalty) {
    penalty = {
      id: generateId(),
      userId: user.id,
      reason: settings.penaltyText,
      dateTriggered: todayISO(),
      status: 'pendiente',
      dateCompleted: null,
    }
  }
  return { user: updatedUser, penalty }
}

export function completePenalty(user: User): User {
  return { ...user, strikes: 0 }
}

/** Quita 1 strike (mínimo 0). Si con eso ya no llega al umbral, retira también
 * cualquier penalización pendiente que ese strike hubiera disparado. */
export function revertStrike(
  users: User[],
  penalties: Penalty[],
  userId: string,
  threshold: number,
): { users: User[]; penalties: Penalty[] } {
  const user = users.find((u) => u.id === userId)
  if (!user || user.strikes <= 0) return { users, penalties }
  const newStrikes = user.strikes - 1
  const nextUsers = users.map((u) => (u.id === userId ? { ...u, strikes: newStrikes } : u))
  const nextPenalties =
    newStrikes < threshold ? penalties.filter((p) => !(p.userId === userId && p.status === 'pendiente')) : penalties
  return { users: nextUsers, penalties: nextPenalties }
}
