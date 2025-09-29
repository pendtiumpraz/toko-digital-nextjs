import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, storeId, customMessage } = body;

    if (!orderId || !storeId) {
      return NextResponse.json(
        { error: 'Order ID and Store ID are required' },
        { status: 400 }
      );
    }

    // Get order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                sku: true
              }
            }
          }
        },
        store: {
          select: {
            name: true,
            whatsappSettings: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.storeId !== storeId) {
      return NextResponse.json(
        { error: 'Unauthorized access to order' },
        { status: 403 }
      );
    }

    // Get WhatsApp settings
    const whatsappSettings = order.store.whatsappSettings;
    if (!whatsappSettings || !whatsappSettings.isEnabled) {
      return NextResponse.json(
        { error: 'WhatsApp integration is not enabled for this store' },
        { status: 400 }
      );
    }

    // Format price
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(price);
    };

    // Prepare order items summary
    const itemsSummary = order.items.map(item =>
      `• ${item.name} x${item.quantity} - ${formatPrice(item.subtotal.toNumber())}`
    ).join('\n');

    // Create message from template
    let message = customMessage || whatsappSettings.orderConfirmationTemplate;

    // Replace placeholders
    message = message
      .replace(/\[ORDER_ID\]/g, order.orderNumber)
      .replace(/\[ORDER_NUMBER\]/g, order.orderNumber)
      .replace(/\[CUSTOMER_NAME\]/g, order.customerName)
      .replace(/\[TOTAL\]/g, formatPrice(order.total.toNumber()))
      .replace(/\[SUBTOTAL\]/g, formatPrice(order.subtotal.toNumber()))
      .replace(/\[ITEMS\]/g, itemsSummary)
      .replace(/\[STORE_NAME\]/g, order.store.name)
      .replace(/\[PAYMENT_METHOD\]/g, order.paymentMethod)
      .replace(/\[STATUS\]/g, order.status);

    // Add order details if not custom message
    if (!customMessage) {
      message += `\n\n📋 *Order Details:*\n${itemsSummary}`;
      message += `\n\n💰 *Total: ${formatPrice(order.total.toNumber())}*`;
      message += `\n💳 *Payment Method:* ${order.paymentMethod}`;
      message += `\n📦 *Status:* ${order.status}`;


      message += `\n\nThank you for choosing ${order.store.name}! 🙏`;
    }

    // Get customer phone number
    const customerPhone = order.customerWhatsapp || order.customerPhone;
    if (!customerPhone) {
      return NextResponse.json(
        { error: 'Customer phone number not available' },
        { status: 400 }
      );
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = customerPhone.replace(/\D/g, '');

    // Ensure it starts with country code
    let formattedPhone = cleanPhone;
    if (cleanPhone.startsWith('0')) {
      formattedPhone = '62' + cleanPhone.substring(1);
    } else if (!cleanPhone.startsWith('62')) {
      formattedPhone = '62' + cleanPhone;
    }

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    // In a real implementation, you would integrate with WhatsApp Business API
    // For now, we'll just return the URL and message for manual sending

    // Log the message sending attempt
    console.log(`WhatsApp message prepared for order ${order.orderNumber}:`, {
      phone: formattedPhone,
      message: message.substring(0, 100) + '...'
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp message prepared successfully',
      data: {
        whatsappUrl,
        message,
        customerPhone: formattedPhone,
        orderNumber: order.orderNumber
      }
    });

  } catch (error: unknown) {
    console.error('Error sending WhatsApp order confirmation:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp order confirmation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      );
    }

    // Get WhatsApp settings for the store
    const whatsappSettings = await prisma.whatsAppSettings.findUnique({
      where: { storeId },
      select: {
        isEnabled: true,
        phoneNumber: true,
        businessName: true,
        orderConfirmationTemplate: true,
        greetingMessage: true,
        awayMessage: true,
        businessHoursEnabled: true,
        businessHoursStart: true,
        businessHoursEnd: true,
        businessHoursTimezone: true
      }
    });

    if (!whatsappSettings) {
      return NextResponse.json(
        { error: 'WhatsApp settings not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: whatsappSettings
    });

  } catch (error: unknown) {
    console.error('Error fetching WhatsApp settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp settings' },
      { status: 500 }
    );
  }
}