import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken, sessionCookie } from '@/lib/auth';

// Simple in-memory rate limiting: max 10 attempts per IP per 15 min
const attempts = new Map();
const MAX = 10;
const WINDOW = 15 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = attempts.get(ip) || { count: 0, reset: now + WINDOW };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + WINDOW; }
  entry.count++;
  attempts.set(ip, entry);
  return entry.count > MAX;
}

export async function POST(req) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 });
    }

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 });
    }

    const [rows] = await query(
      'SELECT id, email, username, handle, password_hash FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    const user = rows[0];

    if (!user) {
      // Run bcrypt anyway to avoid timing-based user enumeration
      await bcrypt.compare(password, '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewYBBQBGy5cNJXGu');
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
    }

    const [dataRows] = await query('SELECT * FROM user_data WHERE user_id = ?', [user.id]);
    const data = dataRows[0] || {};

    const token = signToken({ id: user.id, email: user.email, username: user.username });
    const res = NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, username: user.username, handle: user.handle },
      data: {
        watched:      JSON.parse(data.watched || '[]'),
        favoriteTeam: data.favorite_team || 'BRA',
        theme:        data.theme || 'light',
        lang:         data.lang || 'pt',
        onboarded:    true,
        username:     user.username,
        handle:       user.handle || '',
      },
    });
    res.cookies.set(sessionCookie(token));
    return res;
  } catch (err) {
    console.error('login error', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
