import type { AppState, ScheduledInspection } from '../types'
import { parseISODate, todayISO, toISODate } from './dateUtils'
import { generateId } from './id'
import { getRotationZones } from './zones'

function daysLeftInMonth(from: Date): number {
  const lastDay = new Date(from.getFullYear(), from.getMonth() + 1, 0)
  return Math.max(0, Math.round((lastDay.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)))
}

function findCurrentGuardian(state: AppState, zoneId: string, date: string): string | null {
  const assignment = state.assignments.find(
    (a) => a.zoneId === zoneId && a.role === 'guardian' && date >= a.weekStart && date <= a.weekEnd,
  )
  return assignment?.userId ?? null
}

/** Sortea día (dentro de la semana o el mes, según config), zona y guardián para la próxima inspección sorpresa. */
export function generateScheduledInspection(state: AppState): ScheduledInspection | null {
  const zones = getRotationZones(state)
  if (!zones.length) return null

  const today = new Date()
  const maxOffset = state.settings.inspectionFrequency === 'semanal' ? 6 : daysLeftInMonth(today)
  const offset = Math.floor(Math.random() * (maxOffset + 1))
  const date = toISODate(addOffset(today, offset))
  const zone = zones[Math.floor(Math.random() * zones.length)]

  return {
    id: generateId(),
    date,
    time: state.settings.inspectionTime,
    zoneId: zone.id,
    guardianId: findCurrentGuardian(state, zone.id, date),
    notified: false,
  }
}

function addOffset(date: Date, offset: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + offset)
  return d
}

export function isScheduledInspectionToday(scheduled: ScheduledInspection | null): boolean {
  if (!scheduled) return false
  return scheduled.date === todayISO()
}

export function isScheduledInspectionPast(scheduled: ScheduledInspection | null): boolean {
  if (!scheduled) return false
  return parseISODate(scheduled.date).getTime() < parseISODate(todayISO()).getTime()
}
