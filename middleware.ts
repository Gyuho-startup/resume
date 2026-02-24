import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Next.js middleware for route protection.
 *
 * Protected paths (/dashboard, /downloads) redirect unauthenticated visitors
 * to the home page. Auth callback and public routes are always allowed.
 *
 * Note: Cookie-based auth is validated via Supabase SSR client.
 */

const PROTECTED_PATHS = ['/dashboard', '/downloads'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run protection logic for paths that require auth
  const requiresAuth = PROTECTED_PATHS.some(p => pathname.startsWith(p));
  if (!requiresAuth) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect unauthenticated users to the home page
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/downloads/:path*'],
};
