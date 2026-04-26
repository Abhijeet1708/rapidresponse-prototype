import { NextResponse } from 'next/server';
import { signSession, constantTimeCompare } from '@/lib/session';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const envUsername = process.env.DEMO_USERNAME || '';
    const envPassword = process.env.DEMO_PASSWORD || '';
    const sessionSecret = process.env.SESSION_SECRET || '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Use constant-time comparison to prevent timing attacks
    const isUsernameValid = constantTimeCompare(username, envUsername);
    const isPasswordValid = constantTimeCompare(password, envPassword);

    if (!isUsernameValid || !isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Sign the session cookie
    const payload = JSON.stringify({ user: 'demo', exp: Date.now() + 8 * 60 * 60 * 1000 });
    const signedValue = await signSession(payload, sessionSecret);

    const response = NextResponse.json({ success: true }, { status: 200 });
    
    // Set httpOnly Secure SameSite=Strict cookie
    response.cookies.set({
      name: 'rr_session',
      value: signedValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60, // 8 hours in seconds
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
  }
}
