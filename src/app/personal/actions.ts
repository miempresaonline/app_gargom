'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createWorker(prevState: any, formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const cargo = formData.get('cargo') as string;
  const precioHora = parseFloat(formData.get('precioHora') as string);

  if (!nombre || !cargo || isNaN(precioHora)) {
    return { error: 'Por favor, rellena todos los campos correctamente' };
  }

  try {
    await prisma.worker.create({
      data: { nombre, cargo, precioHora },
    });
    revalidatePath('/personal');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear el trabajador' };
  }
}

export async function updateWorker(id: number, nombre: string, cargo: string, precioHora: number) {
  try {
    await prisma.worker.update({
      where: { id },
      data: { nombre, cargo, precioHora },
    });
    revalidatePath('/personal');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar el trabajador' };
  }
}

export async function deleteWorker(id: number) {
  try {
    await prisma.worker.delete({
      where: { id },
    });
    revalidatePath('/personal');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar el trabajador' };
  }
}
