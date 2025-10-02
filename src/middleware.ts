import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from './lib/firebase';
import { getIdToken } from 'firebase/auth';

// Define public routes that don't require authentication
const publicRoutes = [
  '/auth', 
  '/api/auth', 
  '/_next', 
  '/favicon.ico', 
  '/download',
  '/invite',
  '/sign-in',
  '/sign-up',
  '/verify-email'
];

// Define authentication routes
const authRoutes = ['/auth/name', '/auth/phone', '/auth/verify'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/couple'];

// Couple routes that should be handled by the app router
const coupleRoutes = ['/photobooth', '/games', '/memories', '/calendar'];

// Check if a path is a couple route
function isCoupleRoute(pathname: string): boolean {
  return coupleRoutes.some(route => pathname.startsWith(`/default-couple${route}`));
}

// Extract couple ID from the path
function getCoupleIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/couple\/([^/]+)/);
  return match ? match[1] : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files, API routes, and known public paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Handle redirection from /default-couple/* to /couple/[coupleId]/*
  if (pathname.startsWith('/default-couple')) {
    // For the root /default-couple, redirect to the user's couple page
    if (pathname === '/default-couple') {
      // In a real app, you'd fetch the user's couple ID from the database
      // For now, we'll use a default ID or redirect to the app root
      const url = new URL('/app', request.url);
      return NextResponse.redirect(url);
    }
    
    // For other /default-couple routes, redirect to the dynamic route
    const newPath = pathname.replace('/default-couple', '/couple/default-couple');
    return NextResponse.redirect(new URL(newPath, request.url));
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
     * - default-couple routes (handled by redirection)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    // Match all default-couple routes
    '/default-couple/:path*',
    // Match all dynamic couple routes
    '/couple/:path*',
  ],
};
