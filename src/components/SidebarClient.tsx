'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';
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
  Loader2,
  ChevronLeft,
  ChevronRight
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-collapsed') === 'true';
      setIsCollapsed(stored);
    }
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
    // Emit custom event to sync with LayoutWrapper
    window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: next }));
  };

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
    <aside className="h-full w-full bg-white/80 backdrop-blur-xl text-slate-800 border-r border-slate-200/80 flex flex-col z-50 overflow-visible relative shadow-[4px_0_30px_rgba(15,23,42,0.04)] select-none">
      {/* Collapse/Expand Floating Trigger Arrow Button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute top-10 -right-3 z-[60] bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-gargom-accent rounded-full p-1.5 shadow-md transition-all hover:scale-110 active:scale-95 items-center justify-center cursor-pointer group"
        title={isCollapsed ? "Desplegar menú" : "Colapsar menú"}
      >
        {isCollapsed ? (
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        )}
      </button>

      {/* Premium Decorative Orb (top right background glow) */}
      <div className="absolute top-[-80px] right-[-80px] w-56 h-56 bg-gradient-to-br from-blue-500/5 to-purple-500/0 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-64 h-64 bg-gradient-to-tr from-indigo-500/5 to-transparent blur-[70px] rounded-full pointer-events-none" />

      {/* Logo */}
      <div className={`flex items-center justify-center border-b border-slate-100 relative z-10 py-4 transition-all duration-300 ${isCollapsed ? 'h-20 px-2' : 'h-28 px-6'}`}>
        {isCollapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.2)] select-none">
            <span className="text-white text-xl font-black tracking-tighter">G</span>
          </div>
        ) : (
          <img 
            src="https://ltukyxwcvivaiuqaxlgo.supabase.co/storage/v1/object/sign/COSAS/gargom/logo_gargom_png_transparente_fondos_claros%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83Y2FiZGYxMy0yNDVkLTQ2ZWUtYjFjNy0xM2Q3MGIwNTg5NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDT1NBUy9nYXJnb20vbG9nb19nYXJnb21fcG5nX3RyYW5zcGFyZW50ZV9mb25kb3NfY2xhcm9zICgxKS5wbmciLCJpYXQiOjE3Nzc0MTM5MzEsImV4cCI6MTgwODk0OTkzMX0.DSR-3st04yu-p1jHlw_EmZ4VuhAt2tlybp7Rl0h5DLg" 
            alt="Gargom Logo" 
            className="h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(37,99,235,0.1)]"
          />
        )}
      </div>

      {/* Navigation menu */}
      <nav className={`flex-1 overflow-y-auto py-6 flex flex-col gap-1.5 relative z-10 custom-scrollbar scroll-smooth ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Determine if the link is currently active
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link 
              key={item.name} 
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={`flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden text-sm ${isCollapsed ? 'justify-center p-3 gap-0' : 'gap-3 px-4 py-3'}`}
            >
              {/* Sliding Active Glow Indicator Background */}
              {isActive && (
                <motion.div 
                  layoutId="activeNavBackground"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100/50 rounded-xl"
                />
              )}

              {/* Blue accent line on the very left of the item */}
              {isActive && (
                <motion.div
                  layoutId="activeNavLine"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full"
                />
              )}

              {/* Icon */}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                <Icon 
                  size={18} 
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-blue-600 drop-shadow-[0_0_8px_rgba(37,99,235,0.2)]' : 'text-slate-400 group-hover:text-slate-700'
                  }`} 
                />
              </div>

              {/* Text */}
              {!isCollapsed && (
                <span 
                  className={`font-semibold tracking-wide relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-blue-700 font-extrabold' : 'text-slate-500 group-hover:text-slate-800'
                  }`}
                >
                  {item.name}
                </span>
              )}

              {/* Hover highlight shimmer */}
              <div className="absolute inset-0 bg-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
            </Link>
          );
        })}
      </nav>

      {/* User profile & admin toggle */}
      <div className={`border-t border-slate-100 bg-slate-50/50 relative z-10 flex flex-col transition-all duration-300 ${isCollapsed ? 'p-3 gap-3' : 'p-6 gap-4'}`}>
        {/* User Card */}
        <div className={`flex items-center bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all duration-300 ${isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 flex items-center justify-center text-sm font-black text-white shadow-[0_2px_8px_rgba(37,99,235,0.15)] shrink-0">
            {session?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black truncate text-slate-800 tracking-wide">{session?.nombre || 'Usuario'}</p>
              <p className="text-[10px] text-slate-400 truncate font-semibold">{session?.email || 'admin@gargom.es'}</p>
            </div>
          )}
        </div>

        {/* Developer Mode switch (Only for Admin email) */}
        {session?.email === 'dpenuelaruiz7@gmail.com' && (
          <div className={`flex items-center bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-600 transition-all duration-300 ${isCollapsed ? 'p-2 justify-center' : 'p-2.5 justify-between'}`}>
            <div className="flex items-center gap-1.5 shrink-0" title="Modo Desarrollador">
              <Sparkles size={12} className="animate-pulse" />
              {!isCollapsed && <span>Modo Desarrollador</span>}
            </div>
            
            <button
              onClick={handleDevModeToggle}
              disabled={isPending}
              className={`focus:outline-none transition-opacity duration-200 hover:opacity-80 active:scale-95 ${isCollapsed ? 'mt-1' : ''}`}
              title={devMode ? "Desactivar funciones admin" : "Activar funciones admin"}
            >
              {devMode ? (
                <ToggleRight size={isCollapsed ? 20 : 24} className="text-amber-500 cursor-pointer fill-amber-500/10" />
              ) : (
                <ToggleLeft size={isCollapsed ? 20 : 24} className="text-slate-300 cursor-pointer" />
              )}
            </button>
          </div>
        )}

        {/* Logout and Version */}
        <div className="flex flex-col gap-2.5">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
            className={`flex items-center justify-center rounded-xl border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs transition-all tracking-wide disabled:opacity-50 shadow-[0_2px_6px_rgba(239,68,68,0.02)] ${isCollapsed ? 'p-2.5 w-10 mx-auto' : 'w-full py-2.5 gap-2'}`}
          >
            {isLoggingOut ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <LogOut size={14} />
            )}
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>

          {!isCollapsed ? (
            <div className="text-center">
              <span className="text-[9px] font-mono text-slate-300 font-black tracking-widest uppercase hover:text-slate-500 transition-colors cursor-default select-none">
                Gargom ERP v1.5.0
              </span>
            </div>
          ) : (
            <div className="text-center font-mono text-[8px] text-slate-300 font-black tracking-tight select-none">
              v1.5
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
