import type { AppState } from './types'

export const calculateAmount = (units: number, costPerUnit: number): number => {
  return units * costPerUnit
}

export const setCostPerUnit = (state: AppState, cpu: number): AppState => {
  const next = { ...state, cost_per_unit: cpu }
  // Persist to backend
  void fetch('/api/settings/cost-per-unit', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: cpu })
  })
  return next
}

export const formatINR = (value: number): string => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value)
  } catch {
    return `₹${value.toFixed(2)}`
  }
}