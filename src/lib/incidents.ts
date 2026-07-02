import type { Incident, IncidentSeverity } from '../types'
import { generateId } from './id'
import { todayISO } from './dateUtils'

export const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  leve: 'Leve',
  medio: 'Media',
  grave: 'Grave',
}

export const SEVERITY_DESCRIPTION: Record<IncidentSeverity, string> = {
  leve: 'Algo puntual: un vaso olvidado, una toalla mal puesta. Queda registrado.',
  medio: 'Platos acumulados, baño descuidado, basura sin sacar. Puede afectar a los puntos.',
  grave: 'Zona totalmente sucia o con mal olor. Puede acabar en strike si hay consenso.',
}

export const SEVERITY_ORDER: IncidentSeverity[] = ['leve', 'medio', 'grave']

export interface NewIncidentInput {
  zoneId: Incident['zoneId']
  reportedBy: string
  responsibleUserId: string | null
  photo: string | null
  description: string
  severity: IncidentSeverity
}

export function createIncident(input: NewIncidentInput): Incident {
  return {
    id: generateId(),
    date: todayISO(),
    status: 'abierta',
    ...input,
  }
}
