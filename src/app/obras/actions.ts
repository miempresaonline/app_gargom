'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { logAction } from '@/lib/logger';

export async function createProject(prevState: any, formData: FormData) {
  const cliente = formData.get('cliente') as string || 'General';
  const direccion = formData.get('direccion') as string;
  const nombreReferencia = formData.get('nombreReferencia') as string || null;
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
    nombreReferencia,
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
        direccion: c.direccion || null,
        porcentajeFacturacion: parseFloat(c.porcentajeFacturacion) || 100
      }))
    }
  };

  try {
    const project = await prisma.project.create({ data });
    await logAction('Crear Obra', `Se ha creado la obra en ${project.direccion} para el cliente ${project.cliente}`);
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
  const nombreReferencia = formData.get('nombreReferencia') as string || null;
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
    nombreReferencia,
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
    const project = await prisma.project.update({
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
          porcentajeFacturacion: parseFloat(c.porcentajeFacturacion) || 100,
          projectId: id
        }))
      });
    }

    await logAction('Modificar Obra', `Se ha modificado la obra con ID ${id} (${project.direccion})`);

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
    const project = await prisma.project.update({
      where: { id },
      data: { estado: 'ARCHIVADA' }
    });
    await logAction('Archivar Obra', `Se ha archivado la obra con ID ${id} (${project.direccion})`);
    revalidatePath('/obras');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Error al archivar la obra' };
  }
}

export async function unarchiveProject(id: number) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: { estado: 'ACTIVA' }
    });
    await logAction('Desarchivar Obra', `Se ha desarchivado la obra con ID ${id} (${project.direccion})`);
    revalidatePath('/obras');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Error al desarchivar la obra' };
  }
}

export async function deleteProject(id: number) {
  try {
    const cookieStore = await cookies();
    const devMode = cookieStore.get('gargom_dev_mode')?.value === 'true';
    if (!devMode) {
      return { error: 'Acción permitida únicamente en Modo Desarrollador' };
    }

    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return { error: 'La obra no existe' };
    }

    await prisma.project.delete({
      where: { id }
    });

    await logAction('Eliminar Obra', `Se ha eliminado permanentemente la obra con ID ${id} (${project.direccion})`);

    revalidatePath('/obras');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Error al eliminar la obra' };
  }
}
