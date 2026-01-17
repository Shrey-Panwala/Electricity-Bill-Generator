import type { AppState, Bill, Consumer } from './types'

const defaultState: AppState = {
  consumers: [],
  bills: [],
  cost_per_unit: 5.0,
}

const api = {
  async getState(): Promise<AppState> {
    try {
      const res = await fetch('/api/state')
      if (!res.ok) throw new Error('API error')
      return await res.json()
    } catch {
      return defaultState
    }
  },
  async addConsumer(consumer: Consumer): Promise<boolean> {
    const res = await fetch('/api/consumer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(consumer) })
    return res.status === 201
  },
  async deleteConsumer(id: number): Promise<boolean> {
    const res = await fetch(`/api/consumer/${id}`, { method: 'DELETE' })
    return res.ok
  },
  async addBill(bill: Omit<Bill, 'amt'>): Promise<boolean> {
    const res = await fetch('/api/bill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bill) })
    return res.status === 201
  },
  async deleteBill(consumerID: number, month: number, year: number): Promise<boolean> {
    const res = await fetch(`/api/bill/${consumerID}/${year}/${month}`, { method: 'DELETE' })
    return res.ok
  },
  async getConsumer(id: number): Promise<Consumer | undefined> {
    const res = await fetch(`/api/consumer/${id}`)
    if (!res.ok) return undefined
    return await res.json()
  },
  async getBill(consumerID: number, month: number, year: number): Promise<Bill | undefined> {
    const res = await fetch(`/api/bill/${consumerID}/${year}/${month}`)
    if (!res.ok) return undefined
    return await res.json()
  },
  async getPreviousBills(consumerID: number, month: number, year: number): Promise<Bill[]> {
    const res = await fetch(`/api/bills/previous/${consumerID}/${year}/${month}`)
    if (!res.ok) return []
    return await res.json()
  }
}

// Optional API helpers for components to use explicitly
export const api_get_state = () => api.getState()
export const api_add_consumer = (consumer: Consumer) => api.addConsumer(consumer)
export const api_delete_consumer = (id: number) => api.deleteConsumer(id)
export const api_add_bill = (bill: Omit<Bill, 'amt'>) => api.addBill(bill)
export const api_delete_bill = (consumerID: number, month: number, year: number) => api.deleteBill(consumerID, month, year)

export const loadState = (): AppState => {
  // Note: loadState is now async-like via caller using effects; here we return default and caller will update.
  // To keep signature, we return default and let components refresh via explicit fetch.
  return defaultState
}

export const saveState = (_state: AppState) => {
  // No-op: persistence handled by backend API.
}

export const add_consumer = (state: AppState, consumer: Consumer): AppState => {
  // Fire-and-refresh approach to keep API usage simple
  void api.addConsumer(consumer).then(() => api.getState().then(s => Object.assign(state, s)))
  return state
}

export const add_bill = (state: AppState, bill: Omit<Bill, 'amt'>): AppState => {
  void api.addBill(bill).then(() => api.getState().then(s => Object.assign(state, s)))
  return state
}

export const get_consumer = (state: AppState, consumerID: number): Consumer | undefined => {
  // Fast path using local state; components can refresh via API if needed
  return state.consumers.find(c => c.consumerID === consumerID)
}

export const get_bill = (state: AppState, consumerID: number, month: number, year: number): Bill | undefined => {
  return state.bills.find(b => b.consumerID === consumerID && b.month === month && b.year === year)
}

export const get_previous_bills = (state: AppState, consumerID: number, month: number, year: number): Bill[] => {
  const past = state.bills.filter(b => b.consumerID === consumerID && (b.year < year || (b.year === year && b.month < month)))
  past.sort((a, b) => (b.year - a.year) || (b.month - a.month))
  return past.slice(0, 3)
}

export const remove_consumer = (state: AppState, consumerID: number): AppState => {
  void api.deleteConsumer(consumerID).then(() => api.getState().then(s => Object.assign(state, s)))
  return state
}

export const remove_bill = (state: AppState, consumerID: number, month: number, year: number): AppState => {
  void api.deleteBill(consumerID, month, year).then(() => api.getState().then(s => Object.assign(state, s)))
  return state
}
