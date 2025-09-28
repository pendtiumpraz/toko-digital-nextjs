import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.subscription.deleteMany()
  await prisma.store.deleteMany()
  await prisma.user.deleteMany()

  // Create Super Admin Account
  const superAdminPassword = await bcrypt.hash('Admin@2025!', 12)

  const superAdmin = await prisma.user.create({
    data: {
      name: 'Super Administrator',
      email: 'admin@dibeli.my.id',
      password: superAdminPassword,
      phone: '628123456789',
      role: 'SUPER_ADMIN',
      isActive: true,
      isEmailVerified: true,
      trialStartDate: new Date(),
      trialEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)) // Super admin doesn't need trial expiry
    }
  })

  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 12)

  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 14)

  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      phone: '628123456789',
      role: 'STORE_OWNER',
      isActive: true,
      isEmailVerified: true,
      trialStartDate: new Date(),
      trialEndDate: trialEndDate
    }
  })

  // Create store for test user
  const store = await prisma.store.create({
    data: {
      ownerId: user.id,
      name: 'Test Store',
      subdomain: 'test-store',
      whatsappNumber: '628123456789',
      email: 'test@example.com',
      currency: 'IDR',
      isActive: true,
      description: 'This is a test store for development'
    }
  })

  // Create subscription
  await prisma.subscription.create({
    data: {
      userId: user.id,
      storeId: store.id,
      plan: 'FREE',
      status: 'TRIAL',
      trialStartDate: new Date(),
      trialEndDate: trialEndDate
    }
  })

  console.log('Seed data created successfully!')
  console.log('---')
  console.log('🔑 Super Admin Credentials:')
  console.log('Email: admin@dibeli.my.id')
  console.log('Password: Admin@2025!')
  console.log('Role: SUPER_ADMIN')
  console.log('---')
  console.log('🧪 Test User Credentials:')
  console.log('Email: test@example.com')
  console.log('Password: password123')
  console.log('Role: STORE_OWNER')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })