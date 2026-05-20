import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ObraDetailClient from './client';

export const dynamic = 'force-dynamic';

export default async function ObraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obraId = parseInt(id);
  if (isNaN(obraId)) notFound();

  const [obra, bancos, trabajadores] = await Promise.all([
    prisma.project.findUnique({
      where: { id: obraId },
      include: {
        expenses: {
          include: { worker: true, bank: true },
          orderBy: { createdAt: 'desc' }
        },
        certifications: true,
        clients: true
      }
    }),
    prisma.bank.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.worker.findMany({ orderBy: { nombre: 'asc' } })
  ]);

  if (!obra) notFound();

  return (
    <ObraDetailClient 
      obra={obra} 
      bancos={bancos} 
      trabajadores={trabajadores} 
    />
  );
}
