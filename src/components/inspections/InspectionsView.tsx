import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Card, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { EmptyState } from '../ui/EmptyState'
import { CopyableMessage } from '../ui/CopyableMessage'
import { InspectionVoteModal } from './InspectionVoteModal'
import { formatDateEs } from '../../lib/dateUtils'
import { zoneLabel } from '../../lib/zones'
import { inspectionMessage } from '../../lib/messages'

export function InspectionsView() {
  const { state, scheduleInspection, deleteInspection } = useApp()
  const [voting, setVoting] = useState(false)

  function handleDelete(id: string) {
    if (window.confirm('¿Eliminar esta inspección? Si dio un strike, también se deshace. No se puede deshacer esta acción.')) {
      deleteInspection(id)
    }
  }

  const scheduled = state.scheduledInspection
  const history = [...state.inspections].sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1))

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card>
        <CardTitle>🚨 Inspección sorpresa</CardTitle>
        <p className="mb-3 text-sm text-ink-700">
          Frecuencia configurada: <strong>{state.settings.inspectionFrequency}</strong>, siempre a las{' '}
          <strong>{state.settings.inspectionTime}</strong>. El día y la zona son aleatorios.
        </p>

        {scheduled ? (
          <div className="flex flex-col gap-3">
            <div className="rounded-xl bg-brand-50 p-3">
              <p className="text-sm font-bold">
                {formatDateEs(scheduled.date)} a las {scheduled.time}
              </p>
              <p className="text-sm text-ink-700">Se revisa: {zoneLabel(state, scheduled.zoneId)}</p>
              {scheduled.guardianId && (
                <p className="text-xs text-ink-500">
                  Guardián responsable: {state.users.find((u) => u.id === scheduled.guardianId)?.name ?? '—'}
                </p>
              )}
            </div>
            <CopyableMessage text={inspectionMessage(state, scheduled)} />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setVoting(true)}>
                Realizar inspección ahora
              </Button>
              <Button variant="ghost" onClick={scheduleInspection}>
                🎲 Resortear
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <EmptyState icon="🔍" text="No hay ninguna inspección sorpresa programada todavía." />
            <Button onClick={scheduleInspection}>🎲 Sortear inspección sorpresa</Button>
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>🗂️ Historial de inspecciones</CardTitle>
        {history.length === 0 ? (
          <EmptyState icon="📋" text="Todavía no se ha realizado ninguna inspección." />
        ) : (
          <ul className="flex flex-col gap-3">
            {history.map((i) => {
              const guardian = i.guardianId ? state.users.find((u) => u.id === i.guardianId) : null
              return (
                <li key={i.id} className="border-t border-brand-100 pt-3 first:border-0 first:pt-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold">
                      {formatDateEs(i.date)} · {zoneLabel(state, i.zoneId)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge tone={i.status === 'falla' ? 'danger' : 'ok'}>
                        {i.status === 'falla' ? '❌ Falla' : '✅ Pasa'}
                      </Badge>
                      <button
                        onClick={() => handleDelete(i.id)}
                        className="text-danger-500 hover:text-danger-600"
                        aria-label="Eliminar inspección"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  {guardian && <p className="text-xs text-ink-500">Guardián: {guardian.name}</p>}
                  {i.comments && <p className="mt-1 text-sm text-ink-700">"{i.comments}"</p>}
                  {i.photos.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {i.photos.map((p, idx) => (
                        <img key={idx} src={p} className="h-16 w-16 rounded-lg object-cover" alt="Foto de inspección" />
                      ))}
                    </div>
                  )}
                  {i.strikeGiven && <p className="mt-1 text-xs font-semibold text-danger-600">⚠️ Se dio 1 strike</p>}
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {voting && <InspectionVoteModal onClose={() => setVoting(false)} />}
    </div>
  )
}
