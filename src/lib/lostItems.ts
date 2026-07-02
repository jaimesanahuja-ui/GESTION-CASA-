import type { LostItem } from '../types'
import { generateId } from './id'
import { daysBetween, todayISO } from './dateUtils'

export const DAYS_BEFORE_BOX = 7

export interface NewLostItemInput {
  photo: string | null
  description: string
  location: string
}

export function createLostItem(input: NewLostItemInput): LostItem {
  return {
    id: generateId(),
    date: todayISO(),
    claimedBy: null,
    status: 'pendiente',
    ...input,
  }
}

/** Los objetos pendientes que llevan demasiados días sin reclamar pasan solos a "caja". */
export function withAutoBoxed(items: LostItem[]): LostItem[] {
  const today = todayISO()
  return items.map((item) => {
    if (item.status !== 'pendiente') return item
    if (daysBetween(item.date, today) >= DAYS_BEFORE_BOX) {
      return { ...item, status: 'movido_a_caja' }
    }
    return item
  })
}
