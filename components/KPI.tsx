// src/components/KPI.tsx
import React from 'react'
import Help from './Help'

export default function KPI({
  title, value, help
}: {
  title: string
  value: string | number
  help?: string
}) {
  return (
    <div className="border border-slate-800 rounded-lg p-3 bg-slate-950/40">
      <div className="text-[11px] text-slate-400 flex items-center gap-1">
        <span>{title}</span>
        {help && <Help text={help} />}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  )
}
