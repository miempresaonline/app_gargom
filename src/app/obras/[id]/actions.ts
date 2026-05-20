'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ExpenseType } from '@prisma/client';

export async function createGastoObra(prevState: any, formData: FormData) {
  const tipo = formData.get('tipo') as ExpenseType;
  const projectId = parseInt(formData.get('projectId') as string);
  
  if (!tipo || isNaN(projectId)) {
    return { error: 'Faltan datos obligatorios (Tipo y Obra)' };
  }

  const importe = parseFloat(formData.get('importe') as string);
  const concepto = formData.get('concepto') as string || null;
  const fecha = formData.get('fecha') ? new Date(formData.get('fecha') as string) : null;
  const numero = formData.get('numero') as string || null;
  const fechaVencimiento = formData.get('fechaVencimiento') ? new Date(formData.get('fechaVencimiento') as string) : null;
  const bankId = formData.get('bankId') ? parseInt(formData.get('bankId') as string) : null;
  const workerId = formData.get('workerId') ? parseInt(formData.get('workerId') as string) : null;
  const horas = formData.get('horas') ? parseFloat(formData.get('horas') as string) : null;
  const observaciones = formData.get('observaciones') as string || null;

  try {
    await prisma.expense.create({
      data: {
        tipo,
        projectId,
        concepto,
        importe: isNaN(importe) ? null : importe,
        fecha,
        numero,
        fechaVencimiento,
        bankId,
        workerId,
        horas,
        observaciones
      },
    });
    revalidatePath(`/obras/${projectId}`);
    revalidatePath('/gastos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al registrar el gasto' };
  }
}

export async function deleteGastoObra(id: number, projectId: number) {
  try {
    await prisma.expense.delete({
      where: { id },
    });
    revalidatePath(`/obras/${projectId}`);
    revalidatePath('/gastos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar el gasto' };
  }
}

export async function createCertification(prevState: any, formData: FormData) {
  const projectId = parseInt(formData.get('projectId') as string);
  const importe = parseFloat(formData.get('importe') as string);
  const numero = formData.get('numero') as string;
  const concepto = formData.get('concepto') as string;

  if (isNaN(projectId) || isNaN(importe) || !numero || !concepto) {
    return { error: 'Por favor, rellena todos los campos correctamente' };
  }

  try {
    await prisma.certification.create({
      data: { projectId, importe, numero, concepto },
    });
    revalidatePath(`/obras/${projectId}`);
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear la certificación' };
  }
}
