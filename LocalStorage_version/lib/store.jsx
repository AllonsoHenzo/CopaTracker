'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MATCHES as STATIC_MATCHES, getTeamTheme } from './data';
import { fetchCopaData } from './api';

const StoreContext = createContext(null);

const STORE_KEY = 'copa26-tracker-v2';

const DEFAULT = {
  watched:      [],
  favoriteTeam: 'BRA',
  theme:        'light',
  lang:         'pt',
  username:     '',
  handle:       '',
  onboarded:    false,
};

function loadLS()  { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } }
function saveLS(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {} }

export function StoreProvider({ children }) {
  const [state,      setState]      = useState(DEFAULT);
  const [hydrated,   setHydrated]   = useState(false);
  const [matches,    setMatches]    = useState(STATIC_MATCHES);
  const [standings,  setStandings]  = useState(null);
  const [scorers,    setScorers]    = useState([]);
  const [apiStatus,  setApiStatus]  = useState('loading');

  useEffect(() => {
    const saved = loadLS();
    if (saved) setState(s => ({ ...DEFAULT, ...saved }));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute('data-theme', state.theme);
    saveLS(state);
  }, [state, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const theme = getTeamTheme(state.favoriteTeam);
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [state.favoriteTeam, hydrated]);

  useEffect(() => {
    fetchCopaData()
      .then(data => {
        if (!data) { setApiStatus('error'); return; }
        setMatches(data.matches);
        setStandings(data.standings);
        setScorers(data.scorers || []);
        setApiStatus('ready');
      })
      .catch(() => setApiStatus('error'));
  }, []);

  const watchedSet = useMemo(() => new Set(state.watched), [state.watched]);

  const toggleWatched      = id        => setState(s => { const set = new Set(s.watched); set.has(id) ? set.delete(id) : set.add(id); return { ...s, watched: Array.from(set) }; });
  const markAllFinished    = (ids)     => setState(s => { const set = new Set(s.watched); ids.forEach(id => set.add(id)); return { ...s, watched: Array.from(set) }; });
  const setTheme           = t         => setState(s => ({ ...s, theme: t }));
  const setLang            = l         => setState(s => ({ ...s, lang: l }));
  const setFavoriteTeam    = code      => setState(s => ({ ...s, favoriteTeam: code }));
  const updateProfile      = patch     => setState(s => ({ ...s, ...patch }));
  const setProfile         = (u, team) => setState(s => ({ ...s, username: u, favoriteTeam: team, onboarded: true }));
  const resetAll           = ()        => setState({ ...DEFAULT });

  const value = { state, hydrated, watchedSet, toggleWatched, markAllFinished, setTheme, setLang, setFavoriteTeam, updateProfile, setProfile, resetAll, matches, standings, scorers, apiStatus };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider');
  return ctx;
}
