import { PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'

const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json())

// Validation helpers
function valid_num(mobile_no) { return /^[0-9]{10}$/.test(String(mobile_no)) }
function valid_year(year) { 
  const y = Number(year)
  const currentYear = new Date().getFullYear()
  return y >= 2000 && y <= currentYear 
}
function valid_month(month) { 
  const m = Number(month)
  return m >= 1 && m <= 12 
}
function valid_address(address) { 
  return String(address).trim().length >= 7 
}
function valid_consumer_id(id) { 
  const i = Number(id)
  return Number.isInteger(i) && i > 0 
}

// Get cost per unit setting
async function getCostPerUnit() {
  const setting = await prisma.settings.findUnique({ where: { key: 'cost_per_unit' } })
  return setting ? parseFloat(setting.value) : 5.0
}

// Set cost per unit setting
async function setCostPerUnit(value) {
  await prisma.settings.upsert({
    where: { key: 'cost_per_unit' },
    update: { value: String(value) },
    create: { key: 'cost_per_unit', value: String(value) }
  })
}

// GET /api/state - Get all data
app.get('/api/state', async (_req, res) => {
  try {
    const consumers = await prisma.consumer.findMany({
      orderBy: { consumerID: 'asc' }
    })
    const bills = await prisma.bill.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }]
    })
    const cost_per_unit = await getCostPerUnit()
    
    res.json({ consumers, bills, cost_per_unit })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

// POST /api/consumer - Add consumer
app.post('/api/consumer', async (req, res) => {
  try {
    const { consumerID, name, address, mobile_no } = req.body || {}
    
    if (!valid_consumer_id(consumerID)) {
      return res.status(400).json({ error: 'Invalid consumerID' })
    }
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Invalid name' })
    }
    if (!valid_address(address)) {
      return res.status(400).json({ error: 'Invalid address (min 7 chars)' })
    }
    if (!valid_num(mobile_no)) {
      return res.status(400).json({ error: 'Invalid mobile_no (10 digits)' })
    }

    const existing = await prisma.consumer.findUnique({
      where: { consumerID: Number(consumerID) }
    })
    if (existing) {
      return res.status(409).json({ error: 'Consumer already exists' })
    }

    const consumer = await prisma.consumer.create({
      data: {
        consumerID: Number(consumerID),
        name: String(name).trim(),
        address: String(address).trim(),
        mobile_no: String(mobile_no).trim()
      }
    })
    
    res.status(201).json(consumer)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create consumer' })
  }
})

// DELETE /api/consumer/:id - Delete consumer and their bills
app.delete('/api/consumer/:id', async (req, res) => {
  try {
    const consumerID = Number(req.params.id)
    
    await prisma.consumer.delete({
      where: { consumerID }
    })
    
    res.json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete consumer' })
  }
})

// GET /api/consumer/:id - Fetch a single consumer
app.get('/api/consumer/:id', async (req, res) => {
  try {
    const consumerID = Number(req.params.id)
    const consumer = await prisma.consumer.findUnique({ where: { consumerID } })
    if (!consumer) return res.status(404).json({ error: 'Not found' })
    res.json(consumer)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch consumer' })
  }
})

// POST /api/bill - Add bill
app.post('/api/bill', async (req, res) => {
  try {
    const { consumerID, month, year, units_consumed } = req.body || {}
    
    if (!valid_consumer_id(consumerID)) {
      return res.status(400).json({ error: 'Invalid consumerID' })
    }
    if (!valid_month(month)) {
      return res.status(400).json({ error: 'Invalid month (1-12)' })
    }
    if (!valid_year(year)) {
      return res.status(400).json({ error: 'Invalid year' })
    }
    if (!Number.isFinite(Number(units_consumed)) || Number(units_consumed) <= 0) {
      return res.status(400).json({ error: 'Invalid units_consumed' })
    }

    const consumer = await prisma.consumer.findUnique({
      where: { consumerID: Number(consumerID) }
    })
    if (!consumer) {
      return res.status(404).json({ error: 'Consumer not found' })
    }

    const existing = await prisma.bill.findUnique({
      where: {
        consumerID_month_year: {
          consumerID: Number(consumerID),
          month: Number(month),
          year: Number(year)
        }
      }
    })
    if (existing) {
      return res.status(409).json({ error: 'Bill already exists for month/year' })
    }

    const cost_per_unit = await getCostPerUnit()
    const amt = Number(units_consumed) * cost_per_unit

    const bill = await prisma.bill.create({
      data: {
        consumerID: Number(consumerID),
        month: Number(month),
        year: Number(year),
        units_consumed: Number(units_consumed),
        amt
      }
    })
    
    res.status(201).json(bill)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create bill' })
  }
})

// DELETE /api/bill/:consumerID/:year/:month - Delete specific bill
app.delete('/api/bill/:consumerID/:year/:month', async (req, res) => {
  try {
    const consumerID = Number(req.params.consumerID)
    const year = Number(req.params.year)
    const month = Number(req.params.month)
    
    await prisma.bill.delete({
      where: {
        consumerID_month_year: { consumerID, month, year }
      }
    })
    
    res.json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete bill' })
  }
})

// GET /api/bill/:consumerID/:year/:month - Fetch a single bill
app.get('/api/bill/:consumerID/:year/:month', async (req, res) => {
  try {
    const consumerID = Number(req.params.consumerID)
    const year = Number(req.params.year)
    const month = Number(req.params.month)
    const bill = await prisma.bill.findUnique({
      where: { consumerID_month_year: { consumerID, month, year } }
    })
    if (!bill) return res.status(404).json({ error: 'Not found' })
    res.json(bill)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch bill' })
  }
})

// GET /api/bills/previous/:consumerID/:year/:month - Last 3 previous bills
app.get('/api/bills/previous/:consumerID/:year/:month', async (req, res) => {
  try {
    const consumerID = Number(req.params.consumerID)
    const year = Number(req.params.year)
    const month = Number(req.params.month)
    const bills = await prisma.bill.findMany({
      where: {
        consumerID,
        OR: [
          { year: { lt: year } },
          { year, month: { lt: month } }
        ]
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 3
    })
    res.json(bills)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch previous bills' })
  }
})

// GET /api/settings/cost-per-unit - Get cost per unit
app.get('/api/settings/cost-per-unit', async (_req, res) => {
  try {
    const value = await getCostPerUnit()
    res.json({ cost_per_unit: value })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch setting' })
  }
})

// PUT /api/settings/cost-per-unit - Update cost per unit
app.put('/api/settings/cost-per-unit', async (req, res) => {
  try {
    const { value } = req.body || {}
    const num = Number(value)
    
    if (!Number.isFinite(num) || num <= 0) {
      return res.status(400).json({ error: 'Invalid value' })
    }
    
    await setCostPerUnit(num)
    res.json({ cost_per_unit: num })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update setting' })
  }
})

// Allow PATCH as well for compatibility
app.patch('/api/settings/cost-per-unit', async (req, res) => {
  try {
    const { value, cpu } = req.body || {}
    const num = Number(value ?? cpu)
    if (!Number.isFinite(num) || num <= 0) return res.status(400).json({ error: 'Invalid value' })
    await setCostPerUnit(num)
    res.json({ cost_per_unit: num })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update setting' })
  }
})

// Health check
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' })
  }
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints:`)
  console.log(`   GET  /api/state`)
  console.log(`   POST /api/consumer`)
  console.log(`   POST /api/bill`)
  console.log(`   GET  /api/health`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
