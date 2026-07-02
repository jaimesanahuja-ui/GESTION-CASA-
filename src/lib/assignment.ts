import type { AppState, Assignment, User, Zone, ZoneId } from '../types'
import { addDays, daysBetween } from './dateUtils'
import { generateId } from './id'
import { hashString, mulberry32, seededShuffle } from './random'
import { getRotationZones, zoneLabel } from './zones'

interface ZoneStats {
  timesHad: number
  lastWeekStart: string | null
  hadItLastWeek: boolean
}

function computeZoneStats(user: User, zone: Zone, weekStart: string): ZoneStats {
  const entries = user.zoneHistory.filter((h) => h.zoneId === zone.id && h.role === 'guardian')
  const prevWeekStart = addDays(weekStart, -7)
  const lastWeekStart = entries.length
    ? entries.reduce((latest, e) => (e.weekStart > latest ? e.weekStart : latest), entries[0].weekStart)
    : null
  return {
    timesHad: entries.length,
    lastWeekStart,
    hadItLastWeek: lastWeekStart === prevWeekStart,
  }
}

function scoreCandidate(stats: ZoneStats, weekStart: string): number {
  if (stats.hadItLastWeek) return -1000 // evitar repetir zona la semana inmediatamente anterior
  const weeksSince = stats.lastWeekStart ? Math.max(1, Math.round(daysBetween(stats.lastWeekStart, weekStart) / 7)) : 12
  return weeksSince * 10 - stats.timesHad * 3
}

function whoHadZoneLastWeek(state: AppState, zoneId: ZoneId, weekStart: string): User | undefined {
  const prevWeekStart = addDays(weekStart, -7)
  const prevAssignment = state.assignments.find(
    (a) => a.weekStart === prevWeekStart && a.zoneId === zoneId && a.role === 'guardian',
  )
  return prevAssignment ? state.users.find((u) => u.id === prevAssignment.userId) : undefined
}

export interface GeneratedAssignments {
  weekStart: string
  weekEnd: string
  assignments: Assignment[]
}

