import { useRef, useState } from 'react'
import { fileToCompressedDataUrl } from '../../lib/image'

export function PhotoInput({
  value,
  onChange,
  label = 'Añadir foto (opcional)',
}: {
  value: string | null
  onChange: (dataUrl: string | null) => void
  label?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setLoading(true)
    try {
      const dataUrl = await fileToCompressedDataUrl(file)
      onChange(dataUrl)
    } finally {
      setLoading(false)
    }
  }

  if (value) {
    return (
      <div className="relative inline-block">
        <img src={value} alt="Foto subida" className="h-28 w-28 rounded-xl object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center rounded-full bg-danger-500 text-xs text-white shadow"
          aria-label="Quitar foto"
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex h-28 w-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-300 text-brand-500 hover:bg-brand-50 disabled:opacity-50"
      >
        <span className="text-2xl">{loading ? '⏳' : '📷'}</span>
        <span className="px-1 text-center text-[11px] leading-tight">{loading ? 'Subiendo…' : label}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
