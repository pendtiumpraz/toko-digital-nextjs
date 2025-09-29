import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || 'default-store-id'; // In real app, get from auth

    const whatsappSettings = await prisma.whatsAppSettings.findUnique({
      where: { storeId }
    });

    if (!whatsappSettings) {
      // Return default settings if none exist
      return NextResponse.json({
        success: true,
        data: {
          isEnabled: false,
          phoneNumber: '',
          businessName: '',
          greetingMessage: 'Hi! Welcome to our store. How can we help you today?',
          orderConfirmationTemplate: 'Thank you for your order! We have received your order #[ORDER_ID] and will process it shortly.',
          awayMessage: 'Thanks for your message! We will get back to you as soon as possible.',
          businessHoursEnabled: false,
          businessHoursStart: '09:00',
          businessHoursEnd: '17:00',
          businessHoursTimezone: 'Asia/Jakarta'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isEnabled: whatsappSettings.isEnabled,
        phoneNumber: whatsappSettings.phoneNumber,
        businessName: whatsappSettings.businessName,
        greetingMessage: whatsappSettings.greetingMessage,
        orderConfirmationTemplate: whatsappSettings.orderConfirmationTemplate,
        awayMessage: whatsappSettings.awayMessage,
        businessHoursEnabled: whatsappSettings.businessHoursEnabled,
        businessHoursStart: whatsappSettings.businessHoursStart,
        businessHoursEnd: whatsappSettings.businessHoursEnd,
        businessHoursTimezone: whatsappSettings.businessHoursTimezone
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching WhatsApp settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch WhatsApp settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeId = 'default-store-id', // In real app, get from auth
      isEnabled,
      phoneNumber,
      businessName,
      greetingMessage,
      orderConfirmationTemplate,
      awayMessage,
      businessHours
    } = body;

    // Validate required fields
    if (isEnabled) {
      if (!phoneNumber || !businessName || !greetingMessage || !orderConfirmationTemplate) {
        return NextResponse.json(
          { error: 'Phone number, business name, greeting message, and order confirmation template are required when WhatsApp is enabled' },
          { status: 400 }
        );
      }

      // Validate phone number format
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      if (!cleanPhone.startsWith('62') || cleanPhone.length < 10 || cleanPhone.length > 15) {
        return NextResponse.json(
          { error: 'Phone number must start with 62 (Indonesia country code) and be 10-15 digits' },
          { status: 400 }
        );
      }
    }

    // Prepare data for upsert
    const data = {
      isEnabled: isEnabled || false,
      phoneNumber: phoneNumber || '',
      businessName: businessName || '',
      greetingMessage: greetingMessage || 'Hi! Welcome to our store. How can we help you today?',
      orderConfirmationTemplate: orderConfirmationTemplate || 'Thank you for your order! We have received your order #[ORDER_ID] and will process it shortly.',
      awayMessage: awayMessage || 'Thanks for your message! We will get back to you as soon as possible.',
      businessHoursEnabled: businessHours?.enabled || false,
      businessHoursStart: businessHours?.start || '09:00',
      businessHoursEnd: businessHours?.end || '17:00',
      businessHoursTimezone: businessHours?.timezone || 'Asia/Jakarta'
    };

    // Upsert WhatsApp settings
    const whatsappSettings = await prisma.whatsAppSettings.upsert({
      where: { storeId },
      create: {
        storeId,
        ...data
      },
      update: data
    });

    return NextResponse.json({
      success: true,
      message: 'WhatsApp settings saved successfully',
      data: {
        isEnabled: whatsappSettings.isEnabled,
        phoneNumber: whatsappSettings.phoneNumber,
        businessName: whatsappSettings.businessName,
        greetingMessage: whatsappSettings.greetingMessage,
        orderConfirmationTemplate: whatsappSettings.orderConfirmationTemplate,
        awayMessage: whatsappSettings.awayMessage,
        businessHoursEnabled: whatsappSettings.businessHoursEnabled,
        businessHoursStart: whatsappSettings.businessHoursStart,
        businessHoursEnd: whatsappSettings.businessHoursEnd,
        businessHoursTimezone: whatsappSettings.businessHoursTimezone
      }
    });

  } catch (error: unknown) {
    console.error('Error saving WhatsApp settings:', error);
    return NextResponse.json(
      { error: 'Failed to save WhatsApp settings' },
      { status: 500 }
    );
  }
}