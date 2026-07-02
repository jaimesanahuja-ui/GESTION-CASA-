export function Header({ houseName }: { houseName: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-cream-50/90 px-4 py-3 backdrop-blur-sm sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg leading-tight font-extrabold text-brand-700 sm:text-xl">
            🏠 Guardianes de {houseName}
          </h1>
          <p className="text-xs text-ink-500">La casa no se ordena sola, campeón.</p>
        </div>
      </div>
    </header>
  )
}
