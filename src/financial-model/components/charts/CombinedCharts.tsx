import React from 'react'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'

type CFRow = { year: number; Operating: number; Investing: number; Financing: number; Net: number }
type RevRow = { year: number; Revenue: number; NetAfterDebt: number; CumulativeNet?: number }

function safeNum(v: unknown) { const n = Number(v as any); return Number.isFinite(n) ? n : 0 }
function currencyFormatter(value: number | string | undefined, currency = 'USD') {
  const n = safeNum(value)
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(n)
  } catch { return String(n) }
}
function axisFormatterRaw(v: number) {
  if (Math.abs(v) < 1000) return v.toString()
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 0 }).format(v)
}

export default function CombinedCharts({ cashFlowData, revNetData, currency = 'USD' } : {
  cashFlowData: CFRow[]; revNetData: RevRow[]; currency?: string
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="panel">
        <h3 className="h2 mb-3">Combined Cash Flow</h3>
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => axisFormatterRaw(Number(v))} />
              <Tooltip formatter={(value: any) => currencyFormatter(Number(value), currency)} labelFormatter={(label) => `Year ${label}`} />
              <Legend />
              <Bar dataKey="Investing" stackId="a" fill="#ef4444" name="Investing (CAPEX)" />
              <Bar dataKey="Financing" stackId="a" fill="#f59e0b" name="Debt service" />
              <Bar dataKey="Operating" stackId="b" fill="#10b981" name="Operating (CFADS)" />
              <Line type="monotone" dataKey="Net" stroke="#3e84f7" strokeWidth={2} dot={{ r: 2 }} name="Net" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <h3 className="h2 mb-3">Combined Revenues & Net</h3>
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revNetData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(v) => axisFormatterRaw(Number(v))} />
              <Tooltip formatter={(value: any) => currencyFormatter(Number(value), currency)} labelFormatter={(label) => `Year ${label}`} />
              <Legend />
              <Area type="monotone" dataKey="Revenue" stackId="1" stroke="#3e84f7" fill="#cfe8ff" name="Revenue" />
              <Line type="monotone" dataKey="NetAfterDebt" stroke="#10b981" strokeWidth={2} dot={false} name="Yearly Net" />
              <Line type="monotone" dataKey="CumulativeNet" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Cumulative Net" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
