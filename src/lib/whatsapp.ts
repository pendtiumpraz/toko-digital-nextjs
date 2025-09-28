import { prisma } from './prisma'

export interface WhatsAppMessage {
  storeName: string
  customerName: string
  customerPhone: string
  customerAddress?: string
  items: Array<{
    name: string
    quantity: number
    price: number
    variant?: string
  }>
  total: number
  notes?: string
  orderNumber?: string
}

export interface Product {
  id: string
  name: string
  price: number
  description: string
  images?: string[]
  store: {
    name: string
    whatsappNumber: string
  }
}

/**
 * Generate WhatsApp message for order
 */
export function generateOrderMessage(message: WhatsAppMessage): string {
  const { storeName, customerName, customerPhone, customerAddress, items, total, notes, orderNumber } = message

  let whatsappMessage = `🛒 *New Order${orderNumber ? ` #${orderNumber}` : ''} from ${storeName}*\n\n`

  // Customer Information
  whatsappMessage += `👤 *Customer Information:*\n`
  whatsappMessage += `Name: ${customerName}\n`
  whatsappMessage += `Phone: ${customerPhone}\n`
  if (customerAddress) {
    whatsappMessage += `Address: ${customerAddress}\n`
  }
  if (notes) {
    whatsappMessage += `Notes: ${notes}\n`
  }

  // Order Details
  whatsappMessage += `\n📦 *Order Details:*\n`
  whatsappMessage += `------------------------\n`

  items.forEach(item => {
    whatsappMessage += `${item.name}`
    if (item.variant) {
      whatsappMessage += ` (${item.variant})`
    }
    whatsappMessage += `\n`
    whatsappMessage += `${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.price * item.quantity)}\n\n`
  })

  whatsappMessage += `------------------------\n`
  whatsappMessage += `💰 *Total: ${formatPrice(total)}*\n\n`
  whatsappMessage += `Please confirm the order and provide payment details. Thank you! 🙏`

  return whatsappMessage
}

/**
 * Generate WhatsApp message for product inquiry
 */
export function generateProductInquiryMessage(product: Product, customMessage?: string): string {
  let message = `Hello! I'm interested in this product:\n\n`
  message += `📦 *${product.name}*\n`
  message += `💰 Price: ${formatPrice(product.price)}\n`
  message += `📝 ${product.description}\n\n`

  if (customMessage) {
    message += `Additional message: ${customMessage}\n\n`
  }

  message += `Could you please provide more information? Thank you!`

  return message
}

/**
 * Generate WhatsApp message for general store inquiry
 */
export function generateStoreInquiryMessage(storeName: string, customMessage?: string): string {
  let message = `Hello ${storeName}! 👋\n\n`

  if (customMessage) {
    message += `${customMessage}\n\n`
  } else {
    message += `I would like to know more about your products and services.\n\n`
  }

  message += `Thank you!`

  return message
}

/**
 * Create WhatsApp URL for opening chat
 */
