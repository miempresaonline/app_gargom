import DashboardClient from './DashboardClient';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();

  // Fetch real data
  const [obrasCount, trabajadoresCount, certificaciones, gastos, obrasDestacadas] = await Promise.all([
    prisma.project.count(),
    prisma.worker.count(),
    prisma.certification.findMany({ select: { importe: true } }),
    prisma.expense.findMany({ select: { importe: true, tipo: true, fecha: true } }),
    prisma.project.findMany({
      take: 4, 
      orderBy: { createdAt: 'desc' },
      select: { 
        id: true, 
        cliente: true, 
        presupuestoTotal: true,
        expenses: { select: { importe: true } }
      } 
    })
  ]);

  const totalCertificaciones = certificaciones.reduce((acc, c) => acc + (c.importe || 0), 0);
  const totalGastos = gastos.reduce((acc, g) => acc + (g.importe || 0), 0);
  
  // Agrupar gastos por tipo
  const gastosPorTipo = gastos.reduce((acc: any, g) => {
    acc[g.tipo] = (acc[g.tipo] || 0) + (g.importe || 0);
    return acc;
  }, {});

  // Agrupar gastos de los ultimos 6 meses para la grafica
  const monthlyData: any = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = d.toLocaleString('es-ES', { month: 'short' });
    monthlyData[monthName] = { name: monthName, gastos: 0, certificaciones: 0 };
  }

  gastos.forEach(g => {
    if (!g.fecha) return;
    const d = new Date(g.fecha);
    const monthName = d.toLocaleString('es-ES', { month: 'short' });
    if (monthlyData[monthName]) {
      monthlyData[monthName].gastos += (g.importe || 0);
    }
  });

  // Procesar obras para gráfico de Presupuesto vs Gastos
  const obrasProcesadas = obrasDestacadas.map(obra => {
    const totalGastosObra = obra.expenses.reduce((acc: number, g: any) => acc + (g.importe || 0), 0);
    return {
      name: obra.cliente.split(' ')[0] || 'Obra',
      id: obra.id,
      cliente: obra.cliente,
      presupuestoTotal: obra.presupuestoTotal || 0,
      totalGastosObra,
      porcentajeGasto: obra.presupuestoTotal ? (totalGastosObra / obra.presupuestoTotal) * 100 : 0
    };
  });

  const dashboardData = {
    obrasCount,
    trabajadoresCount,
    totalCertificaciones,
    totalGastos,
    gastosPorTipo,
    chartData: Object.values(monthlyData),
    obrasDestacadas: obrasProcesadas
  };

  return <DashboardClient session={session} data={dashboardData} />;
}
