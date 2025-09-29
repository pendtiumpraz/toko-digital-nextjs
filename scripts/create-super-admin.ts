import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@dibeli.my.id' }
    })

    if (existingAdmin) {
      console.log('Super admin already exists. Updating password...')

      // Update password
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await prisma.user.update({
        where: { email: 'admin@dibeli.my.id' },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          isActive: true,
          isEmailVerified: true
        }
      })

      console.log('✅ Super admin password updated successfully!')
    } else {
      console.log('Creating new super admin...')

      // Create new super admin
      const hashedPassword = await bcrypt.hash('admin123', 12)
      await prisma.user.create({
        data: {
          name: 'Super Administrator',
          email: 'admin@dibeli.my.id',
          password: hashedPassword,
          phone: '628123456789',
          role: 'SUPER_ADMIN',
          isActive: true,
          isEmailVerified: true,
          trialStartDate: new Date(),
          trialEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
        }
      })

      console.log('✅ Super admin created successfully!')
    }

    console.log('\n📝 Super Admin Credentials:')
    console.log('----------------------------')
    console.log('Email: admin@dibeli.my.id')
    console.log('Password: admin123')
    console.log('Role: SUPER_ADMIN')
    console.log('----------------------------\n')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()