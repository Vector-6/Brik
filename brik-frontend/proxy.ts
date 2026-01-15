import { NextResponse } from 'next/server';

/**
 * Security Middleware
 * Adds additional security headers at the edge for enhanced protection
 */
export function proxy() {
  // Clone the response
  const response = NextResponse.next();

  // Add security headers
  const securityHeaders = {
    // DNS Prefetch Control
    'X-DNS-Prefetch-Control': 'on',

    // Strict Transport Security (HSTS)
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

    // Frame Options
    'X-Frame-Options': 'DENY',

    // Content Type Options
    'X-Content-Type-Options': 'nosniff',

    // XSS Protection
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',

    // Cross-Origin Policies
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };

  // Apply headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - let Next.js config handle headers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - manifest.json
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
