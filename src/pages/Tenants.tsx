import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { notify } from '../utils/notify';
import { Pagination } from '../components/Pagination';
import {
  Store,
  Key,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Trash2,
  XCircle,
  ExternalLink,
  Code2,
  Edit,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Edit2,
  Ban,
  Search
} from 'lucide-react';

export const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal Editar Tienda
  const [editTenant, setEditTenant] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWebhookUrl, setEditWebhookUrl] = useState('');
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);

  const fetchTenants = () => {
    setIsLoading(true);
    return api.get('/tenants')
      .then((data) => {
        if (Array.isArray(data)) setTenants(data);
      })
      .catch((err) => {
        console.error('Error fetching tenants:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/tenants', { name, email, webhookUrl });
      setCreatedKey(res.apiKeyRaw);
      if (res?.id && res?.apiKeyRaw) {
        localStorage.setItem(`tenant_apikey_${res.id}`, res.apiKeyRaw);
      }
      notify.success(`Tienda "${name}" registrada exitosamente.`, 'Guarda la clave API generada.');
      fetchTenants();
      setName('');
      setEmail('');
      setWebhookUrl('');
    } catch (err: any) {
      notify.error(`Error al registrar tienda: ${err.message}`);
    }
  };

  const handleToggleStatus = async (tenant: any) => {
    const action = tenant.isActive ? 'desactivar y bloquear el acceso API de' : 'activar el acceso API de';
    if (!confirm(`¿Estás seguro de ${action} "${tenant.name}"?`)) return;
    try {
      await api.patch(`/tenants/${tenant.id}/toggle-status`);
      notify.success(`Tienda ${tenant.name} ${tenant.isActive ? 'desactivada' : 'activada'} con éxito.`);
      fetchTenants();
    } catch (err: any) {
      notify.error(`Error al cambiar estado: ${err.message}`);
    }
  };

  const handleDeleteTenant = async (tenant: any) => {
    if (!confirm(`⚠️ ¡ATENCIÓN! ¿Estás seguro de eliminar definitivamente a la tienda "${tenant.name}"? Sus claves API dejarán de funcionar de inmediato.`)) return;
    try {
      await api.delete(`/tenants/${tenant.id}`);
      notify.success(`Tienda ${tenant.name} eliminada con éxito.`);
      fetchTenants();
    } catch (err: any) {
      notify.error(`Error al eliminar tienda: ${err.message}`);
    }
  };

  const handleOpenEdit = (tenant: any) => {
    setEditTenant(tenant);
    setEditName(tenant.name || '');
    setEditEmail(tenant.email || '');
    setEditWebhookUrl(tenant.webhookUrl || '');
  };

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTenant) return;
    setIsEditingSubmitting(true);
    try {
      await api.put(`/tenants/${editTenant.id}`, {
        name: editName,
        email: editEmail,
        webhookUrl: editWebhookUrl,
      });
      notify.success(`Tienda "${editName}" actualizada correctamente.`);
      setEditTenant(null);
      fetchTenants();
    } catch (err: any) {
      notify.error(`Error al actualizar tienda: ${err.message}`);
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    notify.success('Copiado al portapapeles');
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        t.id?.toLowerCase().includes(q) ||
        t.name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.webhookUrl?.toLowerCase().includes(q)
      );
    });
  }, [tenants, searchQuery]);

  const paginatedTenants = useMemo(() => {
    const fromIndex = (currentPage - 1) * pageSize;
    return filteredTenants.slice(fromIndex, fromIndex + pageSize);
  }, [filteredTenants, currentPage, pageSize]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Store className="w-6 h-6 text-emerald-600" />
            Tiendas y Comercios B2B
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Gestión de comercios, generación de Claves API seguras y configuración de Webhooks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchTenants()}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all border border-slate-200 shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
          <button
            onClick={() => { setIsModalOpen(true); setCreatedKey(null); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Tienda
          </button>
        </div>
      </div>

      {/* Buscador de Tiendas */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar comercio por nombre, correo, URL o ID..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
        />
      </div>

      {/* Tabla de Comercios */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[10px] uppercase font-black tracking-wider">
              <tr>
                <th className="py-4 px-6 font-semibold">Comercio / Tienda</th>
                <th className="py-4 px-6 font-semibold">Clave API (Hash SHA-256)</th>
                <th className="py-4 px-6 font-semibold">URL de Webhook Saliente</th>
                <th className="py-4 px-6 font-semibold">Secreto HMAC</th>
                <th className="py-4 px-6 font-semibold">Estado</th>
                <th className="py-4 px-6 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Cargando comercios...
                  </td>
                </tr>
              ) : paginatedTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No se encontraron comercios registrados.
                  </td>
                </tr>
              ) : (
                paginatedTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700 font-bold shadow-xs">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{t.name}</p>
                          <p className="text-[11px] text-slate-500">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-semibold">
                        {t.apiKeyMasked || 'dsp_live_••••••••'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700 max-w-[200px] truncate font-medium">
                        <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{t.webhookUrl || 'No configurada'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-600 text-[11px]">
                          {t.webhookSecret?.substring(0, 10)}...
                        </span>
                        <button
                          onClick={() => handleCopy(t.webhookSecret, t.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copiar Secreto"
                        >
                          {copiedId === t.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        t.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {t.isActive ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                          title="Editar datos de la tienda"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(t)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            t.isActive
                              ? 'hover:bg-amber-50 text-slate-400 hover:text-amber-600'
                              : 'hover:bg-emerald-50 text-amber-600 hover:text-emerald-600'
                          }`}
                          title={t.isActive ? 'Bloquear y desactivar API' : 'Reactivar acceso API'}
                        >
                          {t.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`¿Regenerar Clave API para ${t.name}? La clave anterior dejará de funcionar.`)) {
                              const res = await api.post(`/tenants/${t.id}/regenerate-key`, {});
                              setCreatedKey(res.apiKeyRaw);
                              if (res?.apiKeyRaw) {
                                localStorage.setItem(`tenant_apikey_${t.id}`, res.apiKeyRaw);
                              }
                              setIsModalOpen(true);
                            }
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                          title="Regenerar Clave API"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(t)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar tienda definitivamente"
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

        {/* Paginación de Comercios */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredTenants.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Modal: Crear Tienda o Mostrar Clave */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-dropdown rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                {createdKey ? '🔑 Clave API B2B Generada' : 'Registrar Nuevo Comercio B2B'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {createdKey
                  ? 'Copia esta clave ahora mismo. Por seguridad, no volverá a mostrarse en texto plano.'
                  : 'Ingresa los datos del comercio para emitir sus credenciales de integración.'}
              </p>
            </div>

            {createdKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-emerald-200">
                  <p className="text-[11px] font-mono font-bold text-emerald-800 break-all">{createdKey}</p>
                </div>
                <button
                  onClick={() => handleCopy(createdKey, 'modal-key')}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                  {copiedId === 'modal-key' ? '¡Copiado al Portapapeles!' : 'Copiar Clave API'}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Listo
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre de la Tienda / Empresa</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. SuperEats Bolivia"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Correo de Integración</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="dev@empresa.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">URL del Endpoint de Webhook (Opcional)</label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.empresa.com/webhooks/dsp"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Generar Credenciales
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Editar Tienda (CRUD) */}
      {editTenant && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-dropdown rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Editar Datos de la Tienda</h3>
                <p className="text-xs text-slate-500 font-medium">Modifica la información y endpoint de webhooks</p>
              </div>
              <button
                onClick={() => setEditTenant(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nombre de la Tienda *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Correo de Integración *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">URL del Endpoint de Webhook</label>
                <input
                  type="url"
                  value={editWebhookUrl}
                  onChange={(e) => setEditWebhookUrl(e.target.value)}
                  placeholder="https://api.empresa.com/webhooks/dsp"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTenant(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isEditingSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isEditingSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
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
