import type { AppState } from '../../types'
import { computeHouseStatus } from '../../lib/houseStatus'
import { addDays, formatShortRangeEs } from '../../lib/dateUtils'
import { LogoIcon } from '../ui/Logo'

const STATUS_BADGE = {
  ok: 'bg-ok-50 text-ok-600',
  warn: 'bg-brand-50 text-brand-500',
  danger: 'bg-danger-50 text-danger-500',
}

export function Header({ state, currentWeekStartDate }: { state: AppState; currentWeekStartDate: string }) {
  const status = computeHouseStatus(state)
  const weekAssignments = state.assignments.filter((a) => a.weekStart === currentWeekStartDate)
  const weekEnd = weekAssignments[0]?.weekEnd ?? addDays(currentWeekStartDate, 6)

  return (
    <header className="flex items-center justify-between bg-cream-50 px-5 pt-[env(safe-area-inset-top,18px)] pb-4 sm:px-6 sm:pt-6">
      <div className="flex items-center gap-2.5">
        <LogoIcon size={42} />
        <div>
          <div className="text-[22px] leading-none font-black tracking-tight text-ink-900">HOME</div>
          <div className="mt-1 text-[10px] font-medium text-ink-500">{formatShortRangeEs(currentWeekStartDate, weekEnd)}</div>
        </div>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap ${STATUS_BADGE[status.level]}`}>
        {status.level === 'ok' ? `✓ ${status.label}` : `⚠️ ${status.label}`}
      </span>
    </header>
  )
}
