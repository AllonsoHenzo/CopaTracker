'use client';

import { useState } from 'react';
import { TEAM_BY_CODE, STAGE_SHORT } from '@/lib/data';

export function TeamCode({ code, size = 'm' }) {
  const t = TEAM_BY_CODE[code] || { code, flag: ['#888','#aaa','#666'] };
  const cls = 'team-code' + (size === 's' ? ' team-code-s' : size === 'l' ? ' team-code-l' : '');
  return (
    <span className={cls}>
      <span className="stripe" style={{ background: `linear-gradient(180deg, ${t.flag[0]} 33%, ${t.flag[1]} 33% 66%, ${t.flag[2]} 66%)` }}></span>
      {t.code || code}
    </span>
  );
}

export function Check({ on, onClick, size = 32, disabled = false }) {
  const [pop, setPop] = useState(false);
  const handleClick = (e) => {
    e?.stopPropagation();
    if (disabled) return;
    if (!on) { setPop(true); setTimeout(() => setPop(false), 600); }
    onClick?.();
  };
  return (
    <button
      className={`mark ${on ? 'on' : ''} ${pop ? 'pop' : ''} ${disabled ? 'disabled' : ''}`}
      style={{ width: size, height: size, opacity: disabled ? 0.2 : 1, cursor: disabled ? 'default' : 'pointer' }}
      onClick={handleClick}
      aria-label={disabled ? 'Jogo ainda não ocorreu' : on ? 'Desmarcar' : 'Marcar como assistido'}
      title={disabled ? 'Jogo ainda não ocorreu' : undefined}
    >
      <svg viewBox="0 0 24 24" width={Math.round(size * 0.55)} height={Math.round(size * 0.55)}>
        <polyline points="5,13 10,18 19,7"></polyline>
      </svg>
    </button>
  );
}

export function Icon({ name, size = 16 }) {
  const paths = {
    home:     <><path d="M3 11l9-8 9 8"/><path d="M5 9v11h14V9"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16"/><path d="M3 9h18"/><path d="M8 3v4M16 3v4"/></>,
    trophy:   <><path d="M8 21h8M12 17v4M5 4h14v3a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5V4z"/></>,
    user:     <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 5-6 8-6s7 2 8 6"/></>,
    search:   <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    share:    <><path d="M4 12v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8"/><path d="M16 6l-4-4-4 4"/><path d="M12 2v14"/></>,
    arrow:    <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    back:     <><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></>,
    filter:   <><path d="M3 6h18M6 12h12M10 18h4"/></>,
    star:     <polygon points="12,2 15,9 22,10 17,15 18,22 12,18 6,22 7,15 2,10 9,9"/>,
    flag:     <><path d="M4 21V4M4 4h12l-2 4 2 4H4"/></>,
    chevron:  <path d="m9 6 6 6-6 6"/>,
    plus:     <><path d="M12 5v14M5 12h14"/></>,
    globe:    <><circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15.4 15.4 0 0 1 0 20M12 2a15.4 15.4 0 0 0 0 20"/></>,
    shield:   <><path d="M12 2L3 7v5c0 5 4 9.3 9 10.5C17 21.3 21 17 21 12V7l-9-5z"/></>,
    award:    <><circle cx="12" cy="9" r="6"/><path d="M8.6 15.7 7 22l5-3 5 3-1.6-6.3"/></>,
    zap:      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>,
    download: <><path d="M12 3v13"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></>,
    upload:   <><path d="M12 17V4"/><path d="m7 9 5-5 5 5"/><path d="M5 21h14"/></>,
  };
  return <svg className="i" width={size} height={size} viewBox="0 0 24 24">{paths[name]}</svg>;
}

export function StageChip({ stage }) {
  const cls = stage === 'final' ? 'chip chip-yellow' : stage === 'group' ? 'chip' : (stage === 'sf' || stage === 'qf') ? 'chip chip-blue' : stage === 'r16' ? 'chip chip-green' : 'chip';
  return <span className={cls}>{STAGE_SHORT[stage]}</span>;
}

export function Stripes({ colors, width = 80, height = 6 }) {
  return (
    <div style={{ display: 'flex', width, height, overflow: 'hidden' }}>
      {colors.map((c, i) => <div key={i} style={{ background: c, flex: 1 }}></div>)}
    </div>
  );
}
