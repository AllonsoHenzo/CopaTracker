import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken, sessionCookie } from '@/lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password, username, handle, favoriteTeam } = body;

    if (!email || !password || !username) {
      return NextResponse.json({ error: 'Campos obrigatórios: email, senha, nome' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 });
    }
    const cleanUsername = username.trim().slice(0, 50);
    const cleanHandle   = (handle || '').trim().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
    if (cleanUsername.length < 2) {
      return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres' }, { status: 400 });
    }

    const [existing] = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Este email já está cadastrado' }, { status: 409 });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await query(
      'INSERT INTO users (email, username, handle, password_hash) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), cleanUsername, cleanHandle, hash]
    );
    const userId = result.insertId;

    await query(
      'INSERT INTO user_data (user_id, favorite_team, theme, lang, onboarded, watched) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, favoriteTeam || 'BRA', 'light', 'pt', 1, '[]']
    );

    const token = signToken({ id: userId, email: email.toLowerCase(), username: cleanUsername });
    const res = NextResponse.json({
      ok: true,
      user: { id: userId, email: email.toLowerCase(), username: cleanUsername, handle: cleanHandle },
      data: {
        watched: [], favoriteTeam: favoriteTeam || 'BRA',
        theme: 'light', lang: 'pt', onboarded: true,
        username: cleanUsername, handle: cleanHandle,
      },
    });
    res.cookies.set(sessionCookie(token));
    return res;
  } catch (err) {
    console.error('register error', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
