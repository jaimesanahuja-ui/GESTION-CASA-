import type { ReactNode } from 'react'

type Tone = 'default' | 'ok' | 'warn' | 'danger' | 'brand'

const TONE_CLASSES: Record<Tone, string> = {
  default: 'bg-ink-500/10 text-ink-700',
  ok: 'bg-ok-50 text-ok-600',
  warn: 'bg-warn-50 text-warn-600',
  danger: 'bg-danger-50 text-danger-600',
  brand: 'bg-brand-100 text-brand-700',
}

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  )
}
