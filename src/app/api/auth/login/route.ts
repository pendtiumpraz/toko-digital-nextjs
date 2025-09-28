import { NextResponse } from 'next/server'
import { prisma, serializeBigInt } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: { store: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Akun Anda tidak aktif. Hubungi admin.' },
        { status: 403 }
      )
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    })

    // Generate JWT token
    const token = generateToken(user.id, user.email)

    // Serialize the store data to handle BigInt values
    const storeData = user.store ? serializeBigInt({
      id: user.store.id,
      name: user.store.name,
      subdomain: user.store.subdomain,
      whatsappNumber: user.store.whatsappNumber,
      isActive: user.store.isActive
    }) : null

    // Return user data and token with proper role-based routing
    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          store: storeData,
          redirectTo: user.role === 'SUPER_ADMIN' ? '/admin' :
                     user.role === 'ADMIN' ? '/admin' : '/dashboard'
        },
        token
      },
      { status: 200 }
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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}