'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ExpenseType } from '@prisma/client';
import { logAction } from '@/lib/logger';
import { syncInvoiceToOdoo } from '@/lib/odoo';

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
  
  // New Fields
  const estadoPago = (formData.get('estadoPago') as string) || 'Pendiente';
  const formaPago = (formData.get('formaPago') as string) || null;
  const esGastoB = formData.get('esGastoB') === 'true';
  const imagenUrl = (formData.get('imagenUrl') as string) || null;
  const supplierId = formData.get('supplierId') ? parseInt(formData.get('supplierId') as string) : null;

  try {
    const expense = await prisma.expense.create({
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
        observaciones,
        estadoPago,
        formaPago,
        esGastoB,
        imagenUrl,
        supplierId
      },
    });

    // Webhook to n8n
    if (estadoPago === 'Pagado') {
      try {
        const formattedFecha = expense.fecha ? expense.fecha.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const formattedFechaVencimiento = expense.fechaVencimiento ? expense.fechaVencimiento.toISOString().split('T')[0] : formattedFecha;

        // Fetch supplier details
        const supplier = expense.supplierId 
          ? await prisma.supplier.findUnique({ where: { id: expense.supplierId } })
          : null;

        const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.miempresa.online/webhook/gastos';
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            event: 'gasto_pagado', 
            gasto: {
              ...expense,
              fecha: formattedFecha,
              numero: expense.numero || `G-${expense.id}`,
              fechaVencimiento: formattedFechaVencimiento,
              proveedorNombre: supplier ? supplier.nombre : null,
              proveedorEmail: supplier ? supplier.correo : null,
              proveedor: supplier ? {
                nombre: supplier.nombre,
                correo: supplier.correo,
                cif: supplier.cif,
                telefono: supplier.telefono
              } : null
            } 
          })
        });
        if (!response.ok) {
          console.error(`Error de n8n webhook al crear gasto de obra: ${response.status} ${response.statusText}`);
          const text = await response.text().catch(() => '');
          console.error(`Detalle de respuesta de n8n: ${text}`);
        } else {
          console.log(`✅ Webhook enviado correctamente a n8n para el gasto ID ${expense.id}`);
        }
      } catch (err) {
        console.error('Error enviando webhook n8n:', err);
      }
    }

    await logAction('Crear Gasto Obra', `Se ha registrado el gasto con ID ${expense.id} (${tipo} - ${expense.importe}€) en la obra con ID ${projectId}`);

    revalidatePath(`/obras/${projectId}`);
    revalidatePath('/gastos');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Error al registrar el gasto' };
  }
}

export async function deleteGastoObra(id: number, projectId: number) {
  try {
    const expense = await prisma.expense.findUnique({ where: { id } });
    await prisma.expense.delete({
      where: { id },
    });
    if (expense) {
      await logAction('Eliminar Gasto Obra', `Se ha eliminado el gasto con ID ${id} (${expense.tipo} - ${expense.importe}€) en la obra con ID ${projectId}`);
    }
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
    const cert = await prisma.certification.create({
      data: { projectId, importe, numero, concepto },
    });
    await logAction('Crear Certificación Obra', `Se ha creado la factura/certificación Nº ${numero} (${importe}€) en la obra con ID ${projectId}`);
    revalidatePath(`/obras/${projectId}`);
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error) {
    return { error: 'Error al crear la certificación' };
  }
}

export async function syncCertificationOdoo(id: number, projectId: number) {
  try {
    const res = await syncInvoiceToOdoo(id);
    if (!res.success) {
      return { error: res.error || 'Error al sincronizar con Odoo' };
    }
    const cert = await prisma.certification.findUnique({ where: { id } });
    await logAction('Sincronizar Certificación Odoo', `Se ha enviado a Odoo la certificación Nº ${cert?.numero || id} de la obra con ID ${projectId}`);
    revalidatePath(`/obras/${projectId}`);
    revalidatePath('/certificaciones');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { error: error.message || 'Error al sincronizar con Odoo' };
  }
}
