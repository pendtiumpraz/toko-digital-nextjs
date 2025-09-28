import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files, API routes that don't need tenant context, and public pages
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Handle subdomain-based routing for stores
  const host = request.headers.get('host')
  if (host) {
    const subdomain = extractSubdomain(host)

    // If this is a store subdomain, add headers for downstream processing
    if (subdomain && subdomain !== 'www' && subdomain !== 'admin' && subdomain !== 'api') {
      const response = NextResponse.next()
      response.headers.set('x-tenant-subdomain', subdomain)
      return response
    }
  }

  // Handle protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Token verification will be handled in the route handlers
    return NextResponse.next()
  }

  // Handle admin routes (super admin and admin only)
  if (pathname.startsWith('/admin') || pathname.startsWith('/superadmin')) {
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Role verification will be handled in the route handlers
    return NextResponse.next()
  }

  // Handle super admin API routes
  if (pathname.startsWith('/api/superadmin')) {
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Token and role verification will be handled in the API routes
    return NextResponse.next()
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