import type { ReactNode } from 'react'

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-pop max-h-[90svh] w-full overflow-y-auto rounded-t-3xl bg-cream-50 p-5 shadow-xl sm:max-w-md sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-ink-500/10 text-ink-700 hover:bg-ink-500/20"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
