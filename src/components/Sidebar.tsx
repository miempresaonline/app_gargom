import { getSession } from '@/lib/auth';
import { cookies } from 'next/headers';
import SidebarClient from './SidebarClient';

export default async function Sidebar() {
  const session = await getSession();
  const cookieStore = await cookies();
  const devMode = cookieStore.get('gargom_dev_mode')?.value === 'true';

  return <SidebarClient session={session} devMode={devMode} />;
}
