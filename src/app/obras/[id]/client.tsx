'use client';

import { useActionState, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, Package, Calendar, Landmark, HardHat, Pickaxe, Loader2, Trash2, Users, Copy, Mail, Phone, User, FileCheck, Download, Hash, Eye, Upload, Sparkles, CheckCircle2, AlertCircle, Coins, Award } from 'lucide-react';
import Link from 'next/link';
import { createGastoObra, deleteGastoObra, createCertification, syncCertificationOdoo } from './actions';
import { parseInvoiceWithGroq } from '../../gastos/actions';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ObraDetailClient({ 
  obra, bancos, trabajadores, proveedores = [], nextCertNumber = 'CERT-1'
}: { 
  obra: any, bancos: any[], trabajadores: any[], proveedores?: any[], nextCertNumber?: string
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('GENERAL');
  const [state, formAction, isPending] = useActionState(createGastoObra, null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certState, certFormAction, isCertPending] = useActionState(createCertification, null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState<number | null>(null);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [horas, setHoras] = useState<string>('');
  const [personalImporte, setPersonalImporte] = useState<number>(0);

  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [rangeStart, setRangeStart] = useState<string>('');
  const [rangeEnd, setRangeEnd] = useState<string>('');

  // Form Field States for Pre-filling and Data Control
  const [concepto, setConcepto] = useState('');
  const [importe, setImporte] = useState('');
  const [numero, setNumero] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [fechaVencimiento, setFechaVencimiento] = useState('');
  const [estadoPago, setEstadoPago] = useState('Pendiente');
  const [esGastoB, setEsGastoB] = useState(false);
  const [supplierId, setSupplierId] = useState('');
  const [bankId, setBankId] = useState('');

  // IA upload & scan states
  const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'scanning' | 'success' | 'error'>('idle');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

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

  useEffect(() => {
    if (certState?.success) {
      setIsCertModalOpen(false);
    }
  }, [certState]);

  const handleGeneratePDF = async (cert: any) => {
    setIsGeneratingPDF(cert.id);
    try {
      const element = document.getElementById(`pdf-cert-${cert.id}`);
      if (!element) return;
      
      const originalDisplay = element.style.display;
      element.style.display = 'block';
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificacion_${cert.numero}_${obra.direccion}.pdf`);
      
      element.style.display = originalDisplay;
    } catch (e) {
      console.error(e);
      alert('Error al generar PDF');
    } finally {
      setIsGeneratingPDF(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este gasto?')) {
      setIsDeleting(id);
      await deleteGastoObra(id, obra.id);
      setIsDeleting(null);
    }
  };

  const handleClone = async (gasto: any) => {
    setSelectedType(gasto.tipo);
    setConcepto(gasto.concepto || '');
    setImporte(gasto.importe ? gasto.importe.toString() : '');
    setFecha(new Date().toISOString().split('T')[0]);
    setSupplierId(gasto.supplierId ? gasto.supplierId.toString() : '');
    setBankId(gasto.bankId ? gasto.bankId.toString() : '');
    setEstadoPago('Pendiente');
    setEsGastoB(gasto.esGastoB || false);
    setIsModalOpen(true);
  };

  const handleOpenAddGasto = (type: string) => {
    setSelectedType(type);
    setConcepto('');
    setImporte('');
    setNumero('');
    setFecha(new Date().toISOString().split('T')[0]);
    setFechaVencimiento('');
    setEstadoPago('Pendiente');
    setEsGastoB(false);
    setSupplierId('');
    setBankId('');
    setUploadedUrl(null);
    setUploadProgress('idle');
    setIsModalOpen(true);
  };

  // Upload Physical Invoice Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, mode: 'ia' | 'manual') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress('uploading');
    
    // 1. Upload to physical storage via the upload API
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

      // 2. Perform Groq AI extraction if mode is 'ia'
      if (mode === 'ia') {
        setUploadProgress('scanning');
        
        const aiRes = await parseInvoiceWithGroq(uploadData.url);
        
        if (aiRes.error) {
          alert(aiRes.error);
          setUploadProgress('error');
        } else if (aiRes.success && aiRes.data) {
          const data = aiRes.data;
          if (data.concepto) setConcepto(data.concepto);
          if (data.importe) setImporte(data.importe.toString());
          if (data.numero) setNumero(data.numero);
          if (data.fecha) setFecha(data.fecha);
          if (data.fechaVencimiento) setFechaVencimiento(data.fechaVencimiento);
          
          // Auto match supplier if found in concept
          if (data.concepto) {
            const matched = proveedores.find(p => 
              data.concepto.toLowerCase().includes(p.nombre.toLowerCase()) || 
              p.nombre.toLowerCase().includes(data.concepto.toLowerCase())
            );
            if (matched) setSupplierId(matched.id.toString());
          }

          setUploadProgress('success');
        }
      } else {
        setUploadProgress('success');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error en el proceso de carga: ' + err.message);
      setUploadProgress('error');
    }
  };

  // Get uniquely available months from expense history
  const availableMonths = Array.from(
    new Set<string>(
      obra.expenses
        .filter((e: any) => e.fecha)
        .map((e: any) => {
          const date = new Date(e.fecha);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          return `${yyyy}-${mm}`;
        })
    )
  ).sort((a: string, b: string) => b.localeCompare(a));

  const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Reactive Filters Execution
  const filteredExpenses = obra.expenses.filter((gasto: any) => {
    // Filter by single month
    if (selectedMonth !== 'ALL' && gasto.fecha) {
      const date = new Date(gasto.fecha);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const gastoMonth = `${yyyy}-${mm}`;
      if (gastoMonth !== selectedMonth) return false;
    }

    // Filter by start month range
    if (rangeStart && gasto.fecha) {
      const date = new Date(gasto.fecha);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const gastoMonth = `${yyyy}-${mm}`;
      if (gastoMonth < rangeStart) return false;
    }

    // Filter by end month range
    if (rangeEnd && gasto.fecha) {
      const date = new Date(gasto.fecha);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const gastoMonth = `${yyyy}-${mm}`;
      if (gastoMonth > rangeEnd) return false;
    }

    return true;
  });

  // Category sum calculation
  const getCategoryTotal = (type: string) => {
    return filteredExpenses
      .filter((e: any) => e.tipo === type)
      .reduce((acc: number, curr: any) => acc + (curr.importe || 0), 0);
  };

  const totalGastos = obra.expenses.reduce((acc: number, curr: any) => acc + (curr.importe || 0), 0);
  const totalGastosFiltrados = filteredExpenses.reduce((acc: number, curr: any) => acc + (curr.importe || 0), 0);
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
          {obra.nombreReferencia && (
            <div className="text-sm font-semibold text-gargom-accent">Ref: {obra.nombreReferencia}</div>
          )}
          <div className="flex items-center gap-2 text-slate-500">
            <Users size={16} /> <span className="font-medium">{obra.clients && obra.clients.length > 0 ? obra.clients.map((c: any) => c.nombre).join(', ') : obra.cliente}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCertModalOpen(true)}
            className="bg-white border-2 border-gargom-accent text-gargom-accent hover:bg-gargom-accent/5 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm shrink-0"
          >
            <FileCheck size={20} strokeWidth={2.5} />
            <span>Nueva Certificación</span>
          </button>
          <button
            onClick={() => handleOpenAddGasto('GENERAL')}
            className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:-translate-y-0.5 shrink-0"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Añadir Gasto</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gargom-accent/5 rounded-bl-full transition-transform group-hover:scale-110 pointer-events-none" />
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">Presupuesto Total</p>
          <p className="text-3xl font-bold text-gargom-blue">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(obra.presupuestoTotal + obra.presupuestoAdicional)}
          </p>
          {obra.presupuestoAdicional > 0 && (
            <p className="text-xs text-slate-400 mt-1">
              Base: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(obra.presupuestoTotal)} | Adicional: +{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(obra.presupuestoAdicional)}
            </p>
          )}
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full transition-transform group-hover:scale-110 pointer-events-none" />
          <p className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-1">Total Gastos</p>
          <p className="text-3xl font-bold text-orange-500">
            {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalGastos)}
          </p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${Math.min(porcentajeGastado, 100)}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full transition-transform group-hover:scale-110 pointer-events-none" />
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
          {obra.clients && obra.clients.length > 0 && (
            <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
              {obra.clients.map((c: any, index: number) => (
                <div key={index} className="text-xs text-slate-600 font-medium">
                  <span className="font-bold text-slate-800">{c.nombre}</span> {c.porcentajeFacturacion && `(${c.porcentajeFacturacion}%)`} {c.cif && `(${c.cif})`} {c.direccion && `- ${c.direccion}`}
                </div>
              ))}
            </div>
          )}
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

      {/* Gastos Dashboard Tab Area */}
      <div className="space-y-6">
        {/* Title and Filters bar */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-gargom-blue flex items-center gap-2">
              <Package size={20} /> Historial de Gastos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Filtra y visualiza la distribución de costes</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Filter by Month Select */}
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setRangeStart('');
                setRangeEnd('');
              }}
              className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-gargom-accent/50"
            >
              <option value="ALL">Todos los meses</option>
              {availableMonths.map(m => (
                <option key={m} value={m}>{formatMonthLabel(m)}</option>
              ))}
            </select>

            {/* Ranges */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-500">
              <span>Rango:</span>
              <input
                type="month"
                value={rangeStart}
                onChange={(e) => {
                  setRangeStart(e.target.value);
                  setSelectedMonth('ALL');
                }}
                className="focus:outline-none text-slate-700 bg-transparent"
                placeholder="Desde"
              />
              <span>a</span>
              <input
                type="month"
                value={rangeEnd}
                onChange={(e) => {
                  setRangeEnd(e.target.value);
                  setSelectedMonth('ALL');
                }}
                className="focus:outline-none text-slate-700 bg-transparent"
                placeholder="Hasta"
              />
              {(rangeStart || rangeEnd || selectedMonth !== 'ALL') && (
                <button
                  onClick={() => {
                    setSelectedMonth('ALL');
                    setRangeStart('');
                    setRangeEnd('');
                  }}
                  className="text-red-500 hover:text-red-700 ml-1"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Sum Cards Panel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">General</span>
            <span className="text-lg font-black text-purple-900 mt-2">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(getCategoryTotal('GENERAL'))}
            </span>
          </div>
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Industrial</span>
            <span className="text-lg font-black text-blue-900 mt-2">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(getCategoryTotal('INDUSTRIAL'))}
            </span>
          </div>
          <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-orange-700 uppercase tracking-wide">Materiales</span>
            <span className="text-lg font-black text-orange-900 mt-2">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(getCategoryTotal('MATERIALES'))}
            </span>
          </div>
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col justify-between">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Servicios</span>
            <span className="text-lg font-black text-indigo-900 mt-2">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(getCategoryTotal('SERVICIOS'))}
            </span>
          </div>
          <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex flex-col justify-between col-span-2 md:col-span-1">
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Personal</span>
            <span className="text-lg font-black text-green-900 mt-2">
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(getCategoryTotal('PERSONAL'))}
            </span>
          </div>
        </div>

        {/* Expenses List */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Package size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No hay gastos que coincidan con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {filteredExpenses.map((gasto: any, index: number) => {
                const borderClass = gasto.esGastoB
                  ? 'border-amber-300 shadow-[0_8px_30px_rgba(245,158,11,0.08)] bg-amber-50/10'
                  : 'border-slate-100 shadow-sm bg-white';
                
                return (
                  <motion.div
                    key={gasto.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className={`rounded-2xl p-4 relative overflow-hidden group border flex gap-4 hover:border-gargom-accent/30 transition-all ${borderClass}`}
                  >
                    {/* Category bar decoration */}
                    <div className={`w-1.5 h-full absolute left-0 top-0 ${
                      gasto.tipo === 'GENERAL' ? 'bg-purple-500' : 
                      gasto.tipo === 'PERSONAL' ? 'bg-green-500' : 
                      gasto.tipo === 'INDUSTRIAL' ? 'bg-blue-500' :
                      gasto.tipo === 'MATERIALES' ? 'bg-orange-500' : 'bg-indigo-500'
                    }`} />

                    <div className="flex-1 pl-3 space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                              gasto.tipo === 'GENERAL' ? 'bg-purple-100 text-purple-700' :
                              gasto.tipo === 'PERSONAL' ? 'bg-green-100 text-green-700' :
                              gasto.tipo === 'INDUSTRIAL' ? 'bg-blue-100 text-blue-700' :
                              gasto.tipo === 'MATERIALES' ? 'bg-orange-100 text-orange-700' :
                              'bg-indigo-100 text-indigo-700'
                            }`}>
                              {gasto.tipo}
                            </span>

                            {/* Payment State badge */}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                              gasto.estadoPago === 'Pagado' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              gasto.estadoPago === 'Pago parcial' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                              'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {gasto.estadoPago || 'Pendiente'}
                            </span>

                            {/* Gasto B badge */}
                            {gasto.esGastoB && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-700 border border-amber-300">
                                Gasto B
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-slate-800 leading-tight text-sm">
                            {gasto.concepto || (gasto.tipo === 'PERSONAL' ? `Horas: ${gasto.worker?.nombre}` : `Factura ${gasto.numero}`)}
                          </h3>

                          {gasto.supplier && (
                            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                              <span>Proveedor:</span>
                              <span className="text-slate-700 font-bold">{gasto.supplier.nombre}</span>
                            </p>
                          )}
                        </div>
                        <div className="font-bold text-gargom-blue text-right shrink-0">
                          {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(gasto.importe || 0)}
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1 pt-1 border-t border-slate-50">
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
                        {gasto.bank && (
                          <div className="flex items-center gap-1">
                            <Coins size={12} className="text-slate-400" />
                            <span className="truncate" title="Cuenta de Pago">{gasto.bank.nombre}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 justify-center shrink-0">
                      {gasto.imagenUrl && (
                        <a 
                          href={gasto.imagenUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg transition shadow-sm border border-slate-200 flex items-center justify-center"
                          title="Ver Factura"
                        >
                          <Eye size={14} />
                        </a>
                      )}
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
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Certificaciones List */}
      <div>
        <h2 className="text-xl font-bold text-gargom-blue mb-4 flex items-center gap-2">
          <FileCheck size={20} /> Certificaciones
        </h2>
        {(!obra.certifications || obra.certifications.length === 0) ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <FileCheck size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No hay certificaciones registradas en esta obra.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {obra.certifications.map((cert: any, index: number) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 relative overflow-hidden shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gargom-blue" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight">{cert.concepto}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mt-1">
                        <Hash size={12} /> {cert.numero}
                        {cert.enviadaOdoo && (
                          <span className="ml-2 inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                            ✓ Enviado a Odoo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Importe</div>
                      <div className="text-xl font-bold text-gargom-accent">
                        {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cert.importe)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    {/* Odoo Sync Switch Button */}
                    {cert.enviadaOdoo ? (
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1">
                        ✓ Odoo Sincronizado
                      </span>
                    ) : (
                      <button 
                        onClick={async () => {
                          setIsSyncing(cert.id);
                          await syncCertificationOdoo(cert.id, obra.id);
                          setIsSyncing(null);
                        }}
                        disabled={isSyncing === cert.id}
                        className="text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors border border-orange-100"
                      >
                        {isSyncing === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                        Sincronizar con Odoo
                      </button>
                    )}

                    <button 
                      onClick={() => handleGeneratePDF(cert)}
                      disabled={isGeneratingPDF === cert.id}
                      className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors border border-indigo-100"
                    >
                      {isGeneratingPDF === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                      Generar Documento
                    </button>
                  </div>

                  {/* Hidden PDF Template for this Certification */}
                  <div id={`pdf-cert-${cert.id}`} className="absolute top-0 left-[-9999px] bg-white text-slate-900 w-[794px] h-[1123px] p-[50px] font-sans box-border shadow-xl">
                    <div className="relative h-full flex flex-col">
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none z-0 text-[180px] font-black text-slate-900 whitespace-nowrap rotate-[-45deg] tracking-tighter">
                        GARGOM
                      </div>
                      
                      <div className="relative z-10 flex justify-between items-start mb-12 pb-6 border-b-4 border-gargom-blue">
                        <div>
                          <div className="text-4xl font-black text-gargom-blue tracking-tight mb-1">CONSTRUCCIONES GARGOM</div>
                          <div className="text-sm font-semibold text-slate-500">NIF: B-12345678</div>
                          <div className="text-sm font-semibold text-slate-500">Calle Falsa 123, 28000 Madrid</div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-light text-slate-400 uppercase tracking-widest mb-1">Certificación</div>
                          <div className="text-xl font-bold text-gargom-accent">Nº {cert.numero}</div>
                          <div className="text-sm font-semibold text-slate-500 mt-2">Fecha: {new Date(cert.createdAt).toLocaleDateString('es-ES')}</div>
                        </div>
                      </div>

                      <div className="relative z-10 grid grid-cols-2 gap-8 mb-12">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Datos del Cliente</div>
                          {obra.clients && obra.clients.length > 0 ? (
                            <>
                              <div className="font-bold text-lg text-slate-800 mb-1">{obra.clients[0].nombre}</div>
                              {obra.clients[0].cif && <div className="text-sm text-slate-600 font-medium">CIF/NIF: {obra.clients[0].cif}</div>}
                              {obra.clients[0].direccion && <div className="text-sm text-slate-600 font-medium mt-1">{obra.clients[0].direccion}</div>}
                            </>
                          ) : (
                            <>
                              <div className="font-bold text-lg text-slate-800 mb-1">{obra.cliente}</div>
                              <div className="text-sm text-slate-600 font-medium">Obra: {obra.direccion}</div>
                            </>
                          )}
                        </div>
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                          <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Detalles de la Obra</div>
                          <div className="font-bold text-lg text-slate-800 mb-1">{obra.direccion}</div>
                          {obra.arquitecto && <div className="text-sm text-slate-600 font-medium mt-1">Arquitecto: {obra.arquitecto}</div>}
                        </div>
                      </div>

                      <div className="relative z-10 flex-1">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b-2 border-slate-800">
                              <th className="py-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Concepto</th>
                              <th className="py-4 text-sm font-bold text-slate-400 uppercase tracking-widest text-right">Importe</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-slate-100">
                              <td className="py-6 text-lg font-bold text-slate-800">{cert.concepto}</td>
                              <td className="py-6 text-lg font-bold text-slate-800 text-right">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cert.importe)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="relative z-10 w-1/2 ml-auto mb-16 mt-8">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-bold text-slate-500">Base Imponible:</span>
                            <span className="text-base font-bold text-slate-800">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cert.importe)}</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-slate-500">IVA ({obra.porcentajeImpuesto ?? 10}%):</span>
                            <span className="text-base font-bold text-slate-800">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cert.importe * ((obra.porcentajeImpuesto ?? 10)/100))}</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                            <span className="text-sm font-bold text-slate-800 uppercase tracking-widest">TOTAL:</span>
                            <span className="text-2xl font-black text-gargom-blue">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cert.importe * (1 + (obra.porcentajeImpuesto ?? 10)/100))}</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 mt-auto flex justify-between items-end border-t border-slate-200 pt-8">
                        <div className="w-64 text-center">
                          <div className="h-16 border-b border-slate-300 mb-2"></div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Firma y Sello</div>
                          <div className="text-sm font-medium text-slate-700 mt-1">Construcciones Gargom S.L.</div>
                        </div>
                        <div className="text-xs font-medium text-slate-400 text-right max-w-xs">
                          Documento generado automáticamente por Gargom ERP. Válido a efectos informativos.
                        </div>
                      </div>
                    </div>
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
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl relative z-10 overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
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
                  <input type="hidden" name="imagenUrl" value={uploadedUrl || ''} />
                  
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
                      <label className="text-sm font-medium text-slate-700 ml-1">Estado de Pago</label>
                      <select
                        name="estadoPago"
                        value={estadoPago}
                        onChange={e => setEstadoPago(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 transition-all font-medium text-slate-700"
                      >
                        <option value="Pendiente">Pendiente de Pago</option>
                        <option value="Pago parcial">Pago Parcial</option>
                        <option value="Pagado">Pagado</option>
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
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-sm">
                              <CheckCircle2 size={16} className="text-emerald-500" />
                              <span className="font-semibold">✓ Imagen cargada y asociada correctamente! URL: {uploadedUrl}</span>
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
                    {/* Supplier Select field - MANDATORY for all non-personal expenses */}
                    {selectedType !== 'PERSONAL' && (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 ml-1">Proveedor *</label>
                        <select
                          name="supplierId"
                          required
                          value={supplierId}
                          onChange={e => setSupplierId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-gargom-accent/50"
                        >
                          <option value="">Selecciona el proveedor obligatoriamente...</option>
                          {proveedores.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre} {p.cif ? `(${p.cif})` : ''}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {selectedType === 'GENERAL' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Concepto *</label>
                          <input 
                            type="text" 
                            name="concepto" 
                            required 
                            value={concepto}
                            onChange={e => setConcepto(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" 
                            placeholder="Ej. Material de oficina" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Número de Factura / Ticket</label>
                          <input 
                            type="text" 
                            name="numero" 
                            value={numero}
                            onChange={e => setNumero(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" 
                            placeholder="T-2026-001 o F-2026-001" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Importe (€) *</label>
                          <input 
                            type="number" 
                            name="importe" 
                            step="0.01" 
                            required 
                            value={importe}
                            onChange={e => setImporte(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-bold text-gargom-accent" 
                            placeholder="0.00" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Gasto</label>
                          <input 
                            type="date" 
                            name="fecha" 
                            required 
                            value={fecha}
                            onChange={e => setFecha(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Vencimiento</label>
                          <input 
                            type="date" 
                            name="fechaVencimiento" 
                            value={fechaVencimiento}
                            onChange={e => setFechaVencimiento(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" 
                          />
                        </div>
                      </div>
                    )}

                    {['INDUSTRIAL', 'MATERIALES', 'SERVICIOS'].includes(selectedType) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Número de Factura *</label>
                          <input 
                            type="text" 
                            name="numero" 
                            required 
                            value={numero}
                            onChange={e => setNumero(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-mono" 
                            placeholder="F-2026-001" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Importe (€) *</label>
                          <input 
                            type="number" 
                            name="importe" 
                            step="0.01" 
                            required 
                            value={importe}
                            onChange={e => setImporte(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-lg font-bold text-gargom-accent" 
                            placeholder="0.00" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Factura</label>
                          <input 
                            type="date" 
                            name="fecha" 
                            required 
                            value={fecha}
                            onChange={e => setFecha(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" 
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-slate-700 ml-1">Fecha de Vencimiento</label>
                          <input 
                            type="date" 
                            name="fechaVencimiento" 
                            value={fechaVencimiento}
                            onChange={e => setFechaVencimiento(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" 
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-sm font-medium text-slate-700 ml-1">Cuenta de Pago Asociada</label>
                          <select 
                            name="bankId" 
                            value={bankId}
                            onChange={e => setBankId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl"
                          >
                            <option value="">Selecciona una cuenta de pago...</option>
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
                          <input 
                            type="date" 
                            name="fecha" 
                            required 
                            value={fecha}
                            onChange={e => setFecha(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl" 
                          />
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

                    {/* Es Gasto B Switch */}
                    <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">¿Es Gasto B?</span>
                        <span className="text-xs text-slate-400">Activa esta opción para registrarlo internamente</span>
                      </div>
                      <input 
                        type="checkbox" 
                        name="esGastoB" 
                        value="true"
                        checked={esGastoB}
                        onChange={e => setEsGastoB(e.target.checked)}
                        className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                      />
                    </div>
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
                      disabled={isPending || uploadProgress === 'uploading' || uploadProgress === 'scanning'}
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

      {/* Modal Añadir Certificación */}
      <AnimatePresence>
        {isCertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCertModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden border border-slate-100 flex flex-col"
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gargom-blue flex items-center gap-2">
                    <FileCheck size={24} className="text-gargom-accent" /> Nueva Certificación
                  </h2>
                  <button 
                    onClick={() => setIsCertModalOpen(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form action={certFormAction} className="space-y-5">
                  <input type="hidden" name="projectId" value={obra.id} />
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Concepto *</label>
                    <input type="text" name="concepto" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all" placeholder="Ej. Certificación 1: Movimiento de tierras" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Número de Factura *</label>
                    <input type="text" name="numero" required defaultValue={nextCertNumber} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all font-mono" placeholder="FACT-001" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700 ml-1">Importe a Facturar (€) *</label>
                    <input type="number" name="importe" step="0.01" required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all text-lg font-bold text-gargom-accent" placeholder="0.00" />
                  </div>

                  {certState?.error && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                      {certState.error}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-8">
                    <button type="button" onClick={() => setIsCertModalOpen(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isCertPending}
                      className="bg-gargom-blue hover:bg-[#021033] text-white px-6 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-gargom-blue/20 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:pointer-events-none"
                    >
                      {isCertPending ? <Loader2 size={20} className="animate-spin" /> : <span>Guardar Factura / Certificación</span>}
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
