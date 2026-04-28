'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear la certificación' };
  }
}

export async function deleteCertification(id: number) {
  try {
    await prisma.certification.delete({
      where: { id },
    });
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar la certificación' };
  }
}

export async function sendToOdoo(id: number) {
  try {
    // Simular el envío a Odoo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await prisma.certification.update({
      where: { id },
      data: { enviadaOdoo: true }
    });
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error) {
    return { error: 'Error al conectar con Odoo' };
  }
}
