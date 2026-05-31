import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') return NextResponse.next()

  const token = request.cookies.get('admin_auth')?.value
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
