import { TEAM_BY_CODE, GROUPS } from './data';

const CACHE_KEY = 'copa26-api-v2';
const CACHE_TTL = 30 * 60 * 1000;

function mapStage(s) {
  return ({ GROUP_STAGE:'group', LAST_32:'r32', ROUND_OF_16:'r16', QUARTER_FINALS:'qf', SEMI_FINALS:'sf', THIRD_PLACE:'third', FINAL:'final' })[s] || 'group';
}

function toBRT(utcStr) {
  const d = new Date(new Date(utcStr).getTime() - 3 * 60 * 60 * 1000);
  return {
    y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(),
    hh: `${String(d.getUTCHours()).padStart(2,'0')}:${String(d.getUTCMinutes()).padStart(2,'0')}`,
  };
}

function mapPayload({ matches: raw, standings, scorers: rawScorers }) {
  const scorers = (rawScorers || []).map((s, i) => ({
    rank:       i + 1,
    player:     s.player?.name || '?',
    nationality:s.player?.nationality || '',
    team:       s.team?.tla || '?',
    goals:      s.goals      || 0,
    assists:    s.assists     || 0,
    penalties:  s.penalties   || 0,
  }));

  const matches = (raw || []).map(m => ({
    id:    String(m.id),
    stage: mapStage(m.stage),
    group: m.group ? m.group.replace('GROUP_', '') : null,
    round: m.matchday,
    teams: [m.homeTeam?.tla || 'TBD', m.awayTeam?.tla || 'TBD'],
    date:  toBRT(m.utcDate),
    venue: { city: m.venue || '', country: '', stadium: m.venue || '' },
    score: (m.score?.fullTime?.home != null)
      ? { home: m.score.fullTime.home, away: m.score.fullTime.away } : null,
    status: m.status,
  }));

  if (standings) {
    for (const sg of standings) {
      if (sg.stage !== 'GROUP_STAGE') continue;
      const letter = sg.group.replace('GROUP_', '');
      GROUPS[letter] = sg.table.map(row => row.team.tla);
      for (const row of sg.table) {
        const t = row.team;
        if (!TEAM_BY_CODE[t.tla]) {
          TEAM_BY_CODE[t.tla] = { code: t.tla, name: t.shortName || t.name, flag: ['#888','#ccc','#888'], conf: '' };
        }
      }
    }
  }

  return { matches, standings: standings || null, scorers };
}

export async function fetchCopaData() {
  if (typeof window === 'undefined') return null;

  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    if (cached && Date.now() - cached.ts < CACHE_TTL) return mapPayload(cached.data);
  } catch {}

  const res = await fetch('/api/copa');
  if (!res.ok) throw new Error(`/api/copa retornou ${res.status}`);

  const payload = await res.json();
  if (payload.error) throw new Error(payload.error);

  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: payload })); } catch {}
  return mapPayload(payload);
}
