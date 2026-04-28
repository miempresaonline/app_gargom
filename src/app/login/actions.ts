'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function loginUser(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Por favor, rellena todos los campos' };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: 'Credenciales incorrectas' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { error: 'Credenciales incorrectas' };
    }

    const token = await signToken({ id: user.id, email: user.email, nombre: user.nombre });
    
    const cookieStore = await cookies();
    cookieStore.set('gargom_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Error del servidor' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('gargom_session');
}
