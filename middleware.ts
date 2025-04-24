import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    // Get token from cookie
    const token = request.cookies.get('doctor_token')?.value;
    
    // If no token, redirect to doctor login
    if (!token) {
      console.log("Middleware: No token cookie found, redirecting to login");
      const url = new URL('/doctor', request.url);
      return NextResponse.redirect(url);
    }
    
    // For Edge runtime compatibility, we'll just check if the token exists
    // The actual token verification will happen in the API endpoints
    // We don't need to do full verification here since the /api/auth/doctor-session
    // endpoint will perform full verification with the Node.js runtime
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/admin/dashboard/:path*', '/doctor/dashboard/:path*'],
}; 