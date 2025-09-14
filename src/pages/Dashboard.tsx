
import React, { useMemo, useState, useEffect, useRef } from 'react';

import KPI from '../components/KPI'
import { fmt2 } from '../utils/format'
import { irr, npv, paybackYears } from '../utils/finance'
import { BurnChart, RevNetChart, CashFlowChart, ExpenseChart } from '../components/charts/PartCharts'
import { usePartDatasets, useCombinedDatasets } from '../hooks/useDatasets'
import PartA from '../components/PartA'
import PartB from '../components/PartB'
import PartC from '../components/PartC'
import Help from '../components/Help'

import { downloadCSV } from '../utils/csv'

import DefaultsPage from './Defaults'

import logo from "../assets/cisec-logo.png";

import { getDefaults, saveDefaults } from '../utils/defaults'

type View = 'main' | 'chartA' | 'chartB' | 'chartC' | 'chartAll' | 'defaults'

type Currency = 'USD' | 'MXN'

// New: debt schedule with optional grace (interest-only) years
function buildDebtScheduleGrace(principal:number, rate:number, tenorYears:number, graceYears:number) {
  const rows: {interest:number; principal:number; service:number; remaining:number}[] = []
  let remaining = principal
  const g = Math.max(0, Math.min(tenorYears, Math.round(graceYears)))
  const n = Math.max(1, Math.round(tenorYears))

  // Interest-only period
  for (let t=1; t<=g; t++) {
    const interest = remaining * rate
    const principalPay = 0
    const service = interest + principalPay
    rows.push({ interest, principal: principalPay, service, remaining })
  }

  // Level payment after grace
  const amortYears = n - g
  if (amortYears <= 0) return { rows }
  const r = rate
  const annuity = r === 0 ? remaining / amortYears : remaining * (r * Math.pow(1+r, amortYears)) / (Math.pow(1+r, amortYears) - 1)

  for (let t=1; t<=amortYears; t++) {
    const interest = remaining * r
    const service = annuity
    const principalPay = Math.max(0, service - interest)
    remaining = Math.max(0, remaining - principalPay)
    rows.push({ interest, principal: principalPay, service, remaining })
  }
  return { rows }
}

