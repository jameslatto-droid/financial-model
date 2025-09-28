
import { clampDomain, moneyk as moneykHelper } from "./helpers/chartHelpers";
// src/components/charts/PartCharts.tsx
import React from 'react'
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from 'recharts'

type Row = { [k: string]: number | string }
type Props = {
  data: Row[]
  label?: string
  money?: (n:number)=>string  // currency-aware formatter
  thousands?: boolean         // show in thousands
}

const common = (label?: string) => ({
  outer: 'bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-md',
  title: <div className="text-sm font-semibold mb-2">{label}</div>
})

const fmt = (money?: (n:number)=>string, thousands?: boolean) => (value: any) => {
  const n = Number(value)
  if (!isFinite(n)) return '—'
  const v = thousands ? n/1000 : n
  return money ? money(v) + (thousands ? 'k' : '') : new Intl.NumberFormat('en-US').format(Math.round(v)) + (thousands ? 'k' : '')
}

function ChartShell({ children, label }:{children:React.ReactNode; label?:string}) {
  const cls = common(label)
  return (
    <div className={cls.outer}>
      {cls.title}
      <div style={{ width: '100%', height: 300 }}>{children}</div>
    </div>
  )
}

export function BurnChart({ data, label = 'Burn & Cash Balances', money, thousands }: Props) {
  const yfmt = fmt(money, thousands)
  return (
    <ChartShell label={label}>
      <ResponsiveContainer>
        <ComposedChart data={data} stackOffset="sign" margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={moneykHelper} domain={["dataMin","dataMax"]} />
          <Tooltip formatter={(v)=>yfmt(v)} />
          <Legend />
          <Bar dataKey="OPEX" stackId="a" />
          <Bar dataKey="DebtService" stackId="a" />
          <Line dataKey="CFADS" dot={false} />
          <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
</ComposedChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function RevNetChart({ data, label = 'Revenues & Net (after debt)', money, thousands }: Props) {
  const yfmt = fmt(money, thousands)
  return (
    <ChartShell label={label}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={moneykHelper} domain={["dataMin","dataMax"]} />
          <Tooltip formatter={(v)=>yfmt(v)} />
          <Legend />
          <Bar dataKey="Revenue" />
          <Line dataKey="NetAfterDebt" dot={false} />
  <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function CashFlowChart({ data, label = 'Cash Flows (Ops, Invest, Finance)', money, thousands }: Props) {
  const yfmt = fmt(money, thousands)
  return (
    <ChartShell label={label}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={moneykHelper} domain={["dataMin","dataMax"]} />
          <Tooltip formatter={(v)=>yfmt(v)} />
          <Legend />
          <Bar dataKey="Operating" />
          <Bar dataKey="Investing" />
          <Bar dataKey="Financing" />
          <Line dataKey="Net" dot={false} />
  <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
  <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}

export function ExpenseChart({ data, label = 'Expenses by Category (OPEX escalated)', money, thousands }: Props) {
  const yfmt = fmt(money, thousands)
  return (
    <ChartShell label={label}>
      <ResponsiveContainer>
        <ComposedChart data={data} stackOffset="sign" margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={moneykHelper} domain={["dataMin","dataMax"]} />
          <Tooltip formatter={(v)=>yfmt(v)} />
          <Legend />
          <Bar dataKey="OPEX" />
          <Bar dataKey="DebtService" />
  <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
  <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="3 3" />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartShell>
  )
}
