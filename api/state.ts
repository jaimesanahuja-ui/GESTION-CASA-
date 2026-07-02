// Endpoint serverless de Vercel: guarda el estado completo de la casa como un
// único blob JSON en Postgres (Neon), para que todos los compañeros de piso
// vean los mismos datos desde sus propios móviles/navegadores.
//
// Variables de entorno necesarias en el proyecto de Vercel:
// - DATABASE_URL (la añade sola la integración de Neon en Storage → Postgres)
// - SYNC_TOKEN: cualquier cadena secreta que elijas, para que no cualquiera en
//   internet pueda leer/machacar el estado de tu casa.
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

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

function checkAuth(req: MinimalRequest): boolean {
  const expected = process.env.SYNC_TOKEN
  if (!expected) return false // sin token configurado, el endpoint se niega por seguridad
  const header = req.headers['x-sync-token']
  const provided = Array.isArray(header) ? header[0] : header
  return provided === expected
}

async function ensureTable(sql: NeonQueryFunction<false, false>) {
  await sql`
    CREATE TABLE IF NOT EXISTS guardianes_kv (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  if (!checkAuth(req)) {
    res.status(401).json({ error: 'No autorizado. Configura SYNC_TOKEN y VITE_SYNC_TOKEN en Vercel.' })
    return
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    res.status(500).json({ error: 'Falta DATABASE_URL. Conecta una base de datos Postgres (Neon) al proyecto.' })
    return
  }
  const sql = neon(databaseUrl)

  if (req.method === 'GET') {
    await ensureTable(sql)
    const rows = await sql`SELECT value FROM guardianes_kv WHERE key = ${STATE_KEY}`
    res.status(200).json({ state: rows[0]?.value ?? null })
    return
  }

  if (req.method === 'PUT') {
    const body = req.body as { state?: unknown } | undefined
    if (!body?.state) {
      res.status(400).json({ error: 'Falta "state" en el cuerpo de la petición.' })
      return
    }
    await ensureTable(sql)
    await sql`
      INSERT INTO guardianes_kv (key, value, updated_at)
      VALUES (${STATE_KEY}, ${JSON.stringify(body.state)}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()
    `
    res.status(200).json({ ok: true })
    return
  }

  res.setHeader('Allow', 'GET, PUT')
  res.status(405).end('Method Not Allowed')
}
