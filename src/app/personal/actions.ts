'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';

export async function createWorker(prevState: any, formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const cargo = formData.get('cargo') as string;
  const precioHora = parseFloat(formData.get('precioHora') as string);

  if (!nombre || !cargo || isNaN(precioHora)) {
    return { error: 'Por favor, rellena todos los campos correctamente' };
  }

  try {
    const worker = await prisma.worker.create({
      data: { nombre, cargo, precioHora },
    });
    await logAction('Crear Operario', `Se ha registrado el operario ${nombre} (${cargo}) con precio/hora de ${precioHora}€`);
    revalidatePath('/personal');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear el trabajador' };
  }
}

export async function updateWorker(id: number, nombre: string, cargo: string, precioHora: number) {
  try {
    const worker = await prisma.worker.update({
      where: { id },
      data: { nombre, cargo, precioHora },
    });
    await logAction('Modificar Operario', `Se ha modificado el operario con ID ${id} (${nombre} - ${cargo})`);
    revalidatePath('/personal');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar el trabajador' };
  }
}

export async function deleteWorker(id: number) {
  try {
    const worker = await prisma.worker.findUnique({ where: { id } });
    await prisma.worker.delete({
      where: { id },
    });
    if (worker) {
      await logAction('Eliminar Operario', `Se ha eliminado el operario con ID ${id} (${worker.nombre})`);
    }
    revalidatePath('/personal');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar el trabajador' };
  }
}
