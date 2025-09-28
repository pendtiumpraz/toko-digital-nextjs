import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import StorePageClient from './StorePageClient'

async function getStore(subdomain: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { subdomain },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: true
          },
          orderBy: { createdAt: 'desc' },
          take: 12
        }
      }
    })
    return store
  } catch (error) {
    console.error('Error fetching store:', error)
    return null
  }
}

export default async function StorePage({ params }: { params: { subdomain: string } }) {
  const store = await getStore(params.subdomain)

  if (!store || !store.isActive) {
    notFound()
  }

  // Convert Decimal prices to numbers for client component
  const storeWithSerializedPrices = {
    ...store,
    products: store.products.map(product => ({
      ...product,
      price: product.price.toNumber(),
      comparePrice: product.comparePrice ? product.comparePrice.toNumber() : null,
      cost: product.cost.toNumber(),
      profit: product.profit.toNumber()
    }))
  }

  return <StorePageClient store={storeWithSerializedPrices} subdomain={params.subdomain} />
}