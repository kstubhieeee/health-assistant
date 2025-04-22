import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;

  // Check if the path is for admin dashboard
  if (path.startsWith('/admin/dashboard')) {
    // Check for admin session cookie
    const adminSession = request.cookies.get('adminSession')?.value;
    
    // If no admin session, redirect to admin login
    if (!adminSession) {
      const url = new URL('/admin', request.url);
      return NextResponse.redirect(url);
    }
  }

  // Check if the path is for doctor dashboard
  if (path.startsWith('/doctor/dashboard')) {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Extract token from header
    const token = extractTokenFromHeader(authHeader);
    
    // If no token or invalid token, redirect to doctor login
    if (!token) {
      const url = new URL('/doctor', request.url);
      return NextResponse.redirect(url);
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // If token is invalid or not a doctor token, redirect to login
    if (!decoded || decoded.role !== 'doctor') {
      const url = new URL('/doctor', request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/dashboard/:path*', '/doctor/dashboard/:path*'],
}; 