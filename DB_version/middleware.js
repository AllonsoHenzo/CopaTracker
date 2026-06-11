import { NextResponse } from 'next/server';

const COOKIE = 'copa26_session';

// Public API routes that don't need auth
const PUBLIC_API = ['/api/auth/login', '/api/auth/register', '/api/auth/me', '/api/auth/logout', '/api/copa'];

async function verifyJwt(token) {
  try {
    const secret = process.env.JWT_SECRET || 'copa26-secret-key-change-in-prod';
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    if (!headerB64 || !payloadB64 || !signatureB64) return null;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sig = Uint8Array.from(
      atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );
    const valid = await crypto.subtle.verify(
      'HMAC', key, sig,
      new TextEncoder().encode(`${headerB64}.${payloadB64}`)
    );
    if (!valid) return null;

    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only intercept API routes
  if (!pathname.startsWith('/api/')) return NextResponse.next();

  // Let public auth routes through
  if (PUBLIC_API.some(p => pathname === p)) return NextResponse.next();

  const token = request.cookies.get(COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    const res = NextResponse.json({ error: 'Sessão inválida ou expirada' }, { status: 401 });
    res.cookies.delete(COOKIE);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
