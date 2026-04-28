import { prisma } from '@/lib/db';
import PersonalClient from './client';

export const dynamic = 'force-dynamic';

export default async function PersonalPage() {
  const workers = await prisma.worker.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <PersonalClient initialWorkers={workers} />;
}
