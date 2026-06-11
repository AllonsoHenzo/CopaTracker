'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { Icon } from '@/components/Shared';

export default function BottomNav() {
  const pathname = usePathname();
  const { state } = useStore();
  const t = useT();

  const TABS = [
    { href: '/',        label: t.bottom.home,     icon: 'home'     },
    { href: '/games',   label: t.bottom.schedule, icon: 'calendar' },
    { href: '/teams',   label: t.bottom.teams,    icon: 'flag'     },
    { href: '/scorers', label: t.bottom.scorers,  icon: 'trophy'   },
    { href: '/profile', label: t.bottom.profile,  icon: 'user'     },
  ];

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <Link key={tab.href} href={tab.href} className={`bottom-tab ${isActive(tab.href) ? 'active' : ''}`}>
          {tab.href === '/games' && state.watched.length > 0 && (
            <span className="bottom-tab-badge">{state.watched.length}</span>
          )}
          <Icon name={tab.icon} size={22}/>
          <span className="bottom-tab-label">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
