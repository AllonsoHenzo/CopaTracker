'use client';

import { forwardRef } from 'react';
import { TEAM_BY_CODE, computeStats } from '@/lib/data';
import { computeBadges } from '@/lib/badges';

const DISPLAY = '"Bricolage Grotesque", "Arial Black", "Impact", system-ui, sans-serif';
const MONO    = '"JetBrains Mono", "Courier New", monospace';

const ShareCard = forwardRef(function ShareCard({ state, watchedSet, matches }, ref) {
  const stats   = computeStats(watchedSet, matches);
  const pct     = Math.round((stats.watched / stats.total) * 100);
  const fav     = state.favoriteTeam;
  const favTeam = TEAM_BY_CODE[fav];
  const badges  = computeBadges(watchedSet, matches, fav);
  const earned  = badges.filter(b => b.earned).length;
  const cities  = new Set(matches.filter(m => watchedSet.has(m.id) && m.venue?.city).map(m => m.venue.city));
  const teams   = new Set(matches.flatMap(m => watchedSet.has(m.id) ? m.teams : []));
  const STRIPES = ['#009739','#FEDD00','#002776','#FAF7F2'];

  return (
    <div ref={ref} style={{
      width: 540, height: 960, background: '#08090b',
      display: 'flex', flexDirection: 'column',
      fontFamily: DISPLAY, position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Stripes topo */}
      <div style={{ display: 'flex', height: 12, flexShrink: 0 }}>
        {STRIPES.map((c,i) => <div key={i} style={{ flex: 1, background: c }}/>)}
      </div>

      {/* Watermark 26 */}
      <div style={{
        position: 'absolute', right: -20, top: 60,
        fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic',
        fontSize: 360, letterSpacing: '-0.06em', lineHeight: 0.8,
        color: '#FEDD00', opacity: 0.07, userSelect: 'none',
      }}>26</div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 44px 40px', position: 'relative' }}>

        {/* Brand */}
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(244,241,234,0.35)' }}>
          Copa 26 Tracker
        </div>

        {/* Nome */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: 56, letterSpacing: '-0.04em', lineHeight: 1, color: '#FAF7F2' }}>
            {state.username || 'Torcedor'}
          </div>
          {state.handle && (
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.12em', color: 'rgba(244,241,234,0.38)', marginTop: 8 }}>
              {state.handle.toUpperCase()}
            </div>
          )}
        </div>

        {/* Número principal */}
        <div style={{ marginTop: 48 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: 144, letterSpacing: '-0.06em', lineHeight: 0.82, color: '#FEDD00' }}>
              {stats.watched}
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontStyle: 'italic', fontSize: 48, letterSpacing: '-0.04em', color: 'rgba(254,221,0,0.35)', lineHeight: 1, paddingBottom: 16 }}>
              /{stats.total}
            </div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(244,241,234,0.4)', marginTop: 8 }}>
            Jogos assistidos
          </div>
        </div>

        {/* Barra progresso */}
        <div style={{ marginTop: 28 }}>
          <div style={{ height: 3, background: 'rgba(244,241,234,0.08)' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: '#009739', transition: 'width 0.4s' }}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: 36, letterSpacing: '-0.03em', color: '#009739' }}>{pct}%</span>
            <span style={{ fontFamily: DISPLAY, fontStyle: 'italic', fontSize: 18, color: 'rgba(244,241,234,0.3)' }}>completo</span>
          </div>
        </div>

        {/* Time favorito */}
        <div style={{
          marginTop: 36, padding: '20px 24px',
          background: '#FEDD00',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.18em', color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>TIME FAVORITO</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: 64, letterSpacing: '-0.05em', lineHeight: 0.85, color: '#08090b' }}>{fav}</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: 'rgba(0,0,0,0.5)', marginTop: 4 }}>{favTeam?.name}</div>
          </div>
          {favTeam && (
            <div style={{ display: 'flex', flexDirection: 'column', width: 10, height: 64, flexShrink: 0 }}>
              {favTeam.flag.map((c,i) => <div key={i} style={{ flex: 1, background: c }}/>)}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
          {[
            { label: 'Seleções', val: teams.size,  of: 48 },
            { label: 'Sedes',    val: cities.size, of: 16 },
            { label: 'Badges',   val: earned,      of: badges.length },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(244,241,234,0.05)', padding: '14px 16px' }}>
              <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,241,234,0.38)' }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, marginTop: 6 }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontStyle: 'italic', fontSize: 40, letterSpacing: '-0.04em', lineHeight: 0.9, color: '#FAF7F2' }}>{s.val}</span>
                <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: 'rgba(244,241,234,0.28)', paddingBottom: 4 }}>/{s.of}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 28 }}>
          <div style={{ height: 1, background: 'rgba(244,241,234,0.08)', marginBottom: 16 }}/>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,241,234,0.25)' }}>
            Copa do Mundo 2026 · 11 Jun — 19 Jul
          </div>
        </div>
      </div>

      {/* Stripes rodapé */}
      <div style={{ display: 'flex', height: 8, flexShrink: 0 }}>
        {STRIPES.map((c,i) => <div key={i} style={{ flex: 1, background: c }}/>)}
      </div>
    </div>
  );
});

export default ShareCard;
