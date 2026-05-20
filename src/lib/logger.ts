import { prisma } from './db';
import { getSession } from './auth';

export async function logAction(accion: string, detalles: string) {
  try {
    const session = await getSession() as any;
    const usuario = (session?.email || session?.nombre || 'Sistema') as string;

    await prisma.systemLog.create({
      data: {
        accion,
        usuario,
        detalles
      }
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
}
