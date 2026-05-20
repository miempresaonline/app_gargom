'use client';

import { useActionState, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Building2, Mail, Loader2, Edit2, Trash2 } from 'lucide-react';
import { createSupplier, updateSupplier, deleteSupplier } from './actions';

export default function ProveedoresClient({ initialProveedores }: { initialProveedores: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createSupplier, null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCorreo, setEditCorreo] = useState('');
  const [editCif, setEditCif] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
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
    const result = await updateSupplier(id, editNombre, editCorreo, editCif, editTelefono);
    if (result.error) {
      alert(result.error);
    }
    setIsUpdating(false);
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este proveedor?')) {
      setIsDeleting(id);
      await deleteSupplier(id);
      setIsDeleting(null);
    }
  };

  const filteredProveedores = initialProveedores.filter(proveedor => 
    proveedor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (proveedor.correo && proveedor.correo.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">Proveedores</h1>
          <p className="text-slate-500 mt-1">Gestiona tus proveedores y sus contactos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:shadow-gargom-accent/30 hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Nuevo Proveedor</span>
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
            placeholder="Buscar por nombre o correo..."
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
          {filteredProveedores.map((proveedor, index) => (
            <motion.div
              key={proveedor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#fdfbf7] border-l-8 border-gargom-blue shadow-md hover:shadow-xl rounded-r-2xl rounded-l-md p-6 relative overflow-hidden group transition-all"
            >
              {/* Paper Texture / Watermark */}
              <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {editingId === proveedor.id ? (
                  <button onClick={() => handleSaveEdit(proveedor.id)} disabled={isUpdating} className="p-2 bg-gargom-accent text-white rounded-lg hover:bg-blue-600 transition">
                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />}
                  </button>
                ) : (
                  <button onClick={() => { 
                    setEditingId(proveedor.id); 
                    setEditNombre(proveedor.nombre); 
                    setEditCorreo(proveedor.correo || ''); 
                    setEditCif(proveedor.cif || '');
                    setEditTelefono(proveedor.telefono || '');
                  }} className="p-2 bg-white text-slate-500 rounded-lg shadow hover:text-gargom-accent transition border border-slate-200">
                    <Edit2 size={16} />
                  </button>
                )}
                <button onClick={() => handleDelete(proveedor.id)} disabled={isDeleting === proveedor.id} className="p-2 bg-white text-slate-500 rounded-lg shadow hover:text-red-500 transition border border-slate-200">
                  {isDeleting === proveedor.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>

              <div className="flex flex-col h-full relative z-10 space-y-6">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gargom-blue/10 text-gargom-blue flex items-center justify-center font-bold text-xl mb-4">
                    <Building2 size={24} />
                  </div>
                  {editingId === proveedor.id ? (
                    <input 
                      autoFocus
                      type="text" 
                      value={editNombre} 
                      onChange={e => setEditNombre(e.target.value)}
                      className="font-bold text-xl text-gargom-blue border-b-2 border-gargom-accent focus:outline-none bg-transparent w-full uppercase tracking-wide"
                    />
                  ) : (
                    <h3 className="font-bold text-xl text-gargom-blue truncate uppercase tracking-wide">{proveedor.nombre}</h3>
                  )}
                  <div className="h-px w-12 bg-gargom-accent mt-2"></div>
                </div>

                <div className="mt-auto space-y-2">
                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <span className="font-bold text-slate-400 w-16 text-xs uppercase">CIF</span>
                    {editingId === proveedor.id ? (
                      <input 
                        type="text" 
                        required
                        value={editCif} 
                        onChange={e => setEditCif(e.target.value)}
                        className="border-b border-gargom-accent focus:outline-none bg-transparent w-full"
                      />
                    ) : (
                      <span className="truncate font-medium">{proveedor.cif || 'No especificado'}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <span className="font-bold text-slate-400 w-16 text-xs uppercase">Tlf</span>
                    {editingId === proveedor.id ? (
                      <input 
                        type="tel" 
                        required
                        value={editTelefono} 
                        onChange={e => setEditTelefono(e.target.value)}
                        className="border-b border-gargom-accent focus:outline-none bg-transparent w-full"
                      />
                    ) : (
                      <span className="truncate font-medium">{proveedor.telefono || 'No especificado'}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <Mail size={16} className="text-gargom-accent flex-shrink-0" />
                    {editingId === proveedor.id ? (
                      <input 
                        type="email" 
                        value={editCorreo} 
                        onChange={e => setEditCorreo(e.target.value)}
                        className="border-b border-gargom-accent focus:outline-none bg-transparent w-full"
                      />
                    ) : (
                      <span className="truncate font-medium">{proveedor.correo || 'Sin correo registrado'}</span>
                    )}
                  </div>
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
                  <h2 className="text-2xl font-bold text-gargom-blue">Añadir Proveedor</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form action={formAction} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">Nombre del proveedor</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Building2 size={18} />
                      </div>
                      <input
                        type="text"
                        name="nombre"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all"
                        placeholder="Ej. Suministros López"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 ml-1">CIF / NIF *</label>
                      <input
                        type="text"
                        name="cif"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all"
                        placeholder="Ej. B12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 ml-1">Teléfono *</label>
                      <input
                        type="tel"
                        name="telefono"
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all"
                        placeholder="Ej. +34 600 000 000"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 ml-1">Correo electrónico (Opcional)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        name="correo"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all"
                        placeholder="contacto@proveedor.es"
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
                      {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>Añadir Proveedor</span>}
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
