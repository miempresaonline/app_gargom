'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createBank(prevState: any, formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const numeroCuenta = formData.get('numeroCuenta') as string;

  if (!nombre || !numeroCuenta) {
    return { error: 'Por favor, rellena todos los campos correctamente' };
  }

  try {
    await prisma.bank.create({
      data: { nombre, numeroCuenta },
    });
    revalidatePath('/bancos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear la cuenta bancaria' };
  }
}

export async function updateBank(id: number, nombre: string, numeroCuenta: string) {
  try {
    await prisma.bank.update({
      where: { id },
      data: { nombre, numeroCuenta },
    });
    revalidatePath('/bancos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar la cuenta bancaria' };
  }
}

export async function deleteBank(id: number) {
  try {
    await prisma.bank.delete({
      where: { id },
    });
    revalidatePath('/bancos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar la cuenta bancaria' };
  }
}
