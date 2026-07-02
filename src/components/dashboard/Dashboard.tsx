import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../ui/EmptyState'
import { formatDateEs } from '../../lib/dateUtils'
import { zoneLabel } from '../../lib/zones'
import { SEVERITY_LABEL } from '../../lib/incidents'
import { IncidentFormModal } from '../incidents/IncidentFormModal'
import { LostItemFormModal } from '../lostitems/LostItemFormModal'
import type { TabId } from '../layout/tabs'

const ROLE_LABEL: Record<string, string> = { guardian: 'Guardián', apoyo: 'Apoyo', descanso: 'Descanso' }
const ROLE_ICON: Record<string, string> = { guardian: '🍳', apoyo: '🤝', descanso: '😌' }

const SEVERITY_BORDER: Record<string, string> = {
  leve: 'border-l-4 border-incident-leve',
  medio: 'border-l-4 border-incident-medio',
  grave: 'border-l-4 border-incident-grave',
}

export function Dashboard({ onNavigate }: { onNavigate: (tab: TabId) => void }) {
  const { state, currentWeekStartDate, generateWeek } = useApp()
  const [showIncidentModal, setShowIncidentModal] = useState(false)
  const [showLostItemModal, setShowLostItemModal] = useState(false)

  const weekAssignments = state.assignments.filter((a) => a.weekStart === currentWeekStartDate)

  const ranking = [...state.users].sort((a, b) => b.monthlyPoints - a.monthlyPoints).slice(0, 4)
  const totalStrikes = state.users.reduce((sum, u) => sum + u.strikes, 0)
  const openIncidents = state.incidents.filter((i) => i.status === 'abierta')
  const pendingLostItems = state.lostItems.filter((i) => i.status === 'pendiente')
  const recentIncidents = state.incidents.slice(0, 3)

  return (
    <div className="flex flex-col gap-3 pb-4">
      {/* Hero: guardianes de la semana */}
      <div className="relative overflow-hidden rounded-[20px] bg-ink-950 p-4">
        <div className="pointer-events-none absolute -top-5 -right-4 h-[100px] w-[100px] rounded-full bg-brand-500/10" />
        <p className="mb-3 text-[10px] font-bold tracking-[0.1em] text-brand-500/60 uppercase">🛡️ Guardianes esta semana</p>
        {weekAssignments.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-sm text-white/60">Todavía no hay asignación para esta semana.</p>
            <Button size="sm" onClick={generateWeek}>
              🔄 Generar asignación semanal
            </Button>
          </div>
        ) : (
          weekAssignments.map((a, i) => {
            const user = state.users.find((u) => u.id === a.userId)
            if (!user) return null
            return (
              <div
                key={a.id}
                className={`flex items-center gap-2.5 py-1.5 ${i < weekAssignments.length - 1 ? 'border-b-[0.5px] border-white/7' : ''}`}
              >
                <div className="w-[26px] text-center text-[17px]">
                  {a.role === 'guardian' && a.zoneId ? zoneLabel(state, a.zoneId).split(' ')[0] : ROLE_ICON[a.role]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">{user.name}</p>
                  <p className="truncate text-[10px] text-white/38">
                    {a.role === 'descanso' ? 'Descansa' : a.zoneId ? zoneLabel(state, a.zoneId).replace(/^\S+\s/, '') : ''}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    a.role === 'descanso' ? 'bg-white/7 text-white/32' : 'bg-brand-500/20 text-brand-300'
                  }`}
                >
                  {ROLE_LABEL[a.role]}
                </span>
              </div>
            )
          })
        )}
        {weekAssignments.length > 0 && (
          <button onClick={() => onNavigate('guardians')} className="mt-3 text-[11px] font-semibold text-brand-300 hover:underline">
            Ver detalle y por qué →
          </button>
        )}
      </div>

      {/* Alerta: inspección programada */}
      {state.scheduledInspection && (
        <div className="flex items-center gap-2.5 rounded-[14px] border-l-[3px] border-brand-500 bg-white p-[11px_13px] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <span className="text-[20px]">🚨</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-ink-900">Inspección programada</p>
            <p className="mt-0.5 text-[11px] text-ink-500">
              {zoneLabel(state, state.scheduledInspection.zoneId)} · {formatDateEs(state.scheduledInspection.date)} ·{' '}
              {state.scheduledInspection.time}
            </p>
          </div>
          <Button size="sm" onClick={() => onNavigate('inspections')}>
            Ver
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => onNavigate('strikes')} className="rounded-[14px] bg-white p-3 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
          <div className="text-[26px] leading-none font-extrabold tracking-tight text-brand-500">{totalStrikes}</div>
          <div className="mt-1 text-[9px] font-bold tracking-[0.05em] text-ink-500 uppercase">Strikes</div>
        </button>
        <button
          onClick={() => onNavigate('incidents')}
          className="rounded-[14px] bg-white p-3 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
        >
          <div className="text-[26px] leading-none font-extrabold tracking-tight text-warn-500">{openIncidents.length}</div>
          <div className="mt-1 text-[9px] font-bold tracking-[0.05em] text-ink-500 uppercase">Incidencias</div>
        </button>
        <button
          onClick={() => onNavigate('lostitems')}
          className="rounded-[14px] bg-white p-3 text-center shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
        >
          <div className="text-[26px] leading-none font-extrabold tracking-tight text-info-500">{pendingLostItems.length}</div>
          <div className="mt-1 text-[9px] font-bold tracking-[0.05em] text-ink-500 uppercase">Objetos</div>
        </button>
      </div>

      {/* Ranking preview */}
      <div>
        <p className="mb-2 text-[10px] font-bold tracking-[0.08em] text-ink-500 uppercase">Ranking del mes 🏆</p>
        {ranking.every((u) => u.monthlyPoints === 0) ? (
          <EmptyState icon="🏆" text="Todavía nadie tiene puntos este mes." />
        ) : (
          <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            {ranking.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-2.5 px-[13px] py-[9px] ${i < ranking.length - 1 ? 'border-b-[0.5px] border-black/6' : ''}`}
              >
                <span className="text-sm">{['🥇', '🥈', '🥉'][i] ?? `${i + 1}️⃣`}</span>
                <Avatar name={u.name} avatar={u.avatar} size="sm" />
                <span className="flex-1 truncate text-xs font-semibold text-ink-900">{u.name}</span>
                <span className="text-sm font-extrabold text-brand-500">
                  {u.monthlyPoints} <span className="text-[9px] font-medium text-ink-500">pts</span>
                </span>
                {u.strikes > 0 ? (
                  <Badge tone="danger">{u.strikes}❌</Badge>
                ) : (
                  <Badge tone="ok">✨</Badge>
                )}
              </div>
            ))}
          </div>
        )}
        <button onClick={() => onNavigate('ranking')} className="mt-2 text-[11px] font-semibold text-brand-500 hover:underline">
          Ver ranking completo →
        </button>
      </div>

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <Button className="flex-col gap-1.5 rounded-2xl py-4" onClick={() => setShowIncidentModal(true)}>
          <span className="text-[22px]">📋</span>
          Reportar incidencia
        </Button>
        <Button variant="dark" className="flex-col gap-1.5 rounded-2xl py-4" onClick={() => setShowLostItemModal(true)}>
          <span className="text-[22px]">🔦</span>
          Objeto perdido
        </Button>
      </div>

      {recentIncidents.length > 0 && (
        <div className="pt-1">
          <p className="mb-2 text-[10px] font-bold tracking-[0.08em] text-ink-500 uppercase">Incidencias recientes</p>
          <div className="flex flex-col gap-2">
            {recentIncidents.map((i) => (
              <div key={i.id} className={`rounded-2xl bg-white p-3 shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${SEVERITY_BORDER[i.severity]}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-ink-900">{zoneLabel(state, i.zoneId)}</span>
                  <Badge tone={i.severity === 'grave' ? 'danger' : i.severity === 'medio' ? 'warn' : 'default'}>
                    {SEVERITY_LABEL[i.severity]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-ink-500">{i.description}</p>
              </div>
            ))}
          </div>
          <button onClick={() => onNavigate('incidents')} className="mt-2 text-[11px] font-semibold text-brand-500 hover:underline">
            Ver todas →
          </button>
        </div>
      )}

      {showIncidentModal && <IncidentFormModal onClose={() => setShowIncidentModal(false)} />}
      {showLostItemModal && <LostItemFormModal onClose={() => setShowLostItemModal(false)} />}
    </div>
  )
}
