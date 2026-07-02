import { PhotoInput } from './PhotoInput'

export function MultiPhotoInput({
  photos,
  onChange,
  max = 4,
}: {
  photos: string[]
  onChange: (photos: string[]) => void
  max?: number
}) {
  function setAt(index: number, value: string | null) {
    const next = [...photos]
    if (value === null) next.splice(index, 1)
    else next[index] = value
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {photos.map((p, i) => (
        <PhotoInput key={i} value={p} onChange={(v) => setAt(i, v)} />
      ))}
      {photos.length < max && (
        <PhotoInput value={null} onChange={(v) => v && onChange([...photos, v])} label="Añadir foto" />
      )}
    </div>
  )
}
