'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, FileCheck, Building, Hash, Loader2, Trash2, ArrowUpRight, CheckCircle2, Search, Edit2 } from 'lucide-react';
import { createCertification, updateCertification, deleteCertification, sendToOdoo } from './actions';

export default function CertificacionesClient({ initialCertificaciones, obras }: { initialCertificaciones: any[], obras: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isSendingOdoo, setIsSendingOdoo] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCertificaciones = initialCertificaciones.filter(cert => 
    (cert.concepto?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (cert.project?.direccion?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (cert.numero?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const openCreateModal = () => {
    setEditingCert(null);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cert: any) => {
    setEditingCert(cert);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar esta certificación?')) {
      setIsDeleting(id);
      await deleteCertification(id);
      setIsDeleting(null);
    }
  };

  const handleSendOdoo = async (id: number) => {
    setIsSendingOdoo(id);
    await sendToOdoo(id);
    setIsSendingOdoo(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      let result;
      if (editingCert && editingCert.id) {
        formData.append('id', editingCert.id.toString());
        result = await updateCertification(null, formData);
      } else {
        result = await createCertification(null, formData);
      }

      if (result.error) {
        setError(result.error);
      } else {
        setIsModalOpen(false);
      }
    });
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">Certificaciones</h1>
          <p className="text-slate-500 mt-1">Gestión y envío de certificaciones a Odoo</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:shadow-gargom-accent/30 hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Nueva Certificación</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Buscar por concepto, obra o número..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 shadow-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCertificaciones.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col relative group"
            >
              {/* Document Header Pattern */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-gargom-blue via-gargom-accent to-gargom-blue" />
              
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!cert.enviadaOdoo && (
                  <button onClick={() => openEditModal(cert)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-200 transition shadow-sm border border-slate-200" title="Editar">
                    <Edit2 size={16} />
                  </button>
                )}
                <button onClick={() => handleDelete(cert.id)} disabled={isDeleting === cert.id} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition shadow-sm border border-red-100">
                  {isDeleting === cert.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileCheck size={20} />
                </div>
                <div className="flex-1 pr-16">
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{cert.concepto}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Hash size={12} /> {cert.numero}
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-start gap-2">
                  <Building size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">{cert.project?.direccion || 'Obra Eliminada'}</span>
                </div>

                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Importe</span>
                  <span className="text-2xl font-bold text-gargom-blue">
                    {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cert.importe)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                {cert.enviadaOdoo ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-2.5 rounded-lg font-medium border border-green-100">
                    <CheckCircle2 size={18} />
                    <span>Enviado a Odoo</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleSendOdoo(cert.id)}
                    disabled={isSendingOdoo === cert.id}
                    className="w-full flex items-center justify-center gap-2 text-white bg-slate-800 hover:bg-black py-2.5 rounded-lg font-medium transition-colors shadow-md shadow-slate-800/20 disabled:opacity-70"
                  >
                    {isSendingOdoo === cert.id ? (
                      <><Loader2 size={18} className="animate-spin" /> Procesando...</>
                    ) : (
                      <><ArrowUpRight size={18} /> Sincronizar con Odoo</>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredCertificaciones.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-500 font-medium">No se han encontrado certificaciones.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-slate-100"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gargom-blue flex items-center gap-2">
                    <FileCheck size={24} className="text-gargom-accent" /> {editingCert ? 'Editar Certificación' : 'Nueva Certificación'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Obra Asociada *</label>
                    <select 
                      name="projectId" 
                      required
                      defaultValue={editingCert?.projectId || ''}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all text-slate-700"
                    >
                      <option value="">Selecciona una obra...</option>
                      {obras.map(o => (
                        <option key={o.id} value={o.id}>{o.direccion}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 ml-1">Número *</label>
                      <input
                        type="text"
                        name="numero"
                        required
                        defaultValue={editingCert?.numero}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all font-mono"
                        placeholder="CERT-001"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 ml-1">Importe (€) *</label>
                      <input
                        type="number"
                        name="importe"
                        step="0.01"
                        required
                        defaultValue={editingCert?.importe}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all font-bold text-gargom-accent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Concepto *</label>
                    <input
                      type="text"
                      name="concepto"
                      required
                      defaultValue={editingCert?.concepto}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all"
                      placeholder="Certificación fase 1"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-gargom-blue hover:bg-[#021033] text-white py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-gargom-blue/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>{editingCert ? 'Guardar Cambios' : 'Guardar Certificación'}</span>}
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