export default function Dashboard() {
  const [view, setView] = useState<View>('main')
  // Auto-apply saved defaults once on mount
  const appliedOnce = useRef(false);
  useEffect(() => {
    if (appliedOnce.current) return;
    const d = getDefaults?.();
    if (d && Object.keys(d).length) {
      applySavedDefaults();
    }
    appliedOnce.current = true;
  }, []);


  // Currency + FX
  const [currency, setCurrency] = useState<Currency>('USD')
  const [fxUSD2MXN, setFxUSD2MXN] = useState<number>(18.0)
  const money = (n: number) => {
    const v = currency === 'USD' ? n : n * fxUSD2MXN
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency, maximumFractionDigits: 0
    }).format(v)
  }
  const moneyK = (n:number) => money(n/1000) + 'k'

  // Discount rate for NPV/Payback
  const [discountRate, setDiscountRate] = useState<number>(0.10)

  // Simple tax settings
  const [taxRate, setTaxRate] = useState<number>(0.25) // 25% default

  // Load saved defaults on mount

  useEffect(() => {

    const defaults = getDefaults();

    if (defaults) {

      if (defaults.currency) setCurrency(defaults.currency);

      if (typeof defaults.discountRate === "number") setDiscountRate(defaults.discountRate);

      if (typeof defaults.taxRate === "number") setTaxRate(defaults.taxRate);

    }

  }, []);


  // Load saved defaults on mount

  useEffect(() => {

    const defaults = getDefaults();

    if (defaults) {

      if (defaults.currency) setCurrency(defaults.currency);

      if (typeof defaults.discountRate === "number") setDiscountRate(defaults.discountRate);

      if (typeof defaults.taxRate === "number") setTaxRate(defaults.taxRate);

    }

  }, []);

  const pct = (x: number) => (isNaN(x) ? '—' : `${fmt2(x * 100)}%`)

  // Common inputs (A+B)
  const [occupiedRooms, setOccupiedRooms] = useState<number>(25000)
  const [roomRateUSD, setRoomRateUSD] = useState<number>(5.7)
  const [splitA, setSplitA] = useState<number>(0.55)
  const [inflation, setInflation] = useState<number>(0.04)

  const shared = useMemo(() => {
    const annualGross = roomRateUSD * occupiedRooms * 365
    const allocA = annualGross * splitA
    const allocB = annualGross * (1 - splitA)
    return { annualGross, allocA, allocB }
  }, [roomRateUSD, occupiedRooms, splitA])

  // Part A
  const [aCapexUSD, setACapexUSD] = useState<number>(18_000_000)
  const [aEquityPct, setAEquityPct] = useState<number>(0.30)
  const [aInterest, setAInterest] = useState<number>(0.12)
  const [aTenor, setATenor] = useState<number>(10)
  const [aGrace, setAGrace] = useState<number>(0)
  const [aBuildYears, setABuildYears] = useState<number>(0)
  const [aDepYears, setADepYears] = useState<number>(10)
  const [aOpexUSD, setAOpexUSD] = useState<number>(1_500_000)

  const a = useMemo(() => {
    const revenue = shared.allocA
    const n = Math.max(1, Math.round(aTenor))
    const equity = aCapexUSD * Math.max(0, Math.min(1, aEquityPct))
    const debtPV = Math.max(0, aCapexUSD - equity)

    const { rows: debtRows } = buildDebtScheduleGrace(debtPV, aInterest, n, aGrace)
    const opexSeries = Array.from({ length: n }, (_, i) => aOpexUSD * Math.pow(1 + inflation, i))
    const depreciation = Array.from({ length: n }, (_, i) => (i < aDepYears ? aCapexUSD / aDepYears : 0))

    const cfadsBeforeDebt = opexSeries.map((ox) => revenue - ox) // EBITDA
    const equityFlowsPreTax = [-equity, ...cfadsBeforeDebt.map((u, i) => u - (debtRows[i]?.service || 0))]

    // Post-tax equity flow: NI + Depreciation - Principal
    const equityPostTax = [-equity]
    for (let i=0;i<n;i++) {
      const ebitda = cfadsBeforeDebt[i]
      const dep = depreciation[i] || 0
      const interest = debtRows[i]?.interest || 0
      const principal = debtRows[i]?.principal || 0
      const ebit = ebitda - dep
      const ebt  = ebit - interest
      const tax  = ebt > 0 ? ebt * taxRate : 0
      const netIncome = ebt - tax
      const cashToEquity = netIncome + dep - principal
      equityPostTax.push(cashToEquity)
    }

    const equityIRR = equity > 0 ? irr(equityFlowsPreTax) : Number.NaN
    const equityIRRPostTax = equity > 0 ? irr(equityPostTax) : Number.NaN
    const projectFlows = [-aCapexUSD, ...cfadsBeforeDebt]

    return {
      revenue, debtRows, opexSeries, cfadsBeforeDebt,
      cfadsAfterDebtSeries: cfadsBeforeDebt.map((u, i) => u - (debtRows[i]?.service || 0)),
      depreciation, projectIRR: irr(projectFlows),
      equityIRR, equityIRRPostTax,
      projectFlows, equityFlows: equityFlowsPreTax,
      buildYears: aBuildYears, graceYears: aGrace
    }
  }, [shared.allocA, aCapexUSD, aEquityPct, aInterest, aTenor, aGrace, aBuildYears, aDepYears, aOpexUSD, inflation, taxRate])

  // Part B
  const [bCapexUSD, setBCapexUSD] = useState<number>(22_000_000)
  const [bEquityPct, setBEquityPct] = useState<number>(0.30)
  const [bInterest, setBInterest] = useState<number>(0.12)
  const [bTenor, setBTenor] = useState<number>(10)
  const [bGrace, setBGrace] = useState<number>(0)
  const [bBuildYears, setBBuildYears] = useState<number>(0)
  const [bDepYears, setBDepYears] = useState<number>(10)
  const [bOpexUSD, setBOpexUSD] = useState<number>(1_800_000)
  const [bPowerMW, setBPowerMW] = useState<number>(6)
  const [bTariffUSDkWh, setBTariffUSDkWh] = useState<number>(0.12)

  const b = useMemo(() => {
    const roomRevenue = shared.allocB
    const hoursPerYear = 8760
    const powerRevenue = bPowerMW * 1000 * hoursPerYear * bTariffUSDkWh
    const revenue = roomRevenue + powerRevenue

    const n = Math.max(1, Math.round(bTenor))
    const equity = bCapexUSD * Math.max(0, Math.min(1, bEquityPct))
    const debtPV = Math.max(0, bCapexUSD - equity)

    const { rows: debtRows } = buildDebtScheduleGrace(debtPV, bInterest, n, bGrace)
    const opexSeries = Array.from({ length: n }, (_, i) => bOpexUSD * Math.pow(1 + inflation, i))
    const depreciation = Array.from({ length: n }, (_, i) => (i < bDepYears ? bCapexUSD / bDepYears : 0))

    const cfadsBeforeDebt = opexSeries.map((ox) => revenue - ox)
    const equityFlowsPreTax = [-equity, ...cfadsBeforeDebt.map((u, i) => u - (debtRows[i]?.service || 0))]

    const equityPostTax = [-equity]
    for (let i=0;i<n;i++) {
      const ebitda = cfadsBeforeDebt[i]
      const dep = depreciation[i] || 0
      const interest = debtRows[i]?.interest || 0
      const principal = debtRows[i]?.principal || 0
      const ebit = ebitda - dep
      const ebt  = ebit - interest
      const tax  = ebt > 0 ? ebt * taxRate : 0
      const netIncome = ebt - tax
      const cashToEquity = netIncome + dep - principal
      equityPostTax.push(cashToEquity)
    }

    const equityIRR = equity > 0 ? irr(equityFlowsPreTax) : Number.NaN
    const equityIRRPostTax = equity > 0 ? irr(equityPostTax) : Number.NaN
    const projectFlows = [-bCapexUSD, ...cfadsBeforeDebt]

    return {
      roomRevenue, powerRevenue, revenue, debtRows, opexSeries, cfadsBeforeDebt,
      cfadsAfterDebtSeries: cfadsBeforeDebt.map((u, i) => u - (debtRows[i]?.service || 0)),
      depreciation, projectIRR: irr(projectFlows),
      equityIRR, equityIRRPostTax,
      projectFlows, equityFlows: equityFlowsPreTax,
      buildYears: bBuildYears, graceYears: bGrace
    }
  }, [shared.allocB, bCapexUSD, bEquityPct, bInterest, bTenor, bGrace, bBuildYears, bDepYears, bOpexUSD, inflation, taxRate, bPowerMW, bTariffUSDkWh])
