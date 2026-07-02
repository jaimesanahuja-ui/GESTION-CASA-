// Modelo de datos de Guardianes de la Casa.
// Pensado para poder migrar de localStorage a Supabase/Firebase sin tocar la UI:
// toda la lectura/escritura pasa por lib/storage.ts y state/AppContext.tsx.

export type ZoneId =
  | 'cocina'
  | 'banio'
  | 'banio_wc_ducha'
  | 'banio_lavabo'
  | 'zonas_comunes'

export type ZoneType = 'cocina' | 'banio' | 'zonas_comunes'

export interface Zone {
  id: ZoneId
  name: string
  type: ZoneType
  icon: string
  description: string
  checklist: string[]
  weeklyTasks: string[]
  active: boolean
}

export interface ZoneHistoryEntry {
  weekStart: string // ISO date
  zoneId: ZoneId
  role: AssignmentRole
}

export interface User {
  id: string
  name: string
  avatar: string | null // emoji o iniciales si no hay foto
  active: boolean
  strikes: number
  monthlyPoints: number
  totalPoints: number
  zoneHistory: ZoneHistoryEntry[]
  restHistory: string[] // semanas (weekStart) en que descansó
}

export type AssignmentRole = 'guardian' | 'apoyo' | 'descanso'

export interface Assignment {
  id: string
  weekStart: string // ISO date
  weekEnd: string // ISO date
  userId: string
  zoneId: ZoneId | null // null si role === 'descanso'
  role: AssignmentRole
  reason: string
  generatedAt: string
}

export type InspectionStatus = 'pendiente' | 'pasa' | 'falla'

export interface InspectionVote {
  userId: string
  vote: 'pasa' | 'falla'
}

export interface Inspection {
  id: string
  date: string // ISO date
  time: string // HH:mm
  zoneId: ZoneId
  guardianId: string | null
  status: InspectionStatus
  votes: InspectionVote[]
  comments: string
  photos: string[] // data URLs
  strikeGiven: boolean
  createdAt: string
}

export interface ScheduledInspection {
  id: string
  date: string
  time: string
  zoneId: ZoneId
  guardianId: string | null
  notified: boolean
}

export type IncidentSeverity = 'leve' | 'medio' | 'grave'
export type IncidentStatus = 'abierta' | 'convertida_en_strike' | 'resuelta'

export interface Incident {
  id: string
  date: string
  zoneId: ZoneId
  reportedBy: string
  responsibleUserId: string | null
  photo: string | null
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
}

export type LostItemStatus = 'pendiente' | 'reclamado' | 'movido_a_caja' | 'resuelto'

export interface LostItem {
  id: string
  date: string
  photo: string | null
  description: string
  location: string
  claimedBy: string | null
  status: LostItemStatus
}

export type PenaltyStatus = 'pendiente' | 'cumplida'

export interface Penalty {
  id: string
  userId: string
  reason: string
  dateTriggered: string
  status: PenaltyStatus
  dateCompleted: string | null
}

export interface MonthSummary {
  id: string
  month: number // 1-12
  year: number
  winnerId: string | null
  pointsByUser: Record<string, number>
  reward: string
  closed: boolean
}

export type InspectionFrequency = 'semanal' | 'mensual'

export interface Settings {
  houseName: string
  weekStartDay: number // 0=domingo ... 3=miércoles
  inspectionFrequency: InspectionFrequency
  inspectionTime: string // HH:mm
  strikesThreshold: number
  penaltyText: string
  monthlyReward: string
  splitBathroom: boolean
  allowRestWeek: boolean
}

export interface AppState {
  users: User[]
  zones: Zone[]
  assignments: Assignment[]
  inspections: Inspection[]
  scheduledInspection: ScheduledInspection | null
  incidents: Incident[]
  lostItems: LostItem[]
  penalties: Penalty[]
  monthSummaries: MonthSummary[]
  settings: Settings
  /** Semanas (weekStart) para las que ya se repartieron los +1 punto, para no duplicarlos. */
  evaluatedWeeks: string[]
}
