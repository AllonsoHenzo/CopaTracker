import { TEAM_BY_CODE } from './data';

export const BADGE_DEFS = [
  {
    id: 'first',
    icon: 'star',
    label: 'Primeiro jogo',
    desc: 'Marcou o primeiro jogo assistido',
    check: (w) => w.size >= 1,
  },
  {
    id: 'triple',
    icon: 'zap',
    label: 'Hat-trick',
    desc: '3 jogos marcados',
    check: (w) => w.size >= 3,
  },
  {
    id: 'dozen',
    icon: 'calendar',
    label: 'Dúzia',
    desc: '12 jogos marcados',
    check: (w) => w.size >= 12,
  },
  {
    id: 'halfway',
    icon: 'shield',
    label: 'Meio tempo',
    desc: '52 jogos marcados — metade da Copa',
    check: (w) => w.size >= 52,
  },
  {
    id: 'complete',
    icon: 'trophy',
    label: 'Copa completa',
    desc: 'Todos os 104 jogos assistidos',
    check: (w, m) => m.length > 0 && w.size >= m.length,
  },
  {
    id: 'faithful',
    icon: 'flag',
    label: 'Torcedor fiel',
    desc: 'Todos os jogos do time favorito',
    check: (w, m, fav) => {
      const fm = m.filter(x => x.teams.includes(fav));
      return fm.length > 0 && fm.every(x => w.has(x.id));
    },
  },
  {
    id: 'final',
    icon: 'award',
    label: 'Finalista',
    desc: 'Assistiu à grande final',
    check: (w, m) => m.filter(x => x.stage === 'final').some(x => w.has(x.id)),
  },
  {
    id: 'hosts',
    icon: 'home',
    label: 'Anfitriões',
    desc: 'Viu jogo de EUA, Canadá e México',
    check: (w, m) => ['USA', 'MEX', 'CAN'].every(c => m.some(x => w.has(x.id) && x.teams.includes(c))),
  },
  {
    id: 'allphases',
    icon: 'chevron',
    label: 'Mata-mata completo',
    desc: 'Pelo menos 1 jogo de cada fase',
    check: (w, m) => ['group', 'r16', 'qf', 'sf', 'final'].every(s => m.some(x => x.stage === s && w.has(x.id))),
  },
  {
    id: 'allconfs',
    icon: 'globe',
    label: 'Mundo todo',
    desc: 'Viu jogos de todas as 6 confederações',
    check: (w, m) => {
      const confs = new Set();
      m.forEach(x => { if (w.has(x.id)) x.teams.forEach(c => { if (TEAM_BY_CODE[c]) confs.add(TEAM_BY_CODE[c].conf); }); });
      return confs.size >= 6;
    },
  },
];

export function computeBadges(watchedSet, matches, favoriteTeam) {
  return BADGE_DEFS.map(b => ({ ...b, earned: b.check(watchedSet, matches, favoriteTeam) }));
}
