import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'db.json')

const defaultState = { consumers: [], bills: [], cost_per_unit: 5.0 }

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify(defaultState, null, 2))
}

function loadState() {
  ensureDataFile()
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8')
    const data = JSON.parse(raw)
    return {
      consumers: Array.isArray(data.consumers) ? data.consumers : [],
      bills: Array.isArray(data.bills) ? data.bills : [],
      cost_per_unit: typeof data.cost_per_unit === 'number' ? data.cost_per_unit : 5.0,
    }
  } catch {
    return { ...defaultState }
  }
}

function saveState(state) {
  ensureDataFile()
  fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2))
}

function valid_num(mobile_no) { return /^[0-9]{10}$/.test(String(mobile_no)) }
function valid_year(year) { const y = Number(year); const currentYear = new Date().getFullYear(); return y >= 2000 && y <= currentYear }
function valid_month(month) { const m = Number(month); return m >= 1 && m <= 12 }
function valid_address(address) { return String(address).trim().length >= 7 }
function valid_consumer_id(id) { const i = Number(id); return Number.isInteger(i) && i > 0 }

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/state', (_req, res) => {
  res.json(loadState())
})

app.post('/api/consumer', (req, res) => {
  const { consumerID, name, address, mobile_no } = req.body || {}
  if (!valid_consumer_id(consumerID)) return res.status(400).json({ error: 'Invalid consumerID' })
  if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'Invalid name' })
  if (!valid_address(address)) return res.status(400).json({ error: 'Invalid address' })
  if (!valid_num(mobile_no)) return res.status(400).json({ error: 'Invalid mobile_no' })

  const state = loadState()
  if (state.consumers.some(c => c.consumerID === Number(consumerID))) {
    return res.status(409).json({ error: 'Consumer already exists' })
  }
  const consumer = { consumerID: Number(consumerID), name: String(name), address: String(address), mobile_no: String(mobile_no) }
  const next = { ...state, consumers: [...state.consumers, consumer] }
  saveState(next)
  res.status(201).json(consumer)
})

app.delete('/api/consumer/:id', (req, res) => {
  const id = Number(req.params.id)
  const state = loadState()
  const nextConsumers = state.consumers.filter(c => c.consumerID !== id)
  const nextBills = state.bills.filter(b => b.consumerID !== id)
  const next = { ...state, consumers: nextConsumers, bills: nextBills }
  saveState(next)
  res.json({ ok: true })
})

app.post('/api/bill', (req, res) => {
  const { consumerID, month, year, units_consumed } = req.body || {}
  if (!valid_consumer_id(consumerID)) return res.status(400).json({ error: 'Invalid consumerID' })
  if (!valid_month(month)) return res.status(400).json({ error: 'Invalid month' })
  if (!valid_year(year)) return res.status(400).json({ error: 'Invalid year' })
  if (!Number.isFinite(Number(units_consumed)) || Number(units_consumed) <= 0) return res.status(400).json({ error: 'Invalid units_consumed' })

  const state = loadState()
  if (!state.consumers.some(c => c.consumerID === Number(consumerID))) {
    return res.status(404).json({ error: 'Consumer not found' })
  }
  if (state.bills.some(b => b.consumerID === Number(consumerID) && b.month === Number(month) && b.year === Number(year))) {
    return res.status(409).json({ error: 'Bill already exists for month/year' })
  }
  const amt = Number(units_consumed) * state.cost_per_unit
  const bill = { consumerID: Number(consumerID), month: Number(month), year: Number(year), units_consumed: Number(units_consumed), amt }
  const next = { ...state, bills: [...state.bills, bill] }
  saveState(next)
  res.status(201).json(bill)
})

app.delete('/api/bill/:consumerID/:year/:month', (req, res) => {
  const consumerID = Number(req.params.consumerID)
  const year = Number(req.params.year)
  const month = Number(req.params.month)
  const state = loadState()
  const nextBills = state.bills.filter(b => !(b.consumerID === consumerID && b.month === month && b.year === year))
  const next = { ...state, bills: nextBills }
  saveState(next)
  res.json({ ok: true })
})

app.get('/api/consumer/:id', (req, res) => {
  const id = Number(req.params.id)
  const state = loadState()
  const consumer = state.consumers.find(c => c.consumerID === id)
  if (!consumer) return res.status(404).json({ error: 'Not found' })
  res.json(consumer)
})

app.get('/api/bill/:consumerID/:year/:month', (req, res) => {
  const consumerID = Number(req.params.consumerID)
  const year = Number(req.params.year)
  const month = Number(req.params.month)
  const state = loadState()
  const bill = state.bills.find(b => b.consumerID === consumerID && b.month === month && b.year === year)
  if (!bill) return res.status(404).json({ error: 'Not found' })
  res.json(bill)
})

app.get('/api/bills/previous/:consumerID/:year/:month', (req, res) => {
  const consumerID = Number(req.params.consumerID)
  const year = Number(req.params.year)
  const month = Number(req.params.month)
  const state = loadState()
  const past = state.bills.filter(b => b.consumerID === consumerID && (b.year < year || (b.year === year && b.month < month)))
  past.sort((a, b) => (b.year - a.year) || (b.month - a.month))
  res.json(past.slice(0, 3))
})

app.patch('/api/settings/cost-per-unit', (req, res) => {
  const { cpu } = req.body || {}
  if (!Number.isFinite(Number(cpu)) || Number(cpu) <= 0) return res.status(400).json({ error: 'Invalid cpu' })
  const state = loadState()
  const next = { ...state, cost_per_unit: Number(cpu) }
  saveState(next)
  res.json({ cost_per_unit: next.cost_per_unit })
})

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})
