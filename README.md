# 🏠 Guardianes de la Casa

App web para gestionar la limpieza y el orden de un piso compartido: roles semanales por
zona, inspecciones sorpresa, strikes, puntos positivos, incidencias con fotos y objetos
perdidos.

Quien ensucia, limpia. El guardián supervisa, no es el mayordomo.

## Stack

- React 19 + TypeScript
- Tailwind CSS v4
- Vite
- Persistencia en `localStorage` por defecto (cada dispositivo guarda sus propios datos)
- Opcionalmente, sincronización compartida entre todos los compañeros de piso vía un
  endpoint serverless de Vercel (`api/state.ts`) + Postgres (Neon) — ver más abajo

## Arrancar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. La app viene con 4 usuarios de ejemplo (Jaime, Alberto,
Richie, Mario) y las zonas Cocina, Baño y Zonas comunes ya configuradas.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (`tsc -b && vite build`)
- `npm run preview` — sirve el build de producción
- `npm run lint` — oxlint

## Estructura

```
src/
  types.ts              modelo de datos (User, Zone, Assignment, Inspection, Incident, LostItem, Penalty, MonthSummary, Settings)
  data/seed.ts           usuarios y zonas de ejemplo
  lib/                    lógica de negocio pura (asignación semanal, strikes, puntos, mensajes de WhatsApp…)
  state/AppContext.tsx    estado global + persistencia en localStorage
  components/
    dashboard/            pantalla principal
    guardians/             guardianes semanales
    inspections/          inspecciones sorpresa
    incidents/              incidencias con fotos
    lostitems/            objetos perdidos
    ranking/                ranking y puntos
    strikes/                strikes y penalizaciones
    settings/               configuración de la casa
    ui/                    componentes reutilizables (Card, Button, Modal, PhotoInput…)
```

## Datos que persisten

Todo el estado (usuarios, zonas, asignaciones, inspecciones, incidencias, objetos
perdidos, penalizaciones, resúmenes mensuales y configuración) se guarda automáticamente
en `localStorage` bajo la clave `guardianes-de-la-casa:state:v1`. Las fotos se guardan
como imágenes comprimidas en base64.

Con esta configuración por defecto, **cada persona ve solo lo que ha hecho en su propio
móvil/navegador** — no es una casa compartida todavía.

## Desplegar en Vercel con datos compartidos

Para que Jaime, Alberto, Richie y Mario vean y editen la misma casa desde sus propios
móviles, la app puede desplegarse en Vercel con una base de datos Postgres (Neon) detrás
de un endpoint serverless (`api/state.ts`) que guarda un único "blob" con todo el estado
de la casa (en una tabla `guardianes_kv` que el propio endpoint crea sola la primera
vez). La app sigue funcionando exactamente igual (mismas pantallas, mismos botones);
simplemente, en lugar de leer/escribir solo `localStorage`, también sincroniza con ese
endpoint (con `localStorage` como caché y modo sin conexión).

### 1. Sube el proyecto a Vercel

