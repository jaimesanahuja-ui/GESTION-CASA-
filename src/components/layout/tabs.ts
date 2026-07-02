export type TabId =
  | 'dashboard'
  | 'guardians'
  | 'inspections'
  | 'incidents'
  | 'lostitems'
  | 'ranking'
  | 'strikes'
  | 'expenses'
  | 'settings'

export const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Inicio' },
  { id: 'guardians', label: 'Guardianes' },
  { id: 'inspections', label: 'Inspección' },
  { id: 'incidents', label: 'Incidencias' },
  { id: 'lostitems', label: 'Perdidos' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'strikes', label: 'Strikes' },
  { id: 'expenses', label: 'Gastos' },
  { id: 'settings', label: 'Ajustes' },
]
