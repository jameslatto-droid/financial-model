import React from 'react'
import { listScenarios, saveScenario, deleteScenario, loadScenario } from '../utils/scenarios'
import { toCSV, downloadCSV } from '../utils/csvExport'

type Props = {
  // Optional callback to provide structured export data: { combined?: any, partA?: any, partB?: any, partC?: any }
  getExportData?: () => any
  onScenarioLoad?: (data: any) => void
}

export default function ScenariosToolbar({ getExportData, onScenarioLoad } : Props) {
  const [name, setName] = React.useState('')
  const [scenarios, setScenarios] = React.useState<any[]>([])
  const [selected, setSelected] = React.useState<string>('')

  React.useEffect(() => {
    setScenarios(listScenarios())
  }, [])

  const refresh = () => setScenarios(listScenarios())

  const handleSave = () => {
    if (!name.trim()) { alert('Please enter a name for the scenario'); return }
    // Gather snapshot: finance + parts if available in localStorage
    const snapshot: any = {}
    try {
      snapshot.finance = JSON.parse(localStorage.getItem('finance:state') || '{}')
    } catch { snapshot.finance = null }
    try { snapshot.partA = JSON.parse(localStorage.getItem('partA:state') || '{}') } catch { snapshot.partA = null }
    try { snapshot.partB = JSON.parse(localStorage.getItem('partB:state') || '{}') } catch { snapshot.partB = null }
    try { snapshot.partC = JSON.parse(localStorage.getItem('partC:state') || '{}') } catch { snapshot.partC = null }
    try { snapshot.combined = JSON.parse(localStorage.getItem('combined:state') || '{}') } catch { snapshot.combined = null }
    // As fallback include entire localStorage for safety
    try {
      const all: Record<string,string> = {}
      for (let i=0;i<localStorage.length;i++) {
        const k = localStorage.key(i) || ''
        all[k] = localStorage.getItem(k) || ''
      }
      snapshot._allLocalStorage = all
    } catch {}

    const ok = saveScenario(name.trim(), snapshot)
    if (ok) {
      refresh()
      setName('')
      alert('Saved scenario: ' + name.trim())
    } else {
      alert('Failed to save scenario')
    }
  }

  const handleLoad = () => {
    if (!selected) { alert('Select a scenario to load'); return }
    const data = loadScenario(selected)
    if (!data) { alert('Scenario not found'); return }
    // restore common keys
    try {
      if (data.finance) localStorage.setItem('finance:state', JSON.stringify(data.finance))
      if (data.partA) localStorage.setItem('partA:state', JSON.stringify(data.partA))
      if (data.partB) localStorage.setItem('partB:state', JSON.stringify(data.partB))
      if (data.partC) localStorage.setItem('partC:state', JSON.stringify(data.partC))
      if (data.combined) localStorage.setItem('combined:state', JSON.stringify(data.combined))
      alert('Scenario loaded. Note: the app may need to be refreshed to apply changes.')
      if (onScenarioLoad) onScenarioLoad(data)
    } catch (e) {
      console.error(e)
      alert('Failed to load scenario')
    }
  }

  const handleDelete = () => {
    if (!selected) { alert('Select a scenario to delete'); return }
    if (!confirm('Delete scenario "'+selected+'"?')) return
    const ok = deleteScenario(selected)
    if (ok) {
      refresh()
      setSelected('')
      alert('Deleted scenario: ' + selected)
    } else alert('Failed to delete scenario')
  }

  const handleExport = (which: 'combined' | 'partA' | 'partB' | 'partC') => {
    let data: any = null
    if (getExportData) {
      const all = getExportData()
      data = all?.[which] ?? all
    }
    // fallback to localStorage keys
    if (!data) {
      try {
        const key = which === 'combined' ? 'combined:state' : (which === 'partA' ? 'partA:state' : which === 'partB' ? 'partB:state' : 'partC:state')
        data = JSON.parse(localStorage.getItem(key) || 'null')
      } catch { data = null }
    }
    if (!data) { alert('No data available to export for ' + which); return }
    const csv = toCSV(data)
    downloadCSV(csv, which + '_export.csv')
  }

  return (
    <section className="panel">
      <h3 className="h2 mb-3">Scenarios</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium">Save current scenario</label>
          <div className="flex gap-2 mt-2">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Scenario name" className="w-full rounded-md border border-neutral-300/70 dark:border-neutral-700 px-2 py-1.5 text-sm bg-transparent" />
            <button onClick={handleSave} className="px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Save</button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Saved scenarios</label>
          <div className="flex gap-2 mt-2">
            <select value={selected} onChange={(e)=>setSelected(e.target.value)} className="w-full rounded-md border border-neutral-300/70 dark:border-neutral-700 px-2 py-1.5 text-sm bg-transparent">
              <option value="">-- select --</option>
              {scenarios.map(s => <option key={s.name} value={s.name}>{s.name} — {new Date(s.created).toLocaleString()}</option>)}
            </select>
            <button onClick={handleLoad} className="px-3 py-1.5 rounded-md border border-neutral-300/70 dark:border-neutral-700 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Load</button>
            <button onClick={handleDelete} className="px-3 py-1.5 rounded-md border border-red-300/70 text-sm text-red-700 hover:bg-red-50">Delete</button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Export CSV</label>
          <div className="flex gap-2 mt-2">
            <button onClick={()=>handleExport('combined')} className="px-3 py-1.5 rounded-md border border-neutral-300/70 text-sm hover:bg-neutral-50">Combined</button>
            <button onClick={()=>handleExport('partA')} className="px-3 py-1.5 rounded-md border border-neutral-300/70 text-sm hover:bg-neutral-50">Part A</button>
            <button onClick={()=>handleExport('partB')} className="px-3 py-1.5 rounded-md border border-neutral-300/70 text-sm hover:bg-neutral-50">Part B</button>
            <button onClick={()=>handleExport('partC')} className="px-3 py-1.5 rounded-md border border-neutral-300/70 text-sm hover:bg-neutral-50">Part C</button>
          </div>
          <p className="text-xs text-neutral-500 mt-2">Exports will attempt to use app-provided data or fall back to localStorage keys.</p>
        </div>
      </div>
    </section>
  )
}
