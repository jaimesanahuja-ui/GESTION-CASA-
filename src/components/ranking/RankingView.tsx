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
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const closedThisMonth = state.monthSummaries.some((m) => m.month === month && m.year === year)
  const lastSummary = [...state.monthSummaries].sort((a, b) => (b.year - a.year) * 12 + (b.month - a.month)).at(-1)
  const lastWinner = lastSummary?.winnerId ? state.users.find((u) => u.id === lastSummary.winnerId) : undefined

  function handleCloseMonth() {
    if (closedThisMonth) return
    if (window.confirm('¿Cerrar el mes y declarar ganador? Los puntos mensuales se reiniciarán a 0.')) {
      closeMonth()
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div>
        <p className="mb-2 text-[10px] font-bold tracking-[0.08em] text-ink-500 uppercase">
          Ranking {monthNameEs(month)} 🏆
        </p>
        {monthly.every((u) => u.monthlyPoints === 0) ? (
          <EmptyState icon="🏆" text="Todavía nadie tiene puntos este mes. Pasa la semana sin incidencias graves para sumar." />
        ) : (
          <div className="flex flex-col gap-2">
            {monthly.map((u, i) => (
              <div
                key={u.id}
                className={`flex items-center gap-3 rounded-2xl p-3.5 ${
                  i === 0
                    ? 'border-[1.5px] border-brand-500/18'
                    : 'bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
                }`}
                style={i === 0 ? { background: 'linear-gradient(135deg,#FFF0EB,#FFE8DF)' } : undefined}
              >
                <span className="w-6 text-center text-lg">{MEDALS[i] ?? `${i + 1}️⃣`}</span>
                <Avatar name={u.name} avatar={u.avatar} />
                <span className="flex-1 truncate text-sm font-semibold text-ink-900">{u.name}</span>
                <span className="text-2xl leading-none font-extrabold tracking-tight text-brand-500">
                  {u.monthlyPoints}
                  <span className="ml-0.5 text-[10px] font-medium text-ink-500">pts</span>
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="mt-3 text-xs text-ink-500">Premio del mes: {state.settings.monthlyReward}</p>
        <Button className="mt-3 w-full" disabled={closedThisMonth} onClick={handleCloseMonth}>
          {closedThisMonth ? '✓ Mes ya cerrado' : '🏁 Cerrar mes'}
        </Button>
      </div>

      {lastSummary && (
        <Card>
          <CardTitle>
            📣 Último cierre — {monthNameEs(lastSummary.month)} {lastSummary.year}
          </CardTitle>
          {lastWinner ? (
            <CopyableMessage
              text={monthlyWinnerMessage(
                state,
                lastWinner,
                lastSummary.pointsByUser[lastWinner.id] ?? 0,
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
              <span className="text-sm font-bold text-brand-500">{u.totalPoints}</span>
            </li>
          ))}
        </ol>
      </Card>

      {state.users.some((u) => u.strikes > 0) && (
        <Card>
          <CardTitle>⚠️ Recordatorio</CardTitle>
          <div className="flex flex-col gap-2">
            {state.users
              .filter((u) => u.strikes > 0)
              .map((u) => (
                <div key={u.id} className="flex items-center justify-between rounded-[10px] bg-brand-50 px-3 py-2">
                  <span className="text-sm font-semibold text-ink-900">{u.name}</span>
                  <Badge tone="brand">
                    {u.strikes}/{state.settings.strikesThreshold} strikes
                  </Badge>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  )
}
