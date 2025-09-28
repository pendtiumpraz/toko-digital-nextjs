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

  return <StorePageClient store={store} subdomain={params.subdomain} />
}