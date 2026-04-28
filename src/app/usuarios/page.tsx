import { PrismaClient } from '@prisma/client';
import UsuariosClient from './client';

const prisma = new PrismaClient();

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
