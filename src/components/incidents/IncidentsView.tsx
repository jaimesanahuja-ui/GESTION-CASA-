import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { IncidentFormModal } from './IncidentFormModal'
import { IncidentStrikeVoteModal } from './IncidentStrikeVoteModal'
import { SEVERITY_LABEL } from '../../lib/incidents'
import { formatDateEs } from '../../lib/dateUtils'
import { zoneLabel } from '../../lib/zones'
import type { Incident, IncidentSeverity } from '../../types'

const SEVERITY_TONE: Record<IncidentSeverity, 'default' | 'warn' | 'danger'> = {
  leve: 'default',
  medio: 'warn',
  grave: 'danger',
}

const SEVERITY_BORDER: Record<IncidentSeverity, string> = {
  leve: 'border-l-4 border-incident-leve',
  medio: 'border-l-4 border-incident-medio',
  grave: 'border-l-4 border-incident-grave',
}

type Filter = 'todas' | 'abierta' | 'resuelta'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'abierta', label: 'Abiertas' },
  { id: 'resuelta', label: 'Resueltas' },
]

export function IncidentsView() {
  const { state, resolveIncident, deleteIncident } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [voteIncident, setVoteIncident] = useState<Incident | null>(null)
  const [filter, setFilter] = useState<Filter>('todas')

  function handleDelete(id: string) {
    if (window.confirm('¿Eliminar esta incidencia? Si generó un strike, también se deshace. No se puede deshacer esta acción.')) {
      deleteIncident(id)
    }
  }

  const incidents = [...state.incidents]
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((i) => {
      if (filter === 'todas') return true
      if (filter === 'abierta') return i.status === 'abierta'
      return i.status === 'resuelta' || i.status === 'convertida_en_strike'
    })

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-ink-900">¿Zona hecha un desastre?</p>
          <p className="text-xs text-ink-500">Sube foto y descripción. No siempre acaba en strike.</p>
        </div>
        <Button size="sm" className="rounded-[10px]" onClick={() => setShowForm(true)}>
          + Nueva
        </Button>
      </div>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              filter === f.id ? 'bg-brand-500 text-white' : 'bg-white text-ink-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {incidents.length === 0 ? (
        <EmptyState icon="🧹" text="Ninguna incidencia registrada todavía. Así da gusto." />
      ) : (
        <div className="flex flex-col gap-3">
          {incidents.map((i) => {
            const reporter = state.users.find((u) => u.id === i.reportedBy)
            const responsible = i.responsibleUserId ? state.users.find((u) => u.id === i.responsibleUserId) : null
            const resolved = i.status === 'resuelta'
            return (
              <div
                key={i.id}
                className={`rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] ${SEVERITY_BORDER[i.severity]} ${resolved ? 'opacity-70' : ''}`}
              >
                <div className="flex gap-3">
                  {i.photo && <img src={i.photo} alt="Foto de incidencia" className="h-20 w-20 shrink-0 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                      <p className="text-sm font-bold text-ink-900">{zoneLabel(state, i.zoneId)}</p>
                      <Badge tone={SEVERITY_TONE[i.severity]}>{SEVERITY_LABEL[i.severity]}</Badge>
                    </div>
                    <p className="text-sm text-ink-700">{i.description}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {formatDateEs(i.date)} · Reportado por {reporter?.name ?? '—'}
                      {responsible && ` · Responsable: ${responsible.name}`}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {i.status === 'abierta' && <Badge tone="warn">Abierta</Badge>}
                      {i.status === 'convertida_en_strike' && <Badge tone="danger">Convertida en strike</Badge>}
                      {i.status === 'resuelta' && <Badge tone="ok">Resuelta</Badge>}

                      {i.status === 'abierta' && (
                        <>
                          {i.severity === 'grave' && i.responsibleUserId && (
                            <Button size="sm" variant="danger" className="rounded-[9px]" onClick={() => setVoteIncident(i)}>
                              ❌ Strike
                            </Button>
                          )}
                          <Button size="sm" className="rounded-[9px] bg-ok-500 hover:bg-ok-600" onClick={() => resolveIncident(i.id)}>
                            ✓ Resolver
                          </Button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="ml-auto text-danger-500 hover:text-danger-600"
                        aria-label="Eliminar incidencia"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && <IncidentFormModal onClose={() => setShowForm(false)} />}
      {voteIncident && <IncidentStrikeVoteModal incident={voteIncident} onClose={() => setVoteIncident(null)} />}
    </div>
  )
}
