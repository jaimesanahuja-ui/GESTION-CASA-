import { useState } from 'react'
import { AppProvider, useApp } from './state/AppContext'
import { Header } from './components/layout/Header'
import { TabBar } from './components/layout/TabBar'
import type { TabId } from './components/layout/tabs'
import { Dashboard } from './components/dashboard/Dashboard'
import { GuardiansView } from './components/guardians/GuardiansView'
import { InspectionsView } from './components/inspections/InspectionsView'
import { IncidentsView } from './components/incidents/IncidentsView'
import { LostItemsView } from './components/lostitems/LostItemsView'
import { RankingView } from './components/ranking/RankingView'
import { StrikesView } from './components/strikes/StrikesView'
import { SettingsView } from './components/settings/SettingsView'

function Shell() {
  const { state, syncStatus } = useApp()
  const [tab, setTab] = useState<TabId>('dashboard')

  return (
    <div className="flex min-h-svh flex-col sm:flex-row">
      <TabBar active={tab} onChange={setTab} />
      <div className="flex-1">
        <Header houseName={state.settings.houseName} syncStatus={syncStatus} />
        <main className="mx-auto max-w-3xl px-4 pt-4 pb-24 sm:px-6 sm:pb-8">
          {tab === 'dashboard' && <Dashboard onNavigate={setTab} />}
          {tab === 'guardians' && <GuardiansView />}
          {tab === 'inspections' && <InspectionsView />}
          {tab === 'incidents' && <IncidentsView />}
          {tab === 'lostitems' && <LostItemsView />}
          {tab === 'ranking' && <RankingView />}
          {tab === 'strikes' && <StrikesView />}
          {tab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}

export default App
