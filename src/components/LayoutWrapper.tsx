'use client';

import { usePathname } from 'next/navigation';

export default function LayoutWrapper({ 
  children, 
  sidebar 
}: { 
  children: React.ReactNode, 
  sidebar: React.ReactNode 
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/login');

  if (isAuthPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      {sidebar}
      <main className="flex-1 ml-64 p-8 min-h-screen bg-slate-50">
        {children}
      </main>
    </>
  );
}
