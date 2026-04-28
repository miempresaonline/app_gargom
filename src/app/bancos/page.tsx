import { prisma } from '@/lib/db';
import BancosClient from './client';

export const dynamic = 'force-dynamic';

export default async function BancosPage() {
  const bancos = await prisma.bank.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <BancosClient initialBancos={bancos} />;
}
