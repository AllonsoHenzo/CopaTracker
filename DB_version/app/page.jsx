'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import Dashboard from '@/components/views/Dashboard';
import ShareModal from '@/components/ShareModal';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { Icon } from '@/components/Shared';

export default function DashboardPage() {
  const router = useRouter();
  const { state } = useStore();
  const t = useT();
  const [sharing, setSharing] = useState(false);

  const now = new Date();
  const dow = t.days_abbr[now.getDay()].toUpperCase();
  const mon = t.months_abbr[now.getMonth() + 1].toUpperCase();
  const subtitle = `${dow} ${String(now.getDate()).padStart(2,'0')} ${mon} ${now.getFullYear()} · COPA DO MUNDO`;

  return (
    <>
      <Topbar
        title={<>{t.common.hello} <span className="it">{state.username}</span></>}
        subtitle={subtitle}
        right={
          <>
            <button className="btn" onClick={() => setSharing(true)}><Icon name="share" size={13}/> {t.common.share}</button>
            <button className="btn btn-solid" onClick={() => router.push('/profile')}>{t.common.my_status} <Icon name="arrow" size={13}/></button>
          </>
        }
      />
      <Dashboard/>
      {sharing && <ShareModal onClose={() => setSharing(false)}/>}
    </>
  );
}
