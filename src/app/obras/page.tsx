import { prisma } from '@/lib/db';
import ObrasClient from './client';

export const dynamic = 'force-dynamic';

export default async function ObrasPage() {
  const obras = await prisma.project.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <ObrasClient initialObras={obras} />;
}
