'use server';

import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function createUser(prevState: any, formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!nombre || !email || !password) {
    return { error: 'Por favor, rellena todos los campos' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: 'Ya existe un usuario con este correo' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await prisma.user.create({
      data: {
        nombre,
        email,
        password: hashedPassword,
      },
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Create user error:', error);
    return { error: 'Error al crear el usuario' };
  }
}

export async function updateUser(id: number, nombre: string) {
  try {
    await prisma.user.update({
      where: { id },
      data: { nombre },
    });
    revalidatePath('/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Update user error:', error);
    return { error: 'Error al actualizar el usuario' };
  }
}

export async function deleteUser(id: number) {
  try {
    await prisma.user.delete({
      where: { id },
    });
    revalidatePath('/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Delete user error:', error);
    return { error: 'Error al eliminar el usuario' };
  }
}
