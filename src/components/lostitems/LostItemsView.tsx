import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { EmptyState } from '../ui/EmptyState'
import { LostItemFormModal } from './LostItemFormModal'
import { formatDateEs, daysBetween, todayISO } from '../../lib/dateUtils'
import { DAYS_BEFORE_BOX } from '../../lib/lostItems'
import type { LostItemStatus } from '../../types'

const STATUS_LABEL: Record<LostItemStatus, string> = {
  pendiente: 'Pendiente',
  reclamado: 'Reclamado',
  movido_a_caja: 'En la caja',
  resuelto: 'Resuelto',
}
const STATUS_TONE: Record<LostItemStatus, 'warn' | 'ok' | 'default' | 'brand'> = {
  pendiente: 'warn',
  reclamado: 'brand',
  movido_a_caja: 'default',
  resuelto: 'ok',
}

export function LostItemsView() {
  const { state, claimLostItem, moveLostItemToBox, resolveLostItem } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const items = [...state.lostItems].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">Ropa, cargadores, vasos, zapatillas…</p>
          <p className="text-xs text-ink-500">
            Si nadie lo reclama en {DAYS_BEFORE_BOX} días, pasa solo a la caja de objetos perdidos.
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          🧦 Subir objeto
        </Button>
      </Card>

      {items.length === 0 ? (
        <EmptyState icon="🎒" text="No hay objetos perdidos registrados." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const claimer = item.claimedBy ? state.users.find((u) => u.id === item.claimedBy) : null
            const daysLeft = Math.max(0, DAYS_BEFORE_BOX - daysBetween(item.date, todayISO()))
            return (
              <Card key={item.id}>
                <div className="flex gap-3">
                  {item.photo && <img src={item.photo} alt={item.description} className="h-20 w-20 shrink-0 rounded-xl object-cover" />}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-1">
                      <p className="text-sm font-bold">{item.description}</p>
                      <Badge tone={STATUS_TONE[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                    </div>
                    <p className="text-xs text-ink-500">
                      📍 {item.location} · {formatDateEs(item.date)}
                    </p>
                    {claimer && <p className="text-xs text-ink-500">Reclamado por {claimer.name}</p>}
                    {item.status === 'pendiente' && (
                      <p className="text-xs text-brand-600">{daysLeft} día(s) antes de ir a la caja</p>
                    )}

                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.status === 'pendiente' && (
                        <>
                          {claimingId === item.id ? (
                            <select
                              autoFocus
                              onChange={(e) => {
                                if (e.target.value) claimLostItem(item.id, e.target.value)
                                setClaimingId(null)
                              }}
                              className="rounded-lg border border-brand-200 bg-white px-2 py-1 text-xs"
                            >
                              <option value="">¿Quién lo reclama?</option>
                              {state.users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Button size="sm" variant="secondary" onClick={() => setClaimingId(item.id)}>
                              Reclamar
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => moveLostItemToBox(item.id)}>
                            Mover a la caja
                          </Button>
                        </>
                      )}
                      {(item.status === 'reclamado' || item.status === 'movido_a_caja') && (
                        <Button size="sm" variant="ghost" onClick={() => resolveLostItem(item.id)}>
                          Marcar resuelto
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {showForm && <LostItemFormModal onClose={() => setShowForm(false)} />}
    </div>
  )
}
