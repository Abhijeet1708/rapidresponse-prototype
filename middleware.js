import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';

// Simple in-memory rate limiter for Edge Middleware
const rateLimitMap = new Map();

export async function middleware(request) {
  const sessionCookie = request.cookies.get('rr_session');
  const sessionSecret = process.env.SESSION_SECRET || '';

  const { pathname } = request.nextUrl;

  // Rate Limiting for Incident Creation
  if (pathname === '/api/incidents/create' && request.method === 'POST') {
    const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    
    let ipData = rateLimitMap.get(ip);
    if (!ipData || now - ipData.startTime > windowMs) {
      ipData = { count: 1, startTime: now };
    } else {
      ipData.count++;
    }
    rateLimitMap.set(ip, ipData);
    
    if (ipData.count > 10) {
      return NextResponse.json({ error: 'Too many requests. Please try again in a minute.' }, { status: 429 });
    }
  }

  const isAuthRoute = pathname.startsWith('/dashboard') || 
    (pathname.startsWith('/api/incidents') && pathname !== '/api/incidents/create');

  if (isAuthRoute) {
    if (!sessionCookie || !sessionCookie.value) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const isValid = await verifySession(sessionCookie.value, sessionSecret);
    
    if (!isValid) {
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));
      
      response.cookies.delete('rr_session');
      return response;
    }
  }

  // Redirect root to /login or /dashboard based on auth state
  if (pathname === '/') {
    if (sessionCookie && sessionCookie.value) {
      const isValid = await verifySession(sessionCookie.value, sessionSecret);
      if (isValid) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/api/incidents/:path*'],
};
