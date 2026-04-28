import { LayoutDashboard, TrendingUp, HardHat, FileText, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gargom-blue">Panel de Control</h1>
          <p className="text-gargom-muted mt-1">Bienvenido al sistema ERP de Construcciones Gargom.</p>
        </div>
        <button className="bg-gargom-blue hover:bg-gargom-accent text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2">
          <Activity size={18} />
          <span>Generar Reporte</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Obras Activas" value="12" icon={HardHat} color="bg-sky-100 text-sky-700" />
        <StatCard title="Certificaciones (Mes)" value="45.200 €" icon={FileText} color="bg-emerald-100 text-emerald-700" />
        <StatCard title="Gastos Pendientes" value="3.150 €" icon={TrendingUp} color="bg-rose-100 text-rose-700" />
        <StatCard title="Trabajadores" value="28" icon={LayoutDashboard} color="bg-indigo-100 text-indigo-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gargom-card border border-gargom-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-gargom-blue">Últimos Gastos Registrados</h2>
          <div className="h-[300px] flex flex-col items-center justify-center text-gargom-muted bg-slate-50/50 rounded-xl border border-dashed border-slate-200 gap-3">
            <TrendingUp size={40} className="text-slate-300" />
            <p className="text-sm">El gráfico de gastos se conectará con la Base de Datos pronto.</p>
          </div>
        </div>
        
        <div className="bg-gargom-card border border-gargom-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-6 text-gargom-blue">Obras Destacadas</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-gargom-blue">
                  <HardHat size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gargom-text">Residencial Fase {i}</p>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gargom-accent h-full rounded-full" style={{ width: `${Math.random() * 60 + 30}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-gargom-card border border-gargom-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gargom-muted mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-gargom-blue group-hover:text-gargom-accent transition-colors">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
