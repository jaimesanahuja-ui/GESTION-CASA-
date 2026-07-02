import { useApp } from '../../state/AppContext'
import { Card, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { EmptyState } from '../ui/EmptyState'
import { CopyableMessage } from '../ui/CopyableMessage'
import { monthNameEs } from '../../lib/dateUtils'
import { monthlyWinnerMessage } from '../../lib/messages'

const MEDALS = ['🥇', '🥈', '🥉']

export function RankingView() {
  const { state, closeMonth } = useApp()
  const monthly = [...state.users].sort((a, b) => b.monthlyPoints - a.monthlyPoints)
  const allTime = [...state.users].sort((a, b) => b.totalPoints - a.totalPoints)
  const now = new Date()
  const lastSummary = [...state.monthSummaries].sort((a, b) => (b.year - a.year) * 12 + (b.month - a.month)).at(-1)

  function handleCloseMonth() {
    if (window.confirm('¿Cerrar el mes y declarar ganador? Los puntos mensuales se reiniciarán a 0.')) {
      closeMonth()
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card tone="brand">
        <div className="mb-2 flex items-center justify-between">
          <CardTitle className="mb-0">🏆 Ranking de {monthNameEs(now.getMonth() + 1)}</CardTitle>
          <Button size="sm" onClick={handleCloseMonth}>
            🏁 Cerrar mes
          </Button>
        </div>
        {monthly.every((u) => u.monthlyPoints === 0) ? (
          <EmptyState icon="🏆" text="Todavía nadie tiene puntos este mes. Pasa la semana sin incidencias graves para sumar." />
        ) : (
          <ol className="flex flex-col gap-2">
            {monthly.map((u, i) => (
              <li key={u.id} className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="w-6 text-center">{MEDALS[i] ?? i + 1}</span>
                  <Avatar name={u.name} avatar={u.avatar} size="sm" />
                  {u.name}
                </span>
                <Badge tone="brand">{u.monthlyPoints} pts</Badge>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-xs text-ink-500">Premio del mes: {state.settings.monthlyReward}</p>
      </Card>

      {lastSummary && (
        <Card>
          <CardTitle>
            📣 Última cierre — {monthNameEs(lastSummary.month)} {lastSummary.year}
          </CardTitle>
          {lastSummary.winnerId ? (
            <CopyableMessage
              text={monthlyWinnerMessage(
                state,
                state.users.find((u) => u.id === lastSummary.winnerId)!,
                lastSummary.pointsByUser[lastSummary.winnerId] ?? 0,
                lastSummary.month,
                lastSummary.year,
              )}
            />
          ) : (
            <p className="text-sm text-ink-500">Nadie sumó puntos ese mes.</p>
          )}
        </Card>
      )}

      <Card>
        <CardTitle>⭐ Puntos totales acumulados</CardTitle>
        <ol className="flex flex-col gap-2">
          {allTime.map((u, i) => (
            <li key={u.id} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <span className="w-5 text-center text-xs text-ink-500">{i + 1}</span>
                {u.name}
              </span>
              <span className="text-sm font-bold text-brand-700">{u.totalPoints}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  )
}
