import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import ObraDetailClient from './client';

export const dynamic = 'force-dynamic';

export default async function ObraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const obraId = parseInt(id);
  if (isNaN(obraId)) notFound();

  const [obra, bancos, trabajadores, proveedores, allCertifications] = await Promise.all([
    prisma.project.findUnique({
      where: { id: obraId },
      include: {
        expenses: {
          include: { worker: true, bank: true, supplier: true },
          orderBy: { createdAt: 'desc' }
        },
        certifications: true,
        clients: true
      }
    }),
    prisma.bank.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.worker.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.supplier.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.certification.findMany({ select: { numero: true } })
  ]);

  if (!obra) notFound();

  // Calculate next certification/invoice number
  let maxNum = 0;
  let prefix = 'CERT-';
  for (const cert of allCertifications) {
    const match = cert.numero.match(/^(.*?)(\d+)$/);
    if (match) {
      const currentPrefix = match[1];
      const currentNum = parseInt(match[2], 10);
      if (currentNum > maxNum) {
        maxNum = currentNum;
        prefix = currentPrefix;
      }
    }
  }
  const nextCertNumber = maxNum === 0 ? 'CERT-1' : `${prefix}${maxNum + 1}`;

  return (
    <ObraDetailClient 
      obra={obra} 
      bancos={bancos} 
      trabajadores={trabajadores} 
      proveedores={proveedores}
      nextCertNumber={nextCertNumber}
    />
  );
}
