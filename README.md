# 🏠 Guardianes de la Casa

App web para gestionar la limpieza y el orden de un piso compartido: roles semanales por
zona, inspecciones sorpresa, strikes, puntos positivos, incidencias con fotos y objetos
perdidos.

Quien ensucia, limpia. El guardián supervisa, no es el mayordomo.

## Stack

- React 19 + TypeScript
- Tailwind CSS v4
- Vite
- Persistencia en `localStorage` (toda la lectura/escritura pasa por `src/lib/storage.ts`,
  así que conectar un backend real como Supabase o Firebase en el futuro es cambiar ese
  archivo, no la UI)

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