// === Defaults integration ===
// Load saved defaults into all state setters (one-click apply)
function applySavedDefaults() {
  const d = getDefaults()
  setCurrency(d.currency); setFxUSD2MXN(d.fxUSD2MXN)
  setDiscountRate(d.discountRate); setTaxRate(d.taxRate)
  setOccupiedRooms(d.occupiedRooms); setRoomRateUSD(d.roomRateUSD)
  setSplitA(d.splitA); setInflation(d.inflation)

  setACapexUSD(d.aCapexUSD); setAEquityPct(d.aEquityPct); setAInterest(d.aInterest)
  setATenor(d.aTenor); setAGrace(d.aGrace); setABuildYears(d.aBuildYears)
  setADepYears(d.aDepYears); setAOpexUSD(d.aOpexUSD)

  setBCapexUSD(d.bCapexUSD); setBEquityPct(d.bEquityPct); setBInterest(d.bInterest)
  setBTenor(d.bTenor); setBGrace(d.bGrace); setBBuildYears(d.bBuildYears)
  setBDepYears(d.bDepYears); setBOpexUSD(d.bOpexUSD)
  setBPowerMW(d.bPowerMW); setBTariffUSDkWh(d.bTariffUSDkWh)

  setCCapexUSD(d.cCapexUSD); setCEquityPct(d.cEquityPct); setCInterest(d.cInterest)
  setCTenor(d.cTenor); setCGrace(d.cGrace); setCBuildYears(d.cBuildYears)
  setCDepYears(d.cDepYears); setCOpexUSD(d.cOpexUSD)
  setCTariffUSDm3(d.cTariffUSDm3); setCTariffCurUSDm3(d.cTariffCurUSDm3)
}

