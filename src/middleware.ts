import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/firebase/config';
import { getIdToken } from 'firebase/auth';

// Define public routes that don't require authentication
const publicRoutes = ['/auth', '/api/auth', '/_next', '/favicon.ico'];

// Define authentication routes
const authRoutes = ['/auth/name', '/auth/phone', '/auth/verify'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/app'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  try {
    // For protected routes, check for auth token
    if (isProtectedRoute) {
      const currentUser = auth.currentUser;
      
      // If no user is logged in, redirect to login
      if (!currentUser) {
        const loginUrl = new URL('/auth/name', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // Get the ID token
      const token = await getIdToken(currentUser, true);
      
      // If no token (shouldn't happen if we have a user), redirect to login
      if (!token) {
        const loginUrl = new URL('/auth/name', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    
    // If user is already authenticated and tries to access auth routes, redirect to dashboard
    if (isAuthRoute && auth.currentUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If token exists and trying to access auth routes, redirect to dashboard
    if (authRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // If it's an auth route, allow it to proceed (handled by client-side auth)
    if (isAuthRoute) {
      return NextResponse.next();
    }
    
    // If it's a protected route, redirect to login with error
    if (isProtectedRoute) {
      const loginUrl = new URL('/auth/name', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // For all other errors, allow the request to continue
    return NextResponse.next();
  }

  // Continue with the request if no redirect is needed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes (handled by client-side auth)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
