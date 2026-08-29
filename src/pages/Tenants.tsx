import React, { useState, useEffect } from 'react';
import { Store, Key, Copy, Check, Plus, RefreshCw, Globe, Shield } from 'lucide-react';
import { api } from '../services/api';

export const Tenants: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      fetchTenants();
      setName('');
      setEmail('');
      setWebhookUrl('');
    } catch (err: any) {
      alert(`Error al registrar tienda: ${err.message}`);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Tiendas y Comercios B2B</h2>
          <p className="text-xs text-slate-500 font-medium">Gestión de comercios, generación de Claves API seguras y configuración de Webhooks</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchTenants()}
            disabled={isLoading}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs transition-all border border-slate-200 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualizando...' : 'Actualizar Tiendas'}</span>
          </button>
          <button
            onClick={() => { setIsModalOpen(true); setCreatedKey(null); }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Registrar Nueva Tienda
          </button>
        </div>
      </div>

      {/* Tabla de Comercios */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200/80 font-bold">
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
            {tenants.map((t) => (
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
                      className="p-1 text-slate-400 hover:text-slate-700"
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
                  <button
                    onClick={async () => {
                      if (confirm(`¿Regenerar Clave API para ${t.name}? La clave anterior dejará de funcionar.`)) {
                        const res = await api.post(`/tenants/${t.id}/regenerate-key`, {});
                        setCreatedKey(res.apiKeyRaw);
                        setIsModalOpen(true);
                      }
                    }}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 rounded-lg transition-colors"
                    title="Regenerar Clave API"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    </div>
  );
};
