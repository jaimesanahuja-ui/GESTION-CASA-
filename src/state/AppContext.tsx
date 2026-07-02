import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AppState, InspectionVote, Settings, User, ZoneId } from '../types'
import { createInitialState } from '../data/seed'
import { createLocalStorageAdapter, STORAGE_KEY } from '../lib/storage'
import { applyAssignmentsToUsers, generateWeeklyAssignment } from '../lib/assignment'
import { currentWeekStart, addDays, todayISO } from '../lib/dateUtils'
import { evaluateWeek } from '../lib/points'
import { closeMonth as closeMonthLogic } from '../lib/monthSummary'
import { generateScheduledInspection } from '../lib/inspections'
import { giveStrike, completePenalty as completePenaltyLogic } from '../lib/strikes'
import { createIncident, type NewIncidentInput } from '../lib/incidents'
import { createLostItem, withAutoBoxed, type NewLostItemInput } from '../lib/lostItems'
import { generateId } from '../lib/id'

const adapter = createLocalStorageAdapter<AppState>(STORAGE_KEY)

interface AppContextValue {
  state: AppState
  currentWeekStartDate: string
  generateWeek: () => void
  scheduleInspection: () => void
  recordInspectionResult: (votes: InspectionVote[], comments: string, photos: string[]) => void
  addIncident: (input: NewIncidentInput) => void
  convertIncidentToStrike: (incidentId: string) => void
  resolveIncident: (incidentId: string) => void
  addLostItem: (input: NewLostItemInput) => void
  claimLostItem: (id: string, userId: string) => void
  moveLostItemToBox: (id: string) => void
  resolveLostItem: (id: string) => void
  completePenalty: (penaltyId: string) => void
  closeMonth: () => void
  updateSettings: (patch: Partial<Settings>) => void
  addUser: (name: string, avatar: string) => void
  updateUser: (id: string, patch: Partial<User>) => void
  toggleUserActive: (id: string) => void
  toggleZoneActive: (id: ZoneId) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => adapter.load() ?? createInitialState())

  useEffect(() => {
    adapter.save(state)
  }, [state])

  // Los objetos perdidos pendientes que caducan pasan a "caja" solos al cargar la app.
  useEffect(() => {
    setState((s) => ({ ...s, lostItems: withAutoBoxed(s.lostItems) }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const currentWeekStartDate = useMemo(
    () => currentWeekStart(state.settings.weekStartDay),
    [state.settings.weekStartDay],
  )

  const generateWeek = useCallback(() => {
    setState((s) => {
      let working = s
      const weekStart = currentWeekStart(s.settings.weekStartDay)
      const prevWeekStart = addDays(weekStart, -7)
      const hasPrevAssignments = s.assignments.some((a) => a.weekStart === prevWeekStart)
      const alreadyEvaluated = s.evaluatedWeeks.includes(prevWeekStart)

      if (hasPrevAssignments && !alreadyEvaluated) {
        const prevWeekEnd = addDays(prevWeekStart, 6)
        const { users } = evaluateWeek(working, prevWeekStart, prevWeekEnd)
        working = { ...working, users, evaluatedWeeks: [...working.evaluatedWeeks, prevWeekStart] }
      }

      // Evita duplicar si ya existe asignación para esta semana.
      if (working.assignments.some((a) => a.weekStart === weekStart)) {
        return working
      }

      const { assignments } = generateWeeklyAssignment(working, weekStart)
      const users = applyAssignmentsToUsers(working.users, assignments)
      return { ...working, users, assignments: [...working.assignments, ...assignments] }
    })
  }, [])

  const scheduleInspection = useCallback(() => {
    setState((s) => ({ ...s, scheduledInspection: generateScheduledInspection(s) }))
  }, [])

  const recordInspectionResult = useCallback((votes: InspectionVote[], comments: string, photos: string[]) => {
    setState((s) => {
      const scheduled = s.scheduledInspection
      if (!scheduled) return s
      const fallas = votes.filter((v) => v.vote === 'falla').length
      const status = fallas >= 2 ? 'falla' : 'pasa'
      let users = s.users
      let penalties = s.penalties
      let strikeGiven = false

      if (status === 'falla' && scheduled.guardianId) {
        const user = users.find((u) => u.id === scheduled.guardianId)
        if (user) {
          const hasPending = penalties.some((p) => p.userId === user.id && p.status === 'pendiente')
          const { user: updatedUser, penalty } = giveStrike(user, s.settings, hasPending)
          users = users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
          if (penalty) penalties = [...penalties, penalty]
          strikeGiven = true
        }
      }

      const inspection = {
        id: generateId(),
        date: scheduled.date,
        time: scheduled.time,
        zoneId: scheduled.zoneId,
        guardianId: scheduled.guardianId,
        status,
        votes,
        comments,
        photos,
        strikeGiven,
        createdAt: new Date().toISOString(),
      } as const

      return {
        ...s,
        users,
        penalties,
        inspections: [...s.inspections, inspection],
        scheduledInspection: null,
      }
    })
  }, [])

  const addIncident = useCallback((input: NewIncidentInput) => {
    setState((s) => ({ ...s, incidents: [createIncident(input), ...s.incidents] }))
  }, [])

  const convertIncidentToStrike = useCallback((incidentId: string) => {
    setState((s) => {
      const incident = s.incidents.find((i) => i.id === incidentId)
      if (!incident || !incident.responsibleUserId) return s
      const user = s.users.find((u) => u.id === incident.responsibleUserId)
      if (!user) return s
      const hasPending = s.penalties.some((p) => p.userId === user.id && p.status === 'pendiente')
      const { user: updatedUser, penalty } = giveStrike(user, s.settings, hasPending)
      const users = s.users.map((u) => (u.id === updatedUser.id ? updatedUser : u))
      const incidents = s.incidents.map((i) =>
        i.id === incidentId ? { ...i, status: 'convertida_en_strike' as const } : i,
      )
      return {
        ...s,
        users,
        incidents,
        penalties: penalty ? [...s.penalties, penalty] : s.penalties,
      }
    })
  }, [])

  const resolveIncident = useCallback((incidentId: string) => {
    setState((s) => ({
      ...s,
      incidents: s.incidents.map((i) => (i.id === incidentId ? { ...i, status: 'resuelta' as const } : i)),
    }))
  }, [])

  const addLostItem = useCallback((input: NewLostItemInput) => {
    setState((s) => ({ ...s, lostItems: [createLostItem(input), ...s.lostItems] }))
  }, [])

  const claimLostItem = useCallback((id: string, userId: string) => {
    setState((s) => ({
      ...s,
      lostItems: s.lostItems.map((item) =>
        item.id === id ? { ...item, status: 'reclamado' as const, claimedBy: userId } : item,
      ),
    }))
  }, [])

  const moveLostItemToBox = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      lostItems: s.lostItems.map((item) => (item.id === id ? { ...item, status: 'movido_a_caja' as const } : item)),
    }))
  }, [])

  const resolveLostItem = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      lostItems: s.lostItems.map((item) => (item.id === id ? { ...item, status: 'resuelto' as const } : item)),
    }))
  }, [])

  const completePenalty = useCallback((penaltyId: string) => {
    setState((s) => {
      const penalty = s.penalties.find((p) => p.id === penaltyId)
      if (!penalty) return s
      const users = s.users.map((u) => (u.id === penalty.userId ? completePenaltyLogic(u) : u))
      const penalties = s.penalties.map((p) =>
        p.id === penaltyId ? { ...p, status: 'cumplida' as const, dateCompleted: todayISO() } : p,
      )
      return { ...s, users, penalties }
    })
  }, [])

  const closeMonthAction = useCallback(() => {
    setState((s) => {
      const now = new Date()
      const { summary, users } = closeMonthLogic(s, now.getMonth() + 1, now.getFullYear())
      return { ...s, users, monthSummaries: [...s.monthSummaries, summary] }
    })
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }))
  }, [])

  const addUser = useCallback((name: string, avatar: string) => {
    setState((s) => ({
      ...s,
      users: [
        ...s.users,
        {
          id: generateId(),
          name,
          avatar: avatar || null,
          active: true,
          strikes: 0,
          monthlyPoints: 0,
          totalPoints: 0,
          zoneHistory: [],
          restHistory: [],
        },
      ],
    }))
  }, [])

  const updateUser = useCallback((id: string, patch: Partial<User>) => {
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, ...patch } : u)) }))
  }, [])

  const toggleUserActive = useCallback((id: string) => {
    setState((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)) }))
  }, [])

  const toggleZoneActive = useCallback((id: ZoneId) => {
    setState((s) => ({ ...s, zones: s.zones.map((z) => (z.id === id ? { ...z, active: !z.active } : z)) }))
  }, [])

  const value: AppContextValue = {
    state,
    currentWeekStartDate,
    generateWeek,
    scheduleInspection,
    recordInspectionResult,
    addIncident,
    convertIncidentToStrike,
    resolveIncident,
    addLostItem,
    claimLostItem,
    moveLostItemToBox,
    resolveLostItem,
    completePenalty,
    closeMonth: closeMonthAction,
    updateSettings,
    addUser,
    updateUser,
    toggleUserActive,
    toggleZoneActive,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp debe usarse dentro de <AppProvider>')
  return ctx
}
