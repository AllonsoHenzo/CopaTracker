import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ user: null });

    const [rows] = await query('SELECT id, email, username, handle FROM users WHERE id = ?', [session.id]);
    const user = rows[0];
    if (!user) return NextResponse.json({ user: null });

    const [dataRows] = await query('SELECT * FROM user_data WHERE user_id = ?', [user.id]);
    const data = dataRows[0] || {};

    return NextResponse.json({
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
  } catch (err) {
    console.error('me error', err);
    return NextResponse.json({ user: null });
  }
}
