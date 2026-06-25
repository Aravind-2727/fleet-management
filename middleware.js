import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|$).*)'],
};

const ownerRoutes = [
  '/dashboard', '/trips', '/trips-management', '/drivers', '/trucks',
  '/expenses', '/advances', '/settlements', '/payments', '/reports', '/settings',
];

const driverRoutes = [
  '/driver/home', '/driver/mytrip', '/driver/expenses', '/driver/advances', '/driver/pay',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow login/signup page
  if (pathname === '/') return NextResponse.next();

  // Check if route needs protection
  const needsOwner = ownerRoutes.some(route => pathname.startsWith(route));
  const needsDriver = driverRoutes.some(route => pathname.startsWith(route));

  if (!needsOwner && !needsDriver) return NextResponse.next();

  // Get Supabase session from cookie
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.next();

  const { createServerClient } = await import('@supabase/ssr');
  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Get user role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  const role = profile?.role;

  if (needsOwner && role !== 'owner') {
    if (role === 'driver') return NextResponse.redirect(new URL('/driver/home', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (needsDriver && role !== 'driver') {
    if (role === 'owner') return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
