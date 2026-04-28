'use client';

import { useActionState } from 'react';
import { loginUser } from './actions';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state?.success) {
      router.push('/');
    }
  }, [state, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Liquid Glass Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gargom-blue/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gargom-accent/20 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-gargom-blue/5 rounded-3xl p-8 sm:p-10">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-6">
              <img 
                src="https://ltukyxwcvivaiuqaxlgo.supabase.co/storage/v1/object/sign/COSAS/gargom/logo_gargom_png_transparente_fondos_claros%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83Y2FiZGYxMy0yNDVkLTQ2ZWUtYjFjNy0xM2Q3MGIwNTg5NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDT1NBUy9nYXJnb20vbG9nb19nYXJnb21fcG5nX3RyYW5zcGFyZW50ZV9mb25kb3NfY2xhcm9zICgxKS5wbmciLCJpYXQiOjE3Nzc0MTM5MzEsImV4cCI6MTgwODk0OTkzMX0.DSR-3st04yu-p1jHlw_EmZ4VuhAt2tlybp7Rl0h5DLg" 
                alt="Gargom Logo" 
                className="h-24 w-auto object-contain drop-shadow-md"
              />
            </div>
            <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">Bienvenido</h1>
            <p className="text-slate-500 mt-2 text-sm">Inicia sesión en Gargom ERP</p>
          </div>

          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Correo electrónico</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:border-gargom-accent/50 transition-all shadow-sm"
                  placeholder="usuario@gargom.es"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 ml-1">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:border-gargom-accent/50 transition-all shadow-sm"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {state?.error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm text-center font-medium"
              >
                {state.error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-gargom-blue hover:bg-[#021033] text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-gargom-blue/20 hover:shadow-xl hover:shadow-gargom-blue/30 disabled:opacity-70 disabled:pointer-events-none group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500" />
              {isPending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <span>Iniciar sesión</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-400 text-xs mt-8 font-medium">
          &copy; {new Date().getFullYear()} Construcciones Gargom. Todos los derechos reservados.
        </p>
      </motion.div>
    </div>
  );
}
