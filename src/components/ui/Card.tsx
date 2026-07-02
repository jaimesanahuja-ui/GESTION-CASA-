import type { ReactNode } from 'react'

type Tone = 'default' | 'ok' | 'warn' | 'danger' | 'brand'

const TONE_BORDER: Record<Tone, string> = {
  default: 'border-brand-100',
  ok: 'border-ok-500/30',
  warn: 'border-warn-500/40',
  danger: 'border-danger-500/30',
  brand: 'border-brand-300',
}

export function Card({
  children,
  tone = 'default',
  className = '',
}: {
  children: ReactNode
  tone?: Tone
  className?: string
}) {
  return (
    <div
      className={`rounded-2xl border ${TONE_BORDER[tone]} bg-white/90 p-4 shadow-sm shadow-brand-900/5 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={`mb-2 text-sm font-bold tracking-wide text-ink-700 uppercase ${className}`}>{children}</h3>
}
