'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { TEAMS, TEAM_BY_CODE, STAGE_LABELS, computeStats } from '@/lib/data';
import { computeBadges } from '@/lib/badges';
import { TeamCode, Icon } from '@/components/Shared';
import GameRow from '@/components/GameRow';

const CONFS = ['CONMEBOL', 'CONCACAF', 'UEFA', 'CAF', 'AFC', 'OFC'];

export default function ProfilePage() {
  const router = useRouter();
  const { watchedSet, state, toggleWatched, updateProfile, setTheme, setLang, setFavoriteTeam, resetAll, matches } = useStore();
  const t = useT();
  const [localName, setLocalName]     = useState(state.username);
  const [localHandle, setLocalHandle] = useState(state.handle);
  const importRef = useRef();

  useEffect(() => { setLocalName(state.username); },  [state.username]);
  useEffect(() => { setLocalHandle(state.handle); },  [state.handle]);

  const badges = computeBadges(watchedSet, matches, state.favoriteTeam);

  function exportData() {
    const data = { watched: state.watched, favoriteTeam: state.favoriteTeam, username: state.username, handle: state.handle };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'copa26-backup.json'; a.click();
    URL.revokeObjectURL(url);
  }

  function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data.watched)) throw new Error('formato inválido');
        if (!confirm(t.profile.import_confirm(data.watched.length))) return;
        updateProfile({ ...data, onboarded: true });
      } catch { alert('Arquivo inválido ou corrompido.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const grouped = CONFS.map(c => ({ conf: c, teams: TEAMS.filter(tm => tm.conf === c) }));
  const stats = computeStats(watchedSet, matches);
  const pct   = Math.round((stats.watched / stats.total) * 100);

  const byConf = {};
  matches.forEach(m => {
    if (!watchedSet.has(m.id)) return;
    m.teams.forEach(c => {
      const tm = TEAM_BY_CODE[c];
      if (!tm) return;
      byConf[tm.conf] = (byConf[tm.conf] || 0) + 1;
    });
  });

  const teamCounts = {};
  matches.forEach(m => {
    if (!watchedSet.has(m.id)) return;
    m.teams.forEach(c => { teamCounts[c] = (teamCounts[c] || 0) + 1; });
  });
  const topTeams     = Object.entries(teamCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);
  const watchedList  = matches.filter(m => watchedSet.has(m.id)).slice(-6).reverse();

  return (
    <div className="page-in">
      <section className="hero-stack profile-hero">
        <div className="hero-main" style={{ gridRow: 'span 1', minHeight: 380 }}>
          <div className="watermark">{state.favoriteTeam}</div>
          <div className="top">
            <div>
              <div className="mono" style={{ opacity: 0.7, color: 'var(--bg)' }}>{t.profile.your_collection}</div>
              <div className="mono" style={{ marginTop: 4, color: 'var(--br-yellow)' }}>{t.profile.subtitle_member}</div>
            </div>
          </div>
          <div className="hero-num">
            <span>{stats.watched}</span>
            <span className="of">/ {stats.total}</span>
          </div>
          <div className="hero-bottom">
            <div>
              <div className="lbl">{t.profile.progress_cup}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, letterSpacing: '-0.03em', marginTop: 4 }}>
                <span style={{ color: 'var(--br-yellow)' }}>{pct}%</span>{' '}
                <span style={{ opacity: 0.4, fontStyle: 'italic', fontSize: 22 }}>{t.profile.complete}</span>
              </div>
            </div>
            <div className="progress">
              <div className="lbl" style={{ marginBottom: 6 }}>{stats.total - stats.watched} {t.profile.remaining}</div>
              <div className="hero-progress"><span style={{ width: pct + '%' }}></span></div>
            </div>
          </div>
        </div>

        <div className="hero-tile yellow" style={{ minHeight: 380 }}>
          <div className="tile-lbl">{t.profile.fav_team}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 140, letterSpacing: '-0.06em', lineHeight: 0.82 }}>{state.favoriteTeam}</div>
          <button className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => router.push(`/teams/${state.favoriteTeam}`)}>
            {t.profile.see_team} <Icon name="arrow" size={13}/>
          </button>
        </div>

        <div className="hero-tile blue" style={{ minHeight: 380 }}>
          <div className="tile-lbl">{t.profile.confs_seen}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 'auto' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 140, letterSpacing: '-0.06em', lineHeight: 1 }}>
              {Object.keys(byConf).length}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontStyle: 'italic', fontSize: 48, opacity: 0.35, lineHeight: 1, paddingBottom: 12 }}>/6</div>
          </div>
          <div className="tile-foot">UEFA · CONMEBOL · CONCACAF · CAF · AFC · OFC</div>
        </div>
      </section>

      <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline' }}>
        <div className="sec-num">01 / 05</div>
        <h2 className="sec-title">{t.profile.sec_progress} <span className="it">{t.profile.sec_progress_adj}</span></h2>
        <span className="chip">{stats.watched}/{stats.total}</span>
      </div>
      <section style={{ padding: '0 40px 30px' }}>
        <div className="bars">
          {Object.keys(STAGE_LABELS).map(s => {
            const it = stats.byStage[s];
            const p  = it.total === 0 ? 0 : (it.watched / it.total) * 100;
            return (
              <div className="bar" key={s} style={{ gridTemplateColumns: '200px 1fr 100px' }}>
                <div className="bar-label">{t.stages[s] || STAGE_LABELS[s]}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: p + '%' }}></div></div>
                <div className="bar-num">{it.watched}/{it.total}</div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline' }}>
        <div className="sec-num">02 / 05</div>
        <h2 className="sec-title">{t.profile.sec_top} <span className="it">{t.profile.sec_top_adj}</span></h2>
        <span className="chip">{t.profile.top_6}</span>
      </div>
      <section className="profile-teams-grid" style={{ borderTop: '1.2px solid var(--line)', borderBottom: '1.2px solid var(--line)' }}>
        <div style={{ borderRight: '1.2px solid var(--line)' }}>
          {topTeams.length === 0
            ? <div className="empty" style={{ border: 'none' }}>MARQUE JOGOS PARA POPULAR ESSE RANKING</div>
            : topTeams.map(([code, count], i) => {
                const tm = TEAM_BY_CODE[code];
                return (
                  <div key={code} onClick={() => router.push(`/teams/${code}`)} style={{ display: 'grid', gridTemplateColumns: '80px auto 1fr 60px', gap: 20, alignItems: 'center', padding: '20px 40px', cursor: 'pointer', borderBottom: '1px solid var(--line-faint)' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 56, letterSpacing: '-0.05em', lineHeight: 0.8, color: i === 0 ? 'var(--br-green)' : i === 1 ? 'var(--br-blue)' : 'var(--ink-mute)' }}>{String(i+1).padStart(2,'0')}</div>
                    <TeamCode code={code} size="m"/>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-0.025em', lineHeight: 1 }}>{tm?.name}</div>
                      <div className="mono" style={{ marginTop: 4 }}>{tm?.conf}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 36, textAlign: 'right', letterSpacing: '-0.03em' }}>{count}</div>
                  </div>
                );
              })
          }
        </div>
        <div style={{ padding: '30px 40px', background: 'var(--bg-elev)' }}>
          <div className="mono" style={{ marginBottom: 16 }}>{t.profile.by_conf}</div>
          {['UEFA','CONMEBOL','CONCACAF','CAF','AFC','OFC'].map(c => {
            const n   = byConf[c] || 0;
            const max = Math.max(1, ...Object.values(byConf));
            const p   = (n / max) * 100;
            const color = c === 'CONMEBOL' ? 'var(--br-yellow)' : c === 'UEFA' ? 'var(--br-blue)' : c === 'CAF' ? 'var(--br-green)' : 'var(--ink-soft)';
            return (
              <div key={c} style={{ padding: '12px 0', borderBottom: '1px solid var(--line-faint)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{c}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, fontStyle: 'italic' }}>{n}</span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-soft)' }}>
                  <div style={{ width: p + '%', height: '100%', background: color, transition: 'width 0.4s' }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline' }}>
        <div className="sec-num">03 / 05</div>
        <h2 className="sec-title">{t.profile.sec_history} <span className="it">{t.profile.sec_history_adj}</span></h2>
      </div>
      <section>
        {watchedList.length === 0
          ? <div className="empty">{t.profile.no_games}</div>
          : watchedList.map(m => <GameRow key={m.id} match={m} watched={watchedSet.has(m.id)} onToggle={() => toggleWatched(m.id)} onOpen={() => router.push(`/game/${m.id}`)}/>)
        }
      </section>

      <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline' }}>
        <div className="sec-num">04 / 06</div>
        <h2 className="sec-title">{t.profile.sec_badges} <span className="it">{t.profile.sec_badges_adj}</span></h2>
        <span className="chip">{badges.filter(b => b.earned).length}/{badges.length}</span>
      </div>
      <section className="badge-grid" style={{ borderTop: '1.2px solid var(--line)', borderBottom: '1.2px solid var(--line)' }}>
        {badges.map(b => (
          <div key={b.id} className={`badge-item ${b.earned ? 'earned' : 'locked'}`}>
            <div className="badge-icon"><Icon name={b.icon} size={16}/></div>
            <div className="badge-name">{b.label}</div>
            <div className="badge-desc">{b.desc}</div>
          </div>
        ))}
      </section>

      <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline' }}>
        <div className="sec-num">05 / 06</div>
        <h2 className="sec-title">{t.profile.sec_settings} <span className="it">{t.profile.sec_settings_adj}</span></h2>
      </div>
      <section className="profile-settings-section" style={{ padding: '0 40px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div className="profile-settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div className="mono" style={{ marginBottom: 10 }}>{t.profile.name_label}</div>
            <input
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              onBlur={() => updateProfile({ username: localName.trim() || state.username })}
              maxLength={30}
              style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1.5px solid var(--line-soft)', color: 'var(--ink)', fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', padding: '8px 0', outline: 'none' }}
            />
          </div>
          <div>
            <div className="mono" style={{ marginBottom: 10 }}>{t.profile.subtitle_label}</div>
            <input
              value={localHandle}
              onChange={e => setLocalHandle(e.target.value)}
              onBlur={() => updateProfile({ handle: localHandle.trim() })}
              placeholder={t.profile.subtitle_ph}
              maxLength={40}
              style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1.5px solid var(--line-soft)', color: 'var(--ink)', fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', padding: '8px 0', outline: 'none' }}
            />
          </div>
        </div>

        <div className="profile-settings-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <div>
            <div className="mono" style={{ marginBottom: 10 }}>TIME FAVORITO</div>
            <select
              value={state.favoriteTeam}
              onChange={e => setFavoriteTeam(e.target.value)}
              style={{ width: '100%', background: 'var(--bg)', border: 'none', borderBottom: '1.5px solid var(--line-soft)', color: 'var(--ink)', fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em', padding: '8px 0', outline: 'none', cursor: 'pointer' }}
            >
              {grouped.map(({ conf, teams }) => (
                <optgroup key={conf} label={conf}>
                  {teams.map(tm => <option key={tm.code} value={tm.code}>{tm.code} - {tm.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <div className="mono" style={{ marginBottom: 10 }}>{t.profile.theme_label}</div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
              {['light', 'dark'].map(th => (
                <button key={th} className={`btn btn-sm${state.theme === th ? ' btn-solid' : ''}`} onClick={() => setTheme(th)}>
                  {th === 'light' ? t.common.light : t.common.dark}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mono" style={{ marginBottom: 10 }}>{t.profile.lang_label}</div>
            <div style={{ display: 'flex', gap: 8, paddingTop: 8 }}>
              {['pt', 'en'].map(l => (
                <button key={l} className={`btn btn-sm${state.lang === l ? ' btn-solid' : ''}`} onClick={() => setLang(l)}>
                  {l === 'pt' ? 'PT' : 'EN'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 8 }}>
          <div className="mono" style={{ marginBottom: 16 }}>{t.profile.backup_label}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-sm" onClick={exportData}>
              <Icon name="download" size={12}/> {t.profile.export_btn}
            </button>
            <button className="btn btn-sm" onClick={() => importRef.current?.click()}>
              <Icon name="upload" size={12}/> {t.profile.import_btn}
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }} onChange={importData}/>
          </div>
          <div className="mono" style={{ marginTop: 10, color: 'var(--ink-mute)' }}>{t.profile.backup_hint}</div>
        </div>
      </section>

      <div className="sec-head" style={{ padding: '32px 40px 18px', borderTop: '1.2px solid var(--line)', display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline' }}>
        <div className="sec-num">06 / 06</div>
        <h2 className="sec-title">{t.profile.sec_danger} <span className="it">{t.profile.sec_danger_adj}</span></h2>
      </div>
      <section className="danger-row" style={{ padding: '0 40px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, letterSpacing: '-0.03em' }}>{t.profile.reset_title}</div>
          <div className="mono" style={{ marginTop: 4 }}>{t.profile.reset_hint}</div>
        </div>
        <button className="btn" onClick={() => { if (confirm(t.profile.reset_confirm)) resetAll(); }}>
          {t.profile.reset_btn}
        </button>
      </section>
    </div>
  );
}
