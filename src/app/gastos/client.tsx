'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Package, FileText, Calendar, Building, Landmark, Pickaxe, HardHat, FileUp, Loader2, Trash2, Users, Copy, Search, Edit2 } from 'lucide-react';
import { createGasto, updateGasto, deleteGasto, parseInvoiceWithGroq } from './actions';

export default function GastosClient({ 
  initialGastos, obras, bancos, trabajadores 
}: { 
  initialGastos: any[], obras: any[], bancos: any[], trabajadores: any[] 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('GENERAL');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  
  // AI Parsing
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const result = await parseInvoiceWithGroq(base64Data);
        if (result.error) {
          setError(result.error);
        } else if (result.success && result.data) {
          // Fill form via state editingGasto
          setEditingGasto((prev: any) => ({
             ...prev,
             concepto: result.data.concepto || prev?.concepto || '',
             numero: result.data.numero || prev?.numero || '',
             importe: result.data.importe || prev?.importe || '',
             fecha: result.data.fecha ? new Date(result.data.fecha).toISOString() : prev?.fecha,
             fechaVencimiento: result.data.fechaVencimiento ? new Date(result.data.fechaVencimiento).toISOString() : prev?.fechaVencimiento
          }));
        }
        setIsAnalyzing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error al procesar el archivo localmente');
      setIsAnalyzing(false);
    }
  };

  // Form state for Personal auto-calculation
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

  const filteredGastos = initialGastos.filter(gasto => {
    const matchesSearch = 
      (gasto.concepto?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (gasto.project?.cliente?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (gasto.numero?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || gasto.tipo === filterType;
    return matchesSearch && matchesType;
  });

  const openCreateModal = () => {
    setEditingGasto(null);
    setSelectedType('GENERAL');
    setSelectedWorkerId('');
    setHoras('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (gasto: any) => {
    setEditingGasto(gasto);
    setSelectedType(gasto.tipo);
    if (gasto.tipo === 'PERSONAL') {
      setSelectedWorkerId(gasto.workerId?.toString() || '');
      setHoras(gasto.horas?.toString() || '');
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handleClone = (gasto: any) => {
    setEditingGasto(null); // It's a new one based on old
    setSelectedType(gasto.tipo);
    if (gasto.tipo === 'PERSONAL') {
      setSelectedWorkerId(gasto.workerId?.toString() || '');
      setHoras(gasto.horas?.toString() || '');
    }
    setError(null);
    setIsModalOpen(true);
    // Note: To perfectly prefill other fields in a non-controlled form when cloning,
    // we'd need to either make the form controlled or use defaultValue cleverly.
    // For now we set editingGasto to a "clone" mode object.
    setEditingGasto({ ...gasto, id: undefined }); 
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este gasto?')) {
      setIsDeleting(id);
      await deleteGasto(id);
      setIsDeleting(null);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    // Si es tipo PERSONAL, el importe está deshabilitado en el form o es readOnly,
    // nos aseguramos de enviarlo calculándolo o habilitándolo.
    if (selectedType === 'PERSONAL') {
      formData.set('importe', personalImporte.toString());
    }

    startTransition(async () => {
      let result;
      if (editingGasto && editingGasto.id) {
        formData.append('id', editingGasto.id.toString());
        result = await updateGasto(null, formData);
      } else {
        result = await createGasto(null, formData);
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
          <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">Gastos</h1>
          <p className="text-slate-500 mt-1">Gestión de compras, facturas, servicios y horas de personal</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Registrar Gasto</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Buscar por concepto, cliente o número de factura..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 shadow-sm"
          />
        </div>
        <div className="w-full md:w-64">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 shadow-sm font-medium text-slate-600"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="GENERAL">General</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="MATERIALES">Materiales</option>
            <option value="SERVICIOS">Servicios</option>
            <option value="PERSONAL">Personal</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {filteredGastos.map((gasto, index) => (
            <motion.div
              key={gasto.id}
              initial={{ opacity: 0, y: 30, rotateX: -5 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(5px)' }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
              className="bg-white/80 backdrop-blur-xl rounded-[24px] p-6 relative overflow-hidden group shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-gargom-accent/20 border border-slate-100 flex gap-5 transition-all duration-300"
            >
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />
              
              {/* Type Indicator */}
              <div className={`w-2.5 h-full absolute left-0 top-0 transition-colors duration-500 ${gasto.tipo === 'GENERAL' ? 'bg-gradient-to-b from-purple-400 to-purple-600' : gasto.tipo === 'PERSONAL' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-orange-400 to-orange-600'}`} />

              <div className="flex-1 pl-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      gasto.tipo === 'GENERAL' ? 'bg-purple-100 text-purple-700' :
                      gasto.tipo === 'PERSONAL' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {gasto.tipo}
                    </span>
                    <h3 className="font-bold text-lg text-slate-800 mt-1">
                      {gasto.concepto || (gasto.tipo === 'PERSONAL' ? `Horas: ${gasto.worker?.nombre}` : `Factura ${gasto.numero}`)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-gargom-blue">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(gasto.importe || 0)}
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-500 grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building size={14} />
                    <span className="truncate">{gasto.project?.cliente || 'Obra Desconocida'}</span>
                  </div>
                  {gasto.fecha && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{new Date(gasto.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                  )}
                  {gasto.tipo === 'PERSONAL' && gasto.horas && (
                    <div className="flex items-center gap-1.5">
                      <Users size={14} />
                      <span>{gasto.horas} horas</span>
                    </div>
                  )}
                  {['INDUSTRIAL', 'MATERIALES', 'SERVICIOS'].includes(gasto.tipo) && gasto.bank && (
                    <div className="flex items-center gap-1.5">
                      <Landmark size={14} />
                      <span className="truncate">{gasto.bank.nombre}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEditModal(gasto)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-200 transition shadow-sm border border-slate-200" title="Editar">
                  <Edit2 size={16} />
                </button>
                {gasto.tipo === 'PERSONAL' && (
                  <button onClick={() => handleClone(gasto)} className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-200 transition shadow-sm border border-slate-200" title="Clonar Gasto">
                    <Copy size={16} />
                  </button>
                )}
                <button onClick={() => handleDelete(gasto.id)} disabled={isDeleting === gasto.id} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition shadow-sm border border-red-100">
                  {isDeleting === gasto.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredGastos.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-500 font-medium">No se han encontrado gastos que coincidan.</p>
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gargom-blue flex items-center gap-2">
                    <Package size={24} className="text-gargom-accent" /> {editingGasto && editingGasto.id ? 'Editar Gasto' : 'Registrar Gasto'}
                  </h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form key={editingGasto ? JSON.stringify(editingGasto) : 'new'} onSubmit={handleSubmit} className="space-y-6">
                  {/* Tipo y Obra */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-slate-700 ml-1">Obra Asociada *</label>
                      <select 
                        name="projectId" 
                        required
                        defaultValue={editingGasto?.projectId}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all text-slate-700"
                      >
                        <option value="">Selecciona una obra...</option>
                        {obras.map(o => (
                          <option key={o.id} value={o.id}>{o.cliente} - {o.direccion}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Conditional Fields based on Type */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    {selectedType === 'GENERAL' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Concepto *</label>
                          <input type="text" name="concepto" defaultValue={editingGasto?.concepto} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Ej. Material de oficina" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Importe (€) *</label>
                          <input type="number" name="importe" defaultValue={editingGasto?.importe} step="0.01" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="0.00" />
                        </div>
                      </div>
                    )}

                    {['INDUSTRIAL', 'MATERIALES', 'SERVICIOS'].includes(selectedType) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Concepto</label>
                          <input type="text" name="concepto" defaultValue={editingGasto?.concepto} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Descripción breve" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Número de Factura</label>
                          <input type="text" name="numero" defaultValue={editingGasto?.numero} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="F-2024-001" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Importe (€) *</label>
                          <input type="number" name="importe" defaultValue={editingGasto?.importe} step="0.01" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Factura</label>
                          <input type="date" name="fecha" defaultValue={editingGasto?.fecha ? new Date(editingGasto.fecha).toISOString().split('T')[0] : ''} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Vencimiento</label>
                          <input type="date" name="fechaVencimiento" defaultValue={editingGasto?.fechaVencimiento ? new Date(editingGasto.fechaVencimiento).toISOString().split('T')[0] : ''} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Banco Asociado</label>
                          <select name="bankId" defaultValue={editingGasto?.bankId} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
                            <option value="">Selecciona un banco...</option>
                            {bancos.map(b => (
                              <option key={b.id} value={b.id}>{b.nombre} - {b.numeroCuenta}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1 md:col-span-2 mt-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Extraer datos de factura con IA</label>
                          <input 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileUpload}
                          />
                          <div 
                            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 transition-colors overflow-hidden ${isAnalyzing ? 'pointer-events-none border-gargom-accent/50' : 'hover:bg-slate-100 hover:border-gargom-accent cursor-pointer text-slate-400'}`}
                          >
                            {isAnalyzing ? (
                              <div className="flex flex-col items-center justify-center relative w-full z-10 py-4">
                                <div className="absolute inset-0 bg-gargom-accent/5 rounded-lg animate-pulse" />
                                {/* Laser effect */}
                                <motion.div 
                                  className="absolute left-0 right-0 h-0.5 bg-gargom-accent shadow-[0_0_8px_2px_rgba(var(--color-gargom-accent),0.6)] z-20"
                                  animate={{ top: ['0%', '100%', '0%'] }}
                                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                                />
                                <div className="relative flex flex-col items-center z-30 space-y-3">
                                  <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="bg-white p-3 rounded-full shadow-lg"
                                  >
                                    <FileUp size={28} className="text-gargom-accent" />
                                  </motion.div>
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-bold text-gargom-accent tracking-wide uppercase">IA Analizando...</span>
                                    <span className="text-xs font-medium text-slate-500 mt-1">Extrayendo datos mágicamente</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <>
                                <FileUp size={24} className="mb-2" />
                                <span className="text-sm font-medium text-slate-600">Sube una foto de la factura</span>
                                <span className="text-xs mt-1 text-slate-500">La IA rellenará los campos automáticamente</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedType === 'PERSONAL' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha (Día)</label>
                          <input type="date" name="fecha" defaultValue={editingGasto?.fecha ? new Date(editingGasto.fecha).toISOString().split('T')[0] : ''} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" />
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
                            value={personalImporte} 
                            readOnly 
                            className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-bold text-gargom-accent" 
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Observaciones</label>
                          <input type="text" name="observaciones" defaultValue={editingGasto?.observaciones} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Detalles de la jornada..." />
                        </div>
                      </div>
                    )}
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
                      {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>{editingGasto && editingGasto.id ? 'Guardar Cambios' : 'Registrar Gasto'}</span>}
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
