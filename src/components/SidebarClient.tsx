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
  const [isMobile, setIsMobile] = useState(false);

  const themesList = [
    { id: 'light', name: 'Claro', bg: 'bg-blue-600', border: 'border-slate-200', tooltip: 'Gargom Light (Clásico Claro)' },
    { id: 'midnight', name: 'Espacial', bg: 'bg-[#38BDF8]', border: 'border-[#1E294B]', tooltip: 'Midnight Dark (Espacial Oscuro)' },
    { id: 'emerald', name: 'Esmeralda', bg: 'bg-[#10B981]', border: 'border-emerald-200', tooltip: 'Emerald Mint (Bosque Esmeralda)' },
    { id: 'carbon', name: 'Obsidiana', bg: 'bg-[#F59E0B]', border: 'border-[#3E3C3A]', tooltip: 'Carbon Gold (Obsidiana y Oro)' },
  ] as const;

  const [activeTheme, setActiveTheme] = useState<'light' | 'midnight' | 'emerald' | 'carbon'>('light');

  // Sync mobile state and collapse state on mount and resize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);

      const storedCollapse = localStorage.getItem('sidebar-collapsed') === 'true';
      setIsCollapsed(storedCollapse);

      const storedTheme = (localStorage.getItem('gargom-theme') || 'light') as 'light' | 'midnight' | 'emerald' | 'carbon';
      setActiveTheme(storedTheme);

      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const isMenuCollapsed = isMobile ? false : isCollapsed;

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

  // Group items into logical sections for clean typography/hierarchy
  const menuGroups = [
    {
      title: 'General',
      items: [
        { name: 'Panel Principal', icon: LayoutDashboard, href: '/' },
        { name: 'Obras', icon: HardHat, href: '/obras' },
      ]
    },
    {
      title: 'Operaciones',
      items: [
        { name: 'Gastos', icon: Coins, href: '/gastos' },
        { name: 'Certificaciones', icon: FileCheck, href: '/certificaciones' },
        { name: 'Pagos', icon: Landmark, href: '/bancos' },
      ]
    },
    {
      title: 'Administración',
      items: [
        { name: 'Personal', icon: Users, href: '/personal' },
        { name: 'Proveedores', icon: Building2, href: '/proveedores' },
        { name: 'Usuarios', icon: ShieldCheck, href: '/usuarios' },
      ]
    }
  ];

  const showLogs = session?.email === 'dpenuelaruiz7@gmail.com' && devMode;
  if (showLogs) {
    menuGroups.push({
      title: 'Sistema',
      items: [
        { name: 'Logs', icon: Terminal, href: '/logs' }
      ]
    });
  }

  return (
    <aside className={`h-full w-full bg-[var(--sidebar-bg)] backdrop-blur-xl text-[var(--sidebar-text)] border-r border-[var(--sidebar-border)] flex flex-col z-50 overflow-visible relative shadow-[4px_0_30px_rgba(15,23,42,0.02)] select-none transition-all duration-300 ${isMobile ? 'pt-16' : ''}`}>
      {/* Collapse/Expand Floating Trigger Arrow Button */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute top-10 -right-3.5 z-[60] bg-[var(--sidebar-card-bg)] hover:bg-[var(--sidebar-hover-bg)] border border-[var(--sidebar-border)] text-[var(--sidebar-muted)] hover:text-[var(--gargom-accent)] rounded-full p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all hover:scale-110 active:scale-95 items-center justify-center cursor-pointer group"
        title={isMenuCollapsed ? "Desplegar menú" : "Colapsar menú"}
      >
        {isMenuCollapsed ? (
          <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        )}
      </button>

      {/* Decorative Orbs (Slightly reduced blur for clean elegance) */}
      <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-gradient-to-br from-blue-500/5 to-purple-500/0 blur-[50px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-56 h-56 bg-gradient-to-tr from-indigo-500/5 to-transparent blur-[60px] rounded-full pointer-events-none" />

      {/* Logo Container */}
      {!isMobile && (
        <div className={`flex items-center justify-center border-b border-[var(--sidebar-border)] relative z-10 py-4 transition-all duration-300 ${isMenuCollapsed ? 'h-20 px-2' : 'h-28 px-6'}`}>
          {isMenuCollapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gargom-accent)] to-[var(--gargom-blue)] flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.15)] select-none">
              <span className="text-white text-xl font-black tracking-tighter">G</span>
            </div>
          ) : (
            <img 
              src="https://ltukyxwcvivaiuqaxlgo.supabase.co/storage/v1/object/sign/COSAS/gargom/logo_gargom_png_transparente_fondos_claros%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83Y2FiZGYxMy0yNDVkLTQ2ZWUtYjFjNy0xM2Q3MGIwNTg5NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDT1NBUy9nYXJnb20vbG9nb19nYXJnb21fcG5nX3RyYW5zcGFyZW50ZV9mb25kb3NfY2xhcm9zICgxKS5wbmciLCJpYXQiOjE3Nzc0MTM5MzEsImV4cCI6MTgwODk0OTkzMX0.DSR-3st04yu-p1jHlw_EmZ4VuhAt2tlybp7Rl0h5DLg" 
              alt="Gargom Logo" 
              className="h-20 w-auto object-contain drop-shadow-[0_4px_12px_rgba(37,99,235,0.05)] transition-all duration-300"
              style={{ filter: 'var(--sidebar-logo-filter)' }}
            />
          )}
        </div>
      )}

      {/* Navigation menu */}
      <nav className={`flex-1 overflow-y-auto py-5 flex flex-col gap-5 relative z-10 custom-scrollbar scroll-smooth ${isMenuCollapsed ? 'px-2' : 'px-4'}`}>
        {menuGroups.map((group, groupIdx) => (
          <div key={group.title} className="flex flex-col gap-0.5">
            {!isMenuCollapsed ? (
              <span className="text-[10px] font-bold text-[var(--sidebar-muted)] tracking-wider uppercase pl-3 mb-1.5 select-none opacity-60">
                {group.title}
              </span>
            ) : groupIdx > 0 ? (
              <hr className="border-[var(--sidebar-border)] my-2 mx-2 opacity-50" />
            ) : null}

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  title={isMenuCollapsed ? item.name : undefined}
                  className={`flex items-center rounded-xl transition-all duration-200 group relative overflow-hidden text-sm ${
                    isMenuCollapsed 
                      ? 'justify-center p-3 gap-0' 
                      : 'gap-3 px-3.5 py-2.5'
                  }`}
                >
                  {/* Sliding Active Glow Indicator Background */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavBackground"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-[var(--sidebar-card-bg)] border border-[var(--sidebar-card-border)] shadow-[0_2px_8px_rgba(0,0,0,0.01)] rounded-xl"
                    />
                  )}

                  {/* Theme active accent line on the very left of the item */}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavLine"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-gradient-to-b from-[var(--gargom-accent)] to-[var(--gargom-blue)] rounded-r-full"
                    />
                  )}

                  {/* Icon */}
                  <div className="relative z-10 transition-transform duration-200 group-hover:scale-105">
                    <Icon 
                      size={18} 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-[var(--sidebar-active-icon)]' : 'text-[var(--sidebar-muted)] group-hover:text-[var(--sidebar-text)]'
                      }`} 
                    />
                  </div>

                  {/* Text */}
                  {!isMenuCollapsed && (
                    <span 
                      className={`font-semibold tracking-wide relative z-10 transition-colors duration-200 ${
                        isActive ? 'text-[var(--sidebar-active-text)] font-bold' : 'text-[var(--sidebar-muted)] group-hover:text-[var(--sidebar-text)]'
                      }`}
                    >
                      {item.name}
                    </span>
                  )}

                  {/* Hover highlight shimmer */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-[var(--sidebar-hover-bg)] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-xl" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile, Theme selector & Dev control section */}
      <div className={`border-t border-[var(--sidebar-border)] bg-[var(--sidebar-hover-bg)]/20 relative z-10 flex flex-col transition-all duration-300 ${isMenuCollapsed ? 'p-3 gap-3' : 'p-4 gap-4'}`}>
        
        {/* Theme Selector */}
        {!isMenuCollapsed ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black text-[var(--sidebar-muted)] tracking-widest uppercase pl-1 select-none opacity-60">
              Tema Visual
            </span>
            <div className="flex items-center bg-[var(--sidebar-card-bg)] border border-[var(--sidebar-card-border)] rounded-xl p-0.5 gap-0.5 shadow-[0_2px_8px_rgba(15,23,42,0.02)]">
              {themesList.map((t) => {
                const isActive = activeTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => changeTheme(t.id)}
                    title={t.tooltip}
                    className={`relative flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer ${
                      isActive
                        ? 'bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] shadow-xs'
                        : 'hover:bg-[var(--sidebar-hover-bg)]/40'
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${t.bg} border ${t.border} shadow-xs transition-transform duration-200 ${isActive ? 'scale-110' : 'opacity-80 hover:opacity-100'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pt-1 border-b border-[var(--sidebar-border)] pb-3">
            {themesList.map((t) => {
              const isActive = activeTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => changeTheme(t.id)}
                  title={t.tooltip}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-[var(--sidebar-card-bg)] border border-[var(--sidebar-card-border)] shadow-xs'
                      : 'hover:scale-110'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${t.bg} border ${t.border}`} />
                </button>
              );
            })}
          </div>
        )}

        {/* User Card */}
        {isMenuCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gargom-accent)] to-[var(--gargom-blue)] flex items-center justify-center text-sm font-bold text-white shadow-[0_2px_8px_rgba(37,99,235,0.15)] select-none shrink-0" title={session?.nombre}>
              {session?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>

            {/* Small Dev Switch Icon */}
            {session?.email === 'dpenuelaruiz7@gmail.com' && (
              <button
                onClick={handleDevModeToggle}
                disabled={isPending}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  devMode 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse' 
                    : 'bg-[var(--sidebar-card-bg)] border-[var(--sidebar-card-border)] text-slate-400 hover:text-slate-200'
                }`}
                title={devMode ? "Desactivar Modo Desarrollador" : "Activar Modo Desarrollador"}
              >
                <Sparkles size={14} />
              </button>
            )}

            {/* Small Logout Icon */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              {isLoggingOut ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
            </button>
          </div>
        ) : (
          <div className="flex flex-col bg-[var(--sidebar-card-bg)] rounded-2xl border border-[var(--sidebar-card-border)] p-3 shadow-[0_4px_12px_rgba(15,23,42,0.02)] gap-3">
            {/* User Info & Logout */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--gargom-accent)] to-[var(--gargom-blue)] flex items-center justify-center text-sm font-black text-white shadow-[0_2px_8px_rgba(37,99,235,0.15)] shrink-0">
                {session?.nombre?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-[var(--sidebar-text)] tracking-wide">{session?.nombre || 'Usuario'}</p>
                <p className="text-[10px] text-[var(--sidebar-muted)] truncate font-semibold">{session?.email || 'admin@gargom.es'}</p>
              </div>
              {/* Sleek Logout Icon Button */}
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 active:scale-95 transition-all cursor-pointer shrink-0"
                title="Cerrar Sesión"
              >
                {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              </button>
            </div>
            
            {/* Dev Mode toggle (inside user card) */}
            {session?.email === 'dpenuelaruiz7@gmail.com' && (
              <div className="flex items-center justify-between border-t border-[var(--sidebar-border)] pt-2.5 mt-0.5 text-[11px] font-semibold text-amber-500">
                <div className="flex items-center gap-1.5">
                  <Sparkles size={12} className="animate-pulse" />
                  <span>Modo Desarrollador</span>
                </div>
                <button
                  onClick={handleDevModeToggle}
                  disabled={isPending}
                  className="focus:outline-none transition-all hover:opacity-80 active:scale-95 cursor-pointer"
                  title={devMode ? "Desactivar funciones admin" : "Activar funciones admin"}
                >
                  {devMode ? (
                    <ToggleRight size={22} className="text-amber-500 fill-amber-500/10 cursor-pointer" />
                  ) : (
                    <ToggleLeft size={22} className="text-slate-400 cursor-pointer" />
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Version */}
        {!isMenuCollapsed ? (
          <div className="text-center pt-1">
            <span className="text-[9px] font-mono text-[var(--sidebar-muted)] font-black tracking-widest uppercase hover:text-[var(--sidebar-text)] transition-colors cursor-default select-none opacity-60">
              Gargom ERP v1.5.0
            </span>
          </div>
        ) : (
          <div className="text-center font-mono text-[8px] text-[var(--sidebar-muted)] font-black tracking-tight select-none opacity-60">
            v1.5
          </div>
        )}
      </div>
    </aside>
  );
}
