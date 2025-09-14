import React from 'react'
import KPI from './KPI'

function pctOrDash(v: number | null | undefined) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—'
  return (v * 100).toFixed(2) + '%'
}

function tileBgForIrr(irr?: number | null) {
  if (irr === null || irr === undefined || Number.isNaN(irr)) return 'bg-white/50 dark:bg-neutral-900'
  const thresh = 0.14
  if (irr >= thresh) return 'bg-green-50/80 dark:bg-green-900/30 border border-green-200/60 dark:border-green-800'
  return 'bg-red-50/80 dark:bg-red-900/30 border border-red-200/60 dark:border-red-800'
}

export default function KPITiles({ aIRR, bIRR, cIRR, combinedIRR } : {
  aIRR?: number | null, bIRR?: number | null, cIRR?: number | null, combinedIRR?: number | null
}) {

  // Read tax from localStorage (finance:state) to determine VAT Excluded tile color
  let tax = 0
  try {
    const raw = localStorage.getItem('finance:state')
    if (raw) {
      const parsed = JSON.parse(raw)
      tax = Number(parsed?.tax ?? 0)
    }
  } catch {
    tax = 0
  }

  const vatExcludedBg = (tax === 0) ? 'bg-green-50/80 dark:bg-green-900/30 border border-green-200/60 dark:border-green-800' : 'bg-white/50 dark:bg-neutral-900'

  return (
    <section className="panel">
      <h2 className="h2 mb-3">KPIs</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI title="Part A IRR (project)" value={pctOrDash(aIRR ?? NaN)} className={tileBgForIrr(aIRR)} />
        <KPI title="Part B IRR (project)" value={pctOrDash(bIRR ?? NaN)} className={tileBgForIrr(bIRR)} />
        <KPI title="Part C IRR (project)" value={pctOrDash(cIRR ?? NaN)} className={tileBgForIrr(cIRR)} />
        <KPI title="Combined IRR (project)" value={pctOrDash(combinedIRR ?? NaN)} className={tileBgForIrr(combinedIRR)} />

        <KPI title="Part A IRR (equity)" value={pctOrDash(null)} className={tileBgForIrr(null)} />
        <KPI title="Part B IRR (equity)" value={pctOrDash(null)} className={tileBgForIrr(null)} />
        <KPI title="Part C IRR (equity)" value={pctOrDash(null)} className={tileBgForIrr(null)} />
        <KPI title="VAT Excluded" value={tax === 0 ? 'Yes' : 'No'} className={vatExcludedBg} />
      </div>
    </section>
  )
}
