'use client';

import { useActionState, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Package, Calendar, Landmark, HardHat, Pickaxe, Loader2, Trash2, Users, Copy, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { createGastoObra, deleteGastoObra } from './actions';

export default function ObraDetailClient({ 
  obra, bancos, trabajadores 
}: { 
  obra: any, bancos: any[], trabajadores: any[] 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('GENERAL');
  const [state, formAction, isPending] = useActionState(createGastoObra, null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [horas, setHoras] = useState<string>('');
  const [personalImporte, setPersonalImporte] = useState<number>(0);

  useEffect(() => {
    if (selectedWorkerId && horas) {
      const worker = trabajadores.find(w => w.id.toString() === selectedWorkerId);
      if (worker) {
        setPersonalImporte(worker.precioHora * parseFloat(horas));
      }
    } else {
      setPersonalImporte(0);
    }
  }, [selectedWorkerId, horas, trabajadores]);

  useEffect(() => {
    if (state?.success) {
      setIsModalOpen(false);
    }
  }, [state]);

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este gasto?')) {
      setIsDeleting(id);
      await deleteGastoObra(id, obra.id);
      setIsDeleting(null);
    }
  };

  const handleClone = async (gasto: any) => {
    setSelectedType(gasto.tipo);
    setIsModalOpen(true);
  };

  const totalGastos = obra.expenses.reduce((acc: number, curr: any) => acc + (curr.importe || 0), 0);
  const rentabilidad = obra.presupuestoTotal - totalGastos;
  const porcentajeGastado = obra.presupuestoTotal > 0 ? (totalGastos / obra.presupuestoTotal) * 100 : 0;

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <Link href="/obras" className="text-gargom-accent hover:text-blue-700 flex items-center gap-1 text-sm font-medium transition-colors mb-2">
            <ArrowLeft size={16} /> Volver a Obras
          </Link>
          <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">{obra.direccion}</h1>
          <div className="flex items-center gap-2 text-slate-500">
            <Users size={16} /> <span className="font-medium">{obra.cliente}</span>
          </div>
        </div>
        <button
          onClick={() => { setSelectedType('GENERAL'); setIsModalOpen(true); }}
          className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:-translate-y-0.5 shrink-0"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Añadir Gasto a la Obra</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">Presupuesto Total</p>
          <p className="text-3xl font-bold text-gargom-blue">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(obra.presupuestoTotal)}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">Total Gastos</p>
          <p className="text-3xl font-bold text-orange-500">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalGastos)}
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${Math.min(porcentajeGastado, 100)}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">Rentabilidad Estimada</p>
          <p className={`text-3xl font-bold ${rentabilidad >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(rentabilidad)}
          </p>
        </div>
      </div>

      {/* Info extra */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cliente Info */}
        <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
            <User size={14} /> Cliente
          </h4>
          <p className="font-bold text-slate-800">{obra.cliente}</p>
          {obra.clienteTelefono && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone size={14} className="text-slate-400" /> {obra.clienteTelefono}
            </div>
          )}
          {obra.clienteCorreo && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail size={14} className="text-slate-400" /> <span className="truncate">{obra.clienteCorreo}</span>
            </div>
          )}
        </div>

        {/* Arquitecto Info */}
        {(obra.arquitecto || obra.arquitectoTelefono || obra.arquitectoCorreo) && (
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
              <HardHat size={14} /> Arquitecto
            </h4>
            <p className="font-bold text-slate-800">{obra.arquitecto || 'No especificado'}</p>
            {obra.arquitectoTelefono && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400" /> {obra.arquitectoTelefono}
              </div>
            )}
            {obra.arquitectoCorreo && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="text-slate-400" /> <span className="truncate">{obra.arquitectoCorreo}</span>
              </div>
            )}
          </div>
        )}

        {/* Aparejador Info */}
        {(obra.aparejador || obra.aparejadorTelefono || obra.aparejadorCorreo) && (
          <div className="bg-white p-4 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-2">
              <Pickaxe size={14} /> Aparejador
            </h4>
            <p className="font-bold text-slate-800">{obra.aparejador || 'No especificado'}</p>
            {obra.aparejadorTelefono && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone size={14} className="text-slate-400" /> {obra.aparejadorTelefono}
              </div>
            )}
            {obra.aparejadorCorreo && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="text-slate-400" /> <span className="truncate">{obra.aparejadorCorreo}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Gastos List */}
      <div>
        <h2 className="text-xl font-bold text-gargom-blue mb-4 flex items-center gap-2">
          <Package size={20} /> Historial de Gastos
        </h2>
        {obra.expenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Package size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No hay gastos registrados en esta obra.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {obra.expenses.map((gasto: any, index: number) => (
                <motion.div
                  key={gasto.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-4 relative overflow-hidden group shadow-sm border border-slate-100 flex gap-4 hover:border-gargom-accent/30 transition-colors"
                >
                  <div className={`w-1.5 h-full absolute left-0 top-0 ${gasto.tipo === 'GENERAL' ? 'bg-purple-500' : gasto.tipo === 'PERSONAL' ? 'bg-green-500' : 'bg-orange-500'}`} />

                  <div className="flex-1 pl-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          gasto.tipo === 'GENERAL' ? 'bg-purple-100 text-purple-700' :
                          gasto.tipo === 'PERSONAL' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {gasto.tipo}
                        </span>
                        <h3 className="font-bold text-slate-800 mt-1 leading-tight text-sm">
                          {gasto.concepto || (gasto.tipo === 'PERSONAL' ? `Horas: ${gasto.worker?.nombre}` : `Factura ${gasto.numero}`)}
                        </h3>
                      </div>
                      <div className="font-bold text-gargom-blue">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(gasto.importe || 0)}
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                      {gasto.fecha && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(gasto.fecha).toLocaleDateString('es-ES')}</span>
                        </div>
                      )}
                      {gasto.tipo === 'PERSONAL' && gasto.horas && (
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span>{gasto.horas} horas</span>
                        </div>
                      )}
                      {['INDUSTRIAL', 'MATERIALES', 'SERVICIOS'].includes(gasto.tipo) && gasto.bank && (
                        <div className="flex items-center gap-1">
                          <Landmark size={12} />
                          <span className="truncate">{gasto.bank.nombre}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {gasto.tipo === 'PERSONAL' && (
                      <button onClick={() => handleClone(gasto)} className="p-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition shadow-sm border border-slate-200" title="Clonar Gasto">
                        <Copy size={14} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(gasto.id)} disabled={isDeleting === gasto.id} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition shadow-sm border border-red-100" title="Eliminar Gasto">
                      {isDeleting === gasto.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modal Añadir Gasto */}
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gargom-blue flex items-center gap-2">
                    <Package size={24} className="text-gargom-accent" /> Registrar Gasto
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form action={formAction} className="space-y-6">
                  <input type="hidden" name="projectId" value={obra.id} />
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Tipo de Gasto *</label>
                    <select 
                      name="tipo" 
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all font-medium text-slate-700"
                    >
                      <option value="GENERAL">General</option>
                      <option value="INDUSTRIAL">Industrial</option>
                      <option value="MATERIALES">Materiales</option>
                      <option value="SERVICIOS">Servicios</option>
                      <option value="PERSONAL">Personal</option>
                    </select>
                  </div>

                  {/* Conditional Fields based on Type */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    {selectedType === 'GENERAL' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Concepto *</label>
                          <input type="text" name="concepto" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Ej. Material de oficina" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Importe (€) *</label>
                          <input type="number" name="importe" step="0.01" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="0.00" />
                        </div>
                      </div>
                    )}

                    {['INDUSTRIAL', 'MATERIALES', 'SERVICIOS'].includes(selectedType) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Número de Factura</label>
                          <input type="text" name="numero" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="F-2024-001" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Importe (€) *</label>
                          <input type="number" name="importe" step="0.01" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Factura</label>
                          <input type="date" name="fecha" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Vencimiento</label>
                          <input type="date" name="fechaVencimiento" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Banco Asociado</label>
                          <select name="bankId" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
                            <option value="">Selecciona un banco...</option>
                            {bancos.map(b => (
                              <option key={b.id} value={b.id}>{b.nombre} - {b.numeroCuenta}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {selectedType === 'PERSONAL' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha (Día)</label>
                          <input type="date" name="fecha" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Trabajador *</label>
                          <select 
                            name="workerId" 
                            required
                            value={selectedWorkerId}
                            onChange={(e) => setSelectedWorkerId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl"
                          >
                            <option value="">Selecciona un trabajador...</option>
                            {trabajadores.map(t => (
                              <option key={t.id} value={t.id}>{t.nombre} ({t.cargo}) - {t.precioHora}€/h</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Horas Trabajadas *</label>
                          <input 
                            type="number" 
                            name="horas" 
                            step="0.5" 
                            required 
                            value={horas}
                            onChange={(e) => setHoras(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" 
                            placeholder="Ej. 8" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Importe Calculado (€)</label>
                          <input 
                            type="number" 
                            name="importe" 
                            value={personalImporte} 
                            readOnly 
                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-gargom-accent" 
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Observaciones</label>
                          <input type="text" name="observaciones" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Detalles de la jornada..." />
                        </div>
                      </div>
                    )}
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
                      {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>Guardar Gasto</span>}
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
