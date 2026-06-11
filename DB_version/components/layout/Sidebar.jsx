'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { Stripes } from '@/components/Shared';
import { MATCHES } from '@/lib/data';

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { state, setTheme, matches } = useStore();
  const t = useT();

  const total   = (matches || MATCHES).length;
  const watched = state.watched.length;

  const NAV = [
    { href: '/',        label: t.nav.dashboard },
    { href: '/games',   label: t.nav.games     },
    { href: '/teams',   label: t.nav.teams     },
    { href: '/scorers', label: t.nav.scorers   },
    { href: '/profile', label: t.nav.profile   },
  ];

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="brand-block">
          <Stripes colors={['var(--br-green)','var(--br-yellow)','var(--br-blue)','var(--br-white)']} width="100%" height={16}/>
          <div className="brand-wordmark">
            Copa<br/><span className="accent">26</span><span style={{ fontSize: 20, color: 'var(--br-yellow)', fontStyle: 'normal' }}>·</span>
          </div>
          <div className="brand-tag">Tracker · Tricolor Ed.</div>
        </div>

        <div>
          <div className="nav-section-label">{t.nav.menu}</div>
          <nav className="nav">
            {NAV.map(it => (
              <Link key={it.href} href={it.href} className={`nav-item ${isActive(it.href) ? 'active' : ''}`}>
                <span>{it.label}</span>
                {it.href === '/games' && <span className="num">{watched}/{total}</span>}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <div className="nav-section-label">{t.nav.shortcuts}</div>
          <nav className="nav">
            <Link href={`/teams/${state.favoriteTeam || 'BRA'}`} className="nav-item">
              <span>{t.nav.my_team}</span>
              <span className="num">{state.favoriteTeam || 'BRA'}</span>
            </Link>
            <Link href="/games?stage=final" className="nav-item">
              <span>{t.nav.the_final}</span>
              <span className="num">19·07</span>
            </Link>
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="theme-toggle">
          <button className={state.theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>{t.common.light}</button>
          <button className={state.theme === 'dark'  ? 'active' : ''} onClick={() => setTheme('dark')}>{t.common.dark}</button>
        </div>
        <div className="profile-pill" style={{ cursor: 'pointer' }} onClick={() => router.push('/profile')}>
          <div className="profile-avatar">{state.username ? state.username.charAt(0).toUpperCase() : '?'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="profile-name">{state.username || 'Configurar perfil'}</div>
            <div className="profile-handle">{state.handle || 'Copa 26 Tracker'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
