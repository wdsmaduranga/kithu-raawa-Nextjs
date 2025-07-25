// middleware.js
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the token from the cookie
  const token = request.cookies.get('token')?.value

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  try {
    // Verify token with Laravel Passport
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    const user = await response.json()

    // Check if route requires admin access
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    if (isAdminRoute && user.user.user_role !== 1) {
      // User is not admin, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Check if route requires reverend access
    const isReverendRoute = request.nextUrl.pathname.startsWith('/reverend')
    if (isReverendRoute && !user.isReverendFather) {
      // User is not a reverend, redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
}

// Configure which routes should be protected
export const config = {
  matcher: [
    '/admin/:path*',   // Protect all admin routes
    '/reverend/:path*', // Protect all reverend routes
    // '/meditation/:path*' // Protect meditation routes
  ]
}