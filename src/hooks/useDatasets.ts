// src/hooks/useDatasets.ts
import { useMemo } from 'react'

type DebtRow = { service: number; remaining?: number }

function safe(n: any) { const x = Number(n); return isFinite(x) ? x : 0 }

export function usePartDatasets(
  n: number,
  capex: number,
  revenue: number,
  opexSeries: number[],
  debtRows: DebtRow[],
  cfadsBeforeDebt: number[]
) {
  return useMemo(() => {
    const burnData: any[] = []
    const revNetData: any[] = []
    const cashFlowData: any[] = []
    const expenseData: any[] = []

    burnData.push({ year: 0, OPEX: 0, DebtService: 0, CFADS: -safe(capex) })
    revNetData.push({ year: 0, Revenue: 0, NetAfterDebt: -safe(capex) })
    cashFlowData.push({ year: 0, Operating: 0, Investing: -safe(capex), Financing: 0, Net: -safe(capex) })
    expenseData.push({ year: 0, OPEX: 0, DebtService: 0 })

    for (let t = 1; t <= n; t++) {
      const opex = safe(opexSeries[t-1])
      const svc  = safe(debtRows[t-1]?.service)
      const cf   = safe(cfadsBeforeDebt[t-1])

      burnData.push({ year: t, OPEX: -opex, DebtService: -svc, CFADS: cf })
      revNetData.push({ year: t, Revenue: safe(revenue), NetAfterDebt: cf - svc })
      cashFlowData.push({ year: t, Operating: cf, Investing: 0, Financing: -svc, Net: cf - svc })
      expenseData.push({ year: t, OPEX: -opex, DebtService: -svc })
    }

    return { burnData, revNetData, cashFlowData, expenseData }
  }, [n, capex, revenue, opexSeries, debtRows, cfadsBeforeDebt])
}

export function useCombinedDatasets(
  N: number,
  totalCapex: number,
  revenueAt: (year:number)=>number,
  opexAt: (year:number)=>number,
  debtSvcAt: (year:number)=>number,
  cfadsBeforeDebtSeries: number[],
  remainingDebtAt: (year:number)=>number
) {
  return useMemo(() => {
    const burnData:any[] = []
    const revNetData:any[] = []
    const cashFlowData:any[] = []
    const expenseData:any[] = []

    burnData.push({ year: 0, OPEX: 0, DebtService: 0, CFADS: -safe(totalCapex) })
    revNetData.push({ year: 0, Revenue: 0, NetAfterDebt: -safe(totalCapex) })
    cashFlowData.push({ year: 0, Operating: 0, Investing: -safe(totalCapex), Financing: 0, Net: -safe(totalCapex) })
    expenseData.push({ year: 0, OPEX: 0, DebtService: 0 })

    for (let y = 1; y <= N; y++) {
      const rev = safe(revenueAt(y))
      const ox  = safe(opexAt(y))
      const svc = safe(debtSvcAt(y))
      const cf  = safe(cfadsBeforeDebtSeries[y-1])

      burnData.push({ year: y, OPEX: -ox, DebtService: -svc, CFADS: cf })
      revNetData.push({ year: y, Revenue: rev, NetAfterDebt: cf - svc })
      cashFlowData.push({ year: y, Operating: cf, Investing: 0, Financing: -svc, Net: cf - svc })
      expenseData.push({ year: y, OPEX: -ox, DebtService: -svc })
    }

    return { burnData, revNetData, cashFlowData, expenseData }
  }, [N, totalCapex, revenueAt, opexAt, debtSvcAt, cfadsBeforeDebtSeries, remainingDebtAt])
}
