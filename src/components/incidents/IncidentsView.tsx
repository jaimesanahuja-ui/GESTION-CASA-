import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { IncidentFormModal } from './IncidentFormModal'
import { SEVERITY_LABEL } from '../../lib/incidents'
import { formatDateEs } from '../../lib/dateUtils'
import { zoneLabel } from '../../lib/zones'
import type { IncidentSeverity } from '../../types'

const SEVERITY_TONE: Record<IncidentSeverity, 'default' | 'warn' | 'danger'> = {
  leve: 'default',
  medio: 'warn',
  grave: 'danger',
}

export function IncidentsView() {
  const { state, resolveIncident, convertIncidentToStrike } = useApp()
  const [showForm, setShowForm] = useState(false)

  const incidents = [...state.incidents].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">Objeto abandonado o zona hecha un desastre?</p>
          <p className="text-xs text-ink-500">Sube foto y descripción. No siempre acaba en strike.</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          📸 Reportar
        </Button>
      </Card>

      {incidents.length === 0 ? (
        <EmptyState icon="🧹" text="Ninguna incidencia registrada todavía. Así da gusto." />
      ) : (
        <div className="flex flex-col gap-3">
          {incidents.map((i) => {
            const reporter = state.users.find((u) => u.id === i.reportedBy)
            const responsible = i.responsibleUserId ? state.users.find((u) => u.id === i.responsibleUserId) : null
            return (
              <Card key={i.id}>
                <div className="flex gap-3">
                  {i.photo && <img src={i.photo} alt="Foto de incidencia" className="h-20 w-20 shrink-0 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                      <p className="text-sm font-bold">{zoneLabel(state, i.zoneId)}</p>
                      <Badge tone={SEVERITY_TONE[i.severity]}>{SEVERITY_LABEL[i.severity]}</Badge>
                    </div>
                    <p className="text-sm text-ink-700">{i.description}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {formatDateEs(i.date)} · Reportado por {reporter?.name ?? '—'}
                      {responsible && ` · Responsable: ${responsible.name}`}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {i.status === 'abierta' && (
                        <Badge tone="warn">Abierta</Badge>
                      )}
                      {i.status === 'convertida_en_strike' && <Badge tone="danger">Convertida en strike</Badge>}
                      {i.status === 'resuelta' && <Badge tone="ok">Resuelta</Badge>}

                      {i.status === 'abierta' && (
                        <>
                          {i.severity === 'grave' && i.responsibleUserId && (
                            <Button size="sm" variant="danger" onClick={() => convertIncidentToStrike(i.id)}>
                              ⚠️ Convertir en strike (consenso)
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => resolveIncident(i.id)}>
                            Marcar resuelta
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {showForm && <IncidentFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
