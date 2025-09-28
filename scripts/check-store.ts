import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkStore() {
  try {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        whatsappNumber: true,
        isActive: true,
        owner: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    console.log('Daftar Toko yang ada:')
    console.log('======================')
    stores.forEach(store => {
      console.log(`\nNama Toko: ${store.name}`)
      console.log(`Subdomain: ${store.subdomain}`)
      console.log(`URL: http://localhost:3001/store/${store.subdomain}`)
      console.log(`Owner: ${store.owner.name} (${store.owner.email})`)
      console.log(`WhatsApp: ${store.whatsappNumber}`)
      console.log(`Status: ${store.isActive ? 'Aktif' : 'Tidak Aktif'}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkStore()