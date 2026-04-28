'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createProject(prevState: any, formData: FormData) {
  const cliente = formData.get('cliente') as string;
  const direccion = formData.get('direccion') as string;
  const presupuestoTotal = parseFloat(formData.get('presupuestoTotal') as string);
  
  if (!cliente || !direccion || isNaN(presupuestoTotal)) {
    return { error: 'Los campos Cliente, Dirección y Presupuesto Total son obligatorios.' };
  }

  const arquitecto = formData.get('arquitecto') as string || null;
  const aparejador = formData.get('aparejador') as string || null;
  const correo = formData.get('correo') as string || null;
  const telefono = formData.get('telefono') as string || null;
  const observaciones = formData.get('observaciones') as string || null;

  try {
    await prisma.project.create({
      data: {
        cliente,
        direccion,
        presupuestoTotal,
        arquitecto,
        aparejador,
        correo,
        telefono,
        observaciones
      },
    });
    revalidatePath('/obras');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear la obra' };
  }
}

export async function deleteProject(id: number) {
  try {
    await prisma.project.delete({
      where: { id },
    });
    revalidatePath('/obras');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar la obra' };
  }
}