export function generateWeeklyAssignment(state: AppState, weekStart: string): GeneratedAssignments {
  const weekEnd = addDays(weekStart, 6)
  const zones = getRotationZones(state)
  const activeUsers = state.users.filter((u) => u.active)
  const rand = mulberry32(hashString(weekStart) ^ 0x9e3779b9)

  const zonesQueue = seededShuffle(zones, rand)
  let pool = seededShuffle(activeUsers, rand)

  const assignments: Assignment[] = []
  const primaryZoneByUser = new Map<string, ZoneId>()

  // 1. Asignar guardián principal a cada zona mientras haya gente en el pool.
  while (zonesQueue.length && pool.length) {
    const zone = zonesQueue.shift()!
    let best: { user: User; score: number } | null = null
    for (const user of pool) {
      const stats = computeZoneStats(user, zone, weekStart)
      const score = scoreCandidate(stats, weekStart) + rand() // pequeño desempate aleatorio
      if (!best || score > best.score) best = { user, score }
    }
    const chosen = best!.user
    const stats = computeZoneStats(chosen, zone, weekStart)
    const prevGuardian = whoHadZoneLastWeek(state, zone.id, weekStart)

    let reason: string
    if (stats.lastWeekStart) {
      const weeksSince = Math.max(1, Math.round(daysBetween(stats.lastWeekStart, weekStart) / 7))
      reason = `${chosen.name} va a ${zone.name.toLowerCase()} porque llevaba ${weeksSince} semana${weeksSince === 1 ? '' : 's'} sin hacer esa zona`
    } else {
      reason = `${chosen.name} va a ${zone.name.toLowerCase()} porque todavía no le había tocado`
    }
    if (prevGuardian && prevGuardian.id !== chosen.id) {
      reason += ` y ${prevGuardian.name} ya la hizo la semana pasada`
    }
    reason += '.'

    assignments.push({
      id: generateId(),
      weekStart,
      weekEnd,
      userId: chosen.id,
      zoneId: zone.id,
      role: 'guardian',
      reason,
      generatedAt: new Date().toISOString(),
    })
    primaryZoneByUser.set(chosen.id, zone.id)
    pool = pool.filter((u) => u.id !== chosen.id)
  }

  // 2. Si sobran zonas (menos usuarios que zonas), se reparten como tarea secundaria
  //    entre quienes ya tienen zona principal.
  const assignedUsers = state.users.filter((u) => primaryZoneByUser.has(u.id))
  while (zonesQueue.length && assignedUsers.length) {
    const zone = zonesQueue.shift()!
    let best: { user: User; score: number } | null = null
    for (const user of assignedUsers) {
      const stats = computeZoneStats(user, zone, weekStart)
      const score = scoreCandidate(stats, weekStart) + rand()
      if (!best || score > best.score) best = { user, score }
    }
    const chosen = best!.user
    const primaryZone = state.zones.find((z) => z.id === primaryZoneByUser.get(chosen.id))
    assignments.push({
      id: generateId(),
      weekStart,
      weekEnd,
      userId: chosen.id,
      zoneId: zone.id,
      role: 'apoyo',
      reason: `${chosen.name} apoya en ${zone.name.toLowerCase()} además de ${primaryZone?.name.toLowerCase() ?? 'su zona'}, porque no hay gente suficiente para cubrir todas las zonas.`,
      generatedAt: new Date().toISOString(),
    })
  }

  // 3. Si sobra gente (más usuarios que zonas), descansan o apoyan.
  if (pool.length) {
    if (state.settings.allowRestWeek) {
      const sortedByRest = [...pool].sort((a, b) => {
        const restDiff = a.restHistory.length - b.restHistory.length
        if (restDiff !== 0) return restDiff
        const lastRestA = a.restHistory[a.restHistory.length - 1] ?? ''
        const lastRestB = b.restHistory[b.restHistory.length - 1] ?? ''
        return lastRestA.localeCompare(lastRestB)
      })
      const resting = sortedByRest[0]
      assignments.push({
        id: generateId(),
        weekStart,
        weekEnd,
        userId: resting.id,
        zoneId: null,
        role: 'descanso',
        reason: resting.restHistory.length === 0
          ? `${resting.name} descansa porque todavía no había tenido semana de descanso.`
          : `${resting.name} descansa porque es quien menos ha descansado últimamente.`,
        generatedAt: new Date().toISOString(),
      })
      pool = pool.filter((u) => u.id !== resting.id)
    }
    // El resto (si queda alguien más) apoya rotando por zonas. Si no hay ninguna
    // zona activa no hay nada que rotar, así que no se genera "apoyo" para nadie.
    let i = 0
    for (const user of pool) {
      if (zones.length === 0) break
      const zone = zones[i % zones.length]
      assignments.push({
        id: generateId(),
        weekStart,
        weekEnd,
        userId: user.id,
        zoneId: zone.id,
        role: 'apoyo',
        reason: `${user.name} apoya en ${zoneLabel(state, zone.id)} porque hay más gente que zonas esta semana.`,
        generatedAt: new Date().toISOString(),
      })
      i++
    }
  }

  return { weekStart, weekEnd, assignments }
}

/** Aplica las nuevas asignaciones al historial de cada usuario (zoneHistory / restHistory). */
export function applyAssignmentsToUsers(users: User[], assignments: Assignment[]): User[] {
  return users.map((user) => {
    const mine = assignments.filter((a) => a.userId === user.id)
    if (!mine.length) return user
    const zoneHistory = [...user.zoneHistory]
    const restHistory = [...user.restHistory]
    for (const a of mine) {
      if (a.role === 'descanso') {
        restHistory.push(a.weekStart)
      } else if (a.zoneId) {
        zoneHistory.push({ weekStart: a.weekStart, zoneId: a.zoneId, role: a.role })
      }
    }
    return { ...user, zoneHistory, restHistory }
  })
}
