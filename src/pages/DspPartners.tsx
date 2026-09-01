import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Bike,
  Package,
  ToggleLeft,
  ToggleRight,
  X,
  Sparkles,
  Loader2,
  DollarSign,
  RefreshCw,
  Edit2,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api';
import { notify } from '../utils/notify';

export const DspPartners: React.FC = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Crear
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    code: '',
    email: '',
    password: '',
    contactName: '',
    contactPhone: '',
    city: 'Santa Cruz',
    payoutPerOrder: 5.0,
  });

  // Modal Editar Asociación
  const [editPartner, setEditPartner] = useState<any | null>(null);
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    email: '',
    password: '',
    contactName: '',
    contactPhone: '',
    city: 'Santa Cruz',
    payoutPerOrder: 5.0,
  });

  const fetchPartners = () => {
    setIsLoading(true);
    api.get('/dsp-partners')
      .then((data: any) => {
        if (Array.isArray(data)) setPartners(data);
      })
      .catch((err) => {
        console.error('Error fetching DSP partners:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleToggleActive = async (partnerId: string) => {
    try {
      await api.patch(`/dsp-partners/${partnerId}/toggle`);
      notify.info('Estado de asociación actualizado.');
      fetchPartners();
    } catch (err: any) {
      notify.error(`Error al cambiar estado: ${err.message}`);
    }
  };

  const handleDeletePartner = async (partner: any) => {
    if (!confirm(`⚠️ ¡ATENCIÓN! ¿Estás seguro de eliminar a la asociación "${partner.name}" (${partner.code})? Esta acción desvinculará sus conductores y pedidos.`)) return;
    try {
      await api.delete(`/dsp-partners/${partner.id}`);
      notify.success(`Asociación ${partner.name} eliminada con éxito.`);
      fetchPartners();
    } catch (err: any) {
      notify.error(`Error al eliminar asociación: ${err.message}`);
    }
  };

  const handleOpenEdit = (partner: any) => {
    setEditPartner(partner);
    setEditForm({
      name: partner.name || '',
      code: partner.code || '',
      email: partner.email || '',
      password: '',
      contactName: partner.contactName || '',
      contactPhone: partner.contactPhone || '',
      city: partner.city || 'Santa Cruz',
      payoutPerOrder: Number(partner.payoutPerOrder) || 5.0,
    });
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPartner) return;
    setIsEditingSubmitting(true);
    try {
      const payload: any = {
        name: editForm.name,
        code: editForm.code,
        email: editForm.email,
        contactName: editForm.contactName,
        contactPhone: editForm.contactPhone,
        city: editForm.city,
        payoutPerOrder: Number(editForm.payoutPerOrder),
      };
      if (editForm.password) {
        payload.password = editForm.password;
      }
      await api.patch(`/dsp-partners/${editPartner.id}`, payload);
      notify.success(`Asociación ${editForm.name} actualizada con éxito.`);
      setEditPartner(null);
      fetchPartners();
    } catch (err: any) {
      notify.error(`Error al actualizar asociación: ${err.message}`);
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.code || !form.email) {
      notify.warning('Por favor completa los campos obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/dsp-partners', {
        name: form.name,
        code: form.code,
        email: form.email,
        password: form.password || '123456',
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        city: form.city,
        payoutPerOrder: Number(form.payoutPerOrder),
      });

      notify.success('Asociación de motos registrada con éxito.');
      setIsModalOpen(false);
      setForm({
        name: '',
        code: '',
        email: '',
        password: '',
        contactName: '',
        contactPhone: '',
        city: 'Santa Cruz',
        payoutPerOrder: 5.0,
      });
      fetchPartners();
    } catch (err: any) {
      notify.error(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPartners = partners.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name?.toLowerCase().includes(q) ||
      p.code?.toLowerCase().includes(q) ||
      p.contactName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q)
    );
  });

  const totalDrivers = partners.reduce((acc, p) => acc + (p.driversCount || 0), 0);
  const totalOrders = partners.reduce((acc, p) => acc + (p.ordersCount || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            Asociaciones de Motos y DSPs Externos
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Administra las asociaciones tercerizadas, define sus tarifas por entrega y concédeles acceso a su propio panel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPartners}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Recargar asociaciones"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Asociación</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{partners.length}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Asociaciones Activas</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black">
            <Bike className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalDrivers}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Motorizados Afiliados</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalOrders}</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Órdenes Delegadas</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar asociación por nombre, código, representante o ciudad..."
          className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Asociación / DSP</th>
                <th className="py-4 px-6">Representante & Contacto</th>
                <th className="py-4 px-6">Ciudad</th>
                <th className="py-4 px-6">Tarifa / Pedido</th>
                <th className="py-4 px-6 text-center">Motorizados</th>
                <th className="py-4 px-6 text-center">Órdenes</th>
                <th className="py-4 px-6 text-center">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    Cargando asociaciones de motos...
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No se encontraron asociaciones registradas.
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-slate-900">{partner.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase">
                          {partner.code}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {partner.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{partner.contactName || 'No asignado'}</div>
                      {partner.contactPhone && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {partner.contactPhone}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {partner.city || 'Santa Cruz'}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                        ${Number(partner.payoutPerOrder || 0).toFixed(2)}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-xl">
                        <Bike className="w-3.5 h-3.5 text-indigo-600" />
                        {partner.driversCount || 0}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl">
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        {partner.ordersCount || 0}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          partner.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-red-50 text-red-700 border border-red-200/60'
                        }`}
                      >
                        {partner.isActive ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(partner)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                          title="Editar datos de la asociación"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(partner.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            partner.isActive
                              ? 'hover:bg-amber-50 text-slate-400 hover:text-amber-600'
                              : 'hover:bg-emerald-50 text-amber-600 hover:text-emerald-600'
                          }`}
                          title={partner.isActive ? 'Suspender asociación' : 'Activar asociación'}
                        >
                          {partner.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePartner(partner)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar asociación definitivamente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registrar Asociación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Registrar Asociación de Motos / DSP
                </h3>
                <p className="text-xs text-slate-400">
                  Crea la cuenta para permitirles operar y recibir órdenes delegadas.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre Asociación *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej: Motos Los Rápidos"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Código Único *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="Ej: DSP-RAPIDOS"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo de Acceso (Login) *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="asociacion@dsp.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contraseña Inicial *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Ej: 123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contacto / Representante
                  </label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                    placeholder="Ej: Don Carlos Mendoza"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={form.contactPhone}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                    placeholder="+591 71234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ciudad / Zona
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Ej: Santa Cruz"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tarifa a Pagar por Pedido ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={form.payoutPerOrder}
                    onChange={(e) => setForm({ ...form, payoutPerOrder: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Guardar y Habilitar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Asociación (CRUD) */}
      {editPartner && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setEditPartner(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Editar Asociación / DSP Partner</h3>
                <p className="text-xs text-slate-500 font-medium">Modifica los datos, contactos o comisión de la asociación</p>
              </div>
            </div>

            <form onSubmit={handleUpdatePartner} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Asociación *</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Código Identificador *</label>
                  <input
                    type="text"
                    required
                    value={editForm.code}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Correo de Acceso *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nueva Contraseña (Opcional)</label>
                  <input
                    type="password"
                    placeholder="Mantener contraseña actual"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Representante / Contacto</label>
                  <input
                    type="text"
                    value={editForm.contactName}
                    onChange={(e) => setEditForm({ ...editForm, contactName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Celular / WhatsApp</label>
                  <input
                    type="text"
                    value={editForm.contactPhone}
                    onChange={(e) => setEditForm({ ...editForm, contactPhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ciudad Base</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tarifa por Entrega (Bs.)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={editForm.payoutPerOrder}
                    onChange={(e) => setEditForm({ ...editForm, payoutPerOrder: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditPartner(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isEditingSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/20"
                >
                  {isEditingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
