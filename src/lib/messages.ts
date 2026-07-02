import type { AppState, Assignment, ScheduledInspection, User, ZoneId } from '../types'
import { formatRangeEs, monthNameEs } from './dateUtils'
import { getZone } from './zones'

export function weeklyAssignmentMessage(state: AppState, assignments: Assignment[], weekStart: string, weekEnd: string): string {
  const lines = [`🏠 Guardianes de ${state.settings.houseName}`, `Semana ${formatRangeEs(weekStart, weekEnd)}:`, '']
  const guardians = assignments.filter((a) => a.role === 'guardian')
  const apoyos = assignments.filter((a) => a.role === 'apoyo')
  const descansos = assignments.filter((a) => a.role === 'descanso')

  for (const a of guardians) {
    const user = state.users.find((u) => u.id === a.userId)
    const zone = getZone(state, a.zoneId)
    lines.push(`${zone?.icon ?? '📍'} ${zone?.name ?? ''} — ${user?.name ?? ''}`)
  }
  for (const a of apoyos) {
    const user = state.users.find((u) => u.id === a.userId)
    const zone = getZone(state, a.zoneId)
    lines.push(`🤝 Apoyo en ${zone?.name ?? ''} — ${user?.name ?? ''}`)
  }
  for (const a of descansos) {
    const user = state.users.find((u) => u.id === a.userId)
    lines.push(`😌 Descanso — ${user?.name ?? ''}`)
  }

  lines.push('', 'Recordatorio: quien ensucia, limpia. El guardián supervisa, no es el mayordomo.')
  return lines.join('\n')
}

export function inspectionMessage(state: AppState, scheduled: ScheduledInspection): string {
  const zone = getZone(state, scheduled.zoneId)
  const guardian = scheduled.guardianId ? state.users.find((u) => u.id === scheduled.guardianId) : null
  const lines = [
    '🚨 INSPECCIÓN SORPRESA',
    `Hoy a las ${scheduled.time} se revisa: ${zone?.name ?? ''}.`,
  ]
  if (guardian) lines.push(`Guardián responsable: ${guardian.name}.`)
  lines.push('', 'La casa no se ordena sola, campeón.')
  return lines.join('\n')
}

export function strikeMessage(state: AppState, user: User, zoneId: ZoneId): string {
  const zone = getZone(state, zoneId)
  return [
    '❌ STRIKE',
    `La zona ${zone?.name ?? ''} no ha pasado la revisión.`,
    `${user.name} suma 1 strike.`,
    `Strikes actuales: ${user.strikes}/${state.settings.strikesThreshold}.`,
  ].join('\n')
}

export function penaltyTriggeredMessage(state: AppState, user: User): string {
  return [
    '🍻 PENALIZACIÓN ACTIVADA',
    `${user.name} ha llegado a ${state.settings.strikesThreshold} strikes.`,
    `${state.settings.penaltyText}.`,
  ].join('\n')
}

export function monthlyWinnerMessage(state: AppState, user: User, points: number, month: number, year: number): string {
  return [
    '🏆 GANADOR DEL MES',
    `${user.name} ha ganado ${monthNameEs(month)} de ${year} con ${points} punto${points === 1 ? '' : 's'}.`,
    `Premio: ${state.settings.monthlyReward}.`,
  ].join('\n')
}
