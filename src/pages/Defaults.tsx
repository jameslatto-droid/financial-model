// src/pages/Defaults.tsx
import React, { useMemo, useState } from 'react'
import { getDefaults, saveDefaults, resetDefaultsToBaseline, type Defaults } from '../utils/defaults'

type Props = {
  onBack: () => void
}

export default function DefaultsPage({ onBack }: Props) {
  const [vals, setVals] = useState<Defaults>(() => getDefaults())

  const set = <K extends keyof Defaults>(k: K, v: Defaults[K]) =>
    setVals(prev => ({ ...prev, [k]: v }))

  const numberInput = (k: keyof Defaults, step = 1, min?: number, max?: number) => (
    <input
      type="number"
      className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1"
      step={step}
      value={Number(vals[k] as number)}
      min={min as number | undefined}
      max={max as number | undefined}
      onChange={e => set(k as any, parseFloat(e.target.value))}
    />
  )

  const savedHint = useMemo(() => {
    try { return localStorage.getItem('fm-defaults-v1')?.length ?? 0 } catch { return 0 }
  }, [vals])

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-xs border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-1">← Back to dashboard</button>
          <div className="flex gap-2">
            <button
              onClick={() => { saveDefaults(vals) }}
              className="text-xs border border-emerald-700 hover:bg-emerald-800 rounded-lg px-3 py-1"
              title="Save these values as your defaults (stored in localStorage)"
            >
              Save defaults
            </button>
            <button
              onClick={() => { setVals(resetDefaultsToBaseline()) }}
              className="text-xs border border-rose-700 hover:bg-rose-800 rounded-lg px-3 py-1"
              title="Revert editor to the hard-coded baseline"
            >
              Reset to baseline
            </button>
          </div>
        </div>

        <h1 className="text-xl font-semibold">Default Values</h1>
        <p className="text-slate-400 text-sm">Edit everything here, click <em>Save defaults</em>, then on the Dashboard click <em>Apply saved defaults</em> to push them into the live model.</p>

        {/* Currency & Finance */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <h2 className="font-semibold mb-3">Currency & Finance</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-semibold">Currency</label>
              <select
                value={vals.currency}
                onChange={e => set('currency', e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1"
              >
                <option value="USD">USD</option>
                <option value="MXN">MXN</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">USD→MXN</label>
              {numberInput('fxUSD2MXN', 0.1)}
            </div>
            <div>
              <label className="text-sm font-semibold">Discount rate</label>
              {numberInput('discountRate', 0.005, 0, 1)}
            </div>
            <div>
              <label className="text-sm font-semibold">Tax rate</label>
              {numberInput('taxRate', 0.01, 0, 1)}
            </div>
          </div>
        </section>

        {/* Common */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <h2 className="font-semibold mb-3">Common (A & B)</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div><label className="text-sm font-semibold">Occupied rooms/day</label>{numberInput('occupiedRooms', 100, 0)}</div>
            <div><label className="text-sm font-semibold">$ per room per day (USD)</label>{numberInput('roomRateUSD', 0.1, 0)}</div>
            <div><label className="text-sm font-semibold">Split to Part A (0–1)</label>{numberInput('splitA', 0.01, 0, 1)}</div>
            <div><label className="text-sm font-semibold">Inflation (0–1)</label>{numberInput('inflation', 0.0025, 0, 1)}</div>
          </div>
        </section>

        {/* Part A */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <h2 className="font-semibold mb-3">Part A</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div><label className="text-sm font-semibold">CAPEX (USD)</label>{numberInput('aCapexUSD', 100000)}</div>
            <div><label className="text-sm font-semibold">Equity % (0–1)</label>{numberInput('aEquityPct', 0.01, 0, 1)}</div>
            <div><label className="text-sm font-semibold">Interest (0–1)</label>{numberInput('aInterest', 0.005, 0, 1)}</div>
            <div><label className="text-sm font-semibold">Tenor (yrs)</label>{numberInput('aTenor', 1, 1)}</div>
            <div><label className="text-sm font-semibold">Grace (yrs)</label>{numberInput('aGrace', 1, 0)}</div>
            <div><label className="text-sm font-semibold">Build (yrs)</label>{numberInput('aBuildYears', 1, 0)}</div>
            <div><label className="text-sm font-semibold">Depreciation (yrs)</label>{numberInput('aDepYears', 1, 1)}</div>
            <div><label className="text-sm font-semibold">OPEX / yr (USD)</label>{numberInput('aOpexUSD', 10000, 0)}</div>
          </div>
        </section>

        {/* Part B */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <h2 className="font-semibold mb-3">Part B</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div><label className="text-sm font-semibold">CAPEX (USD)</label>{numberInput('bCapexUSD', 100000)}</div>
            <div><label className="text-sm font-semibold">Equity % (0–1)</label>{numberInput('bEquityPct', 0.01, 0, 1)}</div>
            <div><label className="text-sm font-semibold">Interest (0–1)</label>{numberInput('bInterest', 0.005, 0, 1)}</div>
            <div><label className="text-sm font-semibold">Tenor (yrs)</label>{numberInput('bTenor', 1, 1)}</div>
            <div><label className="text-sm font-semibold">Grace (yrs)</label>{numberInput('bGrace', 1, 0)}</div>
            <div><label className="text-sm font-semibold">Build (yrs)</label>{numberInput('bBuildYears', 1, 0)}</div>
            <div><label className="text-sm font-semibold">Depreciation (yrs)</label>{numberInput('bDepYears', 1, 1)}</div>
            <div><label className="text-sm font-semibold">OPEX / yr (USD)</label>{numberInput('bOpexUSD', 10000, 0)}</div>
            <div><label className="text-sm font-semibold">Power (MW)</label>{numberInput('bPowerMW', 0.1, 0)}</div>
            <div><label className="text-sm font-semibold">Tariff (USD/kWh)</label>{numberInput('bTariffUSDkWh', 0.005, 0)}</div>
          </div>
        </section>

        {/* Part C */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
          <h2 className="font-semibold mb-3">Part C</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div><label className="text-sm font-semibold">CAPEX (USD)</label>{numberInput('cCapexUSD', 100000)}</div>
            <div><label className="text-sm font-semibold">Equity % (0–1)</label>{numberInput('cEquityPct', 0.01, 0, 1)}</div>
            <div><label className="text-sm font-semibold">Interest (0–1)</label>{numberInput('cInterest', 0.005, 0, 1)}</div>
            <div><label className="text-sm font-semibold">Tenor (yrs)</label>{numberInput('cTenor', 1, 1)}</div>
            <div><label className="text-sm font-semibold">Grace (yrs)</label>{numberInput('cGrace', 1, 0)}</div>
            <div><label className="text-sm font-semibold">Build (yrs)</label>{numberInput('cBuildYears', 1, 0)}</div>
            <div><label className="text-sm font-semibold">Depreciation (yrs)</label>{numberInput('cDepYears', 1, 1)}</div>
            <div><label className="text-sm font-semibold">OPEX / yr (USD)</label>{numberInput('cOpexUSD', 10000, 0)}</div>
            <div><label className="text-sm font-semibold">Target tariff (USD/m³)</label>{numberInput('cTariffUSDm3', 0.01, 0)}</div>
            <div><label className="text-sm font-semibold">Current tariff (USD/m³)</label>{numberInput('cTariffCurUSDm3', 0.001, 0)}</div>
          </div>
        </section>

        <div className="text-xs text-slate-500">Defaults payload size: {savedHint} chars</div>
      </div>
    </div>
  )
}
