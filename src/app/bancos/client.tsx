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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre_asc');

  useEffect(() => {
    if (state?.success) {
      setIsModalOpen(false);
    }
  }, [state]);

  const handleSaveEdit = async (id: number) => {
    setIsUpdating(true);
    const result = await updateBank(id, editNombre, editCuenta);
    if (result.error) {
      alert(result.error);
    } else {
      setEditingId(null);
    }
    setIsUpdating(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este banco?')) {
      setIsDeleting(id);
      await deleteBank(id);
      setIsDeleting(null);
    }
  };

  const filteredBancos = initialBancos.filter(banco => 
    banco.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banco.numeroCuenta.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'nombre_asc') return a.nombre.localeCompare(b.nombre);
    if (sortBy === 'nombre_desc') return b.nombre.localeCompare(a.nombre);
    return 0;
  });

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

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o cuenta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 shadow-sm"
          />
        </div>
        <div className="w-full md:w-64 shrink-0">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 shadow-sm font-medium text-slate-600"
          >
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="nombre_desc">Nombre (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredBancos.map((banco, index) => (
            <motion.div
              key={banco.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[24px] p-6 relative overflow-hidden group shadow-2xl shadow-slate-900/20 aspect-[1.6/1] flex flex-col justify-between"
            >
              {/* Card Decoratives */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gargom-accent/20 rounded-full -ml-10 -mb-10 blur-2xl" />
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {editingId === banco.id ? (
                  <button onClick={() => handleSaveEdit(banco.id)} disabled={isUpdating} className="p-2 bg-gargom-accent text-white rounded-lg hover:bg-blue-600 transition">
                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Landmark size={16} />}
                  </button>
                ) : (
                  <button onClick={() => { setEditingId(banco.id); setEditNombre(banco.nombre); setEditCuenta(banco.numeroCuenta); }} className="p-2 bg-white/10 backdrop-blur-md text-white rounded-lg shadow hover:bg-white/20 transition">
                    <Edit2 size={16} />
                  </button>
                )}
                <button onClick={() => handleDelete(banco.id)} disabled={isDeleting === banco.id} className="p-2 bg-white/10 backdrop-blur-md text-white rounded-lg shadow hover:bg-red-500/80 transition">
                  {isDeleting === banco.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>

              {/* Card Top */}
              <div className="flex items-start justify-between relative z-10">
                <div className="w-12 h-8 bg-yellow-400/80 rounded border border-yellow-300/50 flex items-center justify-center opacity-80 shadow-inner">
                  <div className="w-8 h-4 border border-yellow-600/30 rounded-sm grid grid-cols-3 gap-0.5">
                    <div className="border-r border-b border-yellow-600/20"></div>
                    <div className="border-r border-b border-yellow-600/20"></div>
                    <div className="border-b border-yellow-600/20"></div>
                  </div>
                </div>
                
                <div className="text-right">
                  {editingId === banco.id ? (
                    <input 
                      autoFocus
                      type="text" 
                      value={editNombre} 
                      onChange={e => setEditNombre(e.target.value)}
                      className="font-bold text-lg text-white border-b-2 border-white/50 focus:outline-none bg-transparent text-right w-full"
                    />
                  ) : (
                    <h3 className="font-bold text-xl tracking-wider uppercase opacity-90">{banco.nombre}</h3>
                  )}
                </div>
              </div>

              {/* Card Number (IBAN) */}
              <div className="relative z-10 mt-auto mb-6">
                {editingId === banco.id ? (
                  <input 
                    type="text" 
                    value={editCuenta} 
                    onChange={e => setEditCuenta(e.target.value)}
                    className="border-b border-white/50 focus:outline-none bg-transparent w-full font-mono text-xl tracking-widest uppercase"
                  />
                ) : (
                  <div className="font-mono text-lg md:text-xl tracking-[0.2em] uppercase text-white/90 drop-shadow-md">
                    {/* Format IBAN in groups of 4 if possible */}
                    {banco.numeroCuenta.replace(/(.{4})/g, '$1 ').trim()}
                  </div>
                )}
              </div>

              {/* Card Bottom */}
              <div className="flex items-end justify-between relative z-10 opacity-60 font-mono text-xs uppercase tracking-widest">
                <span>IBAN / CUENTA</span>
                <Landmark size={24} className="opacity-50" />
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
                        pattern="^ES\w{22}$"
                        minLength={24}
                        maxLength={24}
                        title="El IBAN debe empezar por ES y tener exactamente 24 caracteres en total sin espacios"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all font-mono"
                        placeholder="ESXXXXXXXXXXXXXXXXXXXXXX"
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
