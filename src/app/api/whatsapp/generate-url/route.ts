import { NextRequest, NextResponse } from 'next/server'
import { generateProductCheckoutUrl, generateProductInquiryUrl, generateBulkCheckoutUrl } from '@/lib/whatsapp'

/**
 * POST /api/whatsapp/generate-url - Generate WhatsApp URLs
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, productId, storeId, quantity, customMessage, customerInfo, items } = body

    if (!type) {
      return NextResponse.json(
        { error: 'Type is required (checkout, inquiry, bulk)' },
        { status: 400 }
      )
    }

    let url: string

    switch (type) {
      case 'checkout':
        if (!productId) {
          return NextResponse.json(
            { error: 'Product ID is required for checkout' },
            { status: 400 }
          )
        }
        url = await generateProductCheckoutUrl(productId, quantity || 1, customerInfo)
        break

      case 'inquiry':
        if (!productId) {
          return NextResponse.json(
            { error: 'Product ID is required for inquiry' },
            { status: 400 }
          )
        }
        url = await generateProductInquiryUrl(productId, customMessage)
        break

      case 'bulk':
        if (!storeId || !items || !Array.isArray(items)) {
          return NextResponse.json(
            { error: 'Store ID and items array are required for bulk checkout' },
            { status: 400 }
          )
        }
        url = await generateBulkCheckoutUrl(items, storeId, customerInfo)
        break

      default:
        return NextResponse.json(
          { error: 'Invalid type. Available types: checkout, inquiry, bulk' },
          { status: 400 }
        )
    }

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error generating WhatsApp URL:', error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}