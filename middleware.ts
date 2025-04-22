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
    // Check for doctor session cookie
    const doctorId = request.cookies.get('doctorId')?.value;
    
    // If no doctor session, redirect to doctor login
    if (!doctorId) {
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