import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { Incident } from '../../types'

export function IncidentStrikeVoteModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const { state, convertIncidentToStrike } = useApp()
  const [confirming, setConfirming] = useState<Record<string, boolean>>({})

  const responsible = state.users.find((u) => u.id === incident.responsibleUserId)
  const votes = state.users.filter((u) => u.active && confirming[u.id])

  function submit() {
    convertIncidentToStrike(incident.id, votes.map((u) => u.id))
    onClose()
  }

  return (
    <Modal title="⚠️ ¿Esto merece un strike?" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-ink-700">
          Un strike solo cuenta si <strong>al menos 2 personas</strong> están de acuerdo en que la incidencia de{' '}
          {responsible?.name ?? 'esta persona'} es motivo de strike. Marca quién lo confirma.
        </p>

        <div className="flex flex-col gap-2">
          {state.users
            .filter((u) => u.active)
            .map((u) => (
              <button
                key={u.id}
                onClick={() => setConfirming((c) => ({ ...c, [u.id]: !c[u.id] }))}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                  confirming[u.id] ? 'border-danger-500 bg-danger-50' : 'border-brand-100 bg-white'
                }`}
              >
                {u.name}
                <span>{confirming[u.id] ? '✅ Confirma' : '—'}</span>
              </button>
            ))}
        </div>

        <div className="rounded-xl bg-ink-900/5 p-3 text-center">
          <p className="text-xs text-ink-500">Confirmaciones</p>
          <p className={`text-lg font-bold ${votes.length >= 2 ? 'text-danger-600' : 'text-ink-500'}`}>
            {votes.length}/2 {votes.length >= 2 ? '— strike confirmado' : 'necesarias'}
          </p>
        </div>

        <Button variant="danger" disabled={votes.length < 2} onClick={submit}>
          Confirmar strike
        </Button>
      </div>
    </Modal>
  )
}
