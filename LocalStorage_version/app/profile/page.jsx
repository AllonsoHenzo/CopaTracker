'use client';

import { useState } from 'react';
import Topbar from '@/components/layout/Topbar';
import ProfilePage from '@/components/views/Profile';
import ShareModal from '@/components/ShareModal';
import { useStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { Icon } from '@/components/Shared';

export default function Page() {
  const { state } = useStore();
  const t = useT();
  const [sharing, setSharing] = useState(false);
  return (
    <>
      <Topbar
        title={<>{state.username || t.profile.my_title} <span className="it">{t.profile.title_adj}</span></>}
        subtitle={`${state.handle || 'Copa 26'} · ${t.profile.member_since}`}
        right={<button className="btn" onClick={() => setSharing(true)}><Icon name="share" size={13}/> {t.common.share}</button>}
      />
      <ProfilePage/>
      {sharing && <ShareModal onClose={() => setSharing(false)}/>}
    </>
  );
}
