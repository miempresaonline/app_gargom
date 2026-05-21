'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ExpenseType } from '@prisma/client';
import { logAction } from '@/lib/logger';

export async function createGasto(prevState: any, formData: FormData) {
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

  const supplierId = formData.get('supplierId') ? parseInt(formData.get('supplierId') as string) : null;
  const estadoPago = formData.get('estadoPago') as string || 'Pendiente';
  const esGastoB = formData.get('esGastoB') === 'on' || formData.get('esGastoB') === 'true';
  const imagenUrl = formData.get('imagenUrl') as string || null;

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
        supplierId,
        estadoPago,
        esGastoB,
        imagenUrl
      },
    });

    // Webhook to n8n
    if (estadoPago === 'Pagado') {
      try {
        const formattedFecha = expense.fecha ? expense.fecha.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const formattedFechaVencimiento = expense.fechaVencimiento ? expense.fechaVencimiento.toISOString().split('T')[0] : formattedFecha;

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
              fechaVencimiento: formattedFechaVencimiento
            } 
          })
        });
        if (!response.ok) {
          console.error(`Error de n8n webhook al crear gasto: ${response.status} ${response.statusText}`);
          const text = await response.text().catch(() => '');
          console.error(`Detalle de respuesta de n8n: ${text}`);
        } else {
          console.log(`✅ Webhook enviado correctamente a n8n para el gasto ID ${expense.id}`);
        }
      } catch (err) {
        console.error('Error enviando webhook n8n:', err);
      }
    }

    await logAction('Crear Gasto', `Se ha registrado un nuevo gasto (${tipo}) por importe de ${importe}€`);

    revalidatePath('/gastos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al registrar el gasto' };
  }
}

export async function updateGasto(prevState: any, formData: FormData) {
  const id = parseInt(formData.get('id') as string);
  const tipo = formData.get('tipo') as ExpenseType;
  const projectId = parseInt(formData.get('projectId') as string);
  
  if (isNaN(id) || !tipo || isNaN(projectId)) {
    return { error: 'Faltan datos obligatorios (ID, Tipo y Obra)' };
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
  
  const supplierId = formData.get('supplierId') ? parseInt(formData.get('supplierId') as string) : null;
  const estadoPago = formData.get('estadoPago') as string || 'Pendiente';
  const esGastoB = formData.get('esGastoB') === 'on' || formData.get('esGastoB') === 'true';
  const imagenUrl = formData.get('imagenUrl') as string || null;

  try {
    const expense = await prisma.expense.update({
      where: { id },
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
        supplierId,
        estadoPago,
        esGastoB,
        imagenUrl
      },
    });
    
    // Webhook to n8n
    if (estadoPago === 'Pagado') {
      try {
        const formattedFecha = expense.fecha ? expense.fecha.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const formattedFechaVencimiento = expense.fechaVencimiento ? expense.fechaVencimiento.toISOString().split('T')[0] : formattedFecha;

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
              fechaVencimiento: formattedFechaVencimiento
            } 
          })
        });
        if (!response.ok) {
          console.error(`Error de n8n webhook al actualizar gasto: ${response.status} ${response.statusText}`);
          const text = await response.text().catch(() => '');
          console.error(`Detalle de respuesta de n8n: ${text}`);
        } else {
          console.log(`✅ Webhook enviado correctamente a n8n para el gasto ID ${expense.id}`);
        }
      } catch (err) {
        console.error('Error enviando webhook n8n:', err);
      }
    }

    await logAction('Actualizar Gasto', `Se ha actualizado el gasto con ID ${id} (${tipo})`);

    revalidatePath('/gastos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al actualizar el gasto' };
  }
}

export async function deleteGasto(id: number) {
  try {
    const expense = await prisma.expense.findUnique({ where: { id } });
    await prisma.expense.delete({
      where: { id },
    });
    
    if (expense) {
      await logAction('Eliminar Gasto', `Se ha eliminado el gasto con ID ${id} (${expense.tipo} - ${expense.importe}€)`);
    }

    revalidatePath('/gastos');
    return { success: true };
  } catch (error) {
    return { error: 'Error al eliminar el gasto' };
  }
}

export async function parseInvoiceWithGroq(base64Image: string) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract information from this invoice. Return ONLY a valid JSON object without markdown or explanations. Required keys: 'concepto' (string: main supplier or brief description), 'numero' (string: invoice number), 'importe' (number: total amount), 'fecha' (string: YYYY-MM-DD), 'fechaVencimiento' (string: YYYY-MM-DD). If a field is not found, use null."
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq Error:', errText);
      return { error: `Error al analizar la factura con IA: ${errText}` };
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || '{}';
    
    // Clean up potential markdown formatting from the response
    content = content.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(content);
      return { success: true, data: parsed };
    } catch (e) {
      console.error('Failed to parse Groq response as JSON:', content);
      return { error: 'La respuesta de la IA no tenía el formato correcto' };
    }
  } catch (error) {
    console.error('Groq execution error:', error);
    return { error: 'Error de conexión con la IA' };
  }
}
