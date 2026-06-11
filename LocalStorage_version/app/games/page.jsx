'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Topbar from '@/components/layout/Topbar';
import GamesPage from '@/components/views/Games';
import { useT } from '@/lib/i18n';
import { Icon } from '@/components/Shared';

function GamesContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const t            = useT();
  const initialFilters = { stage: searchParams.get('stage') || undefined };

  return (
    <>
      <Topbar
        title={<>{t.games.title} <span className="it">{t.games.title_adj}</span></>}
        subtitle={t.games.subtitle}
        right={<button className="btn btn-solid" onClick={() => router.push('/profile')}>{t.common.my_status} <Icon name="arrow" size={13}/></button>}
      />
      <GamesPage initialFilters={initialFilters}/>
    </>
  );
}

export default function Page() {
  return <Suspense><GamesContent/></Suspense>;
}
