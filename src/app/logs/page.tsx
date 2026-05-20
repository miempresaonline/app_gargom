import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { Shield, Clock, User, Activity } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const session = await getSession();

  if (!session || session.email !== 'dpenuelaruiz7@gmail.com') {
    redirect('/');
  }

  const logs = await prisma.systemLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  return (
    <div className="p-6 md:p-8 w-full max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gargom-blue flex items-center gap-3">
          <Shield className="text-red-500" size={32} />
          Registro del Sistema
        </h1>
        <p className="text-slate-500">
          Esta vista es confidencial y solo accesible para administradores. Muestra las últimas 100 acciones críticas.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Acción</th>
                <th className="px-6 py-4">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 flex items-center gap-2">
                    <Clock size={14} />
                    {new Date(log.createdAt).toLocaleString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700 flex items-center gap-2">
                    <User size={14} className="text-blue-400" />
                    {log.usuario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      <Activity size={12} />
                      {log.accion}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={log.detalles}>
                    {log.detalles}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No se han registrado acciones aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
