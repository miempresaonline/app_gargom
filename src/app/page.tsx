import DashboardClient from './DashboardClient';
import { getSession } from '@/lib/auth';

export default async function Home() {
  const session = await getSession();

  return <DashboardClient session={session} />;
}
