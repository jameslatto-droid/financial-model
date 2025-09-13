export type ScenarioRecord = {
  name: string
  created: string
  data: any
}

const SCENARIOS_KEY = 'app:scenarios'

export function listScenarios(): ScenarioRecord[] {
  try {
    const raw = localStorage.getItem(SCENARIOS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ScenarioRecord[]
  } catch {
    return []
  }
}

export function saveScenario(name: string, data: any) {
  try {
    const current = listScenarios()
    const existingIndex = current.findIndex(s => s.name === name)
    const rec = { name, created: new Date().toISOString(), data }
    if (existingIndex >= 0) current[existingIndex] = rec
    else current.push(rec)
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(current))
    return true
  } catch (e) {
    console.error('saveScenario error', e)
    return false
  }
}

export function deleteScenario(name: string) {
  try {
    const current = listScenarios().filter(s => s.name !== name)
    localStorage.setItem(SCENARIOS_KEY, JSON.stringify(current))
    return true
  } catch (e) {
    console.error('deleteScenario error', e)
    return false
  }
}

export function loadScenario(name: string) {
  try {
    const current = listScenarios()
    const found = current.find(s => s.name === name)
    return found?.data
  } catch (e) {
    console.error('loadScenario error', e)
    return null
  }
}
