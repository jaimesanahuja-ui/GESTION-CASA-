import type { AppState, User } from '../types'

export interface WeekEvaluation {
  users: User[]
  awardedUserIds: string[]
}

/** +1 punto para quien fue guardián de una zona la semana pasada, la zona no falló
 * ninguna inspección y no tuvo incidencias graves atribuidas. */
export function evaluateWeek(state: AppState, weekStart: string, weekEnd: string): WeekEvaluation {
  const weekAssignments = state.assignments.filter((a) => a.weekStart === weekStart && a.role === 'guardian')
  const awardedUserIds: string[] = []

  const users = state.users.map((user) => {
    const assignment = weekAssignments.find((a) => a.userId === user.id)
    if (!assignment || !assignment.zoneId) return user

    const failedInspection = state.inspections.some(
      (i) => i.zoneId === assignment.zoneId && i.status === 'falla' && i.date >= weekStart && i.date <= weekEnd,
    )
    const graveIncident = state.incidents.some(
      (inc) =>
        inc.responsibleUserId === user.id &&
        inc.severity === 'grave' &&
        inc.date >= weekStart &&
        inc.date <= weekEnd,
    )

    if (!failedInspection && !graveIncident) {
      awardedUserIds.push(user.id)
      return { ...user, monthlyPoints: user.monthlyPoints + 1, totalPoints: user.totalPoints + 1 }
    }
    return user
  })

  return { users, awardedUserIds }
}
