export type Consumer = {
  consumerID: number
  name: string
  address: string
  mobile_no: string
}

export type Bill = {
  consumerID: number
  month: number
  year: number
  units_consumed: number
  amt: number
}

export type AppState = {
  consumers: Consumer[]
  bills: Bill[]
  cost_per_unit: number
}