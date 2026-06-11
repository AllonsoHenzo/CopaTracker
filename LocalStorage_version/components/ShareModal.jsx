'use client';

import { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import ShareCard from './ShareCard';
import { Icon } from './Shared';
import { TEAM_BY_CODE, computeStats } from '@/lib/data';
import { computeBadges } from '@/lib/badges';

export default function ShareModal({ onClose }) {
  const { state, watchedSet, matches } = useStore();
  const t = useT();
  const cardRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [status, setStatus] = useState('loading');

  const stats   = computeStats(watchedSet, matches);
  const pct     = Math.round((stats.watched / stats.total) * 100);
  const fav     = state.favoriteTeam;
  const favTeam = TEAM_BY_CODE[fav];
  const badges  = computeBadges(watchedSet, matches, fav).filter(b => b.earned).length;
  const cities  = new Set(matches.filter(m => watchedSet.has(m.id) && m.venue?.city).map(m => m.venue.city));

  const isMobile = typeof navigator !== 'undefined' && !!navigator.share && navigator.maxTouchPoints > 1;

  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(async () => {
      if (cancelled || !cardRef.current) return;
      try {
        await toPng(cardRef.current, { pixelRatio: 1, skipFonts: true });
        const url = await toPng(cardRef.current, { pixelRatio: 2, skipFonts: true, cacheBust: true });
        if (cancelled) return;
        setImgSrc(url);
        if (isMobile) {
          try {
            const blob = await (await fetch(url)).blob();
            const file = new File([blob], 'copa26-tracker.png', { type: 'image/png' });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'Copa 26 Tracker' });
            }
          } catch {}
          if (!cancelled) onClose();
        } else {
          setStatus('ready');
        }
      } catch { if (!cancelled) setStatus('error'); }
    });
    return () => { cancelled = true; };
  }, []);

  function download() {
    if (!imgSrc) return;
    const a = document.createElement('a');
    a.href = imgSrc;
    a.download = 'copa26-tracker.png';
    a.click();
    onClose();
  }

  const offscreen = (
    <div style={{ position: 'fixed', left: -9999, top: -9999, pointerEvents: 'none', zIndex: -1 }}>
      <ShareCard ref={cardRef} state={state} watchedSet={watchedSet} matches={matches}/>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {offscreen}
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(8,9,11,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={onClose}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 28, height: 28, border: '2px solid rgba(244,241,234,0.15)', borderTopColor: '#FEDD00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            <div className="mono" style={{ color: 'rgba(244,241,234,0.3)', fontSize: 11, letterSpacing: '0.18em' }}>
              {t.share.generating_label}
            </div>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </>
    );
  }

  return (
    <>
      {offscreen}

      <div
        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(8,9,11,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
        onClick={onClose}
      >
        <div
          style={{ position: 'relative', display: 'flex', width: '100%', maxWidth: 860, background: '#0d0e12', border: '1.2px solid rgba(244,241,234,0.1)', overflow: 'hidden', maxHeight: '92vh' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ width: 320, flexShrink: 0, background: '#08090b', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', gap: 20, borderRight: '1.2px solid rgba(244,241,234,0.08)' }}>
            <div style={{ width: 240, height: 427, background: '#111', overflow: 'hidden', border: '1px solid rgba(244,241,234,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {status === 'loading' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 28, height: 28, border: '2px solid rgba(244,241,234,0.15)', borderTopColor: '#FEDD00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
                  <div className="mono" style={{ color: 'rgba(244,241,234,0.3)', fontSize: 10 }}>{t.share.generating_label}</div>
                </div>
              )}
              {status === 'error' && (
                <div className="mono" style={{ color: 'rgba(255,59,48,0.7)', fontSize: 10, padding: 20, textAlign: 'center', lineHeight: 1.8 }}>
                  {state.lang === 'en' ? 'ERROR\nGENERATING\nIMAGE' : 'ERRO AO\nGERAR\nIMAGEM'}
                </div>
              )}
              {imgSrc && (
                <img src={imgSrc} alt="story" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}/>
              )}
            </div>
            <div className="mono" style={{ color: 'rgba(244,241,234,0.25)', fontSize: 9.5, letterSpacing: '0.18em', textAlign: 'center' }}>
              {t.share.story_label}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '44px 48px', gap: 0, overflow: 'auto' }}>
            <div className="mono" style={{ color: 'rgba(244,241,234,0.35)', fontSize: 10, letterSpacing: '0.2em' }}>{t.share.eyebrow}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 44, letterSpacing: '-0.04em', lineHeight: 0.9, color: '#FAF7F2', marginTop: 16 }}>
              {t.share.title1}<br/><span style={{ color: 'var(--br-yellow)' }}>{t.share.title2}</span>
            </div>
            <div className="mono" style={{ color: 'rgba(244,241,234,0.4)', marginTop: 16, lineHeight: 1.7, fontSize: 11 }}>
              {t.share.subtitle}
            </div>

            <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid rgba(244,241,234,0.08)' }}>
              {[
                { label: t.share.games_watched, val: `${stats.watched}/${stats.total}`, color: 'var(--br-yellow)' },
                { label: t.share.progress,      val: `${pct}%`,                         color: 'var(--br-green)'  },
                { label: t.share.fav_team,      val: `${fav} · ${favTeam?.name || ''}`, color: '#FAF7F2'          },
                { label: t.share.venues,        val: `${cities.size}/16`,               color: '#FAF7F2'          },
                { label: t.share.achievements,  val: `${badges}/10`,                    color: '#FAF7F2'          },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid rgba(244,241,234,0.06)' }}>
                  <span className="mono" style={{ color: 'rgba(244,241,234,0.38)', fontSize: 10, letterSpacing: '0.12em' }}>{s.label.toUpperCase()}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontStyle: 'italic', fontSize: 20, letterSpacing: '-0.02em', color: s.color }}>{s.val}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                className="btn btn-yellow btn-lg"
                style={{ width: '100%', justifyContent: 'center', fontSize: 13, fontWeight: 700, opacity: status === 'ready' ? 1 : 0.5 }}
                onClick={download}
                disabled={status !== 'ready'}
              >
                {status === 'loading' ? t.share.generating :
                 status === 'error'   ? t.share.error :
                 <><Icon name="share" size={14}/> {t.share.download_btn}</>}
              </button>

              <button
                className="btn btn-lg"
                style={{ width: '100%', justifyContent: 'center', border: '1.2px solid rgba(244,241,234,0.25)', color: 'rgba(244,241,234,0.7)', background: 'transparent' }}
                onClick={onClose}
              >
                {t.share.close}
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: 'rgba(244,241,234,0.35)', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: 4 }}
            aria-label={t.share.close}
          >✕</button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
