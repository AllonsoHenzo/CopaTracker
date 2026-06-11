'use client';

import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { TEAM_BY_CODE } from '@/lib/data';
import { TeamCode } from '@/components/Shared';

export default function ScorersPage() {
  const { scorers, apiStatus } = useStore();
  const t = useT();

  if (apiStatus === 'loading') {
    return (
      <div className="page-in">
        <div className="empty">{t.scorers.loading}</div>
      </div>
    );
  }

  if (scorers.length === 0) {
    return (
      <div className="page-in">
        <div className="empty" style={{ flexDirection: 'column', gap: 8, padding: '60px 40px' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 28 }}>
            {t.scorers.no_data}
          </div>
          <div className="mono" style={{ color: 'var(--ink-mute)' }}>
            {apiStatus === 'error' ? t.scorers.error_hint : t.scorers.no_data_hint}
          </div>
        </div>
      </div>
    );
  }

  const top = scorers[0];

  return (
    <div className="page-in">

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1.2px solid var(--line)' }}>
        <div style={{ padding: '40px', background: 'var(--ink)', color: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -30, top: -20, fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', fontSize: 280, letterSpacing: '-0.08em', lineHeight: 0.7, opacity: 0.07 }}>
            {top.goals}
          </div>
          <div style={{ position: 'relative' }}>
            <div className="mono" style={{ color: 'var(--bg)', opacity: 0.5, marginBottom: 12 }}>{t.scorers.top_scorer}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--br-yellow)' }}>
              {top.player}
            </div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <TeamCode code={top.team} size="s"/>
              <span className="mono" style={{ color: 'var(--bg)', opacity: 0.6 }}>{TEAM_BY_CODE[top.team]?.name || top.team} · {top.nationality}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderLeft: '1.2px solid var(--line)' }}>
          {[
            { label: t.scorers.goals,     val: top.goals     },
            { label: t.scorers.assists,   val: top.assists   },
            { label: t.scorers.penalties, val: top.penalties },
          ].map(s => (
            <div key={s.label} style={{ padding: '30px 24px', borderRight: '1px solid var(--line-faint)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', fontSize: 72, letterSpacing: '-0.05em', lineHeight: 0.85, color: s.label === t.scorers.goals ? 'var(--br-green)' : 'var(--ink)' }}>
                {s.val}
              </div>
              <div className="mono" style={{ marginTop: 8, color: 'var(--ink-mute)', fontSize: 10 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ padding: '18px 40px', borderBottom: '1.2px solid var(--line)' }}>
        <div className="mono">{t.scorers.top_label(scorers.length)}</div>
      </div>

      <section>
        {scorers.map((s, i) => {
          const isFirst = i === 0;
          return (
            <div
              key={i}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px auto 1fr 80px 80px 80px',
                gap: 20,
                alignItems: 'center',
                padding: '18px 40px',
                borderBottom: '1px solid var(--line-faint)',
                background: isFirst ? 'var(--ink)' : 'var(--bg)',
                color: isFirst ? 'var(--bg)' : 'var(--ink)',
              }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', fontSize: 40, letterSpacing: '-0.05em', lineHeight: 0.85, color: isFirst ? 'var(--br-yellow)' : i === 1 ? 'var(--br-green)' : i === 2 ? 'var(--br-blue)' : 'var(--ink-mute)' }}>
                {String(s.rank).padStart(2, '0')}
              </div>

              <TeamCode code={s.team} size="m"/>

              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.025em', lineHeight: 1 }}>
                  {s.player}
                </div>
                <div className="mono" style={{ marginTop: 4, color: isFirst ? 'rgba(244,241,234,0.5)' : 'var(--ink-mute)', fontSize: 10 }}>
                  {TEAM_BY_CODE[s.team]?.name || s.team} · {s.nationality}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontStyle: 'italic', fontSize: 36, letterSpacing: '-0.04em', color: isFirst ? 'var(--br-yellow)' : 'var(--ink)' }}>{s.goals}</div>
                <div className="mono" style={{ fontSize: 9, color: isFirst ? 'rgba(244,241,234,0.45)' : 'var(--ink-mute)' }}>{t.scorers.goals_short}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', opacity: 0.6 }}>{s.assists}</div>
                <div className="mono" style={{ fontSize: 9, color: isFirst ? 'rgba(244,241,234,0.45)' : 'var(--ink-mute)' }}>{t.scorers.assists_short}</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em', opacity: 0.5 }}>{s.penalties}</div>
                <div className="mono" style={{ fontSize: 9, color: isFirst ? 'rgba(244,241,234,0.45)' : 'var(--ink-mute)' }}>{t.scorers.penalties_short}</div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
