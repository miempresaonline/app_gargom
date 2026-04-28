import { prisma } from '@/lib/db';
import GastosClient from './client';

export const dynamic = 'force-dynamic';

export default async function GastosPage() {
  const [gastos, obras, bancos, trabajadores] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
        bank: true,
        worker: true
      }
    }),
    prisma.project.findMany({ orderBy: { direccion: 'asc' } }),
    prisma.bank.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.worker.findMany({ orderBy: { nombre: 'asc' } })
  ]);

  return (
    <GastosClient 
      initialGastos={gastos} 
      obras={obras} 
      bancos={bancos} 
      trabajadores={trabajadores} 
    />
  );
}
