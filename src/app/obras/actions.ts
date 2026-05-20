'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createProject(prevState: any, formData: FormData) {
  const cliente = formData.get('cliente') as string || 'General';
  const direccion = formData.get('direccion') as string;
  const presupuestoTotal = parseFloat(formData.get('presupuestoTotal') as string) || 0;
  const presupuestoAdicional = parseFloat(formData.get('presupuestoAdicional') as string) || 0;
  const porcentajeImpuesto = parseFloat(formData.get('porcentajeImpuesto') as string) || 10;
  const clientsJSON = formData.get('clientsJSON') as string;
  
  if (!direccion) {
    return { error: 'La dirección es obligatoria.' };
  }

  let clientsData = [];
  try {
    if (clientsJSON) clientsData = JSON.parse(clientsJSON);
  } catch (e) {
    console.error(e);
  }

  const data = {
    cliente,
    clienteCorreo: formData.get('clienteCorreo') as string || null,
    clienteTelefono: formData.get('clienteTelefono') as string || null,
    direccion,
    presupuestoTotal,
    presupuestoAdicional,
    porcentajeImpuesto,
    arquitecto: formData.get('arquitecto') as string || null,
    arquitectoCorreo: formData.get('arquitectoCorreo') as string || null,
    arquitectoTelefono: formData.get('arquitectoTelefono') as string || null,
    aparejador: formData.get('aparejador') as string || null,
    aparejadorCorreo: formData.get('aparejadorCorreo') as string || null,
    aparejadorTelefono: formData.get('aparejadorTelefono') as string || null,
    observaciones: formData.get('observaciones') as string || null,
    clients: {
      create: clientsData.map((c: any) => ({
        nombre: c.nombre,
        cif: c.cif || null,
        direccion: c.direccion || null
      }))
    }
  };

  try {
    await prisma.project.create({ data });
    revalidatePath('/obras');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear la obra' };
  }
}

export async function updateProject(prevState: any, formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const cliente = formData.get('cliente') as string || 'General';
  const direccion = formData.get('direccion') as string;
  const presupuestoTotal = parseFloat(formData.get('presupuestoTotal') as string) || 0;
  const presupuestoAdicional = parseFloat(formData.get('presupuestoAdicional') as string) || 0;
  const porcentajeImpuesto = parseFloat(formData.get('porcentajeImpuesto') as string) || 10;
  const clientsJSON = formData.get('clientsJSON') as string;
  
  if (isNaN(id) || !direccion) {
    return { error: 'La dirección es obligatoria.' };
  }

  let clientsData = [];
  try {
    if (clientsJSON) clientsData = JSON.parse(clientsJSON);
  } catch (e) {
    console.error(e);
  }

  const data = {
    cliente,
    clienteCorreo: formData.get('clienteCorreo') as string || null,
    clienteTelefono: formData.get('clienteTelefono') as string || null,
    direccion,
    presupuestoTotal,
    presupuestoAdicional,
    porcentajeImpuesto,
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
    
    // Update clients
    // First delete existing clients for this project
    await prisma.projectClient.deleteMany({ where: { projectId: id } });
    // Then insert new ones
    if (clientsData.length > 0) {
      await prisma.projectClient.createMany({
        data: clientsData.map((c: any) => ({
          nombre: c.nombre,
          cif: c.cif || null,
          direccion: c.direccion || null,
          projectId: id
        }))
      });
    }

    revalidatePath('/obras');
    revalidatePath(`/obras/${id}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Error al actualizar la obra' };
  }
}

export async function archiveProject(id: number) {
  try {
    await prisma.project.update({
      where: { id },
      data: { estado: 'ARCHIVADA' }
    });
    revalidatePath('/obras');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Error al archivar la obra' };
  }
}
