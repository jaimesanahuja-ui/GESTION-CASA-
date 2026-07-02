import { TABS, type TabId } from './tabs'
import { TabIcon } from './TabIcon'
import { LogoIcon } from '../ui/Logo'

export function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <>
      {/* Móvil: píldora flotante oscura con blur */}
      <nav
        className="fixed inset-x-3.5 bottom-6 z-40 flex items-center justify-around gap-0.5 overflow-x-auto rounded-full bg-ink-950/93 px-1.5 py-2.5 backdrop-blur-2xl sm:hidden"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.24), 0 0 0 0.5px rgba(255,255,255,0.08)' }}
      >
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-full px-2.5 py-2 transition-colors ${
                isActive ? 'bg-brand-500/22' : ''
              }`}
            >
              <TabIcon id={tab.id} color={isActive ? '#FF8060' : 'rgba(255,255,255,0.38)'} />
              <span className={`text-[7px] ${isActive ? 'font-bold text-brand-300' : 'font-medium text-white/38'}`}>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Escritorio: sidebar oscuro */}
      <nav className="sticky top-0 hidden h-svh w-56 shrink-0 flex-col gap-1 overflow-y-auto bg-ink-950 p-3 sm:flex">
        <div className="mb-3 flex items-center gap-2.5 px-2 pt-1">
          <LogoIcon size={32} />
          <span className="text-lg font-black tracking-tight text-white">HOME</span>
        </div>
        {TABS.map((tab) => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                isActive ? 'bg-brand-500/22 text-brand-300' : 'text-white/38 hover:bg-white/5 hover:text-white/70'
              }`}
            >
              <TabIcon id={tab.id} color={isActive ? '#FF8060' : 'currentColor'} />
              {tab.label}
            </button>
          )
        })}
      </nav>
    </>
  )
}
