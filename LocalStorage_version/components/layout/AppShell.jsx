'use client';

import Sidebar     from './Sidebar';
import Ticker      from './Ticker';
import BottomNav   from './BottomNav';
import Onboarding  from '@/components/Onboarding';
import { useStore } from '@/lib/store';

export default function AppShell({ children }) {
  const { state, hydrated } = useStore();
  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <Ticker />
        {children}
      </main>
      <BottomNav />
      {hydrated && !state.onboarded && <Onboarding />}
    </div>
  );
}
