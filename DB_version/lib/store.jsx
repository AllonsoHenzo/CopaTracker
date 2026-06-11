'use client';

import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  const [user,       setUser]       = useState(null);
  const [authReady,  setAuthReady]  = useState(false);
  const [matches,    setMatches]    = useState(STATIC_MATCHES);
  const [standings,  setStandings]  = useState(null);
  const [scorers,    setScorers]    = useState([]);
  const [apiStatus,  setApiStatus]  = useState('loading');
  const syncTimer = useRef(null);

  // Check session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(({ user: u, data }) => {
        if (u && data) {
          setUser(u);
          setState(() => ({ ...DEFAULT, ...data }));
        } else {
          const saved = loadLS();
          if (saved) setState(() => ({ ...DEFAULT, ...saved }));
        }
        setHydrated(true);
        setAuthReady(true);
      })
      .catch(() => {
        const saved = loadLS();
        if (saved) setState(() => ({ ...DEFAULT, ...saved }));
        setHydrated(true);
        setAuthReady(true);
      });
  }, []);

  // Persist state
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute('data-theme', state.theme);
    if (!user) {
      saveLS(state);
    } else {
      // Debounce sync to server
      clearTimeout(syncTimer.current);
      syncTimer.current = setTimeout(() => {
        fetch('/api/user/sync', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        }).catch(() => {});
      }, 800);
    }
  }, [state, hydrated, user]);

  // Apply team theme
  useEffect(() => {
    if (!hydrated) return;
    const theme = getTeamTheme(state.favoriteTeam);
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [state.favoriteTeam, hydrated]);

  // Fetch Copa data
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

  const MARKABLE = new Set(['FINISHED', 'IN_PLAY', 'PAUSED', 'HALFTIME']);
  const toggleWatched = id => {
    const m = matches.find(m => m.id === id);
    if (m && !MARKABLE.has(m.status)) return;
    setState(s => { const set = new Set(s.watched); set.has(id) ? set.delete(id) : set.add(id); return { ...s, watched: Array.from(set) }; });
  };
  const markAllFinished = ids   => setState(s => { const set = new Set(s.watched); ids.forEach(id => set.add(id)); return { ...s, watched: Array.from(set) }; });
  const setTheme        = t     => setState(s => ({ ...s, theme: t }));
  const setLang         = l     => setState(s => ({ ...s, lang: l }));
  const setFavoriteTeam = code  => setState(s => ({ ...s, favoriteTeam: code }));
  const updateProfile   = patch => setState(s => ({ ...s, ...patch }));
  const setProfile      = (u, team) => setState(s => ({ ...s, username: u, favoriteTeam: team, onboarded: true }));
  const resetAll        = ()    => setState({ ...DEFAULT });

  const login = useCallback(({ user: u, data }) => {
    setUser(u);
    setState(() => ({ ...DEFAULT, ...data }));
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    const saved = loadLS();
    setState(saved ? { ...DEFAULT, ...saved } : { ...DEFAULT });
  }, []);

  const value = {
    state, hydrated, authReady, user, isLoggedIn: !!user,
    watchedSet, toggleWatched, markAllFinished,
    setTheme, setLang, setFavoriteTeam, updateProfile, setProfile, resetAll,
    login, logout,
    matches, standings, scorers, apiStatus,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore deve ser usado dentro de StoreProvider');
  return ctx;
}
