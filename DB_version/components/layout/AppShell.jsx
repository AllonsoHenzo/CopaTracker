'use client';

import Sidebar    from './Sidebar';
import Ticker     from './Ticker';
import BottomNav  from './BottomNav';
import AuthModal  from '@/components/AuthModal';
import { useStore } from '@/lib/store';

export default function AppShell({ children }) {
  const { authReady, isLoggedIn } = useStore();
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Ticker />
        {children}
      </main>
      <BottomNav />
      {authReady && !isLoggedIn && <AuthModal />}
    </div>
  );
}
