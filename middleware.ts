import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/verify-email'];
const authRoutes = ['/login', '/register', '/forgot-password', '/verify-email'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude public assets and API routes from middleware checks
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.includes(pathname);
  const isAuthRoute = authRoutes.includes(pathname);

  // In Next.js App Router, we'll check for our auth cookie (set by Express later)
  // For now, since we haven't implemented the backend cookie yet, we'll allow all requests 
  // but set up the structure. Once the backend sets `hh_auth_token` or similar, we'll check it here.
  const hasAuthToken = request.cookies.has('refreshToken') || request.cookies.has('hh_auth_token'); 

  // If user is trying to access a protected route without auth
  if (!isPublicRoute && !hasAuthToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and trying to access login/register
  if (isAuthRoute && hasAuthToken) {
    return NextResponse.redirect(new URL('/feed', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
