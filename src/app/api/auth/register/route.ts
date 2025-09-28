import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, storeName } = await request.json()

    // Validate input
    if (!name || !email || !password || !phone || !storeName) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Generate subdomain from store name
    const subdomain = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Check if subdomain is available
    const existingStore = await prisma.store.findUnique({
      where: { subdomain }
    })

    if (existingStore) {
      return NextResponse.json(
        { error: 'Nama toko sudah digunakan, silakan gunakan nama lain' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Calculate trial end date (14 days from now)
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14)

    // Create user with store in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: 'STORE_OWNER',
          trialStartDate: new Date(),
          trialEndDate: trialEndDate,
          isActive: true,
          isEmailVerified: false
        }
      })

      // Create store
      const store = await tx.store.create({
        data: {
          ownerId: user.id,
          name: storeName,
          subdomain,
          whatsappNumber: phone,
          email,
          currency: 'IDR',
          isActive: true
        }
      })

      // Create subscription
      await tx.subscription.create({
        data: {
          userId: user.id,
          storeId: store.id,
          plan: 'FREE',
          status: 'TRIAL',
          trialStartDate: new Date(),
          trialEndDate: trialEndDate
        }
      })

      return { user, store }
    })

    // Generate JWT token
    const token = generateToken(result.user.id, result.user.email)

    // Return user data and token
    const response = NextResponse.json(
      {
        success: true,
        message: 'Registrasi berhasil! Trial 14 hari dimulai.',
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          store: {
            id: result.store.id,
            name: result.store.name,
            subdomain: result.store.subdomain
          }
        },
        token
      },
      { status: 201 }
    )

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat registrasi' },
      { status: 500 }
    )
  }
}