const PALETTE = ['bg-brand-200 text-brand-800', 'bg-ok-50 text-ok-600', 'bg-warn-50 text-warn-600', 'bg-danger-50 text-danger-600']

function colorFor(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function Avatar({
  name,
  avatar,
  size = 'md',
}: {
  name: string
  avatar?: string | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClasses = { sm: 'h-7 w-7 text-sm', md: 'h-10 w-10 text-lg', lg: 'h-14 w-14 text-2xl' }[size]
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className={`grid shrink-0 place-items-center rounded-full font-bold ${colorFor(name)} ${sizeClasses}`}>
      {avatar || initials}
    </div>
  )
}
