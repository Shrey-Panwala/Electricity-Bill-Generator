import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.bill.deleteMany()
  await prisma.consumer.deleteMany()
  await prisma.settings.deleteMany()

  // Seed settings
  await prisma.settings.create({
    data: {
      key: 'cost_per_unit',
      value: '5.0'
    }
  })

  // Seed consumers
  const consumers = [
    { consumerID: 1001, name: 'Rajesh Kumar', address: 'MG Road, Bangalore', mobile_no: '9876543210' },
    { consumerID: 1002, name: 'Priya Sharma', address: 'Park Street, Kolkata', mobile_no: '9876543211' },
    { consumerID: 1003, name: 'Amit Patel', address: 'Marine Drive, Mumbai', mobile_no: '9876543212' },
    { consumerID: 1004, name: 'Sneha Reddy', address: 'Banjara Hills, Hyderabad', mobile_no: '9876543213' },
    { consumerID: 1005, name: 'Vijay Singh', address: 'Connaught Place, Delhi', mobile_no: '9876543214' }
  ]

  for (const consumer of consumers) {
    await prisma.consumer.create({ data: consumer })
  }

  // Seed bills (last 3 months for each consumer)
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const billData = []
  
  for (const consumer of consumers) {
    // Generate 3 months of bill history
    for (let i = 2; i >= 0; i--) {
      let month = currentMonth - i
      let year = currentYear
      
      if (month <= 0) {
        month += 12
        year -= 1
      }
      
      const units = Math.floor(Math.random() * 300) + 100 // 100-400 units
      const amt = units * 5.0
      
      billData.push({
        consumerID: consumer.consumerID,
        month,
        year,
        units_consumed: units,
        amt
      })
    }
  }

  for (const bill of billData) {
    await prisma.bill.create({ data: bill })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`   - ${consumers.length} consumers created`)
  console.log(`   - ${billData.length} bills created`)
  console.log('   - Default cost per unit: ₹5.00')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
