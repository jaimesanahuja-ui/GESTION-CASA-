import { useApp } from '../../state/AppContext'
import { Card, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../ui/EmptyState'
import { CopyableMessage } from '../ui/CopyableMessage'
import { formatDateEs } from '../../lib/dateUtils'
import { penaltyTriggeredMessage } from '../../lib/messages'

export function StrikesView() {
  const { state, completePenalty } = useApp()
  const pendingPenalties = state.penalties.filter((p) => p.status === 'pendiente')
  const completedPenalties = [...state.penalties]
    .filter((p) => p.status === 'cumplida')
    .sort((a, b) => (b.dateCompleted ?? '').localeCompare(a.dateCompleted ?? ''))

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card>
        <CardTitle>❌ Strikes por persona</CardTitle>
        <p className="mb-3 text-sm text-ink-700">
          Dos strikes y hay cervezas. Al llegar a {state.settings.strikesThreshold} strikes: {state.settings.penaltyText.toLowerCase()}.
        </p>
        <ul className="flex flex-col gap-2">
          {state.users.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Avatar name={u.name} avatar={u.avatar} size="sm" />
                {u.name}
              </span>
              <Badge tone={u.strikes >= state.settings.strikesThreshold ? 'danger' : u.strikes > 0 ? 'warn' : 'ok'}>
                {u.strikes}/{state.settings.strikesThreshold}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>

      <Card tone="danger">
        <CardTitle>🍻 Penalizaciones pendientes</CardTitle>
        {pendingPenalties.length === 0 ? (
          <EmptyState icon="🎉" text="No hay penalizaciones pendientes de cumplir." />
        ) : (
          <div className="flex flex-col gap-4">
            {pendingPenalties.map((p) => {
              const user = state.users.find((u) => u.id === p.userId)
              if (!user) return null
              return (
                <div key={p.id} className="rounded-xl bg-danger-50 p-3">
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="mb-2 text-sm text-ink-700">
                    {p.reason} · desde el {formatDateEs(p.dateTriggered)}
                  </p>
                  <CopyableMessage text={penaltyTriggeredMessage(state, user)} />
                  <Button size="sm" className="mt-2 w-full" onClick={() => completePenalty(p.id)}>
                    ✅ Penalización cumplida
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Card>
        <CardTitle>🗂️ Historial de penalizaciones</CardTitle>
        {completedPenalties.length === 0 ? (
          <EmptyState icon="📜" text="Todavía no se ha cumplido ninguna penalización." />
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {completedPenalties.map((p) => {
              const user = state.users.find((u) => u.id === p.userId)
              return (
                <li key={p.id} className="flex items-center justify-between border-t border-brand-100 pt-2 first:border-0 first:pt-0">
                  <span>
                    <strong>{user?.name}</strong> · {p.reason}
                  </span>
                  <span className="text-xs text-ink-500">{p.dateCompleted && formatDateEs(p.dateCompleted)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
