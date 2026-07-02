import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Card, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../ui/EmptyState'
import { computeHouseStatus } from '../../lib/houseStatus'
import { formatDateEs, formatRangeEs } from '../../lib/dateUtils'
import { zoneLabel } from '../../lib/zones'
import { SEVERITY_LABEL } from '../../lib/incidents'
import { IncidentFormModal } from '../incidents/IncidentFormModal'
import type { TabId } from '../layout/tabs'

const ROLE_LABEL: Record<string, string> = { guardian: 'Guardián', apoyo: 'Apoyo', descanso: 'Descanso' }
const ROLE_ICON: Record<string, string> = { guardian: '🛡️', apoyo: '🤝', descanso: '😌' }

export function Dashboard({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { state, currentWeekStartDate, generateWeek, closeMonth } = useApp()
  const [showIncidentModal, setShowIncidentModal] = useState(false)

  const status = computeHouseStatus(state)
  const weekAssignments = state.assignments.filter((a) => a.weekStart === currentWeekStartDate)
  const weekEnd = weekAssignments[0]?.weekEnd

  const ranking = [...state.users].sort((a, b) => b.monthlyPoints - a.monthlyPoints).slice(0, 3)
  const usersWithStrikes = state.users.filter((u) => u.strikes > 0)
  const recentIncidents = state.incidents.slice(0, 3)
  const pendingLostItems = state.lostItems.filter((i) => i.status === 'pendiente')

  function handleCloseMonth() {
    if (window.confirm('¿Cerrar el mes y declarar ganador? Los puntos mensuales se reiniciarán a 0.')) {
      closeMonth()
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card tone={status.level === 'ok' ? 'ok' : status.level === 'warn' ? 'warn' : 'danger'} className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-ink-500">Estado de la casa</p>
          <p className="text-lg font-bold">
            {status.emoji} {status.label}
          </p>
        </div>
        <span className="text-3xl">{status.level === 'ok' ? '✨' : status.level === 'warn' ? '⚠️' : '🔥'}</span>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Button variant="secondary" size="sm" onClick={() => setShowIncidentModal(true)}>
          📸 Reportar incidencia
        </Button>
        <Button variant="secondary" size="sm" onClick={generateWeek}>
          🔄 Generar semana
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onNavigate('inspections')}>
          🚨 Inspección
        </Button>
        <Button variant="secondary" size="sm" onClick={handleCloseMonth}>
          🏁 Cerrar mes
        </Button>
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <CardTitle className="mb-0">🛡️ Guardianes de esta semana</CardTitle>
          {weekEnd && <span className="text-xs text-ink-500">{formatRangeEs(currentWeekStartDate, weekEnd)}</span>}
        </div>
        {weekAssignments.length === 0 ? (
          <EmptyState icon="🗓️" text='Todavía no hay asignación para esta semana. Pulsa "Generar semana".' />
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {weekAssignments.map((a) => {
              const user = state.users.find((u) => u.id === a.userId)
              if (!user) return null
              return (
                <div key={a.id} className="flex items-center gap-3 rounded-xl bg-brand-50 p-2.5">
                  <Avatar name={user.name} avatar={user.avatar} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{user.name}</p>
                    <p className="truncate text-xs text-ink-500">
                      {ROLE_ICON[a.role]} {a.zoneId ? zoneLabel(state, a.zoneId) : ROLE_LABEL[a.role]}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <button
          onClick={() => onNavigate('guardians')}
          className="mt-3 text-xs font-semibold text-brand-600 hover:underline"
        >
          Ver detalle y por qué →
        </button>
      </Card>

      <Card>
        <CardTitle>🚨 Próxima inspección</CardTitle>
        {state.scheduledInspection ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">
                {formatDateEs(state.scheduledInspection.date)} a las {state.scheduledInspection.time}
              </p>
              <p className="text-sm text-ink-500">Se revisa: {zoneLabel(state, state.scheduledInspection.zoneId)}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => onNavigate('inspections')}>
              Ver
            </Button>
          </div>
        ) : (
          <EmptyState icon="🔍" text="No hay inspección sorpresa programada. Sortéala desde la pestaña Inspección." />
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>❌ Strikes actuales</CardTitle>
          {usersWithStrikes.length === 0 ? (
            <EmptyState icon="😇" text="Nadie tiene strikes activos ahora mismo." />
          ) : (
            <ul className="flex flex-col gap-2">
              {usersWithStrikes.map((u) => (
                <li key={u.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Avatar name={u.name} avatar={u.avatar} size="sm" />
                    {u.name}
                  </span>
                  <Badge tone={u.strikes >= state.settings.strikesThreshold ? 'danger' : 'warn'}>
                    {u.strikes}/{state.settings.strikesThreshold}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => onNavigate('strikes')} className="mt-3 text-xs font-semibold text-brand-600 hover:underline">
            Ver todo →
          </button>
        </Card>

        <Card>
          <CardTitle>🏆 Ranking mensual</CardTitle>
          {ranking.every((u) => u.monthlyPoints === 0) ? (
            <EmptyState icon="🏆" text="Todavía nadie tiene puntos este mes." />
          ) : (
            <ol className="flex flex-col gap-2">
              {ranking.map((u, i) => (
                <li key={u.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span>{['🥇', '🥈', '🥉'][i]}</span>
                    {u.name}
                  </span>
                  <Badge tone="brand">{u.monthlyPoints} pts</Badge>
                </li>
              ))}
            </ol>
          )}
          <button onClick={() => onNavigate('ranking')} className="mt-3 text-xs font-semibold text-brand-600 hover:underline">
            Ver ranking completo →
          </button>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardTitle>📸 Incidencias recientes</CardTitle>
          {recentIncidents.length === 0 ? (
            <EmptyState icon="🧹" text="Ninguna incidencia registrada todavía." />
          ) : (
            <ul className="flex flex-col gap-2">
              {recentIncidents.map((i) => (
                <li key={i.id} className="text-sm">
                  <span className="font-semibold">{zoneLabel(state, i.zoneId)}</span> — {i.description}
                  <Badge tone={i.severity === 'grave' ? 'danger' : i.severity === 'medio' ? 'warn' : 'default'}>
                    {' '}
                    {SEVERITY_LABEL[i.severity]}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <button onClick={() => onNavigate('incidents')} className="mt-3 text-xs font-semibold text-brand-600 hover:underline">
            Ver todas →
          </button>
        </Card>

        <Card>
          <CardTitle>🧦 Objetos perdidos</CardTitle>
          {pendingLostItems.length === 0 ? (
            <EmptyState icon="🎒" text="No hay objetos abandonados pendientes." />
          ) : (
            <p className="text-sm">
              Hay <span className="font-bold">{pendingLostItems.length}</span> objeto(s) sin reclamar. Objeto abandonado
              detectado.
            </p>
          )}
          <button onClick={() => onNavigate('lostitems')} className="mt-3 text-xs font-semibold text-brand-600 hover:underline">
            Ver caja →
          </button>
        </Card>
      </div>

      {showIncidentModal && <IncidentFormModal onClose={() => setShowIncidentModal(false)} />}
    </div>
  )
}
