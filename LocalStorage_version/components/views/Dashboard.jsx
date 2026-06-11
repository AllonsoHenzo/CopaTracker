'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { TEAM_BY_CODE, GROUPS, STAGE_LABELS, STAGE_SHORT, fmtDate, computeStats } from '@/lib/data';
import { TeamCode, Check, Icon, StageChip } from '@/components/Shared';
import GameRow from '@/components/GameRow';
import SectionHead from '@/components/SectionHead';

export default function Dashboard() {
  const router = useRouter();
  const { watchedSet, toggleWatched, state, matches } = useStore();
  const t = useT();
  const onNav = (p) => router.push('/' + p);

  const stats = computeStats(watchedSet, matches);
  const pct   = Math.round((stats.watched / stats.total) * 100);

  const now   = new Date();
  const today = { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  const todayGames = matches.filter(m => m.date.y === today.y && m.date.m === today.m && m.date.d === today.d);
  const upcoming   = matches.filter(m => !watchedSet.has(m.id)).slice(0, 8);

  const fav      = state.favoriteTeam;
  const favTeam  = TEAM_BY_CODE[fav];
  const favGroup = Object.entries(GROUPS).find(([, arr]) => arr.includes(fav))?.[0] || '?';
  const favMatches = matches.filter(m => m.teams.includes(fav));
  const favWatched = favMatches.filter(m => watchedSet.has(m.id)).length;

  const finalDate   = new Date(2026, 6, 19);
  const daysToFinal = Math.max(0, Math.ceil((finalDate - now) / 86400000));

  const citiesWatched = new Set(matches.filter(m => watchedSet.has(m.id) && m.venue?.city).map(m => m.venue.city));
  const teamsWatched  = new Set(matches.flatMap(m => watchedSet.has(m.id) ? m.teams : []));

  const LIVE_STATUS = new Set(['IN_PLAY', 'PAUSED', 'HALFTIME']);
  const liveGames   = matches.filter(m => LIVE_STATUS.has(m.status));

  const todayStart  = new Date(today.y, today.m - 1, today.d).getTime();
  const nextFavMatch = matches
    .filter(m => m.teams.includes(fav) && !watchedSet.has(m.id))
    .filter(m => new Date(m.date.y, m.date.m - 1, m.date.d).getTime() >= todayStart)
    .sort((a, b) => new Date(a.date.y, a.date.m - 1, a.date.d) - new Date(b.date.y, b.date.m - 1, b.date.d))[0];

  const TEAM_CRIES = {
    BRA: 'JÁ É HEXA!',       GER: 'É O PENTA!',           ARG: 'É O TETRA!',
    FRA: 'É O TRI!',          URU: 'É O TRI!',             ENG: 'FUTEBOL VOLTA PRA CASA!',
    ESP: 'É O BI!',           MEX: 'PASSA DO QUINTO JOGO!',NED: 'É A LARANJA MECÂNICA!',
    POR: 'É A PRIMEIRA!',     BEL: 'A GERAÇÃO DE OURO!',   CRO: 'É A PRIMEIRA!',
    USA: 'DREAM TEAM!',       CAN: 'É A PRIMEIRA!',        JPN: 'É A PRIMEIRA!',
    MAR: 'LIONS OF ATLAS!',   SEN: 'É A PRIMEIRA!',        NOR: 'É A PRIMEIRA!',
    AUS: 'É A PRIMEIRA!',     SUI: 'É A PRIMEIRA!',        KOR: 'É A PRIMEIRA!',
    COL: 'É A PRIMEIRA!',     ECU: 'É A PRIMEIRA!',        PAR: 'É A PRIMEIRA!',
    TUR: 'É A PRIMEIRA!',     AUT: 'É A PRIMEIRA!',        SCO: 'É A PRIMEIRA!',
    HAI: 'É A PRIMEIRA!',     CUW: 'É A PRIMEIRA!',        SWE: 'É A PRIMEIRA!',
    BIH: 'É A PRIMEIRA!',     CZE: 'É A PRIMEIRA!',        QAT: 'É A PRIMEIRA!',
    NZL: 'É A PRIMEIRA!',     COD: 'É A PRIMEIRA!',        GHA: 'É A PRIMEIRA!',
    PAN: 'É A PRIMEIRA!',     RSA: 'É A PRIMEIRA!',        ALG: 'É A PRIMEIRA!',
    EGY: 'É A PRIMEIRA!',     CPV: 'É A PRIMEIRA!',        CIV: 'É A PRIMEIRA!',
    TUN: 'É A PRIMEIRA!',     JOR: 'É A PRIMEIRA!',        IRQ: 'É A PRIMEIRA!',
    IRN: 'É A PRIMEIRA!',     KSA: 'É A PRIMEIRA!',        UZB: 'É A PRIMEIRA!',
  };
  const teamCry = TEAM_CRIES[fav] || 'É A PRIMEIRA!';

  const daysToNext = nextFavMatch
    ? Math.ceil((new Date(nextFavMatch.date.y, nextFavMatch.date.m - 1, nextFavMatch.date.d) - new Date(today.y, today.m - 1, today.d)) / 86400000)
    : null;

  return (
    <div className="page-in">

      {liveGames.length > 0 && (
        <section style={{ borderBottom: '1.2px solid var(--line)', background: 'rgba(255,59,48,0.04)' }}>
          <div style={{ padding: '14px 40px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,59,48,0.15)' }}>
            <span className="live-badge"><span className="live-dot"></span>{t.common.live_now}</span>
            <span className="mono" style={{ color: 'var(--ink-mute)' }}>{liveGames.length} {liveGames.length > 1 ? t.common.games_noun : t.common.game} {t.common.in_progress}</span>
          </div>
          {liveGames.map(m => (
            <GameRow key={m.id} match={m} watched={watchedSet.has(m.id)} onToggle={() => toggleWatched(m.id)} onOpen={() => onNav(`game/${m.id}`)}/>
          ))}
        </section>
      )}

      {nextFavMatch && (
        <div className="next-game-banner" onClick={() => onNav(`game/${nextFavMatch.id}`)}>
          <span className="mono" style={{ color: 'var(--ink-mute)' }}>{t.common.next_game} {favTeam?.name?.toUpperCase() || fav}</span>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, letterSpacing: '-0.03em' }}>
            {nextFavMatch.teams[0]} <span style={{ opacity: 0.4, fontStyle: 'italic', fontSize: 16 }}>vs</span> {nextFavMatch.teams[1]}
          </div>
          <div className="mono">{nextFavMatch.date.d}/{nextFavMatch.date.m} · {nextFavMatch.date.hh}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 28, letterSpacing: '-0.04em', color: daysToNext === 0 ? '#ff3b30' : 'var(--br-green)' }}>
            {daysToNext === 0 ? t.common.today : daysToNext === 1 ? t.common.tomorrow : `${daysToNext} ${t.common.days}`}
          </div>
        </div>
      )}

      <section className="hero-stack">
        <div className="hero-main">
          <div className="watermark">26</div>
          <div className="top">
            <div>
              <div className="mono" style={{ opacity: 0.7, color: 'var(--bg)' }}>{t.dashboard.your_journey}</div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <span className="chip chip-yellow">{daysToFinal} {t.dashboard.days_to_final_chip}</span>
              </div>
            </div>
            <button className="btn btn-yellow" onClick={() => onNav('games')}>
              {t.dashboard.see_schedule} <Icon name="arrow" size={14}/>
            </button>
          </div>
          <div className="hero-num">
            <span>{String(stats.watched).padStart(2,'0')}</span>
            <span className="of">/ {stats.total}</span>
          </div>
          <div className="hero-bottom">
            <div>
              <div className="lbl">{t.dashboard.watched_label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', marginTop: 4 }}>
                <span style={{ color: 'var(--br-yellow)' }}>{pct}%</span>{' '}
                <span style={{ opacity: 0.4, fontStyle: 'italic', fontSize: 22 }}>da Copa</span>
              </div>
            </div>
            <div className="progress">
              <div className="lbl" style={{ marginBottom: 6 }}>{t.dashboard.progress_label}</div>
              <div className="hero-progress"><span style={{ width: pct + '%' }}></span></div>
            </div>
          </div>
        </div>

        <div className="hero-tile green">
          <div className="tile-lbl">{t.dashboard.days_to_final_tile}</div>
          <div className="tile-num">{daysToFinal}</div>
          <div className="tile-foot">{t.dashboard.final_date}</div>
        </div>

        <div className="hero-tile yellow" style={{ cursor: 'pointer' }} onClick={() => onNav(`teams/${fav}`)}>
          <div className="tile-lbl">{t.dashboard.your_team}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 80, letterSpacing: '-0.05em', lineHeight: 0.85 }}>
              {favTeam?.code || fav}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>
              {favWatched}/{favMatches.length}
            </div>
          </div>
          <div className="tile-foot">{favTeam?.name.toUpperCase()} · {t.dashboard.group_section} {favGroup}</div>
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat-cell">
          <div className="mono">{t.dashboard.remaining_label}</div>
          <div className="num" style={{ color: 'var(--br-blue)' }}>{stats.total - stats.watched}</div>
          <div className="mono" style={{ color: 'var(--ink-mute)' }}>{t.dashboard.games_left}</div>
        </div>
        <div className="stat-cell">
          <div className="mono">{t.dashboard.venues_visited}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <div className="num" style={{ color: 'var(--br-green)' }}>{citiesWatched.size}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', fontSize: 36, opacity: 0.4, lineHeight: 1, paddingBottom: 14 }}>/16</div>
          </div>
          <div className="mono" style={{ color: 'var(--ink-mute)' }}>{t.dashboard.cities_hint}</div>
        </div>
        <div className="stat-cell" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          <div className="mono" style={{ color: 'var(--bg)', opacity: 0.6 }}>{t.dashboard.teams_seen}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <div className="num" style={{ color: 'var(--br-yellow)' }}>{teamsWatched.size}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', fontSize: 36, opacity: 0.4, color: 'var(--br-yellow)', lineHeight: 1, paddingBottom: 14 }}>/48</div>
          </div>
          <div className="mono" style={{ color: 'var(--bg)', opacity: 0.6 }}>{t.dashboard.teams_hint}</div>
        </div>
      </section>

      <SectionHead num="01" title={<>{t.dashboard.upcoming} <span className="it">{t.dashboard.in_schedule}</span></>} count={`${upcoming.length} jogos`} action={<button className="btn" onClick={() => onNav('games')}>{t.common.see_all}</button>}/>
      <section className="scroll-row">
        {upcoming.map((m, i) => {
          const variant = i === 0 ? 'y' : i === 1 ? 'b' : i === 2 ? 'g' : i === 3 ? 'invert' : '';
          return <NextCard key={m.id} match={m} variant={variant} onClick={() => onNav(`game/${m.id}`)} onMark={() => toggleWatched(m.id)} watched={watchedSet.has(m.id)}/>;
        })}
      </section>

      <SectionHead num="02" title={<>{t.dashboard.today_title} <span className="it">{t.dashboard.in_tournament}</span></>} count={`${todayGames.length} jogos`} action={<button className="btn" onClick={() => onNav('games')}>{t.common.filter}</button>}/>
      <section>
        {todayGames.length === 0
          ? <div className="empty">{t.dashboard.no_games_today}</div>
          : todayGames.map(m => <GameRow key={m.id} match={m} watched={watchedSet.has(m.id)} onToggle={() => toggleWatched(m.id)} onOpen={() => onNav(`game/${m.id}`)}/>)
        }
      </section>

      <SectionHead num="03" title={<>{t.dashboard.group_section} <span className="it">{favGroup}</span></>} count={`A chave do ${favTeam?.name || fav}`} action={<button className="btn" onClick={() => onNav('teams')}>{t.dashboard.see_12_groups}</button>}/>
      <section className="dash-groups-grid" style={{ borderTop: '1.2px solid var(--line)', borderBottom: '1.2px solid var(--line)' }}>
        <BigGroupBlock letter={favGroup} watchedSet={watchedSet} onTeam={(c) => onNav(`teams/${c}`)} fav={fav}/>
        <div style={{ padding: '30px 40px', borderLeft: '1.2px solid var(--line)', background: 'var(--bg-elev)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 18 }}>
            {t.dashboard.group_games(favGroup)}
          </div>
          {matches.filter(m => m.group === favGroup).map(m => {
            const t1 = TEAM_BY_CODE[m.teams[0]];
            const t2 = TEAM_BY_CODE[m.teams[1]];
            const isW = watchedSet.has(m.id);
            return (
              <div key={m.id} onClick={() => onNav(`game/${m.id}`)} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 24px', gap: 14, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--line-faint)', cursor: 'pointer' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-mute)', letterSpacing: '0.08em' }}>{fmtDate(m.date, { short: true })} {m.date.hh}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>
                  {t1?.code} <span style={{ fontStyle: 'italic', color: 'var(--ink-mute)', fontSize: 14, margin: '0 6px' }}>vs</span> {t2?.code}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '0.06em' }}>{m.venue?.city.toUpperCase()}</div>
                <Check on={isW} onClick={() => toggleWatched(m.id)} size={20}/>
              </div>
            );
          })}
        </div>
      </section>

      <SectionHead num="04" title={<>{t.dashboard.progress_stage} <span className="it">{t.dashboard.by_stage}</span></>} count="7 ETAPAS · 104 JOGOS"/>
      <section className="stage-strip">
        {Object.keys(STAGE_LABELS).map((stage, i) => {
          const s = stats.byStage[stage];
          const p = s.total === 0 ? 0 : (s.watched / s.total) * 100;
          return (
            <div className="stage-pill" key={stage}>
              <div className="lab">{t.stagesShort[stage] || STAGE_SHORT[stage]}</div>
              <div className="ratio">{s.watched}<span style={{ fontSize: 18, opacity: 0.4, fontStyle: 'normal', fontFamily: 'var(--font-mono)' }}>/{s.total}</span></div>
              <div style={{ width: '100%', height: 4, background: 'var(--bg-soft)', marginTop: 4 }}>
                <div style={{ width: p + '%', height: '100%', background: stage === 'final' ? 'var(--br-yellow)' : 'var(--br-green)' }}></div>
              </div>
            </div>
          );
        })}
      </section>

      <div style={{ padding: '40px', textAlign: 'center', borderTop: '1.2px solid var(--line)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 80, letterSpacing: '-0.05em', lineHeight: 0.85, color: 'transparent', WebkitTextStroke: '1.5px var(--ink)' }}>
          {t.dashboard.cta_prefix} - {teamCry}
        </div>
        <div className="mono" style={{ marginTop: 18, color: 'var(--ink-mute)' }}>{t.dashboard.footer_dates}</div>
      </div>
    </div>
  );
}

