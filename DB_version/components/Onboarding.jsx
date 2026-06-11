'use client';

import { useState } from 'react';
import { TEAMS } from '@/lib/data';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';

const CONFS = ['CONMEBOL', 'CONCACAF', 'UEFA', 'CAF', 'AFC', 'OFC'];

export default function Onboarding() {
  const { setProfile } = useStore();
  const t = useT();
  const [name, setName] = useState('');
  const [team, setTeam] = useState('BRA');

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setProfile(name.trim(), team);
  }

  const grouped = CONFS.map(c => ({ conf: c, teams: TEAMS.filter(tm => tm.conf === c) }));

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'var(--surface-dark)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>

        <div className="mono" style={{ color: 'var(--surface-dark-fg)', opacity: 0.45, marginBottom: 20 }}>
          COPA 26 TRACKER
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic',
          fontSize: 'clamp(52px, 10vw, 88px)', letterSpacing: '-0.045em', lineHeight: 0.88,
          color: 'var(--surface-dark-fg)', marginBottom: 52, whiteSpace: 'pre-line',
        }}>
          {t.onboarding.title}
        </h1>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>

          <div>
            <label className="mono" style={{ color: 'var(--surface-dark-fg)', opacity: 0.45, display: 'block', marginBottom: 12 }}>
              {t.onboarding.name_label}
            </label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t.onboarding.name_placeholder}
              maxLength={30}
              style={{
                width: '100%', background: 'none', border: 'none',
                borderBottom: '2px solid rgba(244,241,234,0.25)',
                color: 'var(--surface-dark-fg)',
                fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.03em',
                padding: '8px 0', outline: 'none',
              }}
            />
          </div>

          <div>
            <label className="mono" style={{ color: 'var(--surface-dark-fg)', opacity: 0.45, display: 'block', marginBottom: 12 }}>
              {t.onboarding.team_label}
            </label>
            <select
              value={team}
              onChange={e => setTeam(e.target.value)}
              style={{
                width: '100%', background: '#0d0e11', border: 'none',
                borderBottom: '2px solid rgba(244,241,234,0.25)',
                color: 'var(--surface-dark-fg)',
                fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.03em',
                padding: '8px 0', outline: 'none', cursor: 'pointer',
              }}
            >
              {grouped.map(({ conf, teams }) => (
                <optgroup key={conf} label={conf}>
                  {teams.map(tm => (
                    <option key={tm.code} value={tm.code}>{tm.code} - {tm.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              type="submit"
              className="btn btn-yellow btn-lg"
              style={{ opacity: name.trim() ? 1 : 0.35, pointerEvents: name.trim() ? 'auto' : 'none', fontSize: 15, fontWeight: 700 }}
            >
              {t.onboarding.submit}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
