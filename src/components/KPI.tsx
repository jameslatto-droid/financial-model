// src/components/KPI.tsx
import React, { useState } from 'react'
import { useState } from "react"
import Help from './Help'

export default function KPI(){
  const [open, setOpen] = useState(false);
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
      {/* Info button (optional) */}
      {props.info && (
        <span className="ml-2 inline-flex items-center">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setOpen((v:boolean)=>!v); }}
            aria-label="Info"
            className="ml-2 text-xs rounded px-2 py-0.5 border border-slate-700 hover:bg-slate-800"
          >
            ⓘ
          </button>
        </span>
      )}
      {props.info && open && (
        <div className="absolute z-50 mt-2 max-w-xs rounded-lg border border-slate-700 bg-slate-900 p-3 text-xs shadow-xl">
          <div className="font-semibold mb-1">How this is calculated</div>
          <div className="text-slate-300 whitespace-pre-wrap">{props.info}</div>
        </div>
      )}
    </div>
  )
}
