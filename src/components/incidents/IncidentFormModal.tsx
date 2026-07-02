import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { PhotoInput } from '../ui/PhotoInput'
import { SEVERITY_DESCRIPTION, SEVERITY_LABEL, SEVERITY_ORDER } from '../../lib/incidents'
import type { IncidentSeverity, ZoneId } from '../../types'
import { getRotationZones } from '../../lib/zones'

export function IncidentFormModal({ onClose }: { onClose: () => void }) {
  const { state, addIncident } = useApp()
  const zones = getRotationZones(state)
  const [zoneId, setZoneId] = useState<ZoneId | ''>(zones[0]?.id ?? '')
  const [reportedBy, setReportedBy] = useState(state.users[0]?.id ?? '')
  const [responsibleUserId, setResponsibleUserId] = useState<string>('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<IncidentSeverity>('leve')
  const [photo, setPhoto] = useState<string | null>(null)

  function submit() {
    if (!zoneId || !reportedBy || !description.trim()) return
    addIncident({
      zoneId,
      reportedBy,
      responsibleUserId: responsibleUserId || null,
      description: description.trim(),
      severity,
      photo,
    })
    onClose()
  }

  return (
    <Modal title="📸 Reportar incidencia" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Zona</label>
          <select
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value as ZoneId)}
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          >
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.icon} {z.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">¿Quién reporta?</label>
          <select
            value={reportedBy}
            onChange={(e) => setReportedBy(e.target.value)}
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          >
            {state.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Responsable (si se sabe)</label>
          <select
            value={responsibleUserId}
            onChange={(e) => setResponsibleUserId(e.target.value)}
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">No lo sé / nadie en concreto</option>
            {state.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Descripción breve</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Ej: ropa tirada en el pasillo del baño"
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Gravedad</label>
          <div className="flex flex-col gap-2">
            {SEVERITY_ORDER.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                  severity === s ? 'border-brand-500 bg-brand-50' : 'border-brand-100 bg-white'
                }`}
              >
                <span className="font-semibold">{SEVERITY_LABEL[s]}</span>
                <p className="text-xs text-ink-500">{SEVERITY_DESCRIPTION[s]}</p>
              </button>
            ))}
          </div>
        </div>

        <PhotoInput value={photo} onChange={setPhoto} />

        <Button onClick={submit} disabled={!description.trim()}>
          Enviar incidencia
        </Button>
      </div>
    </Modal>
  )
}
