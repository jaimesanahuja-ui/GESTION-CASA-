import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { MultiPhotoInput } from '../ui/MultiPhotoInput'
import { zoneLabel } from '../../lib/zones'
import type { InspectionVote } from '../../types'

export function InspectionVoteModal({ onClose }: { onClose: () => void }) {
  const { state, recordInspectionResult } = useApp()
  const scheduled = state.scheduledInspection
  const [votes, setVotes] = useState<Record<string, 'pasa' | 'falla'>>({})
  const [comments, setComments] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  if (!scheduled) return null

  const fallas = Object.values(votes).filter((v) => v === 'falla').length
  const status = fallas >= 2 ? 'falla' : 'pasa'

  function submit() {
    const voteList: InspectionVote[] = Object.entries(votes).map(([userId, vote]) => ({ userId, vote }))
    recordInspectionResult(voteList, comments.trim(), photos)
    onClose()
  }

  return (
    <Modal title={`🔍 Inspección: ${zoneLabel(state, scheduled.zoneId)}`} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-700">
          Estado revista o strike. Vota si cada persona cree que la zona está aceptable. Hacen falta{' '}
          <strong>2 votos de "falla"</strong> para que cuente como fallo.
        </p>

        <div className="flex flex-col gap-2">
          {state.users
            .filter((u) => u.active)
            .map((u) => (
              <div key={u.id} className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
                <span className="text-sm font-semibold">{u.name}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setVotes((v) => ({ ...v, [u.id]: 'pasa' }))}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                      votes[u.id] === 'pasa' ? 'bg-ok-500 text-white' : 'bg-white text-ink-500'
                    }`}
                  >
                    ✅ Pasa
                  </button>
                  <button
                    onClick={() => setVotes((v) => ({ ...v, [u.id]: 'falla' }))}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                      votes[u.id] === 'falla' ? 'bg-danger-500 text-white' : 'bg-white text-ink-500'
                    }`}
                  >
                    ❌ Falla
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Comentarios</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={2}
            placeholder="Lo que se ha visto en la inspección…"
            className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-500">Fotos (opcional)</label>
          <MultiPhotoInput photos={photos} onChange={setPhotos} />
        </div>

        <div className="rounded-xl bg-ink-900/5 p-3 text-center">
          <p className="text-xs text-ink-500">Resultado con los votos actuales</p>
          <p className={`text-lg font-bold ${status === 'falla' ? 'text-danger-600' : 'text-ok-600'}`}>
            {status === 'falla' ? '❌ Falla' : '✅ Pasa'}
          </p>
        </div>

        <Button onClick={submit}>Guardar resultado</Button>
      </div>
    </Modal>
  )
}
