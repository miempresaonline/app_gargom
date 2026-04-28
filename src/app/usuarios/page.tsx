import { prisma } from '@/lib/db';
import UsuariosClient from './client';

export default async function UsuariosPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nombre: true,
      email: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return <UsuariosClient initialUsers={users} />;
}
