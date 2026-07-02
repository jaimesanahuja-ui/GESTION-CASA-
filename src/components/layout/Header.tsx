import type { SyncStatus } from '../../state/AppContext'

const SYNC_LABEL: Record<SyncStatus, { text: string; className: string }> = {
  'local-only': { text: '📴 Solo este dispositivo', className: 'bg-ink-500/10 text-ink-500' },
  syncing: { text: '☁️ Sincronizando…', className: 'bg-warn-50 text-warn-600' },
  synced: { text: '☁️ Sincronizado', className: 'bg-ok-50 text-ok-600' },
  offline: { text: '⚠️ Sin conexión con la casa', className: 'bg-danger-50 text-danger-600' },
}

export function Header({ houseName, syncStatus }: { houseName: string; syncStatus: SyncStatus }) {
  const sync = SYNC_LABEL[syncStatus]
  return (
    <header className="sticky top-0 z-30 flex flex-col gap-1.5 border-b border-brand-100 bg-cream-50/90 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg leading-tight font-extrabold text-brand-700 sm:text-xl">
          🏠 Guardianes de {houseName}
        </h1>
        <p className="text-xs text-ink-500">La casa no se ordena sola, campeón.</p>
      </div>
      <span
        className={`inline-block w-fit shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${sync.className}`}
      >
        {sync.text}
      </span>
    </header>
  )
}
