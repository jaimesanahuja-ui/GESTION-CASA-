// Capa de persistencia. Hoy guarda en localStorage; el resto de la app solo
// conoce esta interfaz, así que cambiar a Supabase/Firebase en el futuro
// significa reescribir este archivo, no la UI.

export interface StorageAdapter<T> {
  load(): T | null
  save(value: T): void
}

export function createLocalStorageAdapter<T>(key: string): StorageAdapter<T> {
  return {
    load(): T | null {
      try {
        const raw = window.localStorage.getItem(key)
        if (!raw) return null
        return JSON.parse(raw) as T
      } catch (err) {
        console.error(`No se pudo leer "${key}" de localStorage`, err)
        return null
      }
    },
    save(value: T): void {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch (err) {
        console.error(`No se pudo guardar "${key}" en localStorage`, err)
      }
    },
  }
}

export const STORAGE_KEY = 'guardianes-de-la-casa:state:v1'
