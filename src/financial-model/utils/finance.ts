// src/utils/finance.ts
export function irr(cashflows: number[]): number {
  // Bisection IRR; cashflows [t0, t1..tN]
  const npvAt = (r: number) => cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + r, t), 0);
  let low = -0.95, high = 5;
  let fLow = npvAt(low), fHigh = npvAt(high);
  if (fLow * fHigh > 0) return Number.NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (low + high) / 2;
    const fMid = npvAt(mid);
    if (Math.abs(fMid) < 1e-8) return mid;
    if (fLow * fMid < 0) { high = mid; fHigh = fMid; } else { low = mid; fLow = fMid; }
  }
  return (low + high) / 2;
}

export function npv(rate: number, cashflows: number[]): number {
  return cashflows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}

/**
 * Simple payback in years (no discounting) based on cumulative cash flow crossing >= 0.
 * Returns fractional years when the crossing happens mid-year. Returns NaN if never paid back.
 */
export function paybackYears(cashflows: number[]): number {
  // cashflows: [t0, t1, ...] with t0 likely negative
  let cum = cashflows[0] || 0;
  if (cum >= 0) return 0;
  for (let t = 1; t < cashflows.length; t++) {
    const prev = cum;
    cum += cashflows[t];
    if (cum >= 0) {
      const over = cum - 0;
      const segment = cashflows[t];
      const frac = segment !== 0 ? (segment - over) / Math.max(Math.abs(segment), 1e-12) : 0;
      return (t - 1) + (1 - frac); // interpolate within the year
    }
  }
  return Number.NaN;
}

export function buildDebtSchedule(PV: number, r: number, n: number) {
  const A = PV > 0 ? (r * PV) / (1 - Math.pow(1 + r, -n)) : 0;
  const rows: { year: number; interest: number; principal: number; remaining: number; service: number }[] = [];
  let remaining = PV;
  for (let t = 1; t <= n; t++) {
    const interest = remaining * r;
    const principal = Math.max(0, A - interest);
    remaining = Math.max(0, remaining - principal);
    rows.push({ year: t, interest, principal, remaining, service: A });
  }
  return { rows, A };
}

export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
