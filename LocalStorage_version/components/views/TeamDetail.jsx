'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { TEAM_BY_CODE, GROUPS, teamGroup, teamMatches, fmtDate } from '@/lib/data';
import { TeamCode, Icon, Stripes } from '@/components/Shared';
import GameRow from '@/components/GameRow';

function contrastColor(bg) {
  const hex = bg.replace('#', '');
  if (hex.length < 6) return '#000';
  const r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
  return (0.299*r + 0.587*g + 0.114*b)/255 > 0.6 ? '#000' : '#fff';
}

export default function TeamDetail({ code }) {
  const router = useRouter();
  const { watchedSet, toggleWatched, state, setFavoriteTeam, matches } = useStore();
  const t = useT();

  const team = TEAM_BY_CODE[code];
  if (!team) return <div className="empty">Seleção não encontrada.</div>;

  const isFav      = state.favoriteTeam === code;
  const tMatches   = teamMatches(code, matches);
  const watched    = tMatches.filter(m => watchedSet.has(m.id)).length;
  const group      = teamGroup(code);
  const groupTeams = group ? GROUPS[group] : [];
  const c1         = team.flag[0];
  const fg         = contrastColor(c1);

  return (
    <div className="page-in">
      <Link href="/teams" className="back-link">
        <Icon name="back" size={12}/> {t.teams.back}
      </Link>

      <section className="team-hero" style={{ marginTop: 14 }}>
        <div className="team-hero-left" style={{ background: c1, color: fg }}>
          <div style={{ position: 'absolute', right: -30, top: -30, fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 360, letterSpacing: '-0.08em', lineHeight: 0.7, color: fg, opacity: 0.1, pointerEvents: 'none' }}>{team.code}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.8 }}>{team.conf} · {t.teams.group_label} {group || '—'}</div>
              <div style={{ marginTop: 6 }}><TeamCode code={team.code} size="l"/></div>
            </div>
            <button className="btn" style={{ background: fg, color: c1, borderColor: fg }} onClick={() => setFavoriteTeam(isFav ? null : code)}>
              {isFav ? t.teams.fav : t.teams.not_fav}
            </button>
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="team-hero-name">{team.name}</div>
            <Stripes colors={team.flag} width={160} height={10}/>
          </div>
        </div>

        <div className="team-hero-right">
          <div className="team-hero-cell">
            <div className="mono">{t.teams.games_watched}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 96, letterSpacing: '-0.05em', lineHeight: 0.85 }}>
              {watched}<span style={{ fontSize: 28, opacity: 0.4, fontStyle: 'normal', fontFamily: 'var(--font-mono)' }}>/{tMatches.length}</span>
            </div>
            <div className="mono">{tMatches.length - watched} {t.teams.remaining}</div>
          </div>
          <div className="team-hero-cell" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
            <div className="mono" style={{ color: 'var(--bg)', opacity: 0.6 }}>{t.teams.next_game}</div>
            {(() => {
              const next = tMatches.find(m => !watchedSet.has(m.id)) || tMatches[0];
              if (!next) return <div style={{ marginTop: 8, color: 'var(--bg)', opacity: 0.5 }}>—</div>;
              const opp  = next.teams.find(c => c !== code);
              const oppT = TEAM_BY_CODE[opp];
              return (
                <>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44, letterSpacing: '-0.04em', lineHeight: 0.9 }}>
                    vs <span style={{ fontStyle: 'italic', color: 'var(--br-yellow)' }}>{oppT?.name || opp}</span>
                  </div>
                  <div className="mono" style={{ color: 'var(--bg)', opacity: 0.7 }}>{fmtDate(next.date, { short: true })} · {next.date.hh} · {next.venue?.city?.toUpperCase()}</div>
                </>
              );
            })()}
          </div>
        </div>
      </section>

      {group && (
        <>
          <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline', marginBottom: 0 }}>
            <div className="sec-num">01</div>
            <h2 className="sec-title">{t.dashboard.group_section} <span className="it">{group}</span></h2>
            <span className="chip">{t.dashboard.classification}</span>
          </div>
          <section>
            {groupTeams.map((c, i) => {
              const tt        = TEAM_BY_CODE[c];
              const isMe      = c === code;
              const qualifies = i < 2;
              return (
                <div key={c} className="team-group-row" onClick={() => router.push(`/teams/${c}`)} style={{ background: isMe ? 'var(--ink)' : 'var(--bg)', color: isMe ? 'var(--bg)' : 'var(--ink)' }}>
                  <div className="team-group-rank" style={{ color: qualifies && !isMe ? 'var(--br-green)' : isMe ? 'var(--br-yellow)' : 'var(--ink-mute)' }}>{String(i+1).padStart(2,'0')}</div>
                  <TeamCode code={c} size="m"/>
                  <span className="team-group-name">{tt?.name}</span>
                  <span className="team-group-status">
                    {qualifies && !isMe && <span className="chip chip-green">{t.teams.advances}</span>}
                    {isMe && <span className="chip chip-yellow">{t.teams.you_are_here}</span>}
                  </span>
                  <div className="team-group-stats">PJ 0 · SG 0</div>
                  <div className="team-group-stats">GP 0 · GC 0</div>
                  <div className="team-group-pts">0</div>
                </div>
              );
            })}
          </section>
        </>
      )}

      <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline', marginBottom: 0 }}>
        <div className="sec-num">02</div>
        <h2 className="sec-title">{t.teams.games_of(team.name)}</h2>
        <span className="chip">{tMatches.length} jogos</span>
      </div>
      <section>
        {tMatches.map(m => (
          <GameRow key={m.id} match={m} watched={watchedSet.has(m.id)} onToggle={() => toggleWatched(m.id)} onOpen={() => router.push(`/game/${m.id}`)}/>
        ))}
      </section>
    </div>
  );
}
