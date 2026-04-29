'use client';

import { useActionState, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, Mail, User, Lock, Calendar, Loader2, Edit2, Trash2, KeyRound, Share2 } from 'lucide-react';
import { createUser, updateUser, deleteUser } from './actions';

export default function UsuariosClient({ initialUsers }: { initialUsers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createUser, null);
  
  // Password generation and sharing state
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [createdUser, setCreatedUser] = useState<{email: string, pass: string} | null>(null);

  // Edit/Delete state
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre_asc');

  // Generate secure password
  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassword(pass);
  };

  // Handle intercepting the form to capture email and password for sharing later
  const formRef = useRef<HTMLFormElement>(null);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    setCreatedUser({ email, pass: password });
    
    // Call the server action programmatically
    const action = e.currentTarget.action;
    formAction(formData);
  };

  useEffect(() => {
    if (state?.success) {
      if (createdUser) {
        // Leave modal open but show sharing options
      } else {
        setIsModalOpen(false);
      }
    }
  }, [state]);

  const handleShareWhatsApp = () => {
    if (!createdUser) return;
    const text = encodeURIComponent(`Hola, se ha creado tu cuenta en Gargom ERP.\n\nUsuario: ${createdUser.email}\nContraseña: ${createdUser.pass}\n\nAccede en: https://app.construccionesgargom.es`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareEmail = () => {
    if (!createdUser) return;
    const subject = encodeURIComponent('Acceso a Gargom ERP');
    const body = encodeURIComponent(`Hola,\n\nSe ha creado tu cuenta en Gargom ERP.\n\nUsuario: ${createdUser.email}\nContraseña: ${createdUser.pass}\n\nAccede en: https://app.construccionesgargom.es`);
    window.open(`mailto:${createdUser.email}?subject=${subject}&body=${body}`);
  };

  const handleSaveEdit = async (id: number) => {
    setIsUpdating(true);
    await updateUser(id, editName);
    setIsUpdating(false);
    setEditingUserId(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setIsDeleting(id);
      await deleteUser(id);
      setIsDeleting(null);
    }
  };

  const filteredUsers = initialUsers.filter(user => 
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-gargom-blue tracking-tight">Usuarios</h1>
          <p className="text-slate-500 mt-1">Gestiona los accesos a la plataforma</p>
        </div>
        <button
          onClick={() => {
            setCreatedUser(null);
            setGeneratedPassword('');
            setIsModalOpen(true);
          }}
          className="bg-gargom-accent hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-gargom-accent/20 hover:shadow-xl hover:shadow-gargom-accent/30 hover:-translate-y-0.5"
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Nuevo Usuario</span>
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

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-gargom-blue/5 rounded-3xl p-6 relative overflow-hidden group hover:border-gargom-accent/30 transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gargom-blue/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110" />
              
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                {editingUserId === user.id ? (
                  <button onClick={() => handleSaveEdit(user.id)} disabled={isUpdating} className="p-2 bg-gargom-accent text-white rounded-lg hover:bg-blue-600 transition">
                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <User size={16} />}
                  </button>
                ) : (
                  <button onClick={() => { setEditingUserId(user.id); setEditName(user.nombre); }} className="p-2 bg-white text-slate-500 rounded-lg shadow hover:text-gargom-accent transition">
                    <Edit2 size={16} />
                  </button>
                )}
                <button onClick={() => handleDelete(user.id)} disabled={isDeleting === user.id} className="p-2 bg-white text-slate-500 rounded-lg shadow hover:text-red-500 transition">
                  {isDeleting === user.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gargom-blue to-gargom-accent flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {user.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  {editingUserId === user.id ? (
                    <input 
                      autoFocus
                      type="text" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)}
                      className="font-bold text-lg text-gargom-blue border-b-2 border-gargom-accent focus:outline-none bg-transparent w-full"
                    />
                  ) : (
                    <h3 className="font-bold text-lg text-gargom-blue">{user.nombre}</h3>
                  )}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 mt-1">
                    Activo
                  </span>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>{new Date(user.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create User Modal */}
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
                  <h2 className="text-2xl font-bold text-gargom-blue">
                    {state?.success && createdUser ? '¡Usuario Creado!' : 'Crear Usuario'}
                  </h2>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setCreatedUser(null);
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {state?.success && createdUser ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 text-green-800 rounded-2xl border border-green-100 text-center">
                      <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User size={24} />
                      </div>
                      <p className="font-medium">El usuario se ha registrado correctamente.</p>
                      <p className="text-sm mt-1 opacity-80">¿Deseas compartir las credenciales?</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleShareWhatsApp} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors font-medium">
                        <Share2 size={24} />
                        <span>WhatsApp</span>
                      </button>
                      <button onClick={handleShareEmail} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium">
                        <Mail size={24} />
                        <span>Email</span>
                      </button>
                    </div>
                    
                    <button onClick={() => { setIsModalOpen(false); setCreatedUser(null); }} className="w-full text-center py-3 font-medium text-slate-500 hover:text-slate-800">
                      Cerrar
                    </button>
                  </div>
                ) : (
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
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
                      <label className="text-sm font-medium text-slate-700 ml-1">Correo electrónico</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all"
                          placeholder="usuario@gargom.es"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1 mb-1">
                        <label className="text-sm font-medium text-slate-700">Contraseña</label>
                        <button type="button" onClick={generatePassword} className="text-xs text-gargom-accent hover:text-blue-700 font-medium flex items-center gap-1">
                          <KeyRound size={12} /> Generar segura
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                          <Lock size={18} />
                        </div>
                        <input
                          type="text"
                          name="password"
                          required
                          value={generatedPassword}
                          onChange={(e) => setGeneratedPassword(e.target.value)}
                          minLength={6}
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gargom-accent/50 focus:bg-white transition-all font-mono"
                          placeholder="••••••••"
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
                        {isPending ? <Loader2 size={20} className="animate-spin" /> : <span>Crear Usuario</span>}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
