// Cliente del endpoint /api/state (ver api/state.ts). Si el backend no está
// desplegado o configurado (p.ej. en `npm run dev` local sin `vercel dev`),
// las llamadas fallan y AppContext hace fallback a localStorage sin más.

const STATE_ENDPOINT = '/api/state'

const SYNC_TOKEN: string | undefined = import.meta.env.VITE_SYNC_TOKEN

export function isRemoteSyncConfigured(): boolean {
  return Boolean(SYNC_TOKEN)
}

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    ...(SYNC_TOKEN ? { 'x-sync-token': SYNC_TOKEN } : {}),
  }
}

export async function loadRemoteState<T>(): Promise<T | null> {
  const res = await fetch(STATE_ENDPOINT, { headers: headers(), cache: 'no-store' })
  if (!res.ok) throw new Error(`GET ${STATE_ENDPOINT} -> ${res.status}`)
  const data = (await res.json()) as { state: T | null }
  return data.state ?? null
}

export async function saveRemoteState<T>(state: T): Promise<void> {
  const res = await fetch(STATE_ENDPOINT, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ state }),
  })
  if (!res.ok) throw new Error(`PUT ${STATE_ENDPOINT} -> ${res.status}`)
}
