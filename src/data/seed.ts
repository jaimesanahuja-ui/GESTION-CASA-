import type { AppState, Settings, User, Zone } from '../types'

export const DEFAULT_SETTINGS: Settings = {
  houseName: 'La Casa',
  weekStartDay: 3, // miércoles
  inspectionFrequency: 'semanal',
  inspectionTime: '21:00',
  strikesThreshold: 2,
  penaltyText: 'Invitar a cervezas el viernes',
  monthlyReward: 'Cena pagada por la casa',
  splitBathroom: false,
  allowRestWeek: true,
}

export const ALL_ZONES: Zone[] = [
  {
    id: 'cocina',
    name: 'Cocina',
    type: 'cocina',
    icon: '🍳',
    description: 'El guardián supervisa, no friega los platos de todos.',
    checklist: [
      'Sin platos acumulados',
      'Lavavajillas puesto si está lleno',
      'Lavavajillas vaciado',
      'Platos, vasos y cubiertos guardados',
      'Encimera despejada',
      'Fregadero vacío',
      'Sin basura ni restos de comida',
    ],
    weeklyTasks: ['Aspirar y fregar la cocina (1x/semana)'],
    active: true,
  },
  {
    id: 'banio',
    name: 'Baño',
    type: 'banio',
    icon: '🚿',
    description: 'WC, ducha, lavabo y reposición general.',
    checklist: [
      'WC limpio',
      'Ducha aceptable',
      'Lavabo limpio',
      'Espejo sin manchas importantes',
      'Papel higiénico disponible',
      'Papelera vacía',
      'Objetos personales fuera o colocados',
    ],
    weeklyTasks: ['Suelo limpio (1x/semana)'],
    active: true,
  },
  {
    id: 'banio_wc_ducha',
    name: 'Baño — WC y ducha',
    type: 'banio',
    icon: '🚽',
    description: 'Subzona del baño: WC y ducha.',
    checklist: ['WC limpio', 'Ducha aceptable', 'Papelera vacía'],
    weeklyTasks: [],
    active: false,
  },
  {
    id: 'banio_lavabo',
    name: 'Baño — Lavabo',
    type: 'banio',
    icon: '🪞',
    description: 'Subzona del baño: lavabo, espejo y suelo.',
    checklist: [
      'Lavabo limpio',
      'Espejo sin manchas importantes',
      'Papel higiénico disponible',
      'Objetos personales fuera o colocados',
    ],
    weeklyTasks: ['Suelo limpio (1x/semana)'],
    active: false,
  },
  {
    id: 'zonas_comunes',
    name: 'Zonas comunes',
    type: 'zonas_comunes',
    icon: '🛋️',
    description: 'Salón, pasillo, entrada y comedor.',
    checklist: [
      'Sofá ordenado',
      'Mantas dobladas',
      'Mesa despejada',
      'Sin cajas de pizza, vasos, botellas o basura',
      'Pasillo libre',
      'Entrada ordenada',
      'Objetos personales fuera de zonas comunes',
      'Basura sacada cuando toque',
    ],
    weeklyTasks: ['Aspirar y fregar salón/pasillo/entrada (1x/semana)'],
    active: true,
  },
]

function makeUser(name: string, avatar: string): User {
  return {
    id: name.toLowerCase(),
    name,
    avatar,
    active: true,
    strikes: 0,
    monthlyPoints: 0,
    totalPoints: 0,
    zoneHistory: [],
    restHistory: [],
  }
}

export const SEED_USERS: User[] = [
  makeUser('Jaime', '🦁'),
  makeUser('Alberto', '🐺'),
  makeUser('Richie', '🦊'),
  makeUser('Mario', '🐨'),
]

export function createInitialState(): AppState {
  return {
    users: SEED_USERS,
    zones: ALL_ZONES,
    assignments: [],
    inspections: [],
    scheduledInspection: null,
    incidents: [],
    lostItems: [],
    penalties: [],
    monthSummaries: [],
    expenses: [],
    settings: DEFAULT_SETTINGS,
    evaluatedWeeks: [],
  }
}

/** Rellena con valores por defecto cualquier campo que falte en un estado cargado
 * de localStorage/backend antiguo (p.ej. si se añade un campo nuevo tras un despliegue). */
export function normalizeState(raw: Partial<AppState> | null | undefined): AppState {
  if (!raw) return createInitialState()
  return {
    ...createInitialState(),
    ...raw,
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings ?? {}) },
  }
}
