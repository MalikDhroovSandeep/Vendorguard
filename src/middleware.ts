import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const userRole = req.auth?.user?.role;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

    // Auth routes (login/signup) - redirect to dashboard if already logged in
    const authRoutes = ['/login', '/signup'];
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    // Dashboard routes require authentication
    const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');

    // Admin-only routes
    const isAdminRoute = nextUrl.pathname.startsWith('/dashboard/admin');

    // If on auth route and logged in, redirect to appropriate dashboard
    if (isAuthRoute && isLoggedIn) {
        const redirectUrl = getRedirectUrl(userRole);
        return NextResponse.redirect(new URL(redirectUrl, nextUrl));
    }

    // If on dashboard route and not logged in, redirect to login
    if (isDashboardRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', nextUrl));
    }

    // If on admin route but not admin, redirect to appropriate dashboard
    if (isAdminRoute && isLoggedIn && userRole !== 'admin') {
        const redirectUrl = getRedirectUrl(userRole);
        return NextResponse.redirect(new URL(redirectUrl, nextUrl));
    }

    return NextResponse.next();
});

// Get redirect URL based on user role
function getRedirectUrl(role?: string): string {
    switch (role) {
        case 'admin':
            return '/dashboard/admin';
        case 'internal':
            return '/dashboard/internal';
        case 'vendor':
            return '/dashboard/vendor';
        default:
            return '/dashboard';
    }
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
