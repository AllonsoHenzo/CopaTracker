'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { GROUPS, STAGE_LABELS, STAGE_SHORT, TEAM_BY_CODE, fmtDate } from '@/lib/data';
import { Icon } from '@/components/Shared';
import GameRow from '@/components/GameRow';

export default function GamesPage({ initialFilters = {} }) {
  const router = useRouter();
  const { watchedSet, toggleWatched, markAllFinished, matches } = useStore();
  const t = useT();

  const finishedUnwatched = matches.filter(m => m.status === 'FINISHED' && !watchedSet.has(m.id));

  function catchUp() {
    if (finishedUnwatched.length === 0) return;
    if (!confirm(`Marcar ${finishedUnwatched.length} jogos já encerrados como assistidos?`)) return;
    markAllFinished(finishedUnwatched.map(m => m.id));
  }

  const [filters, setFilters] = useState({
    stage:  initialFilters.stage  || 'all',
    group:  'all',
    status: 'all',
    q:      '',
  });
  const set = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const filtered = matches.filter(m => {
    if (filters.stage  !== 'all' && m.stage !== filters.stage)       return false;
    if (filters.group  !== 'all' && m.group !== filters.group)       return false;
    if (filters.status === 'watched'   && !watchedSet.has(m.id))     return false;
    if (filters.status === 'unwatched' &&  watchedSet.has(m.id))     return false;
    if (filters.q) {
      const q  = filters.q.toLowerCase();
      const t1 = TEAM_BY_CODE[m.teams[0]]?.name.toLowerCase() || '';
      const t2 = TEAM_BY_CODE[m.teams[1]]?.name.toLowerCase() || '';
      if (!t1.includes(q) && !t2.includes(q) && !(m.venue?.city.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const grouped = {};
  filtered.forEach(m => {
    const key = `${m.date.y}-${m.date.m}-${m.date.d}`;
    if (!grouped[key]) grouped[key] = { date: m.date, items: [] };
    grouped[key].items.push(m);
  });

  return (
    <div className="page-in">
      <section className="filters">
        <div className="filter-row">
          <span className="filter-label">{t.games.stage_label}</span>
          <button className={`filter-chip ${filters.stage === 'all' ? 'active' : ''}`} onClick={() => set('stage','all')}>{t.games.all}</button>
          {Object.keys(STAGE_LABELS).map(s => (
            <button key={s} className={`filter-chip ${filters.stage === s ? 'active' : ''}`} onClick={() => set('stage', s)}>{t.stagesShort[s] || STAGE_SHORT[s]}</button>
          ))}
        </div>
        <div className="filter-row">
          <span className="filter-label">{t.games.group_label}</span>
          <button className={`filter-chip ${filters.group === 'all' ? 'active' : ''}`} onClick={() => set('group','all')}>{t.games.all_groups}</button>
          {Object.keys(GROUPS).map(g => (
            <button key={g} className={`filter-chip ${filters.group === g ? 'active' : ''}`} onClick={() => set('group', g)}>{g}</button>
          ))}
        </div>
        <div className="filter-row">
          <span className="filter-label">{t.games.status_label}</span>
          <button className={`filter-chip ${filters.status === 'all'       ? 'active' : ''}`} onClick={() => set('status','all')}>{t.games.all}</button>
          <button className={`filter-chip ${filters.status === 'watched'   ? 'active' : ''}`} onClick={() => set('status','watched')}>{t.games.watched_filter}</button>
          <button className={`filter-chip ${filters.status === 'unwatched' ? 'active' : ''}`} onClick={() => set('status','unwatched')}>{t.games.unwatched_filter}</button>
          <div className="search">
            <Icon name="search" size={14}/>
            <input placeholder="Time, cidade…" value={filters.q} onChange={(e) => set('q', e.target.value)}/>
          </div>
        </div>
      </section>

      <div style={{ padding: '18px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1.2px solid var(--line)' }}>
        <div className="mono">{t.common.showing} <span style={{ color: 'var(--ink)' }}>{filtered.length}</span> {t.common.of} {matches.length} {t.games.games_label}</div>
        {finishedUnwatched.length > 0 && (
          <button className="btn btn-sm" onClick={catchUp}>
            {t.games.mark_finished(finishedUnwatched.length)}
          </button>
        )}
      </div>

      <div>
        {Object.values(grouped).length === 0 && <div className="empty">{t.games.no_games}</div>}
        {Object.values(grouped).map(g => {
          const dt  = new Date(g.date.y, g.date.m - 1, g.date.d);
          const dow = t.days_abbr[dt.getDay()];
          const mon = t.months_abbr[g.date.m];
          const isWeekend = t.weekend_days.has(dt.getDay());
          return (
            <div key={`${g.date.y}-${g.date.m}-${g.date.d}`}>
              <div className="day-head">
                <div className="day-num">{String(g.date.d).padStart(2,'0')}</div>
                <div>
                  <div className="day-meta" style={{ fontSize: 12 }}>{dow.toUpperCase()} · {mon.toUpperCase()} {g.date.y}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 28, letterSpacing: '-0.03em', marginTop: 2, color: 'var(--ink-mute)' }}>
                    {isWeekend ? t.games.weekend : t.games.weekday}
                  </div>
                </div>
                <div className="day-count">{g.items.length} {t.games.games_label}</div>
              </div>
              {g.items.map(m => (
                <GameRow key={m.id} match={m} watched={watchedSet.has(m.id)} onToggle={() => toggleWatched(m.id)} onOpen={() => router.push('/game/' + m.id)} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
