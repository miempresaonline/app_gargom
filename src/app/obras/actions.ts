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

  const data = {
    cliente,
    clienteCorreo: formData.get('clienteCorreo') as string || null,
    clienteTelefono: formData.get('clienteTelefono') as string || null,
    direccion,
    presupuestoTotal,
    arquitecto: formData.get('arquitecto') as string || null,
    arquitectoCorreo: formData.get('arquitectoCorreo') as string || null,
    arquitectoTelefono: formData.get('arquitectoTelefono') as string || null,
    aparejador: formData.get('aparejador') as string || null,
    aparejadorCorreo: formData.get('aparejadorCorreo') as string || null,
    aparejadorTelefono: formData.get('aparejadorTelefono') as string || null,
    observaciones: formData.get('observaciones') as string || null
  };

  try {
    await prisma.project.create({ data });
    revalidatePath('/obras');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear la obra' };
  }
}

export async function updateProject(prevState: any, formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const cliente = formData.get('cliente') as string;
  const direccion = formData.get('direccion') as string;
  const presupuestoTotal = parseFloat(formData.get('presupuestoTotal') as string);
  
  if (isNaN(id) || !cliente || !direccion || isNaN(presupuestoTotal)) {
    return { error: 'Los campos Cliente, Dirección y Presupuesto Total son obligatorios.' };
  }

  const data = {
    cliente,
    clienteCorreo: formData.get('clienteCorreo') as string || null,
    clienteTelefono: formData.get('clienteTelefono') as string || null,
    direccion,
    presupuestoTotal,
    arquitecto: formData.get('arquitecto') as string || null,
    arquitectoCorreo: formData.get('arquitectoCorreo') as string || null,
    arquitectoTelefono: formData.get('arquitectoTelefono') as string || null,
    aparejador: formData.get('aparejador') as string || null,
    aparejadorCorreo: formData.get('aparejadorCorreo') as string || null,
    aparejadorTelefono: formData.get('aparejadorTelefono') as string || null,
    observaciones: formData.get('observaciones') as string || null
  };

  try {
    await prisma.project.update({
      where: { id },
      data,
    });
    revalidatePath('/obras');
    revalidatePath(`/obras/${id}`);
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar la obra' };
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
