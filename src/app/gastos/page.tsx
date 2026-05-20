import { prisma } from '@/lib/db';
import GastosClient from './client';

export const dynamic = 'force-dynamic';

export default async function GastosPage() {
  const [gastos, obras, bancos, trabajadores, proveedores] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
        bank: true,
        worker: true,
        supplier: true
      }
    }),
    prisma.project.findMany({ orderBy: { direccion: 'asc' } }),
    prisma.bank.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.worker.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.supplier.findMany({ orderBy: { nombre: 'asc' } })
  ]);

  return (
    <GastosClient 
      initialGastos={gastos} 
      obras={obras} 
      bancos={bancos} 
      trabajadores={trabajadores} 
      proveedores={proveedores}
    />
  );
}
