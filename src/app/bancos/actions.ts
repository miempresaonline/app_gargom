'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';

export async function createBank(prevState: any, formData: FormData) {
  const nombre = formData.get('nombre') as string;
  let numeroCuenta = formData.get('numeroCuenta') as string;

  if (!nombre || !numeroCuenta) {
    return { error: 'Por favor, rellena todos los campos correctamente' };
  }

  numeroCuenta = numeroCuenta.replace(/\s+/g, '').toUpperCase();
  if (!numeroCuenta.startsWith('ES') || numeroCuenta.length !== 24) {
    return { error: 'El número de cuenta debe empezar por ES y tener 24 caracteres (excluyendo espacios)' };
  }

  try {
    const bank = await prisma.bank.create({
      data: { nombre, numeroCuenta },
    });
    await logAction('Crear Banco', `Se ha registrado la cuenta de pago ${nombre} (${numeroCuenta})`);
    revalidatePath('/bancos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear la cuenta de pago' };
  }
}

export async function updateBank(id: number, nombre: string, numeroCuenta: string) {
  if (!nombre || !numeroCuenta) {
    return { error: 'Por favor, rellena todos los campos correctamente' };
  }

  numeroCuenta = numeroCuenta.replace(/\s+/g, '').toUpperCase();
  if (!numeroCuenta.startsWith('ES') || numeroCuenta.length !== 24) {
    return { error: 'El número de cuenta debe empezar por ES y tener 24 caracteres (excluyendo espacios)' };
  }

  try {
    const bank = await prisma.bank.update({
      where: { id },
      data: { nombre, numeroCuenta },
    });
    await logAction('Modificar Banco', `Se ha modificado la cuenta de pago con ID ${id} (${nombre})`);
    revalidatePath('/bancos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar la cuenta de pago' };
  }
}

export async function deleteBank(id: number) {
  try {
    const bank = await prisma.bank.findUnique({ where: { id } });
    await prisma.bank.delete({
      where: { id },
    });
    if (bank) {
      await logAction('Eliminar Banco', `Se ha eliminado la cuenta de pago con ID ${id} (${bank.nombre})`);
    }
    revalidatePath('/bancos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar la cuenta de pago' };
  }
}
