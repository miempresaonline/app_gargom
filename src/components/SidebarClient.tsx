'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  HardHat, 
  Users, 
  Building2, 
  Landmark, 
  Coins, 
  ShieldCheck, 
  FileCheck, 
  Terminal, 
  LogOut,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Loader2
} from 'lucide-react';
import { setDeveloperMode } from '@/app/actions/admin';
import { logoutUser } from '@/app/login/actions';

interface SidebarClientProps {
  session: any;
  devMode: boolean;
}

export default function SidebarClient({ session, devMode }: SidebarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const handleDevModeToggle = async () => {
    startTransition(async () => {
      const result = await setDeveloperMode(!devMode);
      if (result.success) {
        router.refresh();
      } else if (result.error) {
        alert(result.error);
      }
    });
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutUser();
      router.push('/login');
    });
  };

  const menuItems = [
    { name: 'Panel Principal', icon: LayoutDashboard, href: '/' },
    { name: 'Obras', icon: HardHat, href: '/obras' },
    { name: 'Gastos', icon: Coins, href: '/gastos' },
    { name: 'Certificaciones', icon: FileCheck, href: '/certificaciones' },
    { name: 'Personal', icon: Users, href: '/personal' },
    { name: 'Pagos', icon: Landmark, href: '/bancos' },
    { name: 'Proveedores', icon: Building2, href: '/proveedores' },
    { name: 'Usuarios', icon: ShieldCheck, href: '/usuarios' },
  ];

  // Render logs only if user is the admin AND devMode is enabled
  const showLogs = session?.email === 'dpenuelaruiz7@gmail.com' && devMode;
  if (showLogs) {
    menuItems.push({ name: 'Logs', icon: Terminal, href: '/logs' });
  }

  return (
    <aside className="h-full w-full bg-[#050D24] text-white border-r border-white/5 flex flex-col z-50 overflow-hidden relative shadow-[10px_0_30px_rgba(0,0,0,0.3)]">
      {/* Premium Decorative Orb (top right background glow) */}
      <div className="absolute top-[-80px] right-[-80px] w-56 h-56 bg-gradient-to-br from-blue-600/20 to-purple-600/0 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-gradient-to-tr from-indigo-500/10 to-transparent blur-[70px] rounded-full pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center justify-center h-28 px-6 border-b border-white/5 relative z-10 py-4">
        <img 
          src="https://ltukyxwcvivaiuqaxlgo.supabase.co/storage/v1/object/sign/COSAS/gargom/logo_gargom_png_transparente_fondos_oscuros.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83Y2FiZGYxMy0yNDVkLTQ2ZWUtYjFjNy0xM2Q3MGIwNTg5NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDT1NBUy9nYXJnb20vbG9nb19nYXJnb21fcG5nX3RyYW5zcGFyZW50ZV9mb25kb3Nfb3NjdXJvcy5wbmciLCJpYXQiOjE3Nzc0MTM5NTEsImV4cCI6MTgwODk0OTk1MX0.6Elwrwg9io_tkVh0Pvefqmy3lV69BDs9V7BcpL0P5d8" 
          alt="Gargom Logo" 
          className="h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(59,130,246,0.3)]"
        />
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-1.5 px-4 relative z-10 custom-scrollbar scroll-smooth">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Determine if the link is currently active
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden text-sm"
            >
              {/* Sliding Active Glow Indicator Background */}
              {isActive && (
                <motion.div 
                  layoutId="activeNavBackground"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-indigo-600/10 border border-blue-500/20 rounded-xl"
                />
              )}

              {/* Blue accent line on the very left of the item */}
              {isActive && (
                <motion.div
                  layoutId="activeNavLine"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-r-full"
                />
              )}

              {/* Icon */}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                <Icon 
                  size={18} 
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.6)]' : 'text-white/60 group-hover:text-white'
                  }`} 
                />
              </div>

              {/* Text */}
              <span 
                className={`font-semibold tracking-wide relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-white font-bold' : 'text-white/60 group-hover:text-white'
                }`}
              >
                {item.name}
              </span>

              {/* Hover highlight shimmer */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
            </Link>
          );
        })}
      </nav>

      {/* User profile & admin toggle */}
      <div className="p-6 border-t border-white/5 bg-[#03091c] relative z-10 flex flex-col gap-4">
        {/* User Card */}
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-indigo-700 flex items-center justify-center text-sm font-black shadow-lg shadow-blue-500/20">
            {session?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black truncate text-white tracking-wide">{session?.nombre || 'Usuario'}</p>
            <p className="text-[10px] text-white/40 truncate font-semibold">{session?.email || 'admin@gargom.es'}</p>
          </div>
        </div>

        {/* Developer Mode switch (Only for Admin email) */}
        {session?.email === 'dpenuelaruiz7@gmail.com' && (
          <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-2.5 rounded-xl text-[11px] font-semibold text-amber-400">
            <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="animate-pulse" />
              <span>Modo Desarrollador</span>
            </div>
            
            <button
              onClick={handleDevModeToggle}
              disabled={isPending}
              className="focus:outline-none transition-opacity duration-200 hover:opacity-80 active:scale-95"
              title={devMode ? "Desactivar funciones admin" : "Activar funciones admin"}
            >
              {devMode ? (
                <ToggleRight size={24} className="text-amber-400 cursor-pointer fill-amber-400/20" />
              ) : (
                <ToggleLeft size={24} className="text-white/30 cursor-pointer" />
              )}
            </button>
          </div>
        )}

        {/* Logout and Version */}
        <div className="flex flex-col gap-2.5">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-500/10 hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold text-xs transition-all tracking-wide disabled:opacity-50"
          >
            {isLoggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            Cerrar Sesión
          </button>

          <div className="text-center">
            <span className="text-[9px] font-mono text-white/20 font-black tracking-widest uppercase hover:text-white/40 transition-colors cursor-default select-none">
              Gargom ERP v1.4.0
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