export function createWhatsAppUrl(phoneNumber: string, message: string): string {
  // Ensure phone number is in international format
  const cleanPhone = cleanPhoneNumber(phoneNumber)
  const encodedMessage = encodeURIComponent(message)

  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

/**
 * Create WhatsApp URL for web version
 */
export function createWhatsAppWebUrl(phoneNumber: string, message: string): string {
  const cleanPhone = cleanPhoneNumber(phoneNumber)
  const encodedMessage = encodeURIComponent(message)

  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`
}

/**
 * Clean and format phone number for WhatsApp
 */
export function cleanPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '')

  // Handle Indonesian phone numbers
  if (cleaned.startsWith('08')) {
    // Convert 08xxx to 628xxx
    cleaned = '62' + cleaned.substring(1)
  } else if (cleaned.startsWith('8')) {
    // Convert 8xxx to 628xxx
    cleaned = '62' + cleaned
  } else if (!cleaned.startsWith('62')) {
    // Assume it's Indonesian if no country code
    cleaned = '62' + cleaned
  }

  return cleaned
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'IDR'): string {
  switch (currency) {
    case 'IDR':
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(price)

    case 'USD':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price)

    default:
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0
      }).format(price)
  }
}

/**
 * Generate custom WhatsApp message from template
 */
export function generateCustomMessage(template: string, variables: Record<string, any>): string {
  let message = template

  // Replace variables in the format {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    message = message.replace(regex, String(value))
  })

  return message
}

/**
 * Validate WhatsApp phone number
 */
export function isValidWhatsAppNumber(phoneNumber: string): boolean {
  const cleaned = cleanPhoneNumber(phoneNumber)

  // Check if it's a valid length (typically 10-15 digits)
  if (cleaned.length < 10 || cleaned.length > 15) {
    return false
  }

  // Check if it's all digits
  return /^\d+$/.test(cleaned)
}

/**
 * Get store WhatsApp settings
 */
export async function getStoreWhatsAppSettings(storeId: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        name: true,
        whatsappNumber: true,
        currency: true
      }
    })

    if (!store) {
      throw new Error('Store not found')
    }

    if (!store.whatsappNumber) {
      throw new Error('WhatsApp number not configured for this store')
    }

    if (!isValidWhatsAppNumber(store.whatsappNumber)) {
      throw new Error('Invalid WhatsApp number format')
    }

    return {
      storeName: store.name,
      whatsappNumber: cleanPhoneNumber(store.whatsappNumber),
      currency: store.currency
    }
  } catch (error) {
    console.error('Error getting store WhatsApp settings:', error)
    throw error
  }
}

/**
 * Generate WhatsApp checkout URL for product
 */
export async function generateProductCheckoutUrl(
  productId: string,
  quantity: number = 1,
  customerInfo?: {
    name?: string
    phone?: string
    address?: string
    notes?: string
  }
): Promise<string> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            name: true,
            whatsappNumber: true,
            currency: true
          }
        }
      }
    })

    if (!product) {
      throw new Error('Product not found')
    }

    const storeSettings = await getStoreWhatsAppSettings(product.storeId)

    const message = generateOrderMessage({
      storeName: storeSettings.storeName,
      customerName: customerInfo?.name || '[Your Name]',
      customerPhone: customerInfo?.phone || '[Your Phone]',
      customerAddress: customerInfo?.address,
      items: [{
        name: product.name,
        quantity,
        price: Number(product.price)
      }],
      total: Number(product.price) * quantity,
      notes: customerInfo?.notes
    })

    return createWhatsAppUrl(storeSettings.whatsappNumber, message)
  } catch (error) {
    console.error('Error generating product checkout URL:', error)
    throw error
  }
}

/**
 * Generate WhatsApp inquiry URL for product
 */
export async function generateProductInquiryUrl(
  productId: string,
  customMessage?: string
): Promise<string> {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        store: {
          select: {
            name: true,
            whatsappNumber: true
          }
        }
      }
    })

    if (!product) {
      throw new Error('Product not found')
    }

    const storeSettings = await getStoreWhatsAppSettings(product.storeId)

    const message = generateProductInquiryMessage({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      description: product.description,
      store: {
        name: storeSettings.storeName,
        whatsappNumber: storeSettings.whatsappNumber
      }
    }, customMessage)

    return createWhatsAppUrl(storeSettings.whatsappNumber, message)
  } catch (error) {
    console.error('Error generating product inquiry URL:', error)
    throw error
  }
}

/**
 * Generate bulk WhatsApp URLs for multiple products
 */
export async function generateBulkCheckoutUrl(
  items: Array<{
    productId: string
    quantity: number
    variant?: string
  }>,
  storeId: string,
  customerInfo?: {
    name?: string
    phone?: string
    address?: string
    notes?: string
  }
): Promise<string> {
  try {
    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map(item => item.productId) },
        storeId
      },
      select: {
        id: true,
        name: true,
        price: true
      }
    })

    const storeSettings = await getStoreWhatsAppSettings(storeId)

    const orderItems = items.map(item => {
      const product = products.find(p => p.id === item.productId)
      if (!product) {
        throw new Error(`Product ${item.productId} not found`)
      }

      return {
        name: product.name,
        quantity: item.quantity,
        price: Number(product.price),
        variant: item.variant
      }
    })

    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const message = generateOrderMessage({
      storeName: storeSettings.storeName,
      customerName: customerInfo?.name || '[Your Name]',
      customerPhone: customerInfo?.phone || '[Your Phone]',
      customerAddress: customerInfo?.address,
      items: orderItems,
      total,
      notes: customerInfo?.notes
    })

    return createWhatsAppUrl(storeSettings.whatsappNumber, message)
  } catch (error) {
    console.error('Error generating bulk checkout URL:', error)
    throw error
  }
}