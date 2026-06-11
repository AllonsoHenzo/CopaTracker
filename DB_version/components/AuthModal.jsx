'use client';

import { useState } from 'react';
import { TEAMS } from '@/lib/data';
import { useStore } from '@/lib/store';

const CONFS = ['CONMEBOL', 'CONCACAF', 'UEFA', 'CAF', 'AFC', 'OFC'];

export default function AuthModal() {
  const { login } = useStore();
  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [handle, setHandle]   = useState('');
  const [team, setTeam]       = useState('BRA');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const grouped = CONFS.map(c => ({ conf: c, teams: TEAMS.filter(tm => tm.conf === c) }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, username, handle, favoriteTeam: team };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || 'Erro desconhecido'); return; }
      login(json);
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === 'login';
  const canSubmit = email && password && (isLogin || username);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--surface-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        <div className="mono" style={{ color: 'var(--surface-dark-fg)', opacity: 0.45, marginBottom: 20 }}>
          COPA 26 TRACKER
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic',
          fontSize: 'clamp(44px, 9vw, 72px)', letterSpacing: '-0.045em', lineHeight: 0.9,
          color: 'var(--surface-dark-fg)', marginBottom: 40,
        }}>
          {isLogin ? 'Bem-vindo\nde volta.' : 'Crie sua\nconta.'}
        </h1>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {!isLogin && (
            <Field label="NOME" value={username} onChange={setUsername} placeholder="Seu nome" maxLength={30} autoFocus />
          )}
          {!isLogin && (
            <Field label="APELIDO (opcional)" value={handle} onChange={setHandle} placeholder="@handle" maxLength={50} />
          )}

          <Field label="EMAIL" value={email} onChange={setEmail} placeholder="seu@email.com" type="email" autoFocus={isLogin} />
          <Field label="SENHA" value={password} onChange={setPassword} placeholder="••••••" type="password" />

          {!isLogin && (
            <div>
              <label className="mono" style={{ color: 'var(--surface-dark-fg)', opacity: 0.45, display: 'block', marginBottom: 10, fontSize: 11, letterSpacing: '0.1em' }}>
                TIME FAVORITO
              </label>
              <select
                value={team}
                onChange={e => setTeam(e.target.value)}
                style={{
                  width: '100%', background: '#0d0e11', border: 'none',
                  borderBottom: '2px solid rgba(244,241,234,0.25)',
                  color: 'var(--surface-dark-fg)',
                  fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.03em',
                  padding: '8px 0', outline: 'none', cursor: 'pointer',
                }}
              >
                {grouped.map(({ conf, teams }) => (
                  <optgroup key={conf} label={conf}>
                    {teams.map(tm => (
                      <option key={tm.code} value={tm.code}>{tm.code} — {tm.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="mono" style={{ color: '#ff4d4d', fontSize: 12, margin: 0 }}>{error}</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 16 }}>
            <button
              type="button"
              onClick={() => { setMode(isLogin ? 'register' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--surface-dark-fg)', opacity: 0.5, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.05em', padding: 0 }}
            >
              {isLogin ? 'Criar conta →' : '← Já tenho conta'}
            </button>
            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="btn btn-yellow btn-lg"
              style={{ opacity: canSubmit && !loading ? 1 : 0.35, fontSize: 15, fontWeight: 700 }}
            >
              {loading ? '...' : isLogin ? 'Entrar' : 'Criar conta'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', maxLength, autoFocus }) {
  return (
    <div>
      <label className="mono" style={{ color: 'var(--surface-dark-fg)', opacity: 0.45, display: 'block', marginBottom: 10, fontSize: 11, letterSpacing: '0.1em' }}>
        {label}
      </label>
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : 'off'}
        style={{
          width: '100%', background: 'none', border: 'none',
          borderBottom: '2px solid rgba(244,241,234,0.25)',
          color: 'var(--surface-dark-fg)',
          fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.03em',
          padding: '8px 0', outline: 'none',
        }}
      />
    </div>
  );
}
