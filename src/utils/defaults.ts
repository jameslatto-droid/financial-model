// src/utils/defaults.ts
export type Currency = 'USD' | 'MXN'

export type Defaults = {
  // Currency + FX
  currency: Currency
  fxUSD2MXN: number
  // Finance
  discountRate: number
  taxRate: number
  // Common inputs (A+B)
  occupiedRooms: number
  roomRateUSD: number
  splitA: number
  inflation: number
  // Part A
  aCapexUSD: number
  aEquityPct: number
  aInterest: number
  aTenor: number
  aGrace: number
  aBuildYears: number
  aDepYears: number
  aOpexUSD: number
  // Part B
  bCapexUSD: number
  bEquityPct: number
  bInterest: number
  bTenor: number
  bGrace: number
  bBuildYears: number
  bDepYears: number
  bOpexUSD: number
  bPowerMW: number
  bTariffUSDkWh: number
  // Part C
  cCapexUSD: number
  cEquityPct: number
  cInterest: number
  cTenor: number
  cGrace: number
  cBuildYears: number
  cDepYears: number
  cOpexUSD: number
  cTariffUSDm3: number
  cTariffCurUSDm3: number
};

export const HARD_CODED_BASELINE: Defaults = {
  currency: 'USD',
  fxUSD2MXN: 18.0,
  discountRate: 0.10,
  taxRate: 0.25,
  occupiedRooms: 25000,
  roomRateUSD: 5.7,
  splitA: 0.55,
  inflation: 0.04,
  aCapexUSD: 18_000_000,
  aEquityPct: 0.30,
  aInterest: 0.12,
  aTenor: 10,
  aGrace: 0,
  aBuildYears: 0,
  aDepYears: 10,
  aOpexUSD: 1_500_000,
  bCapexUSD: 22_000_000,
  bEquityPct: 0.30,
  bInterest: 0.12,
  bTenor: 10,
  bGrace: 0,
  bBuildYears: 0,
  bDepYears: 10,
  bOpexUSD: 1_800_000,
  bPowerMW: 6,
  bTariffUSDkWh: 0.12,
  cCapexUSD: 54_444_444,
  cEquityPct: 0.30,
  cInterest: 0.12,
  cTenor: 10,
  cGrace: 0,
  cBuildYears: 0,
  cDepYears: 15,
  cOpexUSD: 3_333_333,
  cTariffUSDm3: 0.80,
  cTariffCurUSDm3: 0.083,
};

const KEY = 'fm-defaults-v1';

export function getDefaults(): Defaults {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return HARD_CODED_BASELINE;
    const parsed = JSON.parse(raw);
    return { ...HARD_CODED_BASELINE, ...parsed };
  } catch {
    return HARD_CODED_BASELINE;
  }
}

export function saveDefaults(d: Partial<Defaults>) {
  const existing = getDefaults();
  const merged = { ...existing, ...d };
  localStorage.setItem(KEY, JSON.stringify(merged));
  return merged as Defaults;
}

export function resetDefaultsToBaseline() {
  localStorage.setItem(KEY, JSON.stringify(HARD_CODED_BASELINE));
  return HARD_CODED_BASELINE;
}
