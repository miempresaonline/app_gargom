'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/logger';
import { syncInvoiceToOdoo } from '@/lib/odoo';

export async function createCertification(prevState: any, formData: FormData) {
  const projectId = parseInt(formData.get('projectId') as string);
  const importe = parseFloat(formData.get('importe') as string);
  const numero = formData.get('numero') as string;
  const concepto = formData.get('concepto') as string;

  if (isNaN(projectId) || isNaN(importe) || !numero || !concepto) {
    return { error: 'Por favor, rellena todos los campos correctamente' };
  }

  try {
    const cert = await prisma.certification.create({
      data: { projectId, importe, numero, concepto },
    });
    await logAction('Crear Certificación', `Se ha creado la factura/certificación Nº ${numero} (${importe}€) de la obra con ID ${projectId}`);
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear la certificación' };
  }
}

export async function updateCertification(prevState: any, formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const projectId = parseInt(formData.get('projectId') as string);
  const importe = parseFloat(formData.get('importe') as string);
  const numero = formData.get('numero') as string;
  const concepto = formData.get('concepto') as string;

  if (isNaN(id) || isNaN(projectId) || isNaN(importe) || !numero || !concepto) {
    return { error: 'Por favor, rellena todos los campos correctamente' };
  }

  try {
    const cert = await prisma.certification.update({
      where: { id },
      data: { projectId, importe, numero, concepto },
    });
    await logAction('Modificar Certificación', `Se ha modificado la factura/certificación Nº ${numero} (${importe}€)`);
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar la certificación' };
  }
}

export async function deleteCertification(id: number) {
  try {
    const cert = await prisma.certification.findUnique({ where: { id } });
    await prisma.certification.delete({
      where: { id },
    });
    if (cert) {
      await logAction('Eliminar Certificación', `Se ha eliminado la factura/certificación Nº ${cert.numero} (${cert.importe}€)`);
    }
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar la certificación' };
  }
}

export async function sendToOdoo(id: number) {
  try {
    const res = await syncInvoiceToOdoo(id);
    if (!res.success) {
      return { error: res.error || 'Error al conectar con Odoo' };
    }
    const cert = await prisma.certification.findUnique({ where: { id } });
    await logAction('Enviar Odoo', `Se ha enviado a Odoo manualmente la certificación Nº ${cert?.numero || id}`);
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Error al conectar con Odoo' };
  }
}
