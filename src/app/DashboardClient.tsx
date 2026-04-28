'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, HardHat, FileText, Activity, Users, Plus, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto min-h-[calc(100vh-2rem)] relative">
      {/* Decorative background blur elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-[20%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        <motion.header variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white/60 backdrop-blur-2xl p-8 rounded-3xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-bl-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-110 -z-10" />
          
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide uppercase mb-4 border border-blue-100">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Sistema Activo
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-800 mb-2">Hola, {session?.nombre?.split(' ')[0] || 'Admin'}</h1>
            <p className="text-slate-500 font-medium text-lg">Resumen general de operaciones de Gargom.</p>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_15px_30px_rgba(37,99,235,0.3)] hover:-translate-y-1 flex items-center gap-2 group/btn">
            <Activity size={20} className="group-hover/btn:rotate-12 transition-transform" />
            <span>Generar Reporte</span>
          </button>
        </motion.header>

        <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Obras Activas" value={data.obrasCount.toString()} icon={HardHat} color="blue" delay={0.1} />
          <StatCard title="Certificaciones" value={formatMoney(data.totalCertificaciones)} subtitle="Total emitido" icon={FileText} color="emerald" delay={0.2} />
          <StatCard title="Gastos Totales" value={formatMoney(data.totalGastos)} subtitle="Registrados" icon={TrendingUp} color="rose" delay={0.3} />
          <StatCard title="Trabajadores" value={data.trabajadoresCount.toString()} icon={Users} color="indigo" delay={0.4} />
        </motion.div>

        <motion.div variants={container} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={item} className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-blue-100 transition-colors">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-slate-800">Evolución de Gastos</h2>
              <Link href="/gastos" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group/link">
                Ver detalle <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="h-[320px] w-full">
              {data.chartData && data.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value}€`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [formatMoney(value), 'Gastos']}
                    />
                    <Area type="monotone" dataKey="gastos" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorGastos)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-gradient-to-b from-slate-50/50 to-slate-100/50 rounded-2xl border border-dashed border-slate-200/60">
                  <Activity size={32} className="mb-2 text-slate-300" />
                  <p className="text-sm font-medium">No hay datos suficientes para el gráfico.</p>
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div variants={item} className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-indigo-100 transition-colors flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Últimas Obras</h2>
              <Link href="/obras" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors">
                <Plus size={18} />
              </Link>
            </div>
            
            <div className="space-y-4 flex-1">
              {data.obrasDestacadas && data.obrasDestacadas.length > 0 ? (
                data.obrasDestacadas.map((obra: any, i: number) => (
                  <Link href={`/obras`} key={obra.id} className="flex items-center gap-4 p-4 hover:bg-white rounded-2xl transition-all cursor-pointer border border-transparent hover:border-slate-100 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] group/item">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 group-hover/item:text-blue-600 group-hover/item:bg-blue-50 group-hover/item:border-blue-100 transition-colors shadow-sm shrink-0">
                      <HardHat size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-sm text-slate-700 truncate mr-2">{obra.cliente}</p>
                        <span className="text-xs font-bold text-slate-400 whitespace-nowrap">{formatMoney(obra.presupuestoTotal)}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, 30 + i * 20)}%` }}
                          transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  No hay obras registradas
                </div>
              )}
            </div>
            
            {/* Gastos Distribution (Mini view) */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Distribución de Gastos</h3>
              <div className="space-y-3">
                {Object.entries(data.gastosPorTipo).map(([tipo, amount]: [string, any]) => (
                  <div key={tipo} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        tipo === 'PERSONAL' ? 'bg-green-500' : 
                        tipo === 'GENERAL' ? 'bg-purple-500' : 
                        tipo === 'MATERIALES' ? 'bg-blue-500' : 
                        'bg-orange-500'
                      }`} />
                      <span className="text-slate-600 capitalize">{tipo.toLowerCase()}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{formatMoney(amount)}</span>
                  </div>
                ))}
                {Object.keys(data.gastosPorTipo).length === 0 && (
                   <div className="text-center text-slate-400 text-xs">Sin gastos</div>
                )}
              </div>
            </div>
          </motion.div>
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
      className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all cursor-pointer relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientClasses} opacity-5 rounded-bl-[80px] transition-transform duration-500 group-hover:scale-150 group-hover:opacity-10`} />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-semibold text-slate-500 mb-2">{title}</p>
          <h3 className="text-3xl font-black tracking-tight text-slate-800">{value}</h3>
          {subtitle && <p className="text-xs font-medium text-slate-400 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl ${bg} ${text} ${border} shadow-sm border`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
}
