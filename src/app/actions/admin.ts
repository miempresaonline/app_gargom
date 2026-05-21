'use server';

import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';

export async function setDeveloperMode(enabled: boolean) {
  const session = await getSession();
  
  if (!session || session.email !== 'dpenuelaruiz7@gmail.com') {
    return { error: 'No autorizado' };
  }

  const cookieStore = await cookies();
  if (enabled) {
    cookieStore.set('gargom_dev_mode', 'true', {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  } else {
    cookieStore.delete('gargom_dev_mode');
  }

  return { success: true };
}
