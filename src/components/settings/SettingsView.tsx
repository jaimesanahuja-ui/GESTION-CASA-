import { useState } from 'react'
import { useApp } from '../../state/AppContext'
import { Card, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Avatar } from '../ui/Avatar'
import { getConfigurableZones } from '../../lib/zones'
import { isRemoteSyncConfigured } from '../../lib/remoteStorage'

const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-ink-500/20'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

const FIELD = 'w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm'
const LABEL = 'mb-1 block text-xs font-semibold text-ink-500'

export function SettingsView() {
  const { state, syncStatus, updateSettings, addUser, updateUser, toggleUserActive, toggleZoneActive } = useApp()
  const [newUserName, setNewUserName] = useState('')
  const [newUserAvatar, setNewUserAvatar] = useState('')
  const zones = getConfigurableZones(state)
  const remoteConfigured = isRemoteSyncConfigured()

  return (
    <div className="flex flex-col gap-4 pb-4">
      <Card>
        <CardTitle>☁️ Sincronización entre dispositivos</CardTitle>
        {remoteConfigured ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-700">
              Todos los compañeros de piso que abran esta misma URL ven y editan la misma casa.
            </p>
            <Badge tone={syncStatus === 'offline' ? 'danger' : syncStatus === 'syncing' ? 'warn' : 'ok'}>
              {syncStatus === 'synced' && '☁️ Sincronizado'}
              {syncStatus === 'syncing' && '☁️ Sincronizando'}
              {syncStatus === 'offline' && '⚠️ Sin conexión'}
              {syncStatus === 'local-only' && '📴 Local'}
            </Badge>
          </div>
        ) : (
          <p className="text-sm text-ink-700">
            De momento cada dispositivo guarda sus propios datos (localStorage). Para compartir la casa entre todo
            el piso, despliega la app en Vercel con una base de datos Redis (ver README, sección "Desplegar en
            Vercel con datos compartidos").
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>🏠 La casa</CardTitle>
        <label className={LABEL}>Nombre de la casa</label>
        <input
          className={FIELD}
          value={state.settings.houseName}
          onChange={(e) => updateSettings({ houseName: e.target.value })}
        />
      </Card>

      <Card>
        <CardTitle>🧑‍🤝‍🧑 Compañeros de piso</CardTitle>
        <ul className="mb-3 flex flex-col gap-2">
          {state.users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-2 rounded-lg bg-brand-50 px-3 py-2">
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <Avatar name={u.name} avatar={u.avatar} size="sm" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
                  value={u.name}
                  onChange={(e) => updateUser(u.id, { name: e.target.value })}
                />
              </span>
              <button
                onClick={() => toggleUserActive(u.id)}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${u.active ? 'bg-ok-50 text-ok-600' : 'bg-ink-500/10 text-ink-500'}`}
              >
                {u.active ? 'Activo' : 'Inactivo'}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            className={`${FIELD} w-16 text-center`}
            placeholder="🐸"
            maxLength={2}
            value={newUserAvatar}
            onChange={(e) => setNewUserAvatar(e.target.value)}
          />
          <input
            className={FIELD}
            placeholder="Nombre del nuevo compañero"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
          <Button
            size="sm"
            disabled={!newUserName.trim()}
            onClick={() => {
              addUser(newUserName.trim(), newUserAvatar.trim())
              setNewUserName('')
              setNewUserAvatar('')
            }}
          >
            Añadir
          </Button>
        </div>
      </Card>

      <Card>
        <CardTitle>🧭 Zonas activas</CardTitle>
        <ul className="flex flex-col gap-2">
          {zones.map((z) => (
            <li key={z.id} className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2">
              <span className="text-sm font-semibold">
                {z.icon} {z.name}
              </span>
              <Toggle checked={z.active} onChange={() => toggleZoneActive(z.id)} />
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Dividir el baño en dos guardianes</p>
            <p className="text-xs text-ink-500">WC + ducha por un lado, lavabo + suelo por otro.</p>
          </div>
          <Toggle checked={state.settings.splitBathroom} onChange={(v) => updateSettings({ splitBathroom: v })} />
        </div>
      </Card>

      <Card>
        <CardTitle>🗓️ Semana y rotación</CardTitle>
        <div className="mb-3">
          <label className={LABEL}>Día de inicio de semana</label>
          <select
            className={FIELD}
            value={state.settings.weekStartDay}
            onChange={(e) => updateSettings({ weekStartDay: Number(e.target.value) })}
          >
            {WEEKDAYS.map((day, i) => (
              <option key={day} value={i}>
                {day}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Permitir semana de descanso</p>
            <p className="text-xs text-ink-500">Si hay más gente que zonas, alguien descansa.</p>
          </div>
          <Toggle checked={state.settings.allowRestWeek} onChange={(v) => updateSettings({ allowRestWeek: v })} />
        </div>
      </Card>

      <Card>
        <CardTitle>🔍 Inspecciones</CardTitle>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Frecuencia</label>
            <select
              className={FIELD}
              value={state.settings.inspectionFrequency}
              onChange={(e) => updateSettings({ inspectionFrequency: e.target.value as 'semanal' | 'mensual' })}
            >
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Hora</label>
            <input
              type="time"
              className={FIELD}
              value={state.settings.inspectionTime}
              onChange={(e) => updateSettings({ inspectionTime: e.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>❌ Strikes y penalización</CardTitle>
        <div className="mb-3">
          <label className={LABEL}>Nº de strikes para penalización</label>
          <input
            type="number"
            min={1}
            className={FIELD}
            value={state.settings.strikesThreshold}
            onChange={(e) => updateSettings({ strikesThreshold: Math.max(1, Number(e.target.value)) })}
          />
        </div>
        <div>
          <label className={LABEL}>Texto de la penalización</label>
          <input
            className={FIELD}
            value={state.settings.penaltyText}
            onChange={(e) => updateSettings({ penaltyText: e.target.value })}
          />
        </div>
      </Card>

      <Card>
        <CardTitle>🏆 Premio mensual</CardTitle>
        <input
          className={FIELD}
          value={state.settings.monthlyReward}
          onChange={(e) => updateSettings({ monthlyReward: e.target.value })}
          placeholder="Cena pagada, cervezas, elige zona primero…"
        />
      </Card>
    </div>
  )
}
