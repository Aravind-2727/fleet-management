import { supabase } from './src/app/lib/supabase';
import { NextResponse } from 'next/server';

export const config = {
matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export async function middleware(request) {
const url = request.nextUrl.clone();

console.log('====================');
console.log('PATH:', url.pathname);
console.log('URL:', request.url);

// Allow public pages
if (
url.pathname === '/' ||
url.pathname === '/login' ||
url.pathname === '/signup'
) {
console.log('PUBLIC ROUTE');
return NextResponse.next();
}

try {
const { data, error } = await supabase.auth.getUser();

```
console.log('AUTH DATA:', data);
console.log('AUTH ERROR:', error);

const user = data?.user;

if (error || !user) {
  console.log('NO USER FOUND -> REDIRECTING TO /');

  url.pathname = '/';
  return NextResponse.redirect(url, { status: 302 });
}

console.log('USER ID:', user.id);

const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .maybeSingle();

console.log('PROFILE:', profile);
console.log('PROFILE ERROR:', profileError);

const userRole =
  profileError ? 'driver' : profile?.role || 'driver';

console.log('USER ROLE:', userRole);

const protectedRoutes = [
  '/dashboard',
  '/trips',
  '/trips-management',
  '/drivers',
  '/expenses',
  '/advances',
  '/settlements',
  '/payments',
  '/reports',
  '/settings',
];

if (protectedRoutes.includes(url.pathname)) {
  if (userRole !== 'owner') {
    console.log(
      'USER NOT OWNER -> REDIRECTING TO /dashboard'
    );

    url.pathname = '/dashboard';
    return NextResponse.redirect(url, { status: 302 });
  }
}

console.log('ACCESS GRANTED');
return NextResponse.next();
```

} catch (err) {
console.error('MIDDLEWARE ERROR:', err);

```
url.pathname = '/';
return NextResponse.redirect(url, { status: 302 });
```

}
}
