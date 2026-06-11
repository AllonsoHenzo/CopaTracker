'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { TEAM_BY_CODE, GROUPS, STAGE_LABELS, fmtDate } from '@/lib/data';
import { TeamCode, Check, Icon, StageChip, Stripes } from '@/components/Shared';
import GameRow from '@/components/GameRow';

export default function GameDetail({ id }) {
  const router = useRouter();
  const { watchedSet, toggleWatched, matches } = useStore();
  const t = useT();

  const match = matches.find(m => m.id === id);
  if (!match) return <div className="empty">Jogo não encontrado.</div>;

  const t1        = TEAM_BY_CODE[match.teams[0]];
  const t2        = TEAM_BY_CODE[match.teams[1]];
  const isWatched = watchedSet.has(match.id);
  const theme     = match.stage === 'final' ? 'theme-yellow' : match.stage === 'group' ? 'theme-green' : (match.stage === 'sf' || match.stage === 'qf') ? 'theme-blue' : 'theme-ink';

  const h2h = match.teams[0] !== 'TBD' && match.teams[1] !== 'TBD' ? [
    { date: 'JUN 2022', score: '1×0', winner: 0 },
    { date: 'OUT 2019', score: '2×2', winner: -1 },
    { date: 'MAR 2018', score: '0×3', winner: 1 },
    { date: 'SET 2014', score: '2×1', winner: 0 },
  ] : [];

  const sameGroup = match.group ? matches.filter(m => m.group === match.group && m.id !== match.id) : [];
  const venueMatches = matches.filter(m => m.venue?.stadium === match.venue?.stadium).length;

  return (
    <div className="page-in">
      <Link href="/games" className="back-link">
        <Icon name="back" size={12}/> {t.game.back}
      </Link>

      <section className={`gd-hero ${theme}`} style={{ marginTop: 14 }}>
        <div className="gd-team">
          <div className="code">{t1?.code || match.teams[0]}</div>
          <div className="name">{t1?.name || 'A definir'}</div>
          {t1 && <Stripes colors={t1.flag} width={140} height={8}/>}
        </div>
        <div className="gd-vs">
          {match.score ? <span style={{ fontSize: 48, fontFamily: 'var(--font-mono)' }}>{match.score.home} – {match.score.away}</span> : 'vs.'}
        </div>
        <div className="gd-team right">
          <div className="code">{t2?.code || match.teams[1]}</div>
          <div className="name italic">{t2?.name || 'A definir'}</div>
          {t2 && <Stripes colors={t2.flag} width={140} height={8}/>}
        </div>
        <div className="gd-meta">
          <div><div className="lbl">FASE</div><div className="val">{t.stages[match.stage] || STAGE_LABELS[match.stage]}{match.group ? ` · ${t.dashboard.group_section} ${match.group}` : ''}</div></div>
          <div><div className="lbl">DATA · {t.game.kickoff}</div><div className="val">{fmtDate(match.date)} · {match.date.hh}</div></div>
          <div><div className="lbl">{t.game.venue_label}</div><div className="val">{match.venue?.stadium}, {match.venue?.city}</div></div>
          <div><div className="lbl">ID DO JOGO</div><div className="val mono-tight">{match.id}</div></div>
        </div>
      </section>

      <section className={`gd-cta ${isWatched ? 'watched' : ''}`}>
        <div>
          <div className="lbl">{isWatched ? t.game.you_watched : t.game.next_step}</div>
          <div className="txt">
            {isWatched
              ? <>✓ {t.game.in_list} <span className="it">{t.game.your_list}</span></>
              : <>{t.game.waiting} <span className="it">{t.game.ball_rolling}</span></>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <button className={isWatched ? 'btn btn-lg' : 'btn btn-lg btn-yellow'} onClick={() => toggleWatched(match.id)}>
            {isWatched ? t.game.unmark : t.game.mark}
          </button>
          <Check on={isWatched} onClick={() => toggleWatched(match.id)} size={52}/>
        </div>
      </section>

      <section className="gd-grid">
        <div>
          <h3 className="gd-stat-h">{t.game.h2h} <span className="it">{t.game.h2h_adj}</span></h3>
          {[t1, t2].map((tm, i) => tm && (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: i === 0 ? '1px solid var(--line-faint)' : '1px solid var(--line)' }}>
              <TeamCode code={tm.code} size="l"/>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{tm.name}</div>
                <div className="mono" style={{ marginTop: 4 }}>{tm.conf}</div>
              </div>
              <button className="btn btn-sm" onClick={() => router.push(`/teams/${tm.code}`)}>{t.scorers.see_team} <Icon name="arrow" size={12}/></button>
            </div>
          ))}
          {h2h.length > 0 && (
            <>
              <div className="mono" style={{ marginTop: 22, marginBottom: 8 }}>{t.game.last_matches}</div>
              {h2h.map((h, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 80px', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--line-faint)', alignItems: 'center' }}>
                  <span className="mono" style={{ color: 'var(--ink-mute)' }}>{h.date}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
                    <span style={{ opacity: h.winner === 0 ? 1 : 0.4 }}>{t1?.code}</span>
                    <span style={{ margin: '0 10px', opacity: 0.4, fontFamily: 'var(--font-mono)', fontSize: 14 }}>{h.score}</span>
                    <span style={{ opacity: h.winner === 1 ? 1 : 0.4 }}>{t2?.code}</span>
                  </span>
                  <span className="mono" style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>{h.winner === -1 ? t.game.draw : h.winner === 0 ? t1?.code : t2?.code}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="gd-venue-ink" style={{ background: 'var(--ink)', color: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, bottom: -60, fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 240, letterSpacing: '-0.08em', lineHeight: 0.7, opacity: 0.08 }}>
            {match.venue?.country}
          </div>
          <div style={{ position: 'relative' }}>
            <div className="mono" style={{ color: 'var(--bg)', opacity: 0.6, marginBottom: 10 }}>{t.game.venue_label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 60, letterSpacing: '-0.05em', lineHeight: 0.88 }}>{match.venue?.stadium}</div>
            <div className="mono" style={{ marginTop: 12, color: 'var(--br-yellow)' }}>{match.venue?.city?.toUpperCase()} · {match.venue?.country}</div>
            <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid rgba(244,241,234,0.16)' }}>
              <div style={{ padding: '18px 0', borderRight: '1px solid rgba(244,241,234,0.16)', paddingRight: 18 }}>
                <div className="mono" style={{ color: 'var(--bg)', opacity: 0.5 }}>{t.game.kickoff}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.03em', marginTop: 4, color: 'var(--br-yellow)' }}>{match.date.hh}</div>
              </div>
              <div style={{ padding: '18px 0 18px 18px' }}>
                <div className="mono" style={{ color: 'var(--bg)', opacity: 0.5 }}>{t.game.games_at_venue}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.03em', marginTop: 4 }}>{venueMatches}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {match.group && sameGroup.length > 0 && (
        <section>
          <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline', marginBottom: 0 }}>
            <div className="sec-num">→ tb</div>
            <h2 className="sec-title">{t.game.others_in_group} <span className="it">{match.group}</span></h2>
            <span className="chip">{sameGroup.length} jogos</span>
          </div>
          <div>
            {sameGroup.map(m => (
              <GameRow key={m.id} match={m} watched={watchedSet.has(m.id)} onToggle={() => toggleWatched(m.id)} onOpen={() => router.push(`/game/${m.id}`)}/>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
