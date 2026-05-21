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

  const themesList = [
    { id: 'light', name: 'Claro', bg: 'bg-blue-600', border: 'border-slate-200', tooltip: 'Gargom Light (Clásico Claro)' },
    { id: 'midnight', name: 'Espacial', bg: 'bg-[#38BDF8]', border: 'border-[#1E294B]', tooltip: 'Midnight Dark (Espacial Oscuro)' },
    { id: 'emerald', name: 'Esmeralda', bg: 'bg-[#10B981]', border: 'border-emerald-200', tooltip: 'Emerald Mint (Bosque Esmeralda)' },
    { id: 'carbon', name: 'Obsidiana', bg: 'bg-[#F59E0B]', border: 'border-[#3E3C3A]', tooltip: 'Carbon Gold (Obsidiana y Oro)' },
  ] as const;

  const [activeTheme, setActiveTheme] = useState<'light' | 'midnight' | 'emerald' | 'carbon'>('light');

  // Load sidebar state and theme state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCollapse = localStorage.getItem('sidebar-collapsed') === 'true';
      setIsCollapsed(storedCollapse);

      const storedTheme = (localStorage.getItem('gargom-theme') || 'light') as 'light' | 'midnight' | 'emerald' | 'carbon';
      setActiveTheme(storedTheme);
    }
  }, []);

  const changeTheme = (theme: 'light' | 'midnight' | 'emerald' | 'carbon') => {
    setActiveTheme(theme);
    localStorage.setItem('gargom-theme', theme);
    
    const html = document.documentElement;
    // Remove all old theme classes
    html.classList.remove('theme-light', 'theme-dark-midnight', 'theme-light-emerald', 'theme-dark-carbon');
    
    // Add selected theme class
    const classMap = {
      light: 'theme-light',
      midnight: 'theme-dark-midnight',
      emerald: 'theme-light-emerald',
      carbon: 'theme-dark-carbon'
    };
    html.classList.add(classMap[theme] || 'theme-light');
  };

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
    <aside className="h-full w-full bg-[var(--sidebar-bg)] backdrop-blur-xl text-[var(--sidebar-text)] border-r border-[var(--sidebar-border)] flex flex-col z-50 overflow-visible relative shadow-[4px_0_30px_rgba(15,23,42,0.04)] select-none transition-all duration-300">
      {/* Collapse/Expand Floating Trigger Arrow Button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute top-10 -right-3 z-[60] bg-[var(--sidebar-card-bg)] hover:bg-[var(--sidebar-hover-bg)] border border-[var(--sidebar-border)] text-[var(--sidebar-muted)] hover:text-[var(--gargom-accent)] rounded-full p-1.5 shadow-md transition-all hover:scale-110 active:scale-95 items-center justify-center cursor-pointer group"
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
      <div className={`flex items-center justify-center border-b border-[var(--sidebar-border)] relative z-10 py-4 transition-all duration-300 ${isCollapsed ? 'h-20 px-2' : 'h-28 px-6'}`}>
        {isCollapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gargom-accent)] to-[var(--gargom-blue)] flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.15)] select-none">
            <span className="text-white text-xl font-black tracking-tighter">G</span>
          </div>
        ) : (
          <img 
            src="https://ltukyxwcvivaiuqaxlgo.supabase.co/storage/v1/object/sign/COSAS/gargom/logo_gargom_png_transparente_fondos_claros%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83Y2FiZGYxMy0yNDVkLTQ2ZWUtYjFjNy0xM2Q3MGIwNTg5NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDT1NBUy9nYXJnb20vbG9nb19nYXJnb21fcG5nX3RyYW5zcGFyZW50ZV9mb25kb3NfY2xhcm9zICgxKS5wbmciLCJpYXQiOjE3Nzc0MTM5MzEsImV4cCI6MTgwODk0OTkzMX0.DSR-3st04yu-p1jHlw_EmZ4VuhAt2tlybp7Rl0h5DLg" 
            alt="Gargom Logo" 
            className="h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(37,99,235,0.1)] transition-all duration-300"
            style={{ filter: 'var(--sidebar-logo-filter)' }}
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
                  className="absolute inset-0 bg-[var(--sidebar-active-bg)] border border-[var(--sidebar-active-border)] rounded-xl"
                />
              )}

              {/* Theme active accent line on the very left of the item */}
              {isActive && (
                <motion.div
                  layoutId="activeNavLine"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute left-0 top-2 bottom-2 w-1 bg-[var(--sidebar-active-line)] rounded-r-full"
                />
              )}

              {/* Icon */}
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                <Icon 
                  size={18} 
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-[var(--sidebar-active-icon)] drop-shadow-[0_0_8px_rgba(37,99,235,0.15)]' : 'text-[var(--sidebar-muted)] group-hover:text-[var(--sidebar-text)]'
                  }`} 
                />
              </div>

              {/* Text */}
              {!isCollapsed && (
                <span 
                  className={`font-semibold tracking-wide relative z-10 transition-colors duration-300 ${
                    isActive ? 'text-[var(--sidebar-active-text)] font-extrabold' : 'text-[var(--sidebar-muted)] group-hover:text-[var(--sidebar-text)]'
                  }`}
                >
                  {item.name}
                </span>
              )}

              {/* Hover highlight shimmer */}
              <div className="absolute inset-0 bg-[var(--sidebar-hover-bg)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
            </Link>
          );
        })}
      </nav>

      {/* User profile & admin toggle */}
      <div className={`border-t border-[var(--sidebar-border)] bg-[var(--sidebar-hover-bg)] relative z-10 flex flex-col transition-all duration-300 ${isCollapsed ? 'p-3 gap-3' : 'p-6 gap-4'}`}>
        
        {/* Theme Selector */}
        {/* Expanded Theme Panel */}
        {!isCollapsed && (
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[9px] font-black text-[var(--sidebar-muted)] tracking-widest uppercase pl-1">
              Tema Visual
            </span>
            <div className="flex items-center justify-between bg-[var(--sidebar-card-bg)] border border-[var(--sidebar-card-border)] rounded-xl p-1 gap-1 shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
              {themesList.map((t) => (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  title={t.tooltip}
                  className={`relative group flex items-center justify-center w-8 h-8 rounded-lg transition-all active:scale-95 cursor-pointer ${
                    activeTheme === t.id
                      ? 'bg-[var(--sidebar-hover-bg)] ring-2 ring-[var(--gargom-accent)]'
                      : 'hover:bg-[var(--sidebar-hover-bg)]'
                  }`}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${t.bg} border ${t.border} shadow-sm group-hover:scale-110 transition-transform`} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed Theme Stack */}
        {isCollapsed && (
          <div className="flex flex-col items-center gap-2 pt-1 border-b border-[var(--sidebar-border)] pb-3">
            {themesList.map((t) => (
              <button
                key={t.id}
                onClick={() => changeTheme(t.id)}
                title={t.tooltip}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                  activeTheme === t.id
                    ? 'ring-2 ring-[var(--gargom-accent)] ring-offset-2 ring-offset-[var(--gargom-bg)]'
                    : 'hover:scale-110'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${t.bg} border ${t.border}`} />
              </button>
            ))}
          </div>
        )}

        {/* User Card */}
        <div className={`flex items-center bg-[var(--sidebar-card-bg)] rounded-2xl border border-[var(--sidebar-card-border)] shadow-[0_2px_8px_rgba(15,23,42,0.02)] transition-all duration-300 ${isCollapsed ? 'p-2 justify-center' : 'p-3 gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gargom-accent)] to-[var(--gargom-blue)] flex items-center justify-center text-sm font-black text-white shadow-[0_2px_8px_rgba(37,99,235,0.15)] shrink-0">
            {session?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black truncate text-[var(--sidebar-text)] tracking-wide">{session?.nombre || 'Usuario'}</p>
              <p className="text-[10px] text-[var(--sidebar-muted)] truncate font-semibold">{session?.email || 'admin@gargom.es'}</p>
            </div>
          )}
        </div>

        {/* Developer Mode switch (Only for Admin email) */}
        {session?.email === 'dpenuelaruiz7@gmail.com' && (
          <div className={`flex items-center bg-amber-500/10 border border-amber-500/25 rounded-xl text-[11px] font-semibold text-amber-500 transition-all duration-300 ${isCollapsed ? 'p-2 justify-center' : 'p-2.5 justify-between'}`}>
            <div className="flex items-center gap-1.5 shrink-0" title="Modo Desarrollador">
              <Sparkles size={12} className="animate-pulse" />
              {!isCollapsed && <span>Modo Desarrollador</span>}
            </div>
            
            <button
              onClick={handleDevModeToggle}
              disabled={isPending}
              className={`focus:outline-none transition-opacity duration-200 hover:opacity-80 active:scale-95 cursor-pointer ${isCollapsed ? 'mt-1' : ''}`}
              title={devMode ? "Desactivar funciones admin" : "Activar funciones admin"}
            >
              {devMode ? (
                <ToggleRight size={isCollapsed ? 20 : 24} className="text-amber-500 cursor-pointer fill-amber-500/10" />
              ) : (
                <ToggleLeft size={isCollapsed ? 20 : 24} className="text-slate-400 cursor-pointer" />
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
            className={`flex items-center justify-center rounded-xl border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 font-bold text-xs transition-all tracking-wide disabled:opacity-50 shadow-[0_2px_6px_rgba(239,68,68,0.02)] cursor-pointer ${isCollapsed ? 'p-2.5 w-10 mx-auto' : 'w-full py-2.5 gap-2'}`}
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
              <span className="text-[9px] font-mono text-[var(--sidebar-muted)] font-black tracking-widest uppercase hover:text-[var(--sidebar-text)] transition-colors cursor-default select-none">
                Gargom ERP v1.5.0
              </span>
            </div>
          ) : (
            <div className="text-center font-mono text-[8px] text-[var(--sidebar-muted)] font-black tracking-tight select-none">
              v1.5
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
