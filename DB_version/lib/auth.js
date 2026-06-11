import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET;
const COOKIE = 'copa26_session';

if (!SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[SECURITY] FATAL: JWT_SECRET env var not set in production! Set it in .env.local');
  } else {
    console.warn('[SECURITY] JWT_SECRET not set, using insecure dev default');
  }
}

const EFFECTIVE_SECRET = SECRET || 'copa26-dev-only-insecure';

export function signToken(payload) {
  return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try { return jwt.verify(token, EFFECTIVE_SECRET); } catch { return null; }
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function sessionCookie(token) {
  return {
    name:     COOKIE,
    value:    token,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30,
    path:     '/',
  };
}

export function clearCookie() {
  return {
    name:     COOKIE,
    value:    '',
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  };
}
