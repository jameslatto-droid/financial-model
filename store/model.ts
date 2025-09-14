import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ModelState, CommonInputs, RevenueStreams, PartA, PartB, PartC } from '@/types/domain'

// ADD just under your imports (below the existing 'type Actions' is fine)
type DashboardCompat = {
  /** values the dashboard reads directly */
  occupiedRoomsPerDay: number;
  occupiedRooms: number;          // alias (some components use this name)
  usdPerRoomPerDay: number;       // $ per occupied room per day
  taxRate: number;                // 0..1 (e.g. 0.16 = 16%)
};

// EXTEND your Actions type
type Actions = {
  setCommon:  (p: Partial<CommonInputs>) => void
  setRevenue: (p: Partial<RevenueStreams>) => void
  setPartA:   (p: Partial<PartA>) => void
  setPartB:   (p: Partial<PartB>) => void
  setPartC:   (p: Partial<PartC>) => void
  reset: () => void
  loadExample: () => void

  // NEW:
  setOccupiedRoomsPerDay: (n: number) => void
  setOccupiedRooms: (n: number) => void
  setUsdPerRoomPerDay: (n: number) => void
  setTaxRate: (n: number) => void
}


- const initial: ModelState = {
const initial: ModelState & DashboardCompat = {
  common: { projectName: 'Sanitation Tariff Dashboard', buildYears: 2, opsYears: 30, inflationPct: 3, discountRatePct: 12, currency: 'USD', usdToMxn: 17.0, startYear: new Date().getFullYear() },
  revenue: { trustFundUSDPerYear: 42_000_000, tariffUSDPerM3: 0.50, daysPerYear: 365 },

  // Requested defaults
  partA: { option: 'HYBRID', includeWashing: false, capexUSD: 32_000_000, opexUSDPerYear: 12_000_000 },
  partB: { mode: 'AD_BASE', throughputTpd: 600, capexUSD: 30_000_000, opexUSDPerYear: 9_000_000 },

  partC: { scenario: 'C1_3_SITES', flowM3PerDay: 60_000, tech: 'SBR', capexUSD: 0, opexUSDPerYear: 0, sendSludgeToPartB: true },

  // Dashboard fields
  occupiedRoomsPerDay: 37_500,
  occupiedRooms: 37_500,   // kept in sync by setOccupiedRoomsPerDay
  usdPerRoomPerDay: 1.5,
  taxRate: 0.16,           // 16%
}

- export const useModel = create<ModelState & Actions>()(
+ export const useModel = create<ModelState & DashboardCompat & Actions>()(
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

        // NEW setters (keep alias in sync)
        setOccupiedRoomsPerDay: (n) => set(() => ({ occupiedRoomsPerDay: n, occupiedRooms: n })),
        setOccupiedRooms:       (n) => set(() => ({ occupiedRooms: n })),
        setUsdPerRoomPerDay:    (n) => set(() => ({ usdPerRoomPerDay: n })),
        setTaxRate:             (n) => set(() => ({ taxRate: n })),
      }),
      { name: 'sanitation-tariff-dashboard' }
    )
  )
)
