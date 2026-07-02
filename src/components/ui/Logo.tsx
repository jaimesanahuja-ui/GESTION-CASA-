const SHIELD_PATH = 'M36 2L70 15V37C70 57 54 71 36 80C18 71 2 57 2 37V15L36 2Z'
const HOUSE_PATH = 'M36 26L52 37H48.5V56H42V46H30V56H23.5V37H20L36 26Z'

/** Icono de app: escudo con casa dentro, sobre fondo degradado redondeado. */
export function LogoIcon({ size = 42, rounded }: { size?: number; rounded?: number }) {
  const r = rounded ?? Math.round(size * 0.29)
  return (
    <div
      className="grid shrink-0 place-items-center bg-[linear-gradient(145deg,#FF5733,#C8300E)]"
      style={{ width: size, height: size, borderRadius: r, boxShadow: '0 4px 14px rgba(232,64,28,0.38)' }}
    >
      <svg width={size * 0.62} height={size * 0.69} viewBox="0 0 72 80" fill="none">
        <path d={SHIELD_PATH} fill="rgba(255,255,255,0.18)" />
        <path d={HOUSE_PATH} fill="white" />
      </svg>
    </div>
  )
}

/** Solo la marca (escudo + casa), sin caja, para usar sobre fondos claros u oscuros. */
export function LogoMark({ size = 72, shieldColor = '#E8401C', houseColor = 'white' }: { size?: number; shieldColor?: string; houseColor?: string }) {
  return (
    <svg width={size} height={(size * 80) / 72} viewBox="0 0 72 80" fill="none">
      <path d={SHIELD_PATH} fill={shieldColor} />
      <path d={HOUSE_PATH} fill={houseColor} />
    </svg>
  )
}
