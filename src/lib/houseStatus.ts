import type { AppState } from '../types'

export interface HouseStatus {
  level: 'ok' | 'warn' | 'danger'
  emoji: string
  label: string
}

export function computeHouseStatus(state: AppState): HouseStatus {
  const pendingPenalties = state.penalties.some((p) => p.status === 'pendiente')
  const openGrave = state.incidents.some((i) => i.severity === 'grave' && i.status === 'abierta')
  const closeToStrike = state.users.some((u) => u.strikes >= state.settings.strikesThreshold - 1 && u.strikes > 0)
  const openMedio = state.incidents.some((i) => i.severity === 'medio' && i.status === 'abierta')

  if (pendingPenalties || openGrave) {
    return { level: 'danger', emoji: '🔴', label: 'La casa está que arde' }
  }
  if (closeToStrike || openMedio) {
    return { level: 'warn', emoji: '🟡', label: 'Hay avisos pendientes' }
  }
  return { level: 'ok', emoji: '🟢', label: 'Todo en orden' }
}
