import type { TabId } from './tabs'

const PATHS: Record<TabId, React.ReactNode> = {
  dashboard: <path d="M3 12L12 4L21 12V21H15V16H9V21H3V12Z" />,
  guardians: <path d="M12 2L20 6V12C20 17 16.4 21 12 22C7.6 21 4 17 4 12V6L12 2Z" />,
  inspections: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="M20 20L14.8 14.8" />
    </>
  ),
  incidents: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  lostitems: (
    <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" />
  ),
  ranking: (
    <path d="M8 21h8M12 17v4M7 3h10L15.5 12H8.5L7 3ZM7 7H4c0 4 2 6 5 6M17 7h3c0 4-2 6-5 6" />
  ),
  strikes: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M6.5 6.5L17.5 17.5" />
    </>
  ),
  expenses: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.3a4.2 4.2 0 1 0 0 7.4M8.5 11h5M8.5 13h4" />
    </>
  ),
  settings: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="9" cy="6" r="2.2" fill="currentColor" stroke="none" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="15" cy="12" r="2.2" fill="currentColor" stroke="none" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="10" cy="18" r="2.2" fill="currentColor" stroke="none" />
    </>
  ),
}

export function TabIcon({ id, size = 20, color }: { id: TabId; size?: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[id]}
    </svg>
  )
}
