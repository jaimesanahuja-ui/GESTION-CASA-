import { useMemo } from 'react'
import { useApp } from '../../state/AppContext'
import { Card, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'
import { CopyableMessage } from '../ui/CopyableMessage'
import { addDays, formatRangeEs } from '../../lib/dateUtils'
import { weeklyAssignmentMessage } from '../../lib/messages'
import { getZone } from '../../lib/zones'

const ROLE_LABEL: Record<string, string> = { guardian: 'Guardián', apoyo: 'Apoyo', descanso: 'Descanso' }
const ROLE_ICON: Record<string, string> = { guardian: '🛡️', apoyo: '🤝', descanso: '😌' }

export function GuardiansView() {
  const { state, currentWeekStartDate, generateWeek } = useApp()

  const weekAssignments = state.assignments.filter((a) => a.weekStart === currentWeekStartDate)
  const weekEnd = weekAssignments[0]?.weekEnd ?? addDays(currentWeekStartDate, 6)

  const pastWeeks = useMemo(() => {
    const starts = Array.from(new Set(state.assignments.map((a) => a.weekStart)))
      .filter((w) => w !== currentWeekStartDate)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 6)
    return starts.map((weekStart) => ({
      weekStart,
      assignments: state.assignments.filter((a) => a.weekStart === weekStart),
    }))
  }, [state.assignments, currentWeekStartDate])

  const message = weekAssignments.length
    ? weeklyAssignmentMessage(state, weekAssignments, currentWeekStartDate, weekEnd)
    : ''

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-ink-500">Semana {formatRangeEs(currentWeekStartDate, weekEnd)}</p>
          <p className="text-sm text-ink-700">Quien ensucia, limpia. El guardián supervisa, no es el mayordomo.</p>
        </div>
        <Button onClick={generateWeek}>🔄 Generar asignación semanal</Button>
      </Card>

      {weekAssignments.length === 0 ? (
        <EmptyState icon="🗓️" text="Todavía no hay guardianes para esta semana. Genera la asignación." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {weekAssignments
            .filter((a) => a.role === 'guardian')
            .map((a) => {
              const user = state.users.find((u) => u.id === a.userId)
              const zone = getZone(state, a.zoneId)
              if (!user || !zone) return null
              const extras = weekAssignments.filter(
                (x) => x.userId === user.id && x.id !== a.id && x.role === 'apoyo',
              )
              return (
                <Card key={a.id} tone="brand">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-2xl">{zone.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{zone.name}</p>
                      <div className="flex items-center gap-2 text-sm text-ink-700">
                        <Avatar name={user.name} avatar={user.avatar} size="sm" /> {user.name}
                      </div>
                    </div>
                    <Badge tone="brand">Guardián</Badge>
                  </div>
                  <p className="mb-2 text-xs text-ink-500 italic">"{a.reason}"</p>
                  <ul className="grid grid-cols-1 gap-1 text-xs text-ink-700">
                    {zone.checklist.map((item) => (
                      <li key={item} className="flex items-start gap-1.5">
                        <span className="text-ok-600">✓</span>
                        {item}
                      </li>
                    ))}
                    {zone.weeklyTasks.map((item) => (
                      <li key={item} className="flex items-start gap-1.5 text-brand-700">
                        <span>🗓️</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  {extras.length > 0 && (
                    <p className="mt-2 text-xs text-ink-500">
                      Además apoya en: {extras.map((e) => getZone(state, e.zoneId)?.name).join(', ')}
                    </p>
                  )}
                </Card>
              )
            })}

          {weekAssignments
            .filter((a) => a.role !== 'guardian')
            .map((a) => {
              const user = state.users.find((u) => u.id === a.userId)
              if (!user) return null
              return (
                <Card key={a.id}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{ROLE_ICON[a.role]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{ROLE_LABEL[a.role]}</p>
                      <div className="flex items-center gap-2 text-sm text-ink-700">
                        <Avatar name={user.name} avatar={user.avatar} size="sm" /> {user.name}
                        {a.zoneId && <span className="text-ink-500">· {getZone(state, a.zoneId)?.name}</span>}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-ink-500 italic">"{a.reason}"</p>
                </Card>
              )
            })}
        </div>
      )}

      {message && (
        <Card>
          <CardTitle>📋 Mensaje para el chat</CardTitle>
          <CopyableMessage text={message} />
        </Card>
      )}

      <Card tone="warn">
        <CardTitle>🚪 Habitaciones personales</CardTitle>
        <p className="text-sm text-ink-700">
          Cada uno es guardián de su propio cuarto — aquí no se asigna a nadie. Simple recordatorio: si tu puerta da
          asco, es cosa tuya. 🧦
        </p>
      </Card>

      {pastWeeks.length > 0 && (
        <Card>
          <CardTitle>🗂️ Semanas anteriores</CardTitle>
          <div className="flex flex-col gap-3">
            {pastWeeks.map(({ weekStart, assignments }) => (
              <div key={weekStart} className="border-t border-brand-100 pt-2 first:border-0 first:pt-0">
                <p className="mb-1 text-xs font-semibold text-ink-500">
                  {formatRangeEs(weekStart, assignments[0]?.weekEnd ?? weekStart)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {assignments.map((a) => {
                    const user = state.users.find((u) => u.id === a.userId)
                    if (!user) return null
                    return (
                      <span key={a.id} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs">
                        {ROLE_ICON[a.role]} {user.name}
                        {a.zoneId && ` · ${getZone(state, a.zoneId)?.name}`}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
