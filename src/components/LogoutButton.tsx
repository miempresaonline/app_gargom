'use client';

import { useTransition } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { logoutUser } from '@/app/login/actions';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      router.push('/login');
    });
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isPending}
      className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-all duration-300 disabled:opacity-50"
    >
      {isPending ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
      <span className="font-medium text-sm">Cerrar sesión</span>
    </button>
  );
}
