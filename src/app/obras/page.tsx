import { prisma } from '@/lib/db';
import ObrasClient from './client';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function ObrasPage() {
  const obras = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
    include: { clients: true }
  });

  const cookieStore = await cookies();
  const devMode = cookieStore.get('gargom_dev_mode')?.value === 'true';

  return <ObrasClient initialObras={obras} devMode={devMode} />;
}
