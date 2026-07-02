export function EmptyState({ icon = '🌿', text }: { icon?: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-brand-200 py-8 text-center text-ink-500">
      <span className="text-3xl">{icon}</span>
      <p className="max-w-xs text-sm">{text}</p>
    </div>
  )
}
