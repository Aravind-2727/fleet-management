import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export function middleware(request) {
  console.log('Middleware Running:', request.nextUrl.pathname);
  return NextResponse.next();
}