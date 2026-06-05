'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Package, FileText, Calendar, Building, Landmark, Pickaxe, HardHat, FileUp, Loader2, Trash2, Users, Copy, Search, Edit2, Upload, Sparkles, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { createGasto, updateGasto, deleteGasto, parseInvoiceWithGroq } from './actions';

export default function GastosClient({ 
  initialGastos, obras, bancos, trabajadores, proveedores 
}: { 
  initialGastos: any[], obras: any[], bancos: any[], trabajadores: any[], proveedores: any[] 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<any>(null);
  const [selectedType, setSelectedType] = useState<string>('GENERAL');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterProject, setFilterProject] = useState<string>('ALL');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc'|'desc'}>({ key: 'fecha', direction: 'desc' });
  const [viewMode, setViewMode] = useState<'grid'|'table'>('table');
  
  // Physical file upload state
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'scanning' | 'success' | 'error'>('idle');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'ia' | 'manual') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress('uploading');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Error al subir la factura');
      const uploadData = await uploadRes.json();
      setUploadedUrl(uploadData.url);

      if (mode === 'ia') {
        setUploadProgress('scanning');
        
        const aiRes = await parseInvoiceWithGroq(uploadData.url);
        
        if (aiRes.error) {
          setError(aiRes.error);
          setUploadProgress('error');
        } else if (aiRes.success && aiRes.data) {
          const data = aiRes.data;
          
          // Fill form via state editingGasto
          setEditingGasto((prev: any) => {
            // Find matching supplier
            let matchedSupplierId = prev?.supplierId || '';
            if (data.concepto) {
              const matched = proveedores.find(p => 
                data.concepto.toLowerCase().includes(p.nombre.toLowerCase()) || 
                p.nombre.toLowerCase().includes(data.concepto.toLowerCase())
              );
              if (matched) matchedSupplierId = matched.id;
            }

            return {
              ...prev,
              concepto: data.concepto || prev?.concepto || '',
              importe: data.importe || prev?.importe || '',
              numero: data.numero || prev?.numero || '',
              fecha: data.fecha ? new Date(data.fecha).toISOString() : prev?.fecha,
              fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento).toISOString() : prev?.fechaVencimiento,
              supplierId: matchedSupplierId
            };
          });

          setUploadProgress('success');
        }
      } else {
        setUploadProgress('success');
      }
    } catch (err: any) {
      console.error(err);
      setError('Error en el proceso de carga: ' + err.message);
      setUploadProgress('error');
    }
  };

  const getPaymentBadge = (estado: string) => {
    switch (estado) {
      case 'Pagado':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Pagado
          </span>
        );
      case 'Parcial':
      case 'Pago parcial':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            Pago Parcial
          </span>
        );
      case 'Pendiente':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Pendiente
          </span>
        );
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

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredGastos = initialGastos.filter(gasto => {
    const matchesSearch = 
      (gasto.concepto?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (gasto.project?.cliente?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (gasto.project?.direccion?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (gasto.numero?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || gasto.tipo === filterType;
    const matchesProject = filterProject === 'ALL' || gasto.projectId?.toString() === filterProject;
    
    let matchesMonth = true;
    if (filterMonth !== 'ALL') {
      const gDate = gasto.fecha ? new Date(gasto.fecha) : new Date(gasto.createdAt);
      const [y, m] = filterMonth.split('-');
      matchesMonth = gDate.getFullYear().toString() === y && (gDate.getMonth() + 1).toString().padStart(2, '0') === m;
    }

    return matchesSearch && matchesType && matchesProject && matchesMonth;
  }).sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === 'fecha') {
      aValue = a.fecha ? new Date(a.fecha).getTime() : new Date(a.createdAt).getTime();
      bValue = b.fecha ? new Date(b.fecha).getTime() : new Date(b.createdAt).getTime();
    } else if (sortConfig.key === 'project') {
      aValue = a.project?.cliente || '';
      bValue = b.project?.cliente || '';
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Extract unique months for the filter
  const availableMonths = Array.from(new Set(initialGastos.map(g => {
    const d = g.fecha ? new Date(g.fecha) : new Date(g.createdAt);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  }))).sort().reverse();

  const openCreateModal = () => {
    setEditingGasto(null);
    setSelectedType('GENERAL');
    setSelectedWorkerId('');
    setHoras('');
    setUploadProgress('idle');
    setUploadedUrl(null);
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
    setUploadedUrl(gasto.imagenUrl || null);
    setUploadProgress(gasto.imagenUrl ? 'success' : 'idle');
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
    setUploadedUrl(gasto.imagenUrl || null);
    setUploadProgress(gasto.imagenUrl ? 'success' : 'idle');
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
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar por concepto, cliente, obra o factura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 shadow-sm"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl border flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-gargom-blue text-white border-gargom-blue' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
            >
              <Package size={20} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-3 rounded-xl border flex items-center justify-center transition-colors ${viewMode === 'table' ? 'bg-gargom-blue text-white border-gargom-blue' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
            >
              <FileText size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 shadow-sm font-medium text-slate-600"
          >
            <option value="ALL">Todos los meses</option>
            {availableMonths.map(m => {
              const [y, mo] = m.split('-');
              const date = new Date(parseInt(y), parseInt(mo) - 1);
              return <option key={m} value={m}>{date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}</option>
            })}
          </select>

          <select 
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 shadow-sm font-medium text-slate-600"
          >
            <option value="ALL">Todas las obras</option>
            {obras.map(o => (
              <option key={o.id} value={o.id.toString()}>{o.cliente} - {o.direccion}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
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
                className={`bg-white/80 backdrop-blur-xl rounded-[24px] p-6 relative overflow-hidden group flex gap-5 transition-all duration-300 ${
                  gasto.esGastoB
                    ? 'border-amber-300 border-2 shadow-[0_8px_30px_rgba(245,158,11,0.12)] bg-amber-50/10'
                    : 'border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-gargom-accent/10'
                }`}
              >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 pointer-events-none" />
                
                {/* Type Indicator */}
                <div className={`w-2.5 h-full absolute left-0 top-0 transition-colors duration-500 ${gasto.tipo === 'GENERAL' ? 'bg-gradient-to-b from-purple-400 to-purple-600' : gasto.tipo === 'PERSONAL' ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gradient-to-b from-orange-400 to-orange-600'}`} />

                <div className="flex-1 pl-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          gasto.tipo === 'GENERAL' ? 'bg-purple-100 text-purple-700' :
                          gasto.tipo === 'PERSONAL' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {gasto.tipo}
                        </span>
                        {getPaymentBadge(gasto.estadoPago)}
                        {gasto.esGastoB && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 shadow-sm animate-pulse">
                            Gasto B
                          </span>
                        )}
                      </div>
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
                <div className="flex flex-col gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {gasto.imagenUrl && (
                    <a 
                      href={gasto.imagenUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition shadow-sm border border-blue-100 flex items-center justify-center" 
                      title="Ver Factura"
                    >
                      <Eye size={16} />
                    </a>
                  )}
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
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('fecha')}>Fecha {sortConfig.key === 'fecha' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('tipo')}>Tipo {sortConfig.key === 'tipo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('concepto')}>Concepto {sortConfig.key === 'concepto' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('project')}>Obra {sortConfig.key === 'project' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right cursor-pointer hover:bg-slate-100 transition" onClick={() => handleSort('importe')}>Importe {sortConfig.key === 'importe' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGastos.map((gasto) => (
                  <tr 
                    key={gasto.id} 
                    className={`transition-colors group hover:bg-slate-50/50 ${
                      gasto.esGastoB ? 'bg-amber-50/20 hover:bg-amber-100/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {gasto.fecha ? new Date(gasto.fecha).toLocaleDateString('es-ES') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        gasto.tipo === 'GENERAL' ? 'bg-purple-100 text-purple-700' :
                        gasto.tipo === 'PERSONAL' ? 'bg-green-100 text-green-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {gasto.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{gasto.concepto || (gasto.tipo === 'PERSONAL' ? `Horas: ${gasto.worker?.nombre}` : `Factura ${gasto.numero}`)}</span>
                        {gasto.esGastoB && (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
                            B
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {gasto.project?.cliente || '-'} <span className="text-xs text-slate-400 block">{gasto.project?.direccion}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPaymentBadge(gasto.estadoPago)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gargom-blue whitespace-nowrap">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(gasto.importe || 0)}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {gasto.imagenUrl && (
                          <a 
                            href={gasto.imagenUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition flex items-center justify-center" 
                            title="Ver Factura"
                          >
                            <Eye size={16} />
                          </a>
                        )}
                        <button onClick={() => openEditModal(gasto)} className="p-1.5 text-slate-400 hover:text-gargom-accent hover:bg-blue-50 rounded transition" title="Editar">
                          <Edit2 size={16} />
                        </button>
                        {gasto.tipo === 'PERSONAL' && (
                          <button onClick={() => handleClone(gasto)} className="p-1.5 text-slate-400 hover:text-gargom-accent hover:bg-blue-50 rounded transition" title="Clonar">
                            <Copy size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(gasto.id)} disabled={isDeleting === gasto.id} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                          {isDeleting === gasto.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredGastos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                      No se han encontrado gastos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                  <input type="hidden" name="imagenUrl" value={uploadedUrl || ''} />

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

                  {/* Physical invoice upload options (Only show for non-personal) */}
                  {selectedType !== 'PERSONAL' && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-700 ml-1 flex items-center gap-1.5">
                        <Upload size={16} className="text-slate-400" />
                        Imagen / Factura Física (Carga y Escaneo)
                      </label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Option 1: AI Scan */}
                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between items-center text-center relative overflow-hidden group">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                            <Sparkles size={20} />
                          </div>
                          <span className="font-bold text-sm text-slate-800">Escanear factura con IA</span>
                          <span className="text-xs text-slate-500 mt-1 max-w-xs">Sube la foto para procesar, guardar en la obra y autocompletar importes, fechas e información de forma real</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'ia')}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>

                        {/* Option 2: Manual Upload */}
                        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between items-center text-center relative overflow-hidden group">
                          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center mb-2">
                            <Upload size={20} />
                          </div>
                          <span className="font-bold text-sm text-slate-800">Subida Manual Directa</span>
                          <span className="text-xs text-slate-500 mt-1 max-w-xs">Adjunta la foto o captura de la factura física para que se guarde de forma permanente en la obra sin analizar</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'manual')}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Upload and AI Status View */}
                      {uploadProgress !== 'idle' && (
                        <div className="mt-4">
                          {uploadProgress === 'uploading' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-2 text-blue-700 text-sm">
                              <Loader2 size={16} className="animate-spin text-blue-500" />
                              <span>Subiendo archivo al servidor...</span>
                            </div>
                          )}

                          {uploadProgress === 'scanning' && (
                            <div className="relative overflow-hidden bg-slate-900 rounded-xl h-24 flex items-center justify-center text-white">
                              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent animate-pulse" />
                              <motion.div 
                                initial={{ top: 0 }}
                                animate={{ top: '100%' }}
                                transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                                className="absolute left-0 right-0 h-[2px] bg-blue-500 shadow-[0_0_8px_#3b82f6] z-10" 
                              />
                              <div className="flex items-center gap-2 relative z-20">
                                <Sparkles className="animate-spin text-blue-400" size={20} />
                                <span className="font-bold text-xs text-slate-300">Gargom IA: Analizando y extrayendo conceptos...</span>
                              </div>
                            </div>
                          )}

                          {uploadProgress === 'success' && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex flex-col gap-2 text-emerald-700 text-sm">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                <span className="font-semibold">✓ Imagen cargada y asociada correctamente!</span>
                              </div>
                              {uploadedUrl && (
                                <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline font-medium break-all pl-6">
                                  Ver archivo subido: {uploadedUrl}
                                </a>
                              )}
                            </div>
                          )}

                          {uploadProgress === 'error' && (
                            <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 flex items-center gap-2 text-rose-700 text-sm">
                              <AlertCircle size={16} className="text-rose-500" />
                              <span>Hubo un problema procesando el archivo. Inténtalo de nuevo.</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Conditional Fields based on Type */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    {selectedType === 'GENERAL' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Concepto *</label>
                          <input type="text" name="concepto" defaultValue={editingGasto?.concepto} required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Ej. Material de oficina" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Proveedor *</label>
                          <select name="supplierId" required defaultValue={editingGasto?.supplierId} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
                            <option value="">Selecciona un proveedor...</option>
                            {proveedores.map(p => (
                              <option key={p.id} value={p.id}>{p.nombre} ({p.cif || 'Sin CIF'})</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Número de Factura / Ticket</label>
                          <input type="text" name="numero" defaultValue={editingGasto?.numero} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="T-2026-001 o F-2026-001" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Importe (€) *</label>
                          <input type="number" name="importe" defaultValue={editingGasto?.importe} step="0.01" required className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Factura / Gasto *</label>
                          <input type="date" name="fecha" required defaultValue={editingGasto?.fecha ? new Date(editingGasto.fecha).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Vencimiento</label>
                          <input type="date" name="fechaVencimiento" defaultValue={editingGasto?.fechaVencimiento ? new Date(editingGasto.fechaVencimiento).toISOString().split('T')[0] : ''} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Estado de Pago</label>
                          <select name="estadoPago" defaultValue={editingGasto?.estadoPago || 'Pendiente'} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
                            <option value="Pendiente">Pendiente</option>
                            <option value="Parcial">Pago Parcial</option>
                            <option value="Pagado">Pagado</option>
                          </select>
                        </div>
                        <div className="space-y-1 flex items-center h-full pt-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="esGastoB" defaultChecked={editingGasto?.esGastoB} className="w-5 h-5 rounded border-slate-300 text-gargom-accent focus:ring-gargom-accent" />
                            <span className="text-sm font-medium text-slate-700">Marcar como Gasto "B"</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {['INDUSTRIAL', 'MATERIALES', 'SERVICIOS'].includes(selectedType) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Concepto</label>
                          <input type="text" name="concepto" defaultValue={editingGasto?.concepto} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" placeholder="Descripción breve" />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Proveedor *</label>
                          <select name="supplierId" required defaultValue={editingGasto?.supplierId} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
                            <option value="">Selecciona un proveedor...</option>
                            {proveedores.map(p => (
                              <option key={p.id} value={p.id}>{p.nombre} ({p.cif || 'Sin CIF'})</option>
                            ))}
                          </select>
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
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Estado de Pago</label>
                          <select name="estadoPago" defaultValue={editingGasto?.estadoPago || 'Pendiente'} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
                            <option value="Pendiente">Pendiente</option>
                            <option value="Parcial">Pago Parcial</option>
                            <option value="Pagado">Pagado</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Cuenta de Pago</label>
                          <select name="bankId" defaultValue={editingGasto?.bankId} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl">
                            <option value="">Selecciona una cuenta de pago...</option>
                            {bancos.map(b => (
                              <option key={b.id} value={b.id}>{b.nombre} - {b.numeroCuenta}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1 md:col-span-2 flex items-center h-full pt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="esGastoB" defaultChecked={editingGasto?.esGastoB} className="w-5 h-5 rounded border-slate-300 text-gargom-accent focus:ring-gargom-accent" />
                            <span className="text-sm font-medium text-slate-700">Marcar como Gasto "B"</span>
                          </label>
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
