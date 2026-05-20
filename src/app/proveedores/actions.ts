'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createSupplier(prevState: any, formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const correo = formData.get('correo') as string;
  const cif = formData.get('cif') as string;
  const telefono = formData.get('telefono') as string;

  if (!nombre || !cif || !telefono) {
    return { error: 'Los campos Nombre, CIF y Teléfono son obligatorios' };
  }

  try {
    await prisma.supplier.create({
      data: { nombre, correo, cif, telefono },
    });
    revalidatePath('/proveedores');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear el proveedor' };
  }
}

export async function updateSupplier(id: number, nombre: string, correo: string, cif: string, telefono: string) {
  if (!nombre || !cif || !telefono) {
    return { error: 'Los campos Nombre, CIF y Teléfono son obligatorios' };
  }
  
  try {
    await prisma.supplier.update({
      where: { id },
      data: { nombre, correo, cif, telefono },
    });
    revalidatePath('/proveedores');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar el proveedor' };
  }
}

export async function deleteSupplier(id: number) {
  try {
    await prisma.supplier.delete({
      where: { id },
    });
    revalidatePath('/proveedores');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar el proveedor' };
  }
}
