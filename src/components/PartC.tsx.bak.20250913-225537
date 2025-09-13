// src/components/PartC.tsx
import React from 'react'
import KPI from './KPI'

type Currency = 'USD' | 'MXN'
export type PartCComputed = {
  revenueCurrent: number
  revenueTarget: number
  debtRows: { service: number }[]
  opexSeries: number[]
  cfadsBeforeDebt_tgt: number[]
  cfadsAfterDebtSeries_tgt: number[]
  projectIRR: number
  equityIRR: number
}
type PartCState = {
  wasteDay: number
  cCapexUSD: number; setCCapexUSD: (n:number)=>void
  cEquityPct: number; setCEquityPct: (n:number)=>void
  cOpexUSD: number;  setCOpexUSD: (n:number)=>void
  cInterest: number; setCInterest: (n:number)=>void
  cTenor: number;    setCTenor: (n:number)=>void
  cTariffUSDm3: number; setCTariffUSDm3: (n:number)=>void
  cTariffCurUSDm3: number; setCTariffCurUSDm3: (n:number)=>void
}

export default function PartC({
  money, currency, onViewCharts, S, C
}: {
  money:(n:number)=>string
  currency:Currency
  onViewCharts:()=>void
  S:PartCState
  C:PartCComputed
}) {
  const wasteYear = S.wasteDay * 365

  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">
          Part C – Water Treatment <span className="text-xs text-slate-400">(Revenue: tariff × {S.wasteDay.toLocaleString()} m³/day × 365)</span>
        </h2>
        <button onClick={onViewCharts} className="text-xs border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-1">
          View cash flow chart →
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Flow (m³/day)</label>
          <input disabled value={S.wasteDay.toLocaleString()} className="w-full bg-slate-950/60 border border-slate-800 rounded-md px-2 py-1" />

          <label className="text-sm font-semibold">CAPEX (USD)</label>
          <input type="number" value={S.cCapexUSD} step={1_000_000} onChange={(e)=>S.setCCapexUSD(parseFloat(e.target.value))}
                 className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1" />

          <label className="text-sm font-semibold">Equity share (%)</label>
          <input type="range" min={0} max={1} step={0.01} value={S.cEquityPct}
                 onChange={(e)=>S.setCEquityPct(parseFloat(e.target.value))} className="w-full" />
          <div className="text-xs text-slate-400">{(S.cEquityPct*100).toFixed(0)}% equity / {(100 - S.cEquityPct*100).toFixed(0)}% debt</div>

          <label className="text-sm font-semibold">OPEX (USD/yr, base)</label>
          <input type="number" value={S.cOpexUSD} step={100_000} onChange={(e)=>S.setCOpexUSD(parseFloat(e.target.value))}
                 className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1" />
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Sanitation tariff – target (USD/m³)</label>
            <input type="range" min={0.2} max={2.5} step={0.01} value={S.cTariffUSDm3}
                   onChange={(e)=>S.setCTariffUSDm3(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">{S.cTariffUSDm3.toFixed(3)} USD/m³</div>
          </div>
          <div>
            <label className="text-sm font-semibold">Sanitation tariff – current (USD/m³)</label>
            <input type="range" min={0} max={1} step={0.005} value={S.cTariffCurUSDm3}
                   onChange={(e)=>S.setCTariffCurUSDm3(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">{S.cTariffCurUSDm3.toFixed(3)} USD/m³</div>
          </div>
          <div>
            <label className="text-sm font-semibold">Interest (annual, decimal)</label>
            <input type="range" min={0.05} max={0.20} step={0.005} value={S.cInterest}
                   onChange={(e)=>S.setCInterest(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">{S.cInterest.toFixed(3)}</div>
          </div>
          <div>
            <label className="text-sm font-semibold">Tenor (years)</label>
            <input type="range" min={3} max={20} step={1} value={S.cTenor}
                   onChange={(e)=>S.setCTenor(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">{S.cTenor} years</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPI title="Wastewater (m³/yr)" value={wasteYear.toLocaleString()} />
          <KPI title={`Revenue (yr 1, current, ${currency})`} value={money(C.revenueCurrent)} />
          <KPI title={`Revenue (yr 1, target, ${currency})`} value={money(C.revenueTarget)} />
          <KPI title={`Debt service (yr, ${currency})`} value={money(C.debtRows[0]?.service || 0)} />
          <KPI title={`CFADS (yr 1, before debt, ${currency})`} value={money(C.cfadsBeforeDebt_tgt[0] || 0)} />
          <KPI title={`CFADS (yr 1, after debt, ${currency})`} value={money(C.cfadsAfterDebtSeries_tgt[0] || 0)} />
          <KPI title="IRR (project)" value={`${isNaN(C.projectIRR)?'—':(C.projectIRR*100).toFixed(2)+'%'}`} />
          <KPI title="IRR (equity)" value={`${isNaN(C.equityIRR)?'—':(C.equityIRR*100).toFixed(2)+'%'}`} />
        </div>
      </div>
    </section>
  )
}
