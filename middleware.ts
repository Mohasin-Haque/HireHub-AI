import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// --- Route Protection Configuration ---

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  '/api/jobs',
  '/api/search/autocomplete',
  '/api/upload',
];

const ROUTE_CONFIG = {
  '/dashboard/candidate': ['CANDIDATE', 'ADMIN'],
  '/dashboard/employer': ['EMPLOYER', 'ADMIN'],
  '/dashboard/admin': ['ADMIN'],
  '/dashboard/messages': ['CANDIDATE', 'EMPLOYER', 'ADMIN'],
  '/dashboard/settings': ['CANDIDATE', 'EMPLOYER', 'ADMIN'],
  '/api/ai/cover-letter': ['CANDIDATE'],
  '/api/ai/ats-score': ['CANDIDATE'],
  '/api/resume/parse': ['CANDIDATE'],
  '/api/ai': ['EMPLOYER', 'ADMIN', 'CANDIDATE'],
  '/api/applications': ['CANDIDATE', 'EMPLOYER', 'ADMIN'],
  '/api/bookmarks': ['CANDIDATE'],
  '/api/interviews': ['EMPLOYER', 'ADMIN'],
  '/api/jobs': ['EMPLOYER', 'ADMIN'],
};

const getRoleDashboard = (role: string) => {
  if (role === 'CANDIDATE') return '/dashboard/candidate';
  if (role === 'EMPLOYER') return '/dashboard/employer';
  if (role === 'ADMIN') return '/dashboard/admin';
  return '/login'; // Default fallback
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // Temporary Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // --- API Route Protection ---
  if (pathname.startsWith('/api')) {
    // Allow public API routes without auth
    const isPublicApi = PUBLIC_API_ROUTES.some(p => pathname.startsWith(p));
    // Allow GET on public routes
    if (isPublicApi && request.method === 'GET') {
      return response;
    }

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    const role = dbUser?.role;

    const routeKey = Object.keys(ROUTE_CONFIG).find(p => pathname.startsWith(p)) || '';
    const requiredRoles = (ROUTE_CONFIG as Record<string, string[]>)[routeKey] || [];

    if (requiredRoles.length > 0 && !requiredRoles.includes(role || '')) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }
  }

  // --- Dashboard Route Protection ---
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    const role = dbUser?.role;
    const userDashboard = getRoleDashboard(role || '');

    const isAuthorized = Object.entries(ROUTE_CONFIG).some(([pathPrefix, roles]) =>
      pathname.startsWith(pathPrefix) && roles.includes(role || '')
    );

    if (pathname.startsWith('/dashboard') && !isAuthorized && pathname !== userDashboard) {
       return NextResponse.redirect(new URL(userDashboard, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
