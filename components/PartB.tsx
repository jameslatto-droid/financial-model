// src/components/PartB.tsx
import React from 'react'
import KPI from './KPI'

type Currency = 'USD' | 'MXN'
export type PartBComputed = {
  roomRevenue: number
  powerRevenue: number
  revenue: number
  debtRows: { service: number }[]
  opexSeries: number[]
  cfadsBeforeDebt: number[]
  cfadsAfterDebtSeries: number[]
  projectIRR: number
  equityIRR: number
}
type PartBState = {
  bCapexUSD: number; setBCapexUSD: (n:number)=>void
  bEquityPct: number; setBEquityPct: (n:number)=>void
  bOpexUSD: number;  setBOpexUSD: (n:number)=>void
  bInterest: number; setBInterest: (n:number)=>void
  bTenor: number;    setBTenor: (n:number)=>void
  bPowerMW: number;  setBPowerMW: (n:number)=>void
  bTariffUSDkWh: number; setBTariffUSDkWh: (n:number)=>void
}

export default function PartB({
  money, currency, onViewCharts, S, B
}: {
  money: (n:number)=>string
  currency: Currency
  onViewCharts: ()=>void
  S: PartBState
  B: PartBComputed
}) {
  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">
          Part B – Biomass <span className="text-xs text-slate-400">(Room split + electricity sales)</span>
        </h2>
        <button onClick={onViewCharts} className="text-xs border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-1">
          View cash flow chart →
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">CAPEX (USD)</label>
          <input type="number" value={S.bCapexUSD} step={500_000} onChange={(e)=>S.setBCapexUSD(parseFloat(e.target.value))}
                 className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1" />

          <label className="text-sm font-semibold">Equity share (%)</label>
          <input type="range" min={0} max={1} step={0.01} value={S.bEquityPct}
                 onChange={(e)=>S.setBEquityPct(parseFloat(e.target.value))} className="w-full" />
          <div className="text-xs text-slate-400">{(S.bEquityPct*100).toFixed(0)}% equity / {(100 - S.bEquityPct*100).toFixed(0)}% debt</div>

          <label className="text-sm font-semibold">OPEX (USD/yr, base)</label>
          <input type="number" value={S.bOpexUSD} step={50_000} onChange={(e)=>S.setBOpexUSD(parseFloat(e.target.value))}
                 className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1" />
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold">Interest (annual, decimal)</label>
            <input type="range" min={0.05} max={0.20} step={0.005} value={S.bInterest}
                   onChange={(e)=>S.setBInterest(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">{S.bInterest.toFixed(3)}</div>
          </div>
          <div>
            <label className="text-sm font-semibold">Tenor (years)</label>
            <input type="range" min={3} max={20} step={1} value={S.bTenor}
                   onChange={(e)=>S.setBTenor(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">{S.bTenor} years</div>
          </div>
          <div>
            <label className="text-sm font-semibold">Electric capacity (MW)</label>
            <input type="range" min={1} max={12} step={0.1} value={S.bPowerMW}
                   onChange={(e)=>S.setBPowerMW(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">{S.bPowerMW.toFixed(1)} MW</div>
          </div>
          <div>
            <label className="text-sm font-semibold">Electricity tariff (USD/kWh)</label>
            <input type="range" min={0} max={0.25} step={0.005} value={S.bTariffUSDkWh}
                   onChange={(e)=>S.setBTariffUSDkWh(parseFloat(e.target.value))} className="w-full" />
            <div className="text-xs text-slate-400">${S.bTariffUSDkWh.toFixed(3)} / kWh</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <KPI title={`Room revenue (yr 1, ${currency})`} value={money(B.roomRevenue)} />
          <KPI title={`Power revenue (yr 1, ${currency})`} value={money(B.powerRevenue)} />
          <KPI title={`Total revenue (yr 1, ${currency})`} value={money(B.revenue)} />
          <KPI title={`Debt service (yr, ${currency})`} value={money(B.debtRows[0]?.service || 0)} />
          <KPI title={`CFADS (yr 1, before debt, ${currency})`} value={money(B.cfadsBeforeDebt[0] || 0)} />
          <KPI title={`CFADS (yr 1, after debt, ${currency})`} value={money(B.cfadsAfterDebtSeries[0] || 0)} />
          <KPI title="IRR (project)" value={`${isNaN(B.projectIRR)?'—':(B.projectIRR*100).toFixed(2)+'%'}`} />
          <KPI title="IRR (equity)" value={`${isNaN(B.equityIRR)?'—':(B.equityIRR*100).toFixed(2)+'%'}`} />
        </div>
      </div>
    </section>
  )
}
