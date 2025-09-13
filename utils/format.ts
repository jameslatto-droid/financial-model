
export const fmtInt = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n);
export const fmtUSD0 = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
export const fmt2 = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);
