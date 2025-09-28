import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logout berhasil' },
    { status: 200 }
  )

  // Clear the auth cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0 // This will delete the cookie
  })

  return response
}