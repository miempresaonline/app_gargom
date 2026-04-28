import { prisma } from '@/lib/db';
import ProveedoresClient from './client';

export const dynamic = 'force-dynamic';

export default async function ProveedoresPage() {
  const proveedores = await prisma.supplier.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <ProveedoresClient initialProveedores={proveedores} />;
}
