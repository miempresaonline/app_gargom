'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MapPin, User, Phone, Mail, HardHat, Pickaxe, Building, Loader2, Trash2, ArrowRight, Search, Edit2, Archive } from 'lucide-react';
import { createProject, updateProject, archiveProject } from './actions';
import Link from 'next/link';

export default function ObrasClient({ initialObras }: { initialObras: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isArchiving, setIsArchiving] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recientes');
  
  // Dynamic clients state
  const [clients, setClients] = useState<any[]>([]);

  // Filter out archived projects
  const activeObras = initialObras.filter(o => o.estado !== 'ARCHIVADA');

  const filteredObras = activeObras.filter(obra => 
    obra.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obra.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'recientes') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'antiguas') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'presupuesto_desc') return (b.presupuestoTotal + b.presupuestoAdicional) - (a.presupuestoTotal + a.presupuestoAdicional);
    if (sortBy === 'presupuesto_asc') return (a.presupuestoTotal + a.presupuestoAdicional) - (b.presupuestoTotal + b.presupuestoAdicional);
    return 0;
  });

  const openCreateModal = () => {
    setEditingObra(null);
    setClients([]);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (obra: any) => {
    setEditingObra(obra);
    setClients(obra.clients || []);
    setError(null);
    setIsModalOpen(true);
  };

  const handleArchive = async (id: number) => {
    if (confirm('¿Seguro que deseas archivar esta obra? No aparecerá en la lista activa.')) {
      setIsArchiving(id);
      await archiveProject(id);
      setIsArchiving(null);
    }
  };

  const addClient = () => {
    setClients([...clients, { nombre: '', cif: '', direccion: '' }]);
  };

  const removeClient = (index: number) => {
    const newClients = [...clients];
    newClients.splice(index, 1);
    setClients(newClients);
  };

  const updateClient = (index: number, field: string, value: string) => {
    const newClients = [...clients];
    newClients[index] = { ...newClients[index], [field]: value };
    setClients(newClients);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append('clientsJSON', JSON.stringify(clients));
    
    startTransition(async () => {
      let result;
      if (editingObra) {
        formData.append('id', editingObra.id.toString());
        result = await updateProject(null, formData);
      } else {
        result = await createProject(null, formData);
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
          <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">Gestión de Obras</h1>
          <p className="text-slate-500 mt-1">Control de proyectos, presupuestos y ubicaciones</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Nueva Obra</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar por cliente o dirección..."
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
            <option value="recientes">Más recientes</option>
            <option value="antiguas">Más antiguas</option>
            <option value="presupuesto_desc">Mayor presupuesto</option>
            <option value="presupuesto_asc">Menor presupuesto</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredObras.map((obra, index) => (
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
              
              {/* Actions */}
              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(obra)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-200 transition">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleArchive(obra.id)} disabled={isArchiving === obra.id} className="p-2 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 transition" title="Archivar Obra">
                  {isArchiving === obra.id ? <Loader2 size={16} className="animate-spin" /> : <Archive size={16} />}
                </button>
              </div>

              {/* Left Column - Main Info */}
              <div className="flex-1 space-y-4 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gargom-blue/5 text-gargom-blue flex items-center justify-center shrink-0">
                    <Building size={24} />
                  </div>
                  <div className="pr-12">
                    <h3 className="font-bold text-xl text-gargom-blue line-clamp-2">{obra.direccion}</h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <User size={14} />
                      <span className="font-medium truncate">{obra.clients?.length > 0 ? obra.clients.map((c:any)=>c.nombre).join(', ') : obra.cliente}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Presupuesto Total</div>
                    <div className="font-bold text-lg text-gargom-accent">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(obra.presupuestoTotal + obra.presupuestoAdicional)}
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
                      <span className="font-medium text-slate-700 truncate block">{obra.arquitecto}</span>
                    </div>
                  </div>
                )}
                
                {obra.aparejador && (
                  <div className="flex items-center gap-3 text-sm">
                    <Pickaxe size={16} className="text-slate-400" />
                    <div className="flex-1 truncate">
                      <span className="text-xs text-slate-400 block leading-tight">Aparejador</span>
                      <span className="font-medium text-slate-700 truncate block">{obra.aparejador}</span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredObras.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-500 font-medium">No se han encontrado obras activas.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl relative z-10 overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gargom-blue flex items-center gap-2">
                    <Building size={24} className="text-gargom-accent" /> {editingObra ? 'Editar Obra' : 'Nueva Obra'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Obra Basic Info */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <MapPin size={16} /> Datos de la Obra
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700 ml-1">Dirección de la obra *</label>
                        <input
                          type="text"
                          name="direccion"
                          required
                          defaultValue={editingObra?.direccion}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all"
                          placeholder="Ej. Calle Principal 123, Madrid"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Presupuesto Inicial (€) *</label>
                        <input
                          type="number"
                          name="presupuestoTotal"
                          step="0.01"
                          required
                          defaultValue={editingObra?.presupuestoTotal}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Presupuesto Adicional (€)</label>
                        <input
                          type="number"
                          name="presupuestoAdicional"
                          step="0.01"
                          defaultValue={editingObra?.presupuestoAdicional || 0}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">% Impuesto</label>
                        <input
                          type="number"
                          name="porcentajeImpuesto"
                          step="0.1"
                          defaultValue={editingObra?.porcentajeImpuesto ?? 10}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all"
                          placeholder="10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Clients List */}
                  <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                        <User size={16} /> Clientes (Datos de Facturación)
                      </h3>
                      <button type="button" onClick={addClient} className="text-xs bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 font-medium">
                        + Añadir Cliente
                      </button>
                    </div>
                    
                    {clients.length === 0 && (
                      <p className="text-sm text-slate-500">No hay clientes específicos añadidos. Usa el botón superior para añadir uno o más.</p>
                    )}

                    {clients.map((client, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-blue-100 relative pr-10">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600 ml-1">Nombre *</label>
                          <input type="text" required value={client.nombre} onChange={e => updateClient(index, 'nombre', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg" placeholder="Nombre completo" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600 ml-1">CIF</label>
                          <input type="text" value={client.cif || ''} onChange={e => updateClient(index, 'cif', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg" placeholder="CIF/NIF" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600 ml-1">Dirección</label>
                          <input type="text" value={client.direccion || ''} onChange={e => updateClient(index, 'direccion', e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg" placeholder="Dirección de facturación" />
                        </div>
                        <button type="button" onClick={() => removeClient(index)} className="absolute right-2 top-2 p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Arquitecto */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <HardHat size={16} /> Arquitecto
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600 ml-1">Nombre</label>
                          <input type="text" name="arquitecto" defaultValue={editingObra?.arquitecto} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg" placeholder="Nombre del Arquitecto" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600 ml-1">Teléfono</label>
                          <input type="tel" name="arquitectoTelefono" defaultValue={editingObra?.arquitectoTelefono} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg" placeholder="Teléfono" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600 ml-1">Correo Electrónico</label>
                          <input type="email" name="arquitectoCorreo" defaultValue={editingObra?.arquitectoCorreo} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg" placeholder="Correo" />
                        </div>
                      </div>
                    </div>

                    {/* Aparejador */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Pickaxe size={16} /> Aparejador
                      </h3>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600 ml-1">Nombre</label>
                          <input type="text" name="aparejador" defaultValue={editingObra?.aparejador} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg" placeholder="Nombre del Aparejador" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600 ml-1">Teléfono</label>
                          <input type="tel" name="aparejadorTelefono" defaultValue={editingObra?.aparejadorTelefono} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg" placeholder="Teléfono" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-600 ml-1">Correo Electrónico</label>
                          <input type="email" name="aparejadorCorreo" defaultValue={editingObra?.aparejadorCorreo} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg" placeholder="Correo" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Observaciones / Detalles Técnicos</label>
                    <textarea 
                      name="observaciones" 
                      rows={3}
                      defaultValue={editingObra?.observaciones}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all resize-none"
                      placeholder="Anota aquí cualquier detalle extra sobre la obra..."
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white pb-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="bg-gargom-blue hover:bg-[#021033] text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-gargom-blue/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>{editingObra ? 'Guardar Cambios' : 'Crear Obra'}</span>}
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
