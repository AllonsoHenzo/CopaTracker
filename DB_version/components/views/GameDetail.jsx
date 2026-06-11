'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { TEAM_BY_CODE, GROUPS, STAGE_LABELS, fmtDate } from '@/lib/data';
import { TeamCode, Check, Icon, Stripes } from '@/components/Shared';
import GameRow from '@/components/GameRow';

function nameFontSize(name) {
  const len = (name || '').length;
  if (len <= 6)  return 108;
  if (len <= 9)  return 90;
  if (len <= 12) return 74;
  if (len <= 16) return 58;
  if (len <= 20) return 46;
  return 36;
}

export default function GameDetail({ id }) {
  const router = useRouter();
  const { watchedSet, toggleWatched, matches } = useStore();
  const t = useT();

  const match = matches.find(m => m.id === id);
  if (!match) return <div className="empty">Jogo não encontrado.</div>;

  const t1        = TEAM_BY_CODE[match.teams[0]];
  const t2        = TEAM_BY_CODE[match.teams[1]];
  const isWatched = watchedSet.has(match.id);
  const MARKABLE  = new Set(['FINISHED', 'IN_PLAY', 'PAUSED', 'HALFTIME']);
  const canMark   = MARKABLE.has(match.status);
  const theme     = match.stage === 'final' ? 'theme-yellow' : match.stage === 'group' ? 'theme-green' : (match.stage === 'sf' || match.stage === 'qf') ? 'theme-blue' : 'theme-ink';

  const h2h = [];

  const sameGroup = match.group ? matches.filter(m => m.group === match.group && m.id !== match.id) : [];

  const groupStandings = match.group ? (() => {
    const grpTeams = GROUPS[match.group] || [];
    const stats = Object.fromEntries(grpTeams.map(code => [code, { code, gp: 0, gf: 0, ga: 0, pts: 0 }]));
    for (const m of matches.filter(m2 => m2.group === match.group)) {
      if (m.status !== 'FINISHED' || !m.score) continue;
      const [h, a] = m.teams;
      if (!stats[h] || !stats[a]) continue;
      stats[h].gp++; stats[h].gf += m.score.home; stats[h].ga += m.score.away;
      stats[a].gp++; stats[a].gf += m.score.away; stats[a].ga += m.score.home;
      if (m.score.home > m.score.away)      { stats[h].pts += 3; }
      else if (m.score.home < m.score.away) { stats[a].pts += 3; }
      else                                  { stats[h].pts += 1; stats[a].pts += 1; }
    }
    return Object.values(stats).sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
  })() : null;

  return (
    <div className="page-in">
      <Link href="/games" className="back-link">
        <Icon name="back" size={12}/> {t.game.back}
      </Link>

      <section className={`gd-hero ${theme}`} style={{ marginTop: 14 }}>
        <div className="gd-team">
          <div className="code">{t1?.code || match.teams[0]}</div>
          <div className="name" style={{ fontSize: nameFontSize(t1?.name || match.teams[0]) }}>{t1?.name || 'A definir'}</div>
          {t1 && <Stripes colors={t1.flag} width={140} height={8}/>}
        </div>
        <div className="gd-vs">
          {match.score ? <span style={{ fontSize: 48, fontFamily: 'var(--font-mono)' }}>{match.score.home} – {match.score.away}</span> : 'vs.'}
        </div>
        <div className="gd-team right">
          <div className="code">{t2?.code || match.teams[1]}</div>
          <div className="name italic" style={{ fontSize: nameFontSize(t2?.name || match.teams[1]) }}>{t2?.name || 'A definir'}</div>
          {t2 && <Stripes colors={t2.flag} width={140} height={8}/>}
        </div>
        <div className="gd-meta" style={{ gridTemplateColumns: match.venue?.stadium ? 'repeat(3, 1fr)' : '1fr 1fr' }}>
          <div><div className="lbl">FASE</div><div className="val">{t.stages[match.stage] || STAGE_LABELS[match.stage]}{match.group ? ` · ${t.dashboard.group_section} ${match.group}` : ''}</div></div>
          <div><div className="lbl">DATA · {t.game.kickoff}</div><div className="val">{fmtDate(match.date)} · {match.date.hh}</div></div>
          {match.venue?.stadium && <div><div className="lbl">{t.game.venue_label}</div><div className="val">{match.venue.stadium}</div></div>}
        </div>
      </section>

      <section className={`gd-cta ${isWatched ? 'watched' : ''} ${!canMark ? 'scheduled' : ''}`}>
        <div>
          <div className="lbl">{!canMark ? 'JOGO NÃO REALIZADO' : isWatched ? t.game.you_watched : t.game.next_step}</div>
          <div className="txt">
            {!canMark
              ? <>Aguarde o <span className="it">apito inicial</span> para marcar este jogo.</>
              : isWatched
                ? <>✓ {t.game.in_list} <span className="it">{t.game.your_list}</span></>
                : <>{t.game.waiting} <span className="it">{t.game.ball_rolling}</span></>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <button
            className={isWatched ? 'btn btn-lg' : 'btn btn-lg btn-yellow'}
            onClick={() => canMark && toggleWatched(match.id)}
            disabled={!canMark}
            style={{ opacity: canMark ? 1 : 0.35, cursor: canMark ? 'pointer' : 'not-allowed' }}
          >
            {isWatched ? t.game.unmark : t.game.mark}
          </button>
          <Check on={isWatched} onClick={() => toggleWatched(match.id)} disabled={!canMark} size={52}/>
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

        <div className="gd-venue-ink" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          {groupStandings ? (
            <div style={{ paddingRight: 12 }}>
              <div className="mono" style={{ color: 'var(--bg)', opacity: 0.6, marginBottom: 14 }}>GRUPO {match.group} · CLASSIFICAÇÃO</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {groupStandings.map((row, i) => {
                  const isPlaying = row.code === match.teams[0] || row.code === match.teams[1];
                  const teamInfo = TEAM_BY_CODE[row.code];
                  return (
                    <div key={row.code} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '11px 0',
                      borderBottom: '1px solid rgba(244,241,234,0.1)',
                      opacity: isPlaying ? 1 : 0.45,
                    }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, width: 12, flexShrink: 0, color: i < 2 ? '#4ade80' : 'rgba(244,241,234,0.35)' }}>{i + 1}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                        {teamInfo && <div style={{ width: 3, height: 16, background: teamInfo.flag[0], flexShrink: 0 }} />}
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em' }}>{row.code}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.4, flexShrink: 0 }}>{row.gp}J</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.4, flexShrink: 0 }}>{row.gf}-{row.ga}</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: 'var(--br-yellow)', flexShrink: 0, minWidth: 20, textAlign: 'right' }}>{row.pts}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid rgba(244,241,234,0.16)' }}>
                <div style={{ padding: '16px 16px 16px 0', borderRight: '1px solid rgba(244,241,234,0.16)' }}>
                  <div className="mono" style={{ color: 'var(--bg)', opacity: 0.5 }}>{t.game.kickoff}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', marginTop: 4, color: 'var(--br-yellow)' }}>{match.date.hh}</div>
                </div>
                <div style={{ padding: '16px 0 16px 16px' }}>
                  <div className="mono" style={{ color: 'var(--bg)', opacity: 0.5 }}>JOGOS NO GRUPO</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', marginTop: 4 }}>{sameGroup.length + 1}</div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ paddingRight: 12 }}>
              <div className="mono" style={{ color: 'var(--bg)', opacity: 0.6, marginBottom: 10 }}>FASE</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 56, letterSpacing: '-0.05em', lineHeight: 0.88 }}>{t.stages[match.stage] || STAGE_LABELS[match.stage]}</div>
              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, borderTop: '1px solid rgba(244,241,234,0.16)' }}>
                <div style={{ padding: '18px 16px 18px 0', borderRight: '1px solid rgba(244,241,234,0.16)' }}>
                  <div className="mono" style={{ color: 'var(--bg)', opacity: 0.5 }}>{t.game.kickoff}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', marginTop: 4, color: 'var(--br-yellow)' }}>{match.date.hh}</div>
                </div>
                <div style={{ padding: '18px 0 18px 16px' }}>
                  <div className="mono" style={{ color: 'var(--bg)', opacity: 0.5 }}>ID DO JOGO</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.03em', marginTop: 4 }}>{match.id}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {match.group && sameGroup.length > 0 && (
        <section>
          <div className="sec-head">
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
