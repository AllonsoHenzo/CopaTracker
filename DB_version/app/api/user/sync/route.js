import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

const VALID_THEMES = new Set(['light', 'dark']);
const VALID_LANGS  = new Set(['pt', 'en', 'es']);

export async function PUT(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

    const body = await req.json();
    const { watched, favoriteTeam, theme, lang, username, handle } = body;

    if (!Array.isArray(watched) || watched.length > 300) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }
    const safeTheme = VALID_THEMES.has(theme) ? theme : 'light';
    const safeLang  = VALID_LANGS.has(lang)  ? lang  : 'pt';
    const safeTeam  = typeof favoriteTeam === 'string' ? favoriteTeam.slice(0, 10) : 'BRA';

    await query(`
      INSERT INTO user_data (user_id, watched, favorite_team, theme, lang, onboarded)
      VALUES (?, ?, ?, ?, ?, 1)
      ON DUPLICATE KEY UPDATE
        watched       = VALUES(watched),
        favorite_team = VALUES(favorite_team),
        theme         = VALUES(theme),
        lang          = VALUES(lang),
        onboarded     = 1
    `, [session.id, JSON.stringify(watched), safeTeam, safeTheme, safeLang]);

    if (username && typeof username === 'string') {
      const cleanUsername = username.trim().slice(0, 50);
      const cleanHandle   = (handle || '').toString().trim().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
      if (cleanUsername.length >= 2) {
        await query('UPDATE users SET username = ?, handle = ? WHERE id = ?', [
          cleanUsername, cleanHandle, session.id,
        ]);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('sync error', err);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
