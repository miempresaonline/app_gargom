'use client';

import { useActionState, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MapPin, User, FileText, Phone, Mail, HardHat, Pickaxe, Building, Loader2, Trash2, ArrowRight } from 'lucide-react';
import { createProject, deleteProject } from './actions';
import Link from 'next/link';

export default function ObrasClient({ initialObras }: { initialObras: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createProject, null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (state?.success) {
      setIsModalOpen(false);
    }
  }, [state]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta obra? Esto eliminará también todos sus gastos y certificaciones asociados.')) {
      setIsDeleting(id);
      await deleteProject(id);
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">Gestión de Obras</h1>
          <p className="text-slate-500 mt-1">Control de proyectos, presupuestos y ubicaciones</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:shadow-gargom-accent/30 hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Nueva Obra</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {initialObras.map((obra, index) => (
            <motion.div
              key={obra.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-3xl p-6 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:border-gargom-accent/20 hover:shadow-[0_8px_30px_rgba(20,93,255,0.1)] transition-all flex flex-col md:flex-row gap-6"
            >
              {/* Blueprint Decoration */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#0051ff 1px, transparent 1px), linear-gradient(90deg, #0051ff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              {/* Delete Button */}
              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleDelete(obra.id)} disabled={isDeleting === obra.id} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition">
                  {isDeleting === obra.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>

              {/* Left Column - Main Info */}
              <div className="flex-1 space-y-4 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gargom-blue/5 text-gargom-blue flex items-center justify-center shrink-0">
                    <Building size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gargom-blue line-clamp-2">{obra.direccion}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <User size={14} />
                      <span className="font-medium">{obra.cliente}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Presupuesto</div>
                    <div className="font-bold text-lg text-gargom-accent">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(obra.presupuestoTotal)}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-end">
                    <Link href={`/obras/${obra.id}`} className="flex items-center gap-1 text-sm font-medium text-gargom-blue hover:text-gargom-accent transition-colors bg-gargom-blue/5 px-3 py-1.5 rounded-lg">
                      Ver Detalles <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column - Tech Info */}
              <div className="w-full md:w-64 space-y-3 relative z-10 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex flex-col justify-center">
                
                {obra.arquitecto && (
                  <div className="flex items-center gap-3 text-sm">
                    <HardHat size={16} className="text-slate-400" />
                    <div className="flex-1 truncate">
                      <span className="text-xs text-slate-400 block leading-tight">Arquitecto</span>
                      <span className="font-medium text-slate-700">{obra.arquitecto}</span>
                    </div>
                  </div>
                )}
                
                {obra.aparejador && (
                  <div className="flex items-center gap-3 text-sm">
                    <Pickaxe size={16} className="text-slate-400" />
                    <div className="flex-1 truncate">
                      <span className="text-xs text-slate-400 block leading-tight">Aparejador</span>
                      <span className="font-medium text-slate-700">{obra.aparejador}</span>
                    </div>
                  </div>
                )}

                {(obra.telefono || obra.correo) && (
                  <div className="pt-2 mt-2 border-t border-slate-50 space-y-2">
                    {obra.telefono && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        <span>{obra.telefono}</span>
                      </div>
                    )}
                    {obra.correo && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        <span className="truncate">{obra.correo}</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gargom-blue flex items-center gap-2">
                    <Building size={24} className="text-gargom-accent" /> Nueva Obra
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form action={formAction} className="space-y-6">
                  {/* Required Fields */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Datos Principales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Cliente *</label>
                        <input
                          type="text"
                          name="cliente"
                          required
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all"
                          placeholder="Nombre del cliente"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Presupuesto Total (€) *</label>
                        <input
                          type="number"
                          name="presupuestoTotal"
                          step="0.01"
                          required
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Dirección de la obra *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <MapPin size={16} />
                          </div>
                          <input
                            type="text"
                            name="direccion"
                            required
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all"
                            placeholder="Ej. Calle Principal 123, Madrid"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Equipo Técnico</h3>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Arquitecto</label>
                        <input type="text" name="arquitecto" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all" placeholder="Nombre (Opcional)" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Aparejador</label>
                        <input type="text" name="aparejador" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all" placeholder="Nombre (Opcional)" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Contacto</h3>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Correo Electrónico</label>
                        <input type="email" name="correo" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all" placeholder="correo@ejemplo.com" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Teléfono</label>
                        <input type="tel" name="telefono" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all" placeholder="+34 600 000 000" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Observaciones</label>
                    <textarea 
                      name="observaciones" 
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all resize-none"
                      placeholder="Detalles adicionales..."
                    />
                  </div>

                  {state?.error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                      {state.error}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-gargom-blue hover:bg-[#021033] text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-gargom-blue/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>Crear Obra</span>}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
