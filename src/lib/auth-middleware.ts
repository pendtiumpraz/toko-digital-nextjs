import { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string
  role: string
  storeId?: string
}

export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Get token from cookie or Authorization header
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return null
    }

    // Verify JWT token
    const decoded = verifyToken(token)
    if (!decoded) {
      return null
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { store: true }
    })

    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      storeId: user.store?.id
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  )
}