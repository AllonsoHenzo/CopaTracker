'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/layout/Topbar';
import TeamDetail from '@/components/views/TeamDetail';
import { useT } from '@/lib/i18n';
import { Icon } from '@/components/Shared';
import { TEAM_BY_CODE, teamGroup } from '@/lib/data';

export default function Page({ params }) {
  const router = useRouter();
  const t = useT();
  const { code } = use(params);
  const team  = TEAM_BY_CODE[code];
  const group = teamGroup(code);
  return (
    <>
      <Topbar
        title={<>{team?.name || code}</>}
        subtitle={`${team?.conf || ''} · ${t.teams.group_label} ${group || '?'}`}
        right={<button className="btn btn-solid" onClick={() => router.push('/profile')}>{t.common.my_status} <Icon name="arrow" size={13}/></button>}
      />
      <TeamDetail code={code}/>
    </>
  );
}
