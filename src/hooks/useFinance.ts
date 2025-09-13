import { useEffect, useState } from "react"

export type FinanceState = {
  currency: "USD" | "MXN"
  fx: number
  discount: number // decimal e.g., 0.10
  tax: number // decimal
  depreciationYears: number
  buildYears: number
  graceYears: number
}

const KEY = "finance:state"

const DEFAULTS: FinanceState = {
  currency: "USD",
  fx: 17.0,
  discount: 0.10,
  tax: 0.16,
  depreciationYears: 10,
  buildYears: 2,
  graceYears: 0
}

export function useFinance() {
  const [state, setState] = useState<FinanceState>(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return JSON.parse(raw) as FinanceState
    } catch {}
    return DEFAULTS
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch {}
  }, [state])

  function setFinance(updater: Partial<FinanceState> | ((s: FinanceState)=>FinanceState)) {
    setState(s => {
      const next = typeof updater === "function" ? updater(s) : { ...s, ...updater }
      return next
    })
  }

  function reset() {
    setState(DEFAULTS)
    try { localStorage.setItem(KEY, JSON.stringify(DEFAULTS)) } catch {}
  }

  return { state, setFinance, reset }
}
