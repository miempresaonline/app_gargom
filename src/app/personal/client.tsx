'use client';

import { useActionState, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, User, Briefcase, DollarSign, Loader2, Edit2, Trash2 } from 'lucide-react';
import { createWorker, updateWorker, deleteWorker } from './actions';

export default function PersonalClient({ initialWorkers }: { initialWorkers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createWorker, null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCargo, setEditCargo] = useState('');
  const [editPrecioHora, setEditPrecioHora] = useState<number>(0);
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
    await updateWorker(id, editNombre, editCargo, editPrecioHora);
    setIsUpdating(false);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este trabajador?')) {
      setIsDeleting(id);
      await deleteWorker(id);
      setIsDeleting(null);
    }
  };

  const filteredWorkers = initialWorkers.filter(worker => 
    worker.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'nombre_asc') return a.nombre.localeCompare(b.nombre);
    if (sortBy === 'nombre_desc') return b.nombre.localeCompare(a.nombre);
    if (sortBy === 'precio_desc') return b.precioHora - a.precioHora;
    if (sortBy === 'precio_asc') return a.precioHora - b.precioHora;
    return 0;
  });

  return (
    <div className="p-6 md:p-8 w-full max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">Personal</h1>
          <p className="text-slate-500 mt-1">Gestiona los trabajadores y sus tarifas</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:shadow-gargom-accent/30 hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Nuevo Trabajador</span>
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
            placeholder="Buscar por nombre o cargo..."
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
            <option value="precio_desc">Mayor tarifa</option>
            <option value="precio_asc">Menor tarifa</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredWorkers.map((worker, index) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-[20px] shadow-xl shadow-slate-200/50 overflow-hidden relative group border border-slate-100 flex flex-col"
            >
              {/* Badge Clip Hole */}
              <div className="absolute top-0 inset-x-0 flex justify-center mt-3 z-20">
                <div className="w-16 h-3 bg-slate-100 rounded-full shadow-inner border border-slate-200/50"></div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-8 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {editingId === worker.id ? (
                  <button onClick={() => handleSaveEdit(worker.id)} disabled={isUpdating} className="p-2 bg-gargom-accent text-white rounded-full hover:bg-blue-600 transition shadow-lg">
                    {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <User size={14} />}
                  </button>
                ) : (
                  <button onClick={() => { setEditingId(worker.id); setEditNombre(worker.nombre); setEditCargo(worker.cargo); setEditPrecioHora(worker.precioHora); }} className="p-2 bg-white text-slate-500 rounded-full shadow-lg border border-slate-100 hover:text-gargom-accent transition">
                    <Edit2 size={14} />
                  </button>
                )}
                <button onClick={() => handleDelete(worker.id)} disabled={isDeleting === worker.id} className="p-2 bg-white text-slate-500 rounded-full shadow-lg border border-slate-100 hover:text-red-500 transition">
                  {isDeleting === worker.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>

              {/* Card Header Profile */}
              <div className="bg-gradient-to-b from-gargom-blue to-[#0a1e4a] pt-12 pb-6 px-4 flex flex-col items-center relative text-center">
                <div className="w-20 h-20 bg-white p-1 rounded-full shadow-lg mb-3">
                  <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-gargom-blue font-bold text-3xl overflow-hidden relative">
                    {worker.nombre.charAt(0).toUpperCase()}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent"></div>
                  </div>
                </div>
                
                {editingId === worker.id ? (
                  <input 
                    autoFocus
                    type="text" 
                    value={editNombre} 
                    onChange={e => setEditNombre(e.target.value)}
                    className="font-bold text-lg text-white border-b-2 border-white/50 focus:outline-none bg-transparent text-center w-full"
                  />
                ) : (
                  <h3 className="font-bold text-lg text-white truncate w-full px-2">{worker.nombre}</h3>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col items-center justify-center space-y-4 bg-slate-50">
                <div className="text-center w-full">
                  <span className="text-xs font-bold tracking-widest text-slate-400 uppercase block mb-1">Cargo</span>
                  {editingId === worker.id ? (
                    <input 
                      type="text" 
                      value={editCargo} 
                      onChange={e => setEditCargo(e.target.value)}
                      className="border-b border-slate-300 focus:outline-none bg-transparent w-full text-center font-medium text-slate-700"
                    />
                  ) : (
                    <div className="font-semibold text-slate-700 truncate px-2">{worker.cargo}</div>
                  )}
                </div>

                <div className="w-8 h-px bg-slate-200"></div>

                <div className="text-center w-full">
                  <span className="text-xs font-bold tracking-widest text-slate-400 uppercase block mb-1">Tarifa</span>
                  {editingId === worker.id ? (
                    <div className="flex items-center justify-center text-slate-700 font-medium">
                      <input 
                        type="number" 
                        step="0.01"
                        value={editPrecioHora} 
                        onChange={e => setEditPrecioHora(parseFloat(e.target.value))}
                        className="border-b border-slate-300 focus:outline-none bg-transparent w-16 text-center"
                      />
                      <span className="ml-1 text-sm text-slate-500">€/h</span>
                    </div>
                  ) : (
                    <div className="font-bold text-gargom-accent text-lg">{worker.precioHora.toFixed(2)} €<span className="text-xs text-slate-400 font-normal">/h</span></div>
                  )}
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="h-10 bg-white border-t border-slate-100 flex items-center justify-center gap-1 opacity-20 overflow-hidden px-4">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="bg-slate-800 h-6" style={{ width: `${Math.random() * 4 + 1}px` }}></div>
                ))}
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
                  <h2 className="text-2xl font-bold text-gargom-blue">Añadir Trabajador</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form action={formAction} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">Nombre completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="nombre"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all"
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">Cargo / Especialidad</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Briefcase size={18} />
                      </div>
                      <input
                        type="text"
                        name="cargo"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all"
                        placeholder="Ej. Peón Especialista"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">Precio por hora (€)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <DollarSign size={18} />
                      </div>
                      <input
                        type="number"
                        name="precioHora"
                        step="0.01"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all"
                        placeholder="0.00"
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
                      {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>Añadir Trabajador</span>}
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
