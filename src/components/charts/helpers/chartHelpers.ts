export function clampDomain(data: any[], keys: string[]) {
  if (!Array.isArray(data) || data.length === 0) return ['auto','auto'] as const;
  let min = Infinity, max = -Infinity;
  for (const r of data) {
    for (const k of keys) {
      const v = Number((r as any)[k]);
      if (Number.isFinite(v)) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return ['auto','auto'] as const;
  // pad 5%
  const span = Math.max(1, max - min);
  return [min - 0.05*span, max + 0.05*span] as const;
}
export const moneyk = (n: any) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  const sign = v < 0 ? '-' : '';
  const a = Math.abs(v);
  return `${sign}$${(a/1000).toLocaleString(undefined,{maximumFractionDigits:0})}k`;
}
