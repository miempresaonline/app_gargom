'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LayoutWrapper({ 
  children, 
  sidebar 
}: { 
  children: React.ReactNode, 
  sidebar: React.ReactNode 
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Synchronize sidebar collapsed state via localStorage and CustomEvents
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-collapsed') === 'true';
      setIsSidebarCollapsed(stored);

      const handleToggle = (e: Event) => {
        setIsSidebarCollapsed((e as CustomEvent).detail);
      };
      window.addEventListener('sidebar-toggle', handleToggle);
      return () => window.removeEventListener('sidebar-toggle', handleToggle);
    }
  }, []);

  if (isAuthPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--sidebar-bg)] backdrop-blur-xl z-50 flex items-center justify-between px-4 border-b border-[var(--sidebar-border)] shadow-[0_2px_15px_rgba(15,23,42,0.03)] transition-all duration-300">
        <div className="flex items-center">
          <img 
            src="https://ltukyxwcvivaiuqaxlgo.supabase.co/storage/v1/object/sign/COSAS/gargom/logo_gargom_png_transparente_fondos_claros%20(1).png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83Y2FiZGYxMy0yNDVkLTQ2ZWUtYjFjNy0xM2Q3MGIwNTg5NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDT1NBUy9nYXJnb20vbG9nb19nYXJnb21fcG5nX3RyYW5zcGFyZW50ZV9mb25kb3NfY2xhcm9zICgxKS5wbmciLCJpYXQiOjE3Nzc0MTM5MzEsImV4cCI6MTgwODk0OTkzMX0.DSR-3st04yu-p1jHlw_EmZ4VuhAt2tlybp7Rl0h5DLg" 
            alt="Gargom Logo" 
            className="h-8 w-auto object-contain transition-all duration-300"
            style={{ filter: 'var(--sidebar-logo-filter)' }}
          />
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[var(--sidebar-text)] p-2 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors cursor-pointer"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Wrapper */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out
        md:translate-x-0 
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebar}
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`
        flex-1 p-4 md:p-8 min-h-screen bg-gargom-bg mt-16 md:mt-0 transition-all duration-300 w-full overflow-x-hidden relative
        ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
      `}>
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>
    </>
  );
}
