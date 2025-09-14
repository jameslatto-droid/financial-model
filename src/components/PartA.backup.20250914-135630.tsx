// src/components/PartA.tsx
import React from 'react'
import { useState } from "react"
import KPI from './KPI'

type Currency = 'USD' | 'MXN'

export type PartAComputed = {
  revenue: number
  debtRows: { service: number }[]
  opexSeries: number[]
  cfadsBeforeDebt: number[]
  cfadsAfterDebtSeries: number[]
  projectIRR: number
  equityIRR: number
}
type PartAState = {
  aCapexUSD: number; setACapexUSD: (n: number) => void
  aEquityPct: number; setAEquityPct: (n: number) => void
  aOpexUSD: number;  setAOpexUSD: (n: number) => void
  aInterest: number; setAInterest: (n: number) => void
  aTenor: number;    setATenor: (n: number) => void
}

export default function PartA({
  money, currency, onViewCharts, S, A
}: {
  money: (n: number) => string
  currency: Currency
  onViewCharts: () => void
  S: PartAState
  A: PartAComputed
}) {
  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">
          Part A – Sargassum <span className="text-xs text-slate-400">(Revenue: $/room/day × occupied rooms × 365 × splitA)</span>
        </h2>
        <button onClick={onViewCharts} className="text-xs border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-1">
          View cash flow chart →
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">CAPEX (USD)</label>
          <input type="number" value={S.aCapexUSD} step={500_000} onChange={(e)=>S.setACapexUSD(parseFloat(e.target.value))}
                 className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1" />

          <label className="text-sm font-semibold">Equity share (%)</label>
          <input type="range" min={0} max={1} step={0.01} value={S.aEquityPct}
                 onChange={(e)=>S.setAEquityPct(parseFloat(e.target.value))} className="w-full" />
          <div className="text-xs text-slate-400">{(S.aEquityPct*100).toFixed(0)}% equity / {(100 - S.aEquityPct*100).toFixed(0)}% debt</div>

          <label className="text-sm font-semibold">OPEX (USD/yr, base)</label>
          <input type="number" value={S.aOpexUSD} step={50_000} onChange={(e)=>S.setAOpexUSD(parseFloat(e.target.value))}
                 className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1" />
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Interest (annual, decimal)</label>
            <input type="range" min={0.05} max={0.20} step={0.005} value={S.aInterest}
                   onChange={(e)=>S.setAInterest(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">{S.aInterest.toFixed(3)}</div>
          </div>
          <div>
            <label className="text-sm font-semibold">Tenor (years)</label>
            <input type="range" min={3} max={20} step={1} value={S.aTenor}
                   onChange={(e)=>S.setATenor(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">{S.aTenor} years</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KPI title={`Revenue (yr 1, ${currency})`} value={money(A.revenue)} />
          <KPI title={`Debt service (yr, ${currency})`} value={money(A.debtRows[0]?.service || 0)} />
          <KPI title={`CFADS (yr 1, before debt, ${currency})`} value={money(A.cfadsBeforeDebt[0] || 0)} />
          <KPI title={`CFADS (yr 1, after debt, ${currency})`} value={money(A.cfadsAfterDebtSeries[0] || 0)} />
          <KPI title="IRR (project)" value={`${isNaN(A.projectIRR)?'—':(A.projectIRR*100).toFixed(2)+'%'}`} />
          <KPI title="IRR (equity)" value={`${isNaN(A.equityIRR)?'—':(A.equityIRR*100).toFixed(2)+'%'}`} />
        </div>
      </div>
    </section>
  )
}
