// src/components/_PartTypes.ts
export type CommonProps = {
  rooms: number
  roomFee: number
  splitAB: number
  inflation: number
  buildYears: number
  graceYears: number
  taxRate: number
  currency: string
  exchangeRate: number
}

export type PartAState = {
  capex: number
  opex: number
  equity: number // 0..1
  interest: number
  tenor: number
}

export type PartBState = {
  capex: number
  opex: number
  equity: number
  interest: number
  tenor: number
  powerMW: number
  tariffUSDkWh: number
}

export type PartCState = {
  capex: number
  opex: number
  equity: number
  interest: number
  tenor: number
  wasteDay: number
  tariff: number          // current tariff USD/m3
  targetTariff: number    // target tariff USD/m3
}
