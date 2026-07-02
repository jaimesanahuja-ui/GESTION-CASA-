import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { PhotoInput } from '../ui/PhotoInput'

export function LostItemFormModal({ onClose }: { onClose: () => void }) {
  const { addLostItem } = useApp()
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [photo, setPhoto] = useState<string | null>(null)

  function submit() {
    if (!description.trim() || !location.trim()) return
    addLostItem({ description: description.trim(), location: location.trim(), photo })
    onClose()
  }

  return (
    <Modal title="🧦 Objeto abandonado detectado" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <PhotoInput value={photo} onChange={setPhoto} label="Foto del objeto" />
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">¿Qué es?</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: cargador de móvil blanco"
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">¿Dónde estaba?</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ej: encima del sofá del salón"
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          />
        </div>
        <Button onClick={submit} disabled={!description.trim() || !location.trim()}>
          Publicar en objetos perdidos
        </Button>
      </div>
    </Modal>
  )
}
