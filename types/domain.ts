export type Currency = 'USD' | 'MXN'

export interface CommonInputs {
  projectName: string
  buildYears: 1 | 2
  opsYears: number
  inflationPct: number
  discountRatePct: number
  currency: Currency
  usdToMxn: number
  startYear: number
}

export interface RevenueStreams {
  trustFundUSDPerYear: number
  tariffUSDPerM3: number
  daysPerYear: number
}

export interface PartA {
  option: 'OWN_2_DAMEN' | 'LEASE_2_DAMEN' | 'NEARSHORE' | 'HYBRID'
  includeWashing: boolean
  capexUSD: number
  opexUSDPerYear: number
}
export interface PartB {
  mode: 'AD_BASE' | 'AD_INCIN_HYBRID'
  throughputTpd: number
  capexUSD: number
  opexUSDPerYear: number
}
export interface PartC {
  scenario: 'C1_3_SITES' | 'C2_2_SITES'
  flowM3PerDay: number
  tech: 'SBR'
  capexUSD: number
  opexUSDPerYear: number
  sendSludgeToPartB: boolean
}

export interface ModelState {
  common: CommonInputs
  revenue: RevenueStreams
  partA: PartA
  partB: PartB
  partC: PartC
}
