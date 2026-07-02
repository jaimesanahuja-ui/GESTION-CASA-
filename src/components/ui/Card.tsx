import type { ReactNode } from 'react'

type Tone = 'default' | 'ok' | 'warn' | 'danger' | 'brand' | 'dark'

const TONE_CLASSES: Record<Tone, string> = {
  default: 'bg-white text-ink-900',
  ok: 'bg-ok-50 text-ink-900',
  warn: 'bg-warn-50 text-ink-900',
  danger: 'bg-danger-50 text-ink-900',
  brand: 'border-l-[3px] border-brand-500 bg-white text-ink-900',
  dark: 'bg-ink-950 text-white',
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
      className={`rounded-2xl p-4 ${TONE_CLASSES[tone]} ${className}`}
      style={{ boxShadow: tone === 'dark' ? undefined : '0 1px 4px rgba(0,0,0,0.06)' }}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`mb-2 text-[10px] font-bold tracking-[0.08em] text-ink-500 uppercase ${className}`}>{children}</h3>
  )
}
