// Endpoint serverless de Vercel: guarda el estado completo de la casa como un
// único blob JSON en Redis (Upstash), para que todos los compañeros de piso
// vean los mismos datos desde sus propios móviles/navegadores.
//
// Variables de entorno necesarias en el proyecto de Vercel:
// - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (integración de Storage → Redis/Upstash)
// - SYNC_TOKEN: cualquier cadena secreta que elijas, para que no cualquiera en
//   internet pueda leer/machacar el estado de tu casa.
import { Redis } from '@upstash/redis'

// Tipos mínimos propios en vez de depender de @vercel/node (evita arrastrar
// su cadena de dependencias solo por un par de interfaces).
interface MinimalRequest {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
}
interface MinimalResponse {
  status(code: number): MinimalResponse
  json(body: unknown): void
  setHeader(name: string, value: string): void
  end(chunk?: string): void
}

const STATE_KEY = 'guardianes-de-la-casa:state:v1'

function getRedis(): Redis {
  return Redis.fromEnv()
}

function checkAuth(req: MinimalRequest): boolean {
  const expected = process.env.SYNC_TOKEN
  if (!expected) return false // sin token configurado, el endpoint se niega por seguridad
  const header = req.headers['x-sync-token']
  const provided = Array.isArray(header) ? header[0] : header
  return provided === expected
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  if (!checkAuth(req)) {
    res.status(401).json({ error: 'No autorizado. Configura SYNC_TOKEN y VITE_SYNC_TOKEN en Vercel.' })
    return
  }

  const redis = getRedis()

  if (req.method === 'GET') {
    const state = await redis.get(STATE_KEY)
    res.status(200).json({ state: state ?? null })
    return
  }

  if (req.method === 'PUT') {
    const body = req.body as { state?: unknown } | undefined
    if (!body?.state) {
      res.status(400).json({ error: 'Falta "state" en el cuerpo de la petición.' })
      return
    }
    await redis.set(STATE_KEY, body.state)
    res.status(200).json({ ok: true })
    return
  }

  res.setHeader('Allow', 'GET, PUT')
  res.status(405).end('Method Not Allowed')
}
