import React from 'react'
import CombinedCharts from '../components/charts/CombinedCharts'
import { useCombinedDatasets } from '../hooks/useDatasets'

export default function Charts() {
  const buildYears = 2
  const opsYears = 30
  const N = buildYears + opsYears
  const totalCapex = 42_000_000

  const revenueAt = (year: number) => (year <= buildYears ? 0 : 42_000_000)
  const opexAt = (year: number) => (year <= buildYears ? 0 : 15_000_000)
  const debtSvcAt = (year: number) => (year <= buildYears ? 0 : (year <= buildYears + 15 ? 2_500_000 : 0))
  const cfadsBeforeDebtSeries = Array.from({ length: N }, (_, i) => (i + 1 <= buildYears ? -totalCapex / buildYears : 42_000_000 - 15_000_000))
  const remainingDebtAt = (year: number) => Math.max(0, totalCapex - (year - 1) * (totalCapex / 20))

  const { cashFlowData, revNetData } = useCombinedDatasets(N, totalCapex, revenueAt, opexAt, debtSvcAt, cfadsBeforeDebtSeries, remainingDebtAt)

  const withCumulative = revNetData.map((r:any) => ({ ...r }))
  let cum = 0
  withCumulative.forEach((row:any) => {
    cum += Number(row.NetAfterDebt || 0)
    row.CumulativeNet = cum
  })

  return (
    <div className="space-y-6">
      <h1 className="h1">Project Charts</h1>
      <p className="text-sm text-neutral-500">Combined cash flow and revenue/net. Data is demo-only for now.</p>
      <CombinedCharts cashFlowData={cashFlowData} revNetData={withCumulative} currency="USD" />
    </div>
  )
}
