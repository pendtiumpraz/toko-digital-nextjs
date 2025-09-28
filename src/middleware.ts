import { NextRequest, NextResponse } from 'next/server'
import { getTenantContext } from './lib/tenant'
import { verifyToken } from './lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes that don't need tenant context, and public pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/superadmin') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/privacy' ||
    pathname === '/terms'
  ) {
    return NextResponse.next()
  }

  // Handle subdomain-based routing for stores
  const host = request.headers.get('host')
  if (host) {
    const subdomain = extractSubdomain(host)

    // If this is a store subdomain, ensure the store exists and is active
    if (subdomain && subdomain !== 'www' && subdomain !== 'admin' && subdomain !== 'api') {
      const tenantContext = await getTenantContext(request)

      if (!tenantContext) {
        // Subdomain doesn't exist or store is inactive
        return new NextResponse('Store not found or inactive', { status: 404 })
      }

      // Add tenant context to headers for downstream use
      const response = NextResponse.next()
      response.headers.set('x-tenant-id', tenantContext.storeId)
      response.headers.set('x-tenant-subdomain', subdomain)
      return response
    }
  }

  // Handle protected API routes that require tenant isolation
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth')) {
    // These routes should handle tenant isolation internally
    return NextResponse.next()
  }

  // Handle protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token and check user role
    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Add user info to headers for downstream use
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.userId)
    response.headers.set('x-user-email', decoded.email)
    return response
  }

  // Handle admin routes (super admin and admin only)
  if (pathname.startsWith('/admin')) {
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Verify token and check user role
    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get user role from database - for now, we'll skip this check
    // In a full implementation, you'd query the database here
    // For now, let the component handle role verification
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.userId)
    response.headers.set('x-user-email', decoded.email)
    return response
  }

  // Handle super admin API routes
  if (pathname.startsWith('/api/superadmin')) {
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(authToken)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Add user info to headers for API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.userId)
    response.headers.set('x-user-email', decoded.email)
    return response
  }

  return NextResponse.next()
}

/**
 * Extract subdomain from host header
 */
function extractSubdomain(host: string): string | null {
  // Remove port if present
  const hostname = host.split(':')[0]

  // Split by dots
  const parts = hostname.split('.')

  // If we have at least 3 parts (subdomain.domain.tld), return the first part
  if (parts.length >= 3) {
    return parts[0]
  }

  // For localhost development, check if it's a subdomain pattern
  if (hostname.includes('localhost') && parts.length >= 2) {
    const subdomain = parts[0]
    // Skip common non-tenant subdomains
    if (!['www', 'api', 'admin', 'app'].includes(subdomain)) {
      return subdomain
    }
  }

  return null
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}