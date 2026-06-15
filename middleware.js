// middleware.js

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request) {
  const url = request.nextUrl.clone();
  
  // Allow access to login and signup pages
  if (url.pathname === '/' || url.pathname === '/login' || url.pathname === '/signup') {
    return NextResponse.next();
  }
  
  // Check for authentication using Supabase auth
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    // No valid session, redirect to login page
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  
  // User is authenticated, check user role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  const userRole = profileError ? 'driver' : profile?.role || 'driver';
  
  // Route-specific authorization
  const protectedRoutes = ['/dashboard', '/trips', '/trips-management', '/drivers', '/expenses', '/advances', '/settlements', '/payments', '/reports', '/settings'];
  
  if (protectedRoutes.includes(url.pathname)) {
    if (userRole !== 'owner') {
      // Driver users cannot access protected routes
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Import supabase
const { supabase } = require('./src/app/lib/supabase');
const { NextResponse } = require('next/server');