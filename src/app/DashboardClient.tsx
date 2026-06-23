'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, HardHat, FileText, Activity, Users, Plus, ArrowRight, Building2, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

export default function DashboardClient({ session, data }: { session: any, data: any }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const container: any = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item: any = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto min-h-[calc(100vh-2rem)] relative space-y-8">
      {/* Decorative background blur elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.header variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white/60 backdrop-blur-2xl p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.01)] relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110 -z-10 opacity-30" />
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide uppercase mb-4 border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Sistema Activo
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800 mb-2">Hola, {session?.nombre?.split(' ')[0] || 'Admin'}</h1>
            <p className="text-slate-500 font-medium text-lg">Resumen financiero y de control de obras en curso.</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-[0_10px_20px_rgba(37,99,235,0.15)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.25)] hover:-translate-y-0.5 flex items-center gap-2 group/btn"
          >
            <Activity size={20} className="group-hover/btn:rotate-12 transition-transform" />
            <span>Generar Reporte</span>
          </button>
        </motion.header>

        {/* Financial Stat Cards */}
        <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Presupuesto en Curso" 
            value={formatMoney(data.totalPresupuesto)} 
            subtitle={`${data.obrasCount} obras activas`} 
            icon={HardHat} 
            color="blue" 
            delay={0.1} 
          />
          <StatCard 
            title="Certificado Emitido" 
            value={formatMoney(data.totalCertificaciones)} 
            subtitle="Facturación total" 
            icon={FileText} 
            color="emerald" 
            delay={0.2} 
          />
          <StatCard 
            title="Gastos Totales" 
            value={formatMoney(data.totalGastos)} 
            subtitle={`${formatMoney(data.totalGastosPendientes)} pendientes`} 
            icon={TrendingDown} 
            color="rose" 
            delay={0.3} 
          />
          <StatCard 
            title="Beneficio Estimado" 
            value={formatMoney(data.marginEstimado)} 
            subtitle={`Rentabilidad: ${data.marginPorcentaje.toFixed(1)}%`} 
            icon={TrendingUp} 
            color="indigo" 
            delay={0.4} 
          />
        </motion.div>

        {/* Charts Section */}
        <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Area & Bar Charts */}
          <div className="lg:col-span-2 space-y-8 flex flex-col">
            {/* Chart 1: Monthly Evolution Area Chart */}
            <motion.div variants={item} className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:border-blue-100/50 transition-colors">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Evolución Certificaciones vs Gastos</h2>
                  <p className="text-xs text-slate-400 mt-1">Comparativa temporal de los últimos 6 meses</p>
                </div>
              </div>
              <div className="h-[280px] w-full">
                {data.chartData && data.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCert" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                        </linearGradient>
                        <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value}€`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -5px rgb(0 0 0 / 0.15)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                        formatter={(value: any, name: any) => [formatMoney(value), name === 'certificaciones' ? 'Certificado' : 'Gasto']}
                      />
                      <Area type="monotone" dataKey="certificaciones" name="Certificado" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCert)" />
                      <Area type="monotone" dataKey="gastos" name="Gasto" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGasto)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-b from-slate-50/50 to-slate-100/50 rounded-2xl border border-dashed border-slate-200/60">
                    <Activity size={32} className="mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Sin datos suficientes para el gráfico.</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Chart 2: Project Budgets vs Expenses */}
            <motion.div variants={item} className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:border-blue-100/50 transition-colors">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Presupuesto vs Gastos por Obra</h2>
                  <p className="text-xs text-slate-400 mt-1">Comparativa de costes en proyectos destacados</p>
                </div>
                <Link href="/obras" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/link">
                  Ver detalle <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="h-[240px] w-full">
                {data.obrasDestacadas && data.obrasDestacadas.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.obrasDestacadas} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value}€`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -5px rgb(0 0 0 / 0.15)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}
                        formatter={(value: any, name: any) => [formatMoney(value), name === 'presupuestoTotal' ? 'Presupuesto' : 'Gastos']}
                        cursor={{fill: 'transparent'}}
                      />
                      <Bar dataKey="presupuestoTotal" name="Presupuesto" fill="url(#colorPresupuesto)" radius={[6, 6, 6, 6]} />
                      <Bar dataKey="totalGastosObra" name="Gastos" fill="url(#colorGastos)" radius={[6, 6, 6, 6]} />
                      <defs>
                        <linearGradient id="colorPresupuesto" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8"/>
                          <stop offset="100%" stopColor="#4f46e5"/>
                        </linearGradient>
                        <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fca5a5"/>
                          <stop offset="100%" stopColor="#ef4444"/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-b from-slate-50/50 to-slate-100/50 rounded-2xl border border-dashed border-slate-200/60">
                    <Activity size={32} className="mb-2 text-slate-300" />
                    <p className="text-sm font-medium">No hay obras suficientes para el gráfico.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* Right Panels (Gastos type & Top Suppliers) */}
          <div className="space-y-8 flex flex-col">
            {/* Chart 3: Distribution of Expenses */}
            <motion.div variants={item} className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:border-indigo-100/50 transition-colors flex flex-col h-[340px]">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Distribución de Gastos</h2>
              
              <div className="h-[150px] w-full relative mb-4">
                {Object.keys(data.gastosPorTipo).length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(data.gastosPorTipo).map(([name, value]) => ({ name, value }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {Object.keys(data.gastosPorTipo).map((tipo, index) => {
                          const colors: any = {
                            'PERSONAL': ['#34d399', '#059669'],
                            'GENERAL': ['#c084fc', '#9333ea'],
                            'MATERIALES': ['#60a5fa', '#2563eb'],
                            'SUBCONTRATAS': ['#fbbf24', '#d97706'],
                          };
                          const colorSet = colors[tipo] || ['#f97316', '#ea580c'];
                          return (
                            <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} />
                          );
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => formatMoney(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                      />
                      <defs>
                        {Object.keys(data.gastosPorTipo).map((tipo, index) => {
                          const colors: any = {
                            'PERSONAL': ['#34d399', '#059669'],
                            'GENERAL': ['#c084fc', '#9333ea'],
                            'MATERIALES': ['#60a5fa', '#2563eb'],
                            'SUBCONTRATAS': ['#fbbf24', '#d97706'],
                          };
                          const colorSet = colors[tipo] || ['#f97316', '#ea580c'];
                          return (
                            <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={colorSet[0]} />
                              <stop offset="100%" stopColor={colorSet[1]} />
                            </linearGradient>
                          );
                        })}
                      </defs>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    Sin gastos registrados
                  </div>
                )}
              </div>
              
              <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {Object.entries(data.gastosPorTipo).map(([tipo, amount]: [string, any]) => (
                  <div key={tipo} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50/50 border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                        tipo === 'PERSONAL' ? 'bg-emerald-500' : 
                        tipo === 'GENERAL' ? 'bg-purple-500' : 
                        tipo === 'MATERIALES' ? 'bg-blue-500' : 
                        tipo === 'SUBCONTRATAS' ? 'bg-amber-500' : 
                        'bg-orange-500'
                      }`} />
                      <span className="font-semibold text-slate-600 capitalize">{tipo.toLowerCase()}</span>
                    </div>
                    <span className="font-bold text-slate-800">{formatMoney(amount)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Chart 4: Top Suppliers */}
            <motion.div variants={item} className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:border-indigo-100/50 transition-colors flex flex-col h-[260px]">
              <h2 className="text-lg font-bold text-slate-800 mb-1">Top 5 Proveedores</h2>
              <p className="text-[11px] text-slate-400 mb-4">Proveedores con mayor facturación</p>
              
              <div className="h-[160px] w-full">
                {data.topProveedores && data.topProveedores.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.topProveedores} layout="vertical" margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} width={75} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', background: 'rgba(255,255,255,0.95)' }}
                        formatter={(value: any) => [formatMoney(value), 'Coste Acumulado']}
                      />
                      <Bar dataKey="value" fill="url(#colorTopProv)" radius={[0, 4, 4, 0]} barSize={10} />
                      <defs>
                        <linearGradient id="colorTopProv" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                    No hay proveedores con gastos.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Operational Metrics Widget */}
            <motion.div variants={item} className="grid grid-cols-2 gap-4 mt-auto">
              <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                <Users className="text-indigo-500 mb-2" size={24} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trabajadores</span>
                <span className="text-2xl font-black text-slate-800 mt-1">{data.trabajadoresCount}</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                <Building2 className="text-blue-500 mb-2" size={24} />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Proveedores</span>
                <span className="text-2xl font-black text-slate-800 mt-1">{data.proveedoresCount}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color, delay }: any) {
  const colorMap: any = {
    blue: "from-blue-500 to-blue-600 shadow-blue-500/20 text-blue-600 bg-blue-50 border-blue-100",
    emerald: "from-emerald-500 to-emerald-600 shadow-emerald-500/20 text-emerald-600 bg-emerald-50 border-emerald-100",
    rose: "from-rose-500 to-rose-600 shadow-rose-500/20 text-rose-600 bg-rose-50 border-rose-100",
    indigo: "from-indigo-500 to-indigo-600 shadow-indigo-500/20 text-indigo-600 bg-indigo-50 border-indigo-100",
  };

  const bgClasses = colorMap[color];
  const [gradientClasses, shadow, text, bg, border] = bgClasses.split(' ');

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all cursor-pointer relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientClasses} opacity-5 rounded-bl-[80px] transition-transform duration-500 group-hover:scale-150 group-hover:opacity-10`} />
      
      <div className="flex justify-between items-start relative z-10 gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-500 mb-2 truncate">{title}</p>
          <h3 className="text-2xl xl:text-3xl font-black tracking-tight text-slate-800 break-words">{value}</h3>
          {subtitle && <p className="text-xs font-semibold text-slate-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${bg} ${text} ${border} shadow-sm border shrink-0`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
}
