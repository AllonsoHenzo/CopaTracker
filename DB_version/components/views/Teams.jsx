'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { TEAMS, TEAM_BY_CODE, GROUPS, teamGroup } from '@/lib/data';
import { TeamCode } from '@/components/Shared';

export default function TeamsPage() {
  const router = useRouter();
  const { watchedSet, state, matches } = useStore();
  const t = useT();
  const [view, setView] = useState('groups');
  const [conf, setConf] = useState('all');

  return (
    <div className="page-in">
      <section className="filters">
        <div className="filter-row">
          <span className="filter-label">{t.teams.view_label}</span>
          <button className={`filter-chip ${view === 'groups' ? 'active' : ''}`} onClick={() => setView('groups')}>{t.teams.groups_view}</button>
          <button className={`filter-chip ${view === 'all'    ? 'active' : ''}`} onClick={() => setView('all')}>{t.teams.teams_view}</button>
        </div>
        {view === 'all' && (
          <div className="filter-row">
            <span className="filter-label">{t.teams.confed_label}</span>
            {['all','UEFA','CONMEBOL','CONCACAF','CAF','AFC','OFC'].map(c => (
              <button key={c} className={`filter-chip ${conf === c ? 'active' : ''}`} onClick={() => setConf(c)}>{c === 'all' ? t.games.all : c}</button>
            ))}
          </div>
        )}
      </section>

      {view === 'groups' ? (
        <section className="groups-grid">
          {Object.keys(GROUPS).map(letter => (
            <BigGroupCard key={letter} letter={letter} fav={state.favoriteTeam} watchedSet={watchedSet} matches={matches} onTeam={(c) => router.push(`/teams/${c}`)}/>
          ))}
        </section>
      ) : (
        <section className="team-grid">
          {TEAMS.filter(tm => conf === 'all' || tm.conf === conf).map(tm => (
            <TeamCard key={tm.code} team={tm} isFav={state.favoriteTeam === tm.code} onClick={() => router.push(`/teams/${tm.code}`)}/>
          ))}
        </section>
      )}
    </div>
  );
}

function BigGroupCard({ letter, fav, watchedSet, matches, onTeam }) {
  const t = useT();
  const teams   = GROUPS[letter];
  const gMatches = matches.filter(m => m.group === letter);
  const w        = gMatches.filter(m => watchedSet.has(m.id)).length;
  return (
    <div className="group-card">
      <div className="group-card-head">
        <span className="group-letter">{letter}</span>
        <div style={{ flex: 1 }}>
          <div className="group-card-meta">{t.teams.group_label} · {teams.length} {t.teams.teams_label}</div>
          <div className="mono" style={{ marginTop: 2, color: 'var(--ink)' }}>{w}/{gMatches.length} {t.dashboard.watched_count}</div>
        </div>
      </div>
      <div className="group-table">
        {teams.map((code, i) => {
          const tm    = TEAM_BY_CODE[code];
          const isFav = fav === code;
          return (
            <div key={code} className={`group-row ${i < 2 ? 'qualifies' : ''}`} onClick={(e) => { e.stopPropagation(); onTeam(code); }} style={{ cursor: 'pointer' }}>
              <div className="rk">{i + 1}</div>
              <div className="nm">
                <TeamCode code={code} size="s"/>
                <span style={{ fontWeight: isFav ? 800 : 600 }}>
                  {tm?.name}{isFav && <span style={{ marginLeft: 6, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--br-green)', letterSpacing: '0.1em' }}>★</span>}
                </span>
              </div>
              <div className="pj">0</div>
              <div className="pt">0</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeamCard({ team, isFav, onClick }) {
  const t = useT();
  return (
    <article className="team-card" onClick={onClick}>
      <div className="stripe-top">
        {team.flag.map((c, i) => <span key={i} style={{ background: c }}></span>)}
      </div>
      <div>
        <div className="code">{team.code} · {team.conf}</div>
        <div className="nm">{team.name}</div>
      </div>
      <div className="foot">
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{t.teams.group_label}</div>
          <div className="grp">{teamGroup(team.code) || '—'}</div>
        </div>
        {isFav && <span className="chip chip-green">FAV</span>}
      </div>
    </article>
  );
}
