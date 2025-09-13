// src/utils/scenario.ts
export type Scenario = {
  name: string
  savedAt: number
  state: Record<string, any>
}

const KEY = 'fm_scenarios_v1'

function readAll(): Scenario[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    return list
  } catch { return [] }
}

function writeAll(list: Scenario[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function listScenarios(): Scenario[] {
  return readAll().sort((a,b)=>b.savedAt - a.savedAt)
}

export function saveScenario(name: string, state: Record<string, any>) {
  const list = readAll().filter(s => s.name !== name)
  list.push({ name, savedAt: Date.now(), state })
  writeAll(list)
}

export function loadScenario(name: string): Scenario | undefined {
  return readAll().find(s => s.name === name)
}

export function deleteScenario(name: string) {
  const list = readAll().filter(s => s.name !== name)
  writeAll(list)
}
