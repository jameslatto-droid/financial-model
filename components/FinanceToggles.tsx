import React from "react";

function FinanceToggles({
  a, b, c,
  currency, setCurrency,
  fxUSD2MXN, setFxUSD2MXN,
  discountRate, setDiscountRate,
  taxRate, setTaxRate,
  resetAll
}) {
  return (
    <section className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 shadow-lg">
      <h3 className="font-semibold mb-3">Finance toggles</h3>

      {/* NEW: Global finance controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 border border-slate-700 rounded-lg px-3 py-1">
          <span className="text-xs">Currency</span>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="bg-transparent text-xs"
          >
            <option value="USD">USD</option>
            <option value="MXN">MXN</option>
          </select>
          <input
            type="number" step={0.1} value={fxUSD2MXN}
            onChange={e => setFxUSD2MXN(parseFloat(e.target.value))}
            className="bg-transparent text-xs w-20"
            title="USD→MXN rate"
          />
        </div>

        <div className="flex items-center gap-2 border border-slate-700 rounded-lg px-3 py-1">
          <span className="text-xs">Discount</span>
          <input
            type="range" min={0} max={0.30} step={0.005}
            value={discountRate}
            onChange={e => setDiscountRate(parseFloat(e.target.value))}
          />
          <span className="text-xs">{(discountRate*100).toFixed(1)}%</span>
        </div>

        <div className="flex items-center gap-2 border border-slate-700 rounded-lg px-3 py-1">
          <span className="text-xs">Tax</span>
          <input
            type="range" min={0} max={0.5} step={0.01}
            value={taxRate}
            onChange={e => setTaxRate(parseFloat(e.target.value))}
          />
          <span className="text-xs">{(taxRate*100).toFixed(0)}%</span>
        </div>

        <button
          onClick={resetAll}
          className="text-xs border border-slate-700 hover:bg-slate-800 rounded-lg px-3 py-1"
        >
          Reset all
        </button>
      </div>

      {/* Per-part toggles remain below */}
      <div className="grid md:grid-cols-3 gap-4 text-xs">
        <div className="border border-slate-800 rounded-lg p-3">
          <div className="font-semibold mb-2">Part A</div>
          <div>Grace (yrs): <input type="range" min={0} max={5} step={1} value={a.aGrace} onChange={e=>a.setAGrace(parseInt(e.target.value))} /> {a.aGrace}</div>
          <div>Build (yrs): <input type="range" min={0} max={3} step={1} value={a.aBuildYears} onChange={e=>a.setABuildYears(parseInt(e.target.value))} /> {a.aBuildYears}</div>
          <div>Depreciation (yrs): <input type="number" min={1} max={30} value={a.aDepYears} onChange={e=>a.setADepYears(parseInt(e.target.value)||1)} className="w-16 bg-slate-950 border border-slate-800 rounded px-1" /></div>
        </div>

        <div className="border border-slate-800 rounded-lg p-3">
          <div className="font-semibold mb-2">Part B</div>
          <div>Grace (yrs): <input type="range" min={0} max={5} step={1} value={b.bGrace} onChange={e=>b.setBGrace(parseInt(e.target.value))} /> {b.bGrace}</div>
          <div>Build (yrs): <input type="range" min={0} max={3} step={1} value={b.bBuildYears} onChange={e=>b.setBBuildYears(parseInt(e.target.value))} /> {b.bBuildYears}</div>
          <div>Depreciation (yrs): <input type="number" min={1} max={30} value={b.bDepYears} onChange={e=>b.setBDepYears(parseInt(e.target.value)||1)} className="w-16 bg-slate-950 border border-slate-800 rounded px-1" /></div>
        </div>

        <div className="border border-slate-800 rounded-lg p-3">
          <div className="font-semibold mb-2">Part C</div>
          <div>Grace (yrs): <input type="range" min={0} max={5} step={1} value={c.cGrace} onChange={e=>c.setCGrace(parseInt(e.target.value))} /> {c.cGrace}</div>
          <div>Build (yrs): <input type="range" min={0} max={3} step={1} value={c.cBuildYears} onChange={e=>c.setCBuildYears(parseInt(e.target.value))} /> {c.cBuildYears}</div>
          <div>Depreciation (yrs): <input type="number" min={1} max={30} value={c.cDepYears} onChange={e=>c.setCDepYears(parseInt(e.target.value)||1)} className="w-16 bg-slate-950 border border-slate-800 rounded px-1" /></div>
        </div>
      </div>
    </section>
  )
}

export default FinanceToggles;
