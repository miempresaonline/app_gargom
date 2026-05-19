'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isAuthPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#03194B] z-50 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center">
          <img 
            src="https://ltukyxwcvivaiuqaxlgo.supabase.co/storage/v1/object/sign/COSAS/gargom/logo_gargom_png_transparente_fondos_oscuros.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV83Y2FiZGYxMy0yNDVkLTQ2ZWUtYjFjNy0xM2Q3MGIwNTg5NDMiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJDT1NBUy9nYXJnb20vbG9nb19nYXJnb21fcG5nX3RyYW5zcGFyZW50ZV9mb25kb3Nfb3NjdXJvcy5wbmciLCJpYXQiOjE3Nzc0MTM5NTEsImV4cCI6MTgwODk0OTk1MX0.6Elwrwg9io_tkVh0Pvefqmy3lV69BDs9V7BcpL0P5d8" 
            alt="Gargom Logo" 
            className="h-8 w-auto object-contain"
          />
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2 rounded-lg hover:bg-white/10"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Wrapper */}
      <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 w-64
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
      <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-screen bg-slate-50 mt-16 md:mt-0 transition-all duration-300 w-full overflow-x-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}
