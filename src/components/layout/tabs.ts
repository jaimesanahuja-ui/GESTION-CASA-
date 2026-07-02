export type TabId =
  | 'dashboard'
  | 'guardians'
  | 'inspections'
  | 'incidents'
  | 'lostitems'
  | 'ranking'
  | 'strikes'
  | 'settings'

export const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Inicio', icon: '🏠' },
  { id: 'guardians', label: 'Guardianes', icon: '🛡️' },
  { id: 'inspections', label: 'Inspección', icon: '🔍' },
  { id: 'incidents', label: 'Incidencias', icon: '📸' },
  { id: 'lostitems', label: 'Perdidos', icon: '🧦' },
  { id: 'ranking', label: 'Ranking', icon: '🏆' },
  { id: 'strikes', label: 'Strikes', icon: '❌' },
  { id: 'settings', label: 'Ajustes', icon: '⚙️' },
]