// Save current screen values as the new defaults
function saveCurrentAsDefaults() {
  saveDefaults({
    currency, fxUSD2MXN, discountRate, taxRate,
    occupiedRooms, roomRateUSD, splitA, inflation,
    aCapexUSD, aEquityPct, aInterest, aTenor, aGrace, aBuildYears, aDepYears, aOpexUSD,
    bCapexUSD, bEquityPct, bInterest, bTenor, bGrace, bBuildYears, bDepYears, bOpexUSD, bPowerMW, bTariffUSDkWh,
    cCapexUSD, cEquityPct, cInterest, cTenor, cGrace, cBuildYears, cDepYears, cOpexUSD, cTariffUSDm3, cTariffCurUSDm3,
  })
}

  // Part C
  const wasteDay = 47_000
  const wasteYear = wasteDay * 365
  const [cCapexUSD, setCCapexUSD] = useState<number>(54_444_444)
  const [cEquityPct, setCEquityPct] = useState<number>(0.30)
  const [cInterest, setCInterest] = useState<number>(0.12)
  const [cTenor, setCTenor] = useState<number>(10)
  const [cGrace, setCGrace] = useState<number>(0)
  const [cBuildYears, setCBuildYears] = useState<number>(0)
  const [cDepYears, setCDepYears] = useState<number>(15)
  const [cOpexUSD, setCOpexUSD] = useState<number>(3_333_333)
  const [cTariffUSDm3, setCTariffUSDm3] = useState<number>(0.80)
  const [cTariffCurUSDm3, setCTariffCurUSDm3] = useState<number>(0.083)

  const c = useMemo(() => {
    const revenueCurrent = cTariffCurUSDm3 * wasteYear
    const revenueTarget = cTariffUSDm3 * wasteYear
    const n = Math.max(1, Math.round(cTenor))
    const equity = cCapexUSD * Math.max(0, Math.min(1, cEquityPct))
    const debtPV = Math.max(0, cCapexUSD - equity)

    const { rows: debtRows } = buildDebtScheduleGrace(debtPV, cInterest, n, cGrace)
    const opexSeries = Array.from({ length: n }, (_, i) => cOpexUSD * Math.pow(1 + inflation, i))
    const depreciation = Array.from({ length: n }, (_, i) => (i < cDepYears ? cCapexUSD / cDepYears : 0))

    const cfadsBeforeDebt_cur = opexSeries.map((ox) => revenueCurrent - ox)
    const cfadsBeforeDebt_tgt = opexSeries.map((ox) => revenueTarget  - ox)
    const equityFlowsPreTax = [-equity, ...cfadsBeforeDebt_tgt.map((u, i) => u - (debtRows[i]?.service || 0))]

    const equityPostTax = [-equity]
    for (let i=0;i<n;i++) {
      const ebitda = cfadsBeforeDebt_tgt[i]
      const dep = depreciation[i] || 0
      const interest = debtRows[i]?.interest || 0
      const principal = debtRows[i]?.principal || 0
      const ebit = ebitda - dep
      const ebt  = ebit - interest
      const tax  = ebt > 0 ? ebt * taxRate : 0
      const netIncome = ebt - tax
      const cashToEquity = netIncome + dep - principal
      equityPostTax.push(cashToEquity)
    }

    const equityIRR = equity > 0 ? irr(equityFlowsPreTax) : Number.NaN
    const equityIRRPostTax = equity > 0 ? irr(equityPostTax) : Number.NaN
    const projectFlows = [-cCapexUSD, ...cfadsBeforeDebt_tgt]

    return {
      revenueCurrent, revenueTarget, debtRows, opexSeries,
      cfadsBeforeDebt_tgt, cfadsAfterDebtSeries_tgt: cfadsBeforeDebt_tgt.map((u, i) => u - (debtRows[i]?.service || 0)),
      depreciation, projectIRR: irr(projectFlows),
      equityIRR, equityIRRPostTax,
      projectFlows, equityFlows: equityFlowsPreTax,
      buildYears: cBuildYears, graceYears: cGrace
    }
  }, [cTariffCurUSDm3, cTariffUSDm3, cCapexUSD, cEquityPct, cInterest, cTenor, cGrace, cBuildYears, cDepYears, cOpexUSD, inflation, taxRate, wasteYear])

  // Combined
  const combined = useMemo(() => {
    const totalCapex = aCapexUSD + bCapexUSD + cCapexUSD
    const N = Math.max(aTenor, bTenor, cTenor)
    const aU = Array.from({ length: N }, (_, i) => (i < a.cfadsBeforeDebt.length ? a.cfadsBeforeDebt[i] : 0))
    const bU = Array.from({ length: N }, (_, i) => (i < b.cfadsBeforeDebt.length ? b.cfadsBeforeDebt[i] : 0))
    const cU = Array.from({ length: N }, (_, i) => (i < c.cfadsBeforeDebt_tgt.length ? c.cfadsBeforeDebt_tgt[i] : 0))
    const totalCFADSBeforeDebtSeries = aU.map((v, i) => v + bU[i] + cU[i])
    const projectFlows = [-totalCapex, ...totalCFADSBeforeDebtSeries]
    const projectIRR = irr(projectFlows)
    const totalCFADSBeforeDebt = totalCFADSBeforeDebtSeries.reduce((p,c)=>p+c,0)
    const ROI = totalCapex > 0 ? ((totalCFADSBeforeDebt - totalCapex) / totalCapex) : Number.NaN

    const equity0 = (aCapexUSD * aEquityPct) + (bCapexUSD * bEquityPct) + (cCapexUSD * cEquityPct)
    const equityCF = [-equity0, ...Array.from({ length: N }, (_, i) =>
      (i < a.cfadsAfterDebtSeries.length ? a.cfadsAfterDebtSeries[i] : 0) +
      (i < b.cfadsAfterDebtSeries.length ? b.cfadsAfterDebtSeries[i] : 0) +
      (i < c.cfadsAfterDebtSeries_tgt.length ? c.cfadsAfterDebtSeries_tgt[i] : 0)
    )]
    const equityIRR = equity0 > 0 ? irr(equityCF) : Number.NaN

    return {
      totalCapex, totalCFADSBeforeDebt, totalCFADSBeforeDebtSeries, projectIRR, equityIRR, ROI, N,
      projectFlows, equityCF
    }
  }, [a, b, c, aCapexUSD, bCapexUSD, cCapexUSD, aEquityPct, bEquityPct, cEquityPct, aTenor, bTenor, cTenor])

  const resetAll = () => {
    setCurrency('USD'); setFxUSD2MXN(18); setDiscountRate(0.10); setTaxRate(0.25);
    setOccupiedRooms(25000); setRoomRateUSD(5.7); setSplitA(0.55); setInflation(0.04);
    setACapexUSD(18_000_000); setAEquityPct(0.30); setAInterest(0.12); setATenor(10); setAGrace(0); setABuildYears(0); setADepYears(10); setAOpexUSD(1_500_000);
    setBCapexUSD(22_000_000); setBEquityPct(0.30); setBInterest(0.12); setBTenor(10); setBGrace(0); setBBuildYears(0); setBDepYears(10); setBOpexUSD(1_800_000); setBPowerMW(6); setBTariffUSDkWh(0.12);
    setCCapexUSD(54_444_444); setCEquityPct(0.30); setCInterest(0.12); setCTenor(10); setCGrace(0); setCBuildYears(0); setCDepYears(15); setCOpexUSD(3_333_333); setCTariffUSDm3(0.80); setCTariffCurUSDm3(0.083);
  }

  // Datasets (unchanged shape; charts show thousands via prop)
  const DS_A = usePartDatasets(aTenor, aCapexUSD, a.revenue, a.opexSeries, a.debtRows, a.cfadsBeforeDebt)
  const DS_B = usePartDatasets(bTenor, bCapexUSD, b.revenue, b.opexSeries, b.debtRows, b.cfadsBeforeDebt)
  const DS_C = usePartDatasets(cTenor, cCapexUSD, c.revenueTarget, c.opexSeries, c.debtRows, c.cfadsBeforeDebt_tgt)
  const DS_ALL = useCombinedDatasets(
    Math.max(aTenor, bTenor, cTenor),
    aCapexUSD + bCapexUSD + cCapexUSD,
    (y)=> y===0?0: (y<=aTenor? a.revenue:0) + (y<=bTenor? b.revenue:0) + (y<=cTenor? c.revenueTarget:0),
    (y)=> y===0?0: (y<=aTenor? a.opexSeries[y-1]||0:0) + (y<=bTenor? b.opexSeries[y-1]||0:0) + (y<=cTenor? c.opexSeries[y-1]||0:0),
    (y)=> y===0?0: (y<=aTenor? a.debtRows[y-1]?.service||0:0) + (y<=bTenor? b.debtRows[y-1]?.service||0:0) + (y<=cTenor? c.debtRows[y-1]?.service||0:0),
    Array.from({ length: Math.max(aTenor,bTenor,cTenor) }, (_, i) => (a.cfadsBeforeDebt[i]||0)+(b.cfadsBeforeDebt[i]||0)+(c.cfadsBeforeDebt_tgt[i]||0)),
    (y)=> y===0? (a.debtRows[0]?.remaining||0)+(b.debtRows[0]?.remaining||0)+(c.debtRows[0]?.remaining||0) : (a.debtRows[y-1]?.remaining||0)+(b.debtRows[y-1]?.remaining||0)+(c.debtRows[y-1]?.remaining||0)
  )

  // Render Defaults page when selected
