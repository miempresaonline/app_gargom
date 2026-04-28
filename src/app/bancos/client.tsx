'use client';

import { useActionState, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Landmark, Hash, Loader2, Edit2, Trash2 } from 'lucide-react';
import { createBank, updateBank, deleteBank } from './actions';

export default function BancosClient({ initialBancos }: { initialBancos: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createBank, null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCuenta, setEditCuenta] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (state?.success) {
      setIsModalOpen(false);
    }
  }, [state]);

  const handleSaveEdit = async (id: number) => {
    setIsUpdating(true);
    await updateBank(id, editNombre, editCuenta);
    setIsUpdating(false);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este banco?')) {
      setIsDeleting(id);
      await deleteBank(id);
      setIsDeleting(null);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">Bancos</h1>
          <p className="text-slate-500 mt-1">Gestiona las cuentas bancarias</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:shadow-gargom-accent/30 hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Añadir Banco</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {initialBancos.map((banco, index) => (
            <motion.div
              key={banco.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-gargom-blue/5 rounded-3xl p-6 relative overflow-hidden group hover:border-gargom-accent/30 transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gargom-blue/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {editingId === banco.id ? (
                  <button onClick={() => handleSaveEdit(banco.id)} disabled={isUpdating} className="p-2 bg-gargom-accent text-white rounded-lg hover:bg-blue-600 transition">
                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Landmark size={16} />}
                  </button>
                ) : (
                  <button onClick={() => { setEditingId(banco.id); setEditNombre(banco.nombre); setEditCuenta(banco.numeroCuenta); }} className="p-2 bg-white text-slate-500 rounded-lg shadow hover:text-gargom-accent transition">
                    <Edit2 size={16} />
                  </button>
                )}
                <button onClick={() => handleDelete(banco.id)} disabled={isDeleting === banco.id} className="p-2 bg-white text-slate-500 rounded-lg shadow hover:text-red-500 transition">
                  {isDeleting === banco.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gargom-blue to-gargom-accent flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {banco.nombre.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 pr-10">
                  {editingId === banco.id ? (
                    <input 
                      autoFocus
                      type="text" 
                      value={editNombre} 
                      onChange={e => setEditNombre(e.target.value)}
                      className="font-bold text-lg text-gargom-blue border-b-2 border-gargom-accent focus:outline-none bg-transparent w-full"
                    />
                  ) : (
                    <h3 className="font-bold text-lg text-gargom-blue truncate">{banco.nombre}</h3>
                  )}
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Hash size={16} className="text-slate-400" />
                  {editingId === banco.id ? (
                    <input 
                      type="text" 
                      value={editCuenta} 
                      onChange={e => setEditCuenta(e.target.value)}
                      className="border-b border-gargom-accent focus:outline-none bg-transparent w-full font-mono"
                    />
                  ) : (
                    <span className="truncate font-mono font-medium">{banco.numeroCuenta}</span>
                  )}
                </div>
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-100"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gargom-blue">Añadir Banco</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form action={formAction} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">Nombre del Banco</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Landmark size={18} />
                      </div>
                      <input
                        type="text"
                        name="nombre"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all"
                        placeholder="Ej. Santander"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">Número de cuenta / IBAN</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Hash size={18} />
                      </div>
                      <input
                        type="text"
                        name="numeroCuenta"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all font-mono"
                        placeholder="ESXX XXXX XXXX XX XXXXXXXXXX"
                      />
                    </div>
                  </div>

                  {state?.error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                      {state.error}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full bg-gargom-blue hover:bg-[#021033] text-white py-3.5 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-gargom-blue/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>Añadir Banco</span>}
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
