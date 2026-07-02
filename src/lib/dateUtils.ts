const DAY_MS = 24 * 60 * 60 * 1000

export function toISODate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseISODate(b).getTime() - parseISODate(a).getTime()) / DAY_MS)
}

/** Devuelve el ISO date del inicio de la semana actual (o próxima) según el día de inicio configurado (0=domingo..6=sábado). */
export function currentWeekStart(weekStartDay: number, from: Date = new Date()): string {
  const d = new Date(from)
  const currentDay = d.getDay()
  let diff = currentDay - weekStartDay
  if (diff < 0) diff += 7
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return toISODate(d)
}

export function nextWeekStart(weekStartDay: number, from: Date = new Date()): string {
  return addDays(currentWeekStart(weekStartDay, from), 7)
}

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export function formatDateEs(iso: string): string {
  const d = parseISODate(iso)
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`
}

export function formatRangeEs(startIso: string, endIso: string): string {
  const start = parseISODate(startIso)
  const end = parseISODate(endIso)
  if (start.getMonth() === end.getMonth()) {
    return `del ${start.getDate()} al ${end.getDate()} de ${MONTHS_ES[end.getMonth()]}`
  }
  return `del ${start.getDate()} de ${MONTHS_ES[start.getMonth()]} al ${end.getDate()} de ${MONTHS_ES[end.getMonth()]}`
}

export function monthNameEs(month: number): string {
  return MONTHS_ES[month - 1]
}

const MONTHS_ES_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Formato compacto para la cabecera, ej. "2 jul → 9 jul". */
export function formatShortRangeEs(startIso: string, endIso: string): string {
  const start = parseISODate(startIso)
  const end = parseISODate(endIso)
  return `${start.getDate()} ${MONTHS_ES_SHORT[start.getMonth()]} → ${end.getDate()} ${MONTHS_ES_SHORT[end.getMonth()]}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function nowTimeHHMM(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
