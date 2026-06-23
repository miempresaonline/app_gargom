import DashboardClient from './DashboardClient';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();

  // Fetch real data
  const [proyectos, trabajadoresCount, proveedoresCount, certificaciones, gastos, obrasDestacadas] = await Promise.all([
    prisma.project.findMany({
      select: {
        presupuestoTotal: true,
        presupuestoAdicional: true,
        estado: true
      }
    }),
    prisma.worker.count(),
    prisma.supplier.count(),
    prisma.certification.findMany({
      select: {
        importe: true,
        createdAt: true
      }
    }),
    prisma.expense.findMany({
      select: {
        importe: true,
        tipo: true,
        fecha: true,
        estadoPago: true,
        supplier: {
          select: {
            nombre: true
          }
        }
      }
    }),
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

  // Proyectos Activos y Presupuesto en Curso
  const proyectosActivos = proyectos.filter(p => p.estado === 'ACTIVA');
  const obrasCount = proyectosActivos.length;
  const totalPresupuesto = proyectosActivos.reduce((acc, p) => acc + (p.presupuestoTotal || 0) + (p.presupuestoAdicional || 0), 0);

  // Totales financieros
  const totalCertificaciones = certificaciones.reduce((acc, c) => acc + (c.importe || 0), 0);
  const totalGastos = gastos.reduce((acc, g) => acc + (g.importe || 0), 0);
  const totalGastosPendientes = gastos
    .filter(g => g.estadoPago === 'Pendiente')
    .reduce((acc, g) => acc + (g.importe || 0), 0);
  
  const marginEstimado = totalCertificaciones - totalGastos;
  const marginPorcentaje = totalCertificaciones > 0 ? (marginEstimado / totalCertificaciones) * 100 : 0;

  // Agrupar gastos por tipo
  const gastosPorTipo = gastos.reduce((acc: any, g) => {
    acc[g.tipo] = (acc[g.tipo] || 0) + (g.importe || 0);
    return acc;
  }, {});

  // Agrupar gastos por proveedor
  const gastosPorProveedor = gastos.reduce((acc: any, g) => {
    if (!g.supplier) return acc;
    const name = g.supplier.nombre;
    acc[name] = (acc[name] || 0) + (g.importe || 0);
    return acc;
  }, {});

  // Top 5 proveedores por gasto
  const topProveedores = Object.entries(gastosPorProveedor)
    .map(([name, value]: any) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Agrupar gastos e certificaciones de los ultimos 6 meses para la grafica mensual
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

  certificaciones.forEach(c => {
    if (!c.createdAt) return;
    const d = new Date(c.createdAt);
    const monthName = d.toLocaleString('es-ES', { month: 'short' });
    if (monthlyData[monthName]) {
      monthlyData[monthName].certificaciones += (c.importe || 0);
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
    proveedoresCount,
    totalPresupuesto,
    totalCertificaciones,
    totalGastos,
    totalGastosPendientes,
    marginEstimado,
    marginPorcentaje,
    gastosPorTipo,
    chartData: Object.values(monthlyData),
    obrasDestacadas: obrasProcesadas,
    topProveedores
  };

  return <DashboardClient session={session} data={dashboardData} />;
}
