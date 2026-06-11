'use client';

import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import TeamsPage from '@/components/views/Teams';
import { useT } from '@/lib/i18n';
import { Icon } from '@/components/Shared';

export default function Page() {
  const router = useRouter();
  const t = useT();
  return (
    <>
      <Topbar
        title={<>{t.teams.title} <span className="it">{t.teams.title_adj}</span></>}
        subtitle={t.teams.subtitle}
        right={<button className="btn btn-solid" onClick={() => router.push('/profile')}>{t.common.my_status} <Icon name="arrow" size={13}/></button>}
      />
      <TeamsPage/>
    </>
  );
}
