import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ModelState, CommonInputs, RevenueStreams, PartA, PartB, PartC } from '@/types/domain'

type Actions = {
  setCommon:  (p: Partial<CommonInputs>) => void
  setRevenue: (p: Partial<RevenueStreams>) => void
  setPartA:   (p: Partial<PartA>) => void
  setPartB:   (p: Partial<PartB>) => void
  setPartC:   (p: Partial<PartC>) => void
  reset: () => void
  loadExample: () => void
}

const initial: ModelState = {
  common: { projectName: 'Sanitation Tariff Dashboard', buildYears: 2, opsYears: 30, inflationPct: 3, discountRatePct: 12, currency: 'USD', usdToMxn: 17.0, startYear: new Date().getFullYear() },
  revenue: { trustFundUSDPerYear: 42_000_000, tariffUSDPerM3: 0.50, daysPerYear: 365 },
  partA:   { option: 'HYBRID', includeWashing: false, capexUSD: 0, opexUSDPerYear: 0 },
  partB:   { mode: 'AD_BASE', throughputTpd: 600, capexUSD: 0, opexUSDPerYear: 0 },
  partC:   { scenario: 'C1_3_SITES', flowM3PerDay: 60_000, tech: 'SBR', capexUSD: 0, opexUSDPerYear: 0, sendSludgeToPartB: true },
}

export const useModel = create<ModelState & Actions>()(
  devtools(
    persist(
      (set) => ({
        ...initial,
        setCommon:  (p) => set((s) => ({ common:  { ...s.common,  ...p } })),
        setRevenue: (p) => set((s) => ({ revenue: { ...s.revenue, ...p } })),
        setPartA:   (p) => set((s) => ({ partA:   { ...s.partA,   ...p } })),
        setPartB:   (p) => set((s) => ({ partB:   { ...s.partB,   ...p } })),
        setPartC:   (p) => set((s) => ({ partC:   { ...s.partC,   ...p } })),
        reset: () => set(() => initial),
        loadExample: () => set(() => initial),
      }),
      { name: 'sanitation-tariff-dashboard' }
    )
  )
)
