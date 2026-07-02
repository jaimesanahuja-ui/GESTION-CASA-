import type { AppState, Zone, ZoneId } from '../types'

/** Zonas que realmente rotan guardián esta semana, según configuración (baño dividido o no). */
export function getRotationZones(state: AppState): Zone[] {
  return state.zones.filter((z) => {
    if (!z.active) return false
    if (z.id === 'banio') return !state.settings.splitBathroom
    if (z.id === 'banio_wc_ducha' || z.id === 'banio_lavabo') return state.settings.splitBathroom
    return true
  })
}

/** Zonas que tiene sentido mostrar en Configuración según si el baño está dividido o no. */
export function getConfigurableZones(state: AppState): Zone[] {
  return state.zones.filter((z) => {
    if (z.id === 'banio') return !state.settings.splitBathroom
    if (z.id === 'banio_wc_ducha' || z.id === 'banio_lavabo') return state.settings.splitBathroom
    return true
  })
}

export function getZone(state: AppState, zoneId: ZoneId | null): Zone | undefined {
  if (!zoneId) return undefined
  return state.zones.find((z) => z.id === zoneId)
}

export function zoneLabel(state: AppState, zoneId: ZoneId | null): string {
  if (!zoneId) return 'Descanso'
  const zone = getZone(state, zoneId)
  return zone ? `${zone.icon} ${zone.name}` : zoneId
}