function NextCard({ match, variant, onClick, onMark, watched }) {
  const cls = 'next-card' + (variant ? ' ' + variant : '');
  const t1  = TEAM_BY_CODE[match.teams[0]] || { name: match.teams[0], code: match.teams[0] };
  const t2  = TEAM_BY_CODE[match.teams[1]] || { name: match.teams[1], code: match.teams[1] };
  return (
    <article className={cls} onClick={onClick}>
      <div className="watermark2">{match.group || STAGE_SHORT[match.stage]}</div>
      <div className="head">
        <StageChip stage={match.stage}/>
        <Check on={watched} onClick={onMark} size={28}/>
      </div>
      <div className="matchup">
        <div className="team-line">{t1.name}<span className="cd">{t1.code}</span></div>
        <div className="vs">versus</div>
        <div className="team-line">{t2.name}<span className="cd">{t2.code}</span></div>
      </div>
      <div className="foot">
        <div className="when">{fmtDate(match.date, { short: true })}<strong>{match.date.hh}</strong></div>
        <div className="when" style={{ textAlign: 'right' }}>{match.venue?.country}<strong style={{ fontSize: 16 }}>{match.venue?.city}</strong></div>
      </div>
    </article>
  );
}

function BigGroupBlock({ letter, watchedSet, onTeam, fav }) {
  const { matches } = useStore();
  const t = useT();
  const teams   = GROUPS[letter] || [];
  const gMatches = matches.filter(m => m.group === letter);
  const w        = gMatches.filter(m => watchedSet.has(m.id)).length;
  return (
    <div style={{ padding: '30px 40px', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
      <div style={{ position: 'absolute', right: -20, top: -20, fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 280, letterSpacing: '-0.08em', lineHeight: 0.7, color: 'var(--br-yellow)', opacity: 0.5, pointerEvents: 'none' }}>{letter}</div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div className="mono" style={{ marginBottom: 8 }}>{t.dashboard.classification}</div>
        <div className="group-table">
          {teams.map((code, i) => {
            const tm      = TEAM_BY_CODE[code];
            const qualifies = i < 2;
            const isFav   = fav === code;
            return (
              <div key={code} className={`group-row ${qualifies ? 'qualifies' : ''}`} onClick={() => onTeam(code)} style={{ cursor: 'pointer', padding: '10px 0' }}>
                <div className="rk">{i + 1}</div>
                <div className="nm">
                  <TeamCode code={code} size="s"/>
                  <span style={{ fontWeight: isFav ? 800 : 600, fontSize: 18 }}>
                    {tm?.name}{isFav && <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--br-green)', letterSpacing: '0.12em' }}>· FAV</span>}
                  </span>
                </div>
                <div className="pj">PJ 0</div>
                <div className="pt">0</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="mono"><span style={{ display: 'inline-block', width: 6, height: 6, background: 'var(--br-green)', marginRight: 6, verticalAlign: 1 }}></span>{t.dashboard.advance}</span>
          <span className="mono">{w}/{gMatches.length} {t.dashboard.watched_count}</span>
        </div>
      </div>
    </div>
  );
}
