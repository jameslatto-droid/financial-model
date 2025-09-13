import React from "react"
import { useFinance } from "../hooks/useFinance"

export default function FinancePanel() {
  const { state, setFinance, reset } = useFinance()

  const set = (k: string, v: any) => {
    setFinance(prev => ({ ...prev, [k]: v } as any))
  }

  return (
    <section className="panel">
      <h2 className="h2 mb-3">Finance & Toggles</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Currency</label>
          <select value={state.currency} onChange={e=>set("currency", e.target.value)} className="mt-2 w-full rounded-md border px-2 py-1.5 bg-transparent text-sm">
            <option value="USD">USD</option>
            <option value="MXN">MXN</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">FX (1 USD = X MXN)</label>
          <input type="number" value={state.fx} step="0.01" onChange={e=>set("fx", Number(e.target.value) || 0)} className="mt-2 w-full rounded-md border px-2 py-1.5 bg-transparent text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Discount rate</label>
          <div className="mt-2 flex items-center gap-2">
            <input type="range" min="0" max="0.3" step="0.005" value={state.discount} onChange={e=>set("discount", Number(e.target.value))} />
            <div className="text-sm w-20 text-right">{(state.discount*100).toFixed(2)}%</div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Tax (VAT)</label>
          <div className="mt-2 flex items-center gap-2">
            <input type="range" min="0" max="0.3" step="0.01" value={state.tax} onChange={e=>set("tax", Number(e.target.value))} />
            <div className="text-sm w-20 text-right">{(state.tax*100).toFixed(1)}%</div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Depreciation years</label>
          <input type="number" min="1" max="50" value={state.depreciationYears} onChange={e=>set("depreciationYears", Math.max(1, Number(e.target.value)||1))} className="mt-2 w-full rounded-md border px-2 py-1.5 bg-transparent text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Build years</label>
          <input type="number" min="0" max="10" value={state.buildYears} onChange={e=>set("buildYears", Math.max(0, Number(e.target.value)||0))} className="mt-2 w-full rounded-md border px-2 py-1.5 bg-transparent text-sm" />
        </div>

        <div>
          <label className="text-sm font-medium">Grace years (interest-only)</label>
          <input type="number" min="0" max="10" value={state.graceYears} onChange={e=>set("graceYears", Math.max(0, Number(e.target.value)||0))} className="mt-2 w-full rounded-md border px-2 py-1.5 bg-transparent text-sm" />
        </div>

        <div className="md:col-span-2 flex items-end">
          <button onClick={()=>{ reset(); alert("Finance settings reset to defaults") }} className="px-3 py-1.5 rounded-md border text-sm">Reset Finance</button>
        </div>
      </div>
    </section>
  )
}
