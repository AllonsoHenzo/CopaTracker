'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import GameDetail from '@/components/views/GameDetail';
import { useT } from '@/lib/i18n';
import { Icon } from '@/components/Shared';

export default function Page({ params }) {
  const router = useRouter();
  const t = useT();
  const { id } = use(params);
  return (
    <>
      <Topbar
        title={<>{t.game.page_title} <span className="it">{t.game.page_adj}</span></>}
        subtitle={`COPA 2026 · ${id}`}
        right={<button className="btn btn-solid" onClick={() => router.push('/profile')}>{t.common.my_status} <Icon name="arrow" size={13}/></button>}
      />
      <GameDetail id={id}/>
    </>
  );
}