if (view === 'defaults') {
  return <DefaultsPage onBack={() => setView('main')} />
}
  // CSV Export (same as before, omitted for brevity)

  if (view !== 'main') {
    const back = <button onClick={()=>setView('main')} className="mb-4 text-xs border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-1">← Back to overview</button>;
    const grid = (ds:any) => (
      <div className="grid md:grid-cols-2 gap-4">
        <BurnChart data={ds.burnData} label="Burn and Cash Balances" money={money} thousands />
        <RevNetChart data={ds.revNetData} label="Revenues and Net (after debt)" money={money} thousands />
        <CashFlowChart data={ds.cashFlowData} label="Cash Flows (Ops, Invest, Finance)" money={money} thousands />
        <ExpenseChart data={ds.expenseData} label="Expenses by Category (OPEX escalated)" money={money} thousands />
      </div>
    )



    return (
      
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          {back}
          {view==='chartA' && grid(DS_A)}
          {view==='chartB' && grid(DS_B)}
          {view==='chartC' && grid(DS_C)}
          {view==='chartAll' && grid(DS_ALL)}
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-950 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Dashboard Title / Logo */}
<section id="dashboard-title" className="mb-4">
  <div className="flex items-center gap-4">
    <img src={logo} alt="CISEC logo" className="h-12 w-auto" />
    <h1 className="text-2xl font-bold text-white">Cancún CISEC</h1>
  </div>
</section>


        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <p className="text-slate-400 text-sm"></p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 border border-slate-700 rounded-lg px-3 py-1">
              <span className="text-xs">Currency</span>
              <select value={currency} onChange={(e)=>setCurrency(e.target.value as Currency)} className="bg-transparent text-xs">
                <option value="USD">USD</option>
                <option value="MXN">MXN</option>
              </select>
              <input type="number" step={0.1} value={fxUSD2MXN} onChange={(e)=>setFxUSD2MXN(parseFloat(e.target.value))}
                className="bg-transparent text-xs w-20" title="USD→MXN rate" />
            </div>

            <div className="flex items-center gap-2 border border-slate-700 rounded-lg px-3 py-1">
              <span className="text-xs">Discount</span>
              <input type="range" min={0} max={0.30} step={0.005} value={discountRate}
                     onChange={(e)=>setDiscountRate(parseFloat(e.target.value))} />
              <span className="text-xs">{(discountRate*100).toFixed(1)}%</span>
              <Help text="Used for NPV and payback." />
            </div>

            <div className="flex items-center gap-2 border border-slate-700 rounded-lg px-3 py-1">
              <span className="text-xs">Tax</span>
              <input type="range" min={0} max={0.5} step={0.01} value={taxRate}
                     onChange={(e)=>setTaxRate(parseFloat(e.target.value))} />
              <span className="text-xs">{(taxRate*100).toFixed(0)}%</span>
              <Help text="Simple corporate tax applied to positive EBT (EBIT - interest). Depreciation is straight-line." />
            </div>

            <button onClick={resetAll} className="text-xs border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-1">Reset all</button>
            
            <button
  onClick={() => setView('defaults')}
  className="text-xs border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-1"
  title="Open the page to view and edit all default values"
>
  Edit defaults →
</button>

<button
  onClick={applySavedDefaults}
  className="text-xs border border-emerald-700 hover:bg-emerald-800 rounded-lg px-3 py-1"
  title="Load saved defaults (from localStorage) into all inputs"
>
  Apply saved defaults
</button>

<button
  onClick={saveCurrentAsDefaults}
  className="text-xs border border-indigo-700 hover:bg-indigo-800 rounded-lg px-3 py-1"
  title="Save current screen values as your new defaults"
>
  Save current as defaults
</button>

            
          </div>
        </header>

        {/* Common inputs */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-lg">
          <h2 className="font-semibold mb-3">Common Inputs – Shared A & B Revenue</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Occupied rooms (per day) <Help text="Total occupied hotel rooms per day across the district." /></label>
              <input type="number" value={occupiedRooms} step={100} onChange={(e)=>setOccupiedRooms(parseFloat(e.target.value))}
                     className="w-full bg-slate-950 border border-slate-800 rounded-md px-2 py-1" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">$ per occupied room per day (USD) <Help text="Average daily fee per occupied room that funds A & B." /></label>
              <input type="range" min={0} max={30} step={0.1} value={roomRateUSD}
                     onChange={(e)=>setRoomRateUSD(parseFloat(e.target.value))} className="w-full" />
              <div className="text-xs text-slate-400">Current: ${roomRateUSD.toFixed(2)} / room / day</div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold">Split allocation to Part A <Help text="Share of room fee going to Part A (rest goes to Part B)." /></label>
              <input type="range" min={0} max={1} step={0.01} value={splitA}
                     onChange={(e)=>setSplitA(parseFloat(e.target.value))} className="w-full" />
              <div className="text-xs text-slate-400">A receives {(splitA*100).toFixed(0)}% • B receives {((1-splitA)*100).toFixed(0)}%</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KPI info="Equity IRR uses leveraged, after-tax equity cash flows:
Equity injection as outflow, then CF after debt service and tax.
Changes to interest and tax directly impact this metric." info="Project IRR is computed on unlevered cash flows:
CFADS-before-debt (no interest, no tax) and total CAPEX.
Changing interest or tax will not change this metric; those affect Equity IRR." title={`Gross A+B revenue (yr, ${currency})`} value={money(shared.annualGross)} help="Room-based fee × occupied rooms × 365." />
              <div className="space-y-1">
                <label className="text-sm font-semibold">Inflation (OPEX escalation) <Help text="Annual growth applied to OPEX streams." /></label>
                <input type="range" min={0} max={0.2} step={0.0025} value={inflation} onChange={(e)=>setInflation(parseFloat(e.target.value))} className="w-full" />
                <div className="text-xs text-slate-400">{(inflation*100).toFixed(2)}% / yr</div>
              </div>
            </div>
          </div>
        </section>

        {/* Part settings (build + grace + depreciation) would be placed inside each Part component UI ideally.
            For speed, we keep them here for now. */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-lg">
          <h3 className="font-semibold mb-3">Finance toggles</h3>
          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="border border-slate-800 rounded-lg p-3">
              <div className="font-semibold mb-2">Part A</div>
              <div>Grace (yrs): <input type="range" min={0} max={5} step={1} value={aGrace} onChange={(e)=>setAGrace(parseInt(e.target.value))} /> {aGrace}</div>
              <div>Build (yrs): <input type="range" min={0} max={3} step={1} value={aBuildYears} onChange={(e)=>setABuildYears(parseInt(e.target.value))} /> {aBuildYears}</div>
              <div>Depreciation (yrs): <input type="number" min={1} max={30} value={aDepYears} onChange={(e)=>setADepYears(parseInt(e.target.value)||1)} className="w-16 bg-slate-950 border border-slate-800 rounded px-1" /></div>
            </div>
            <div className="border border-slate-800 rounded-lg p-3">
              <div className="font-semibold mb-2">Part B</div>
              <div>Grace (yrs): <input type="range" min={0} max={5} step={1} value={bGrace} onChange={(e)=>setBGrace(parseInt(e.target.value))} /> {bGrace}</div>
              <div>Build (yrs): <input type="range" min={0} max={3} step={1} value={bBuildYears} onChange={(e)=>setBBuildYears(parseInt(e.target.value))} /> {bBuildYears}</div>
              <div>Depreciation (yrs): <input type="number" min={1} max={30} value={bDepYears} onChange={(e)=>setBDepYears(parseInt(e.target.value)||1)} className="w-16 bg-slate-950 border border-slate-800 rounded px-1" /></div>
            </div>
            <div className="border border-slate-800 rounded-lg p-3">
              <div className="font-semibold mb-2">Part C</div>
              <div>Grace (yrs): <input type="range" min={0} max={5} step={1} value={cGrace} onChange={(e)=>setCGrace(parseInt(e.target.value))} /> {cGrace}</div>
              <div>Build (yrs): <input type="range" min={0} max={3} step={1} value={cBuildYears} onChange={(e)=>setCBuildYears(parseInt(e.target.value))} /> {cBuildYears}</div>
              <div>Depreciation (yrs): <input type="number" min={1} max={30} value={cDepYears} onChange={(e)=>setCDepYears(parseInt(e.target.value)||1)} className="w-16 bg-slate-950 border border-slate-800 rounded px-1" /></div>
            </div>
          </div>
        </section>

        {/* Parts display remain unchanged */}
        <PartA
          money={money} currency={currency} onViewCharts={()=>setView('chartA')}
          S={{ aCapexUSD, setACapexUSD, aEquityPct, setAEquityPct, aOpexUSD, setAOpexUSD, aInterest, setAInterest, aTenor, setATenor, bPowerMW, setBPowerMW }}
          A={a}
        />
        <PartB
          money={money} currency={currency} onViewCharts={()=>setView('chartB')}
          S={{ bCapexUSD, setBCapexUSD, bEquityPct, setBEquityPct, bOpexUSD, setBOpexUSD, bInterest, setBInterest, bTenor, setBTenor, bPowerMW, setBPowerMW, bTariffUSDkWh, setBTariffUSDkWh }}
          B={b}
        />
        <PartC
          money={money} currency={currency} onViewCharts={()=>setView('chartC')}
          S={{ wasteDay, cCapexUSD, setCCapexUSD, cEquityPct, setCEquityPct, cOpexUSD, setCOpexUSD, cInterest, setCInterest, cTenor, setCTenor, cTariffUSDm3, setCTariffUSDm3, cTariffCurUSDm3, setCTariffCurUSDm3 }}
          C={c}
        />

        {/* Combined */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Combined Overview</h2>
            <button onClick={()=>setView('chartAll')} className="text-xs border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-1">View combined chart →</button>
          </div>
          <div className="grid md:grid-cols-4 gap-3">
            <KPI info="Equity IRR uses leveraged, after-tax equity cash flows:
Equity injection as outflow, then CF after debt service and tax.
Changes to interest and tax directly impact this metric." info="Project IRR is computed on unlevered cash flows:
CFADS-before-debt (no interest, no tax) and total CAPEX.
Changing interest or tax will not change this metric; those affect Equity IRR." title={`Total CAPEX (${currency})`} value={money(aCapexUSD + bCapexUSD + cCapexUSD)} help="Sum of A+B+C capital expenditures." />
            <KPI info="Equity IRR uses leveraged, after-tax equity cash flows:
Equity injection as outflow, then CF after debt service and tax.
Changes to interest and tax directly impact this metric." info="Project IRR is computed on unlevered cash flows:
CFADS-before-debt (no interest, no tax) and total CAPEX.
Changing interest or tax will not change this metric; those affect Equity IRR." title={`Total CFADS before debt (sum, ${currency})`} value={money(a.cfadsBeforeDebt.reduce((p,c)=>p+c,0)+b.cfadsBeforeDebt.reduce((p,c)=>p+c,0)+c.cfadsBeforeDebt_tgt.reduce((p,c)=>p+c,0))} help="Aggregate CFADS before any debt service." />
            <KPI info="Equity IRR uses leveraged, after-tax equity cash flows:
Equity injection as outflow, then CF after debt service and tax.
Changes to interest and tax directly impact this metric." info="Project IRR is computed on unlevered cash flows:
CFADS-before-debt (no interest, no tax) and total CAPEX.
Changing interest or tax will not change this metric; those affect Equity IRR." title="IRR (project)" value={pct((isNaN(irr([- (aCapexUSD+bCapexUSD+cCapexUSD), ...DS_ALL.cashFlowData.slice(1).map(r=>Number(r.Operating))]))?Number.NaN:irr([- (aCapexUSD+bCapexUSD+cCapexUSD), ...DS_ALL.cashFlowData.slice(1).map(r=>Number(r.Operating))])))} help="IRR on project cash flows before financing (unlevered)." />
            <KPI info="Equity IRR uses leveraged, after-tax equity cash flows:
Equity injection as outflow, then CF after debt service and tax.
Changes to interest and tax directly impact this metric." info="Project IRR is computed on unlevered cash flows:
CFADS-before-debt (no interest, no tax) and total CAPEX.
Changing interest or tax will not change this metric; those affect Equity IRR." title="IRR (equity, pre-tax)" value={pct((a.equityIRR + b.equityIRR + c.equityIRR)/3)} help="Simple average of per-part leveraged equity IRRs before tax." />
            <KPI info="Equity IRR uses leveraged, after-tax equity cash flows:
Equity injection as outflow, then CF after debt service and tax.
Changes to interest and tax directly impact this metric." info="Project IRR is computed on unlevered cash flows:
CFADS-before-debt (no interest, no tax) and total CAPEX.
Changing interest or tax will not change this metric; those affect Equity IRR." title="IRR (equity, post-tax)" value={pct((a.equityIRRPostTax + b.equityIRRPostTax + c.equityIRRPostTax)/3)} help="Simple average of per-part leveraged equity IRRs after tax and depreciation." />
            <KPI info="Equity IRR uses leveraged, after-tax equity cash flows:
Equity injection as outflow, then CF after debt service and tax.
Changes to interest and tax directly impact this metric." info="Project IRR is computed on unlevered cash flows:
CFADS-before-debt (no interest, no tax) and total CAPEX.
Changing interest or tax will not change this metric; those affect Equity IRR." title="ROI (unlevered, over horizon)" value={pct(((a.cfadsBeforeDebt.reduce((p,c)=>p+c,0)+b.cfadsBeforeDebt.reduce((p,c)=>p+c,0)+c.cfadsBeforeDebt_tgt.reduce((p,c)=>p+c,0)) - (aCapexUSD+bCapexUSD+cCapexUSD)) / (aCapexUSD+bCapexUSD+cCapexUSD))} help="(Sum of unlevered CFADS − CAPEX) ÷ CAPEX." />
            <KPI info="Equity IRR uses leveraged, after-tax equity cash flows:
Equity injection as outflow, then CF after debt service and tax.
Changes to interest and tax directly impact this metric." info="Project IRR is computed on unlevered cash flows:
CFADS-before-debt (no interest, no tax) and total CAPEX.
Changing interest or tax will not change this metric; those affect Equity IRR." title={`Project NPV @ ${(discountRate*100).toFixed(1)}% (${currency})`} value={money(npv(discountRate, [-(aCapexUSD+bCapexUSD+cCapexUSD), ...DS_ALL.cashFlowData.slice(1).map(r=>Number(r.Operating))]))} help="NPV of unlevered project cash flows at the chosen discount rate." />
            <KPI info="Equity IRR uses leveraged, after-tax equity cash flows:
Equity injection as outflow, then CF after debt service and tax.
Changes to interest and tax directly impact this metric." info="Project IRR is computed on unlevered cash flows:
CFADS-before-debt (no interest, no tax) and total CAPEX.
Changing interest or tax will not change this metric; those affect Equity IRR." title="Project Payback (yrs)" value={`${isNaN(paybackYears([-(aCapexUSD+bCapexUSD+cCapexUSD), ...DS_ALL.cashFlowData.slice(1).map(r=>Number(r.Operating))]))?'—':(paybackYears([-(aCapexUSD+bCapexUSD+cCapexUSD), ...DS_ALL.cashFlowData.slice(1).map(r=>Number(r.Operating))])).toFixed(2)}`} help="Years until cumulative project cash flows turn positive." />
          </div>
        </section>

      </div>
    </div>
  )
}
