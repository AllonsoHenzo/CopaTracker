'use client';

import { TEAM_BY_CODE, fmtDate } from '@/lib/data';
import { TeamCode, Check } from './Shared';

const LIVE     = new Set(['IN_PLAY', 'PAUSED', 'HALFTIME']);
const MARKABLE = new Set(['FINISHED', 'IN_PLAY', 'PAUSED', 'HALFTIME']);

export default function GameRow({ match, watched, onToggle, onOpen }) {
  const t1      = TEAM_BY_CODE[match.teams[0]] || { name: match.teams[0], code: match.teams[0] };
  const t2      = TEAM_BY_CODE[match.teams[1]] || { name: match.teams[1], code: match.teams[1] };
  const isLive  = LIVE.has(match.status);
  const canMark = MARKABLE.has(match.status);

  return (
    <div className={`game-row ${watched ? 'watched' : ''} ${isLive ? 'live' : ''}`} onClick={onOpen}>
      <div className="game-id">{match.id}</div>
      <div className="game-matchup">
        <div className="game-team">
          <TeamCode code={t1.code} size="s"/>
          <span className="name">{t1.name}</span>
        </div>
        {match.score ? (
          <span className="game-score">{match.score.home} – {match.score.away}</span>
        ) : (
          <span className="game-vs">vs</span>
        )}
        <div className="game-team away">
          <span className="name">{t2.name}</span>
          <TeamCode code={t2.code} size="s"/>
        </div>
      </div>
      <div className="game-when">
        {isLive
          ? <span className="live-badge"><span className="live-dot"></span>AO VIVO</span>
          : <>{fmtDate(match.date, { short: true })} · {match.date.hh}</>
        }
      </div>
      <div className="game-venue">{match.venue?.city}</div>
      <Check on={watched} onClick={onToggle} disabled={!canMark}/>
    </div>
  );
}
