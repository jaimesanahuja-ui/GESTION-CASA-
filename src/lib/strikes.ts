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