- Entra en [vercel.com](https://vercel.com), "Add New… → Project" e importa este
  repositorio de GitHub.
- Framework preset: Vercel detecta Vite automáticamente. Build command `vite build`,
  output `dist` (no hace falta tocar nada).

### 2. Añade una base de datos Postgres (Neon)

- En el proyecto de Vercel: pestaña **Storage → Create Database → Postgres** (proveedor
  Neon, tiene plan gratuito de sobra para esto).
- Conéctala al proyecto. Esto añade automáticamente un buen puñado de variables de
  entorno (`DATABASE_URL`, `POSTGRES_URL`, `PGHOST`…); `api/state.ts` solo necesita
  `DATABASE_URL`, que siempre viene incluida.

### 3. Configura el token compartido

En **Settings → Environment Variables** del proyecto añade:

| Variable          | Valor                                   | Notas                                    |
| ------------------ | ---------------------------------------- | ----------------------------------------- |
| `SYNC_TOKEN`        | una contraseña/cadena aleatoria a tu gusto | la usa el servidor para validar peticiones |
| `VITE_SYNC_TOKEN`   | el mismo valor exacto que `SYNC_TOKEN`     | se incluye en el build del frontend        |

Sin estas dos variables la app funciona igualmente, pero solo con `localStorage` (modo
"un dispositivo"). En cuanto `VITE_SYNC_TOKEN` está presente en el build, la app activa
la sincronización automáticamente.

### 4. Redeploy

Tras añadir las variables, haz un redeploy (Vercel → Deployments → ⋯ → Redeploy) para
que el build del frontend incluya `VITE_SYNC_TOKEN`.

### 5. Comparte la URL

Pasa la URL de Vercel (o un dominio propio) al chat del piso. Todo el mundo que la abra
comparte los mismos guardianes, strikes, puntos, incidencias y objetos perdidos. En el
Header y en Configuración verás un indicador (☁️ Sincronizado / Sincronizando / Sin
conexión) que confirma si el dispositivo está hablando con el backend compartido.

### Cómo funciona la sincronización

- Al abrir la app, se descarga el estado compartido desde `/api/state`.
- Cada cambio (generar semana, dar un strike, subir una incidencia…) se guarda al
  instante en `localStorage` y, con un pequeño retraso (600 ms) para no saturar, se envía
  también al backend compartido.
- Al volver a la pestaña o app (cambio de foco/visibilidad), se vuelve a consultar el
  backend por si otro compañero de piso ha cambiado algo mientras tanto.
- Es un modelo "el último cambio gana" (sin fusión de conflictos): pensado para el uso
  normal de una casa (alguien pulsa un botón de vez en cuando), no para ediciones
  simultáneas del mismo campo por varias personas a la vez.
- Si el backend no responde (sin internet, no configurado…), la app sigue funcionando
  con la copia local en `localStorage` sin romperse.

## Instalarla como app en el móvil

La app es una PWA (Progressive Web App): se puede "instalar" desde el navegador para que
abra a pantalla completa, con su propio icono en el escritorio/pantalla de inicio, sin
barra de direcciones — se ve y se siente como una app nativa, aunque siga siendo la
misma web.

**Android (Chrome):**

1. Abre la URL de Vercel en Chrome.
2. Menú `⋮` (arriba a la derecha) → **Añadir a pantalla de inicio** (o puede que Chrome
   te muestre solo un banner "Instalar app" — dale a Instalar).
3. Aparece un icono como cualquier otra app; al abrirlo no se ve la interfaz de Chrome.

**iPhone (Safari — tiene que ser Safari, no Chrome ni otro navegador):**

1. Abre la URL de Vercel en Safari.
2. Botón de compartir (el cuadrado con la flecha hacia arriba, abajo en el centro).
3. Desplázate y toca **Añadir a pantalla de inicio**.
4. Confirma el nombre ("Guardianes") y **Añadir**.

Una vez instalada, sigue funcionando exactamente igual (misma sincronización, mismos
datos) — la diferencia es solo visual/de acceso. Como es una PWA con service worker, la
carga inicial de la app (HTML/CSS/JS) también queda cacheada para que abra rápido incluso
con mala cobertura; el estado de la casa en sí sigue yendo siempre a `/api/state` en
directo (nunca se sirve una copia vieja desde caché).

### Notas y límites conocidos

- Todo el estado —incluidas las fotos comprimidas en base64— se guarda como un único
  valor `jsonb` en Postgres. Con un uso normal de piso compartido va sobrado, pero si
  algún día acumuláis muchísimas fotos de incidencias, lo lógico sería mover las
  imágenes a un almacenamiento de objetos aparte (p. ej. Vercel Blob) en vez de este
  único blob JSON.
- `SYNC_TOKEN` es una protección ligera para que nadie que encuentre la URL pública de
  Vercel pueda leer o borrar los datos de la casa por casualidad; no es un sistema de
  login por persona.
