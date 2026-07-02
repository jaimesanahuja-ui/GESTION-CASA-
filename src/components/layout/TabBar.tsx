import { TABS, type TabId } from './tabs'

export function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <>
      {/* Móvil: barra inferior con scroll horizontal */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-100 bg-cream-50/95 backdrop-blur-sm sm:hidden">
        <div className="flex overflow-x-auto px-1 py-1.5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex min-w-[68px] flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition-colors ${
                active === tab.id ? 'bg-brand-100 text-brand-700' : 'text-ink-500'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Escritorio: sidebar */}
      <nav className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r border-brand-100 bg-white/60 p-3 sm:flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
              active === tab.id ? 'bg-brand-500 text-white shadow-sm' : 'text-ink-700 hover:bg-brand-100'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  )
}
