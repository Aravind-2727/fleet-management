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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.next();

  let response = NextResponse.next({ request });

  const { createServerClient } = await import('@supabase/ssr');
  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Read selected role from cookie (set during login)
  const selectedRole = request.cookies.get('selected_role')?.value;

  let role = null;

  if (selectedRole === 'driver') {
    // Driver access: verify profile exists AND a drivers record links to it
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (driver) {
        role = 'driver';
      }
    }
  } else {
    // Owner or no cookie: verify profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      role = 'owner';
    }
  }

  // Fallback: try to find any profile
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      role = 'owner';
    }
  }

  if (needsOwner && role !== 'owner') {
    if (role === 'driver') return NextResponse.redirect(new URL('/driver/home', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (needsDriver && role !== 'driver') {
    if (role === 'owner') return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}
