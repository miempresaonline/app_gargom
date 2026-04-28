import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, HardHat, Users, Building2, Landmark, Package, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gargom-blue text-white shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-center h-24 px-6 border-b border-white/10">
        <Image 
          src="/imagenes/logo_gargom_dark_bg.png" 
          alt="Gargom Logo" 
          width={180} 
          height={60} 
          className="object-contain drop-shadow-lg"
          priority
        />
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 group"
            >
              <Icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold shadow-inner">
            A
          </div>
          <div>
            <p className="text-sm font-semibold">Admin</p>
            <p className="text-xs text-white/60">Gargom ERP</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
