import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, HardHat, Users, Building2, Landmark, Package, ShieldCheck } from 'lucide-react';
import LogoutButton from './LogoutButton';
import { getSession } from '@/lib/auth';

export default async function Sidebar() {
  const session = await getSession() as any;
  
  const menuItems = [
    { name: 'Panel Principal', icon: LayoutDashboard, href: '/' },
    { name: 'Obras', icon: HardHat, href: '/obras' },
    { name: 'Gastos', icon: Package, href: '/gastos' },
    { name: 'Personal', icon: Users, href: '/personal' },
    { name: 'Bancos', icon: Landmark, href: '/bancos' },
    { name: 'Proveedores', icon: Building2, href: '/proveedores' },
    { name: 'Usuarios', icon: ShieldCheck, href: '/usuarios' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#03194B] text-white shadow-[20px_0_40px_rgba(3,25,75,0.1)] flex flex-col z-50 overflow-hidden">
      {/* Decorative gradient orb */}
      <div className="absolute top-[-50px] left-[-50px] w-40 h-40 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />
      
      <div className="flex items-center justify-center h-24 px-6 border-b border-white/10 relative z-10">
        <Image 
          src="/imagenes/logo_gargom_dark_bg.png" 
          alt="Gargom Logo" 
          width={180} 
          height={60} 
          className="object-contain drop-shadow-xl"
          priority
        />
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4 relative z-10 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Icon size={20} className="group-hover:scale-110 group-hover:text-blue-400 transition-all duration-300 relative z-10" />
              <span className="font-medium tracking-wide relative z-10">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10 bg-[#021033] relative z-10">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
            {session?.nombre?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold truncate text-white">{session?.nombre || 'Usuario'}</p>
            <p className="text-[11px] text-white/50 truncate font-medium">{session?.email || 'admin@gargom.es'}</p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
