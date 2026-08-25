import React, { useState, useEffect } from 'react';
import { Webhook, RefreshCw, CheckCircle2, AlertTriangle, Play, Shield, Terminal, ArrowUpRight, Search, Check, Copy } from 'lucide-react';
import { api } from '../services/api';
import { CryptoHelper } from '../services/crypto';

export const WebhooksConsole: React.FC = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [testSecret, setTestSecret] = useState('whsec_99418af882b7c4');
  const [testPayload, setTestPayload] = useState('{\n  "event": "order.in_transit",\n  "timestamp": "2026-08-24T21:35:00Z",\n  "data": {\n    "order_id": "ord_8f912a7b",\n    "merchant_reference": "TIENDA-9941",\n    "status": "IN_TRANSIT"\n  }\n}');
  const [computedSignature, setComputedSignature] = useState('');
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [copiedSig, setCopiedSig] = useState(false);

  const fetchDeliveries = () => {
    api.get('/webhooks/deliveries')
      .then(setDeliveries)
      .catch(() => {
        setDeliveries([
          {
            id: 'del_1a2b3c4d-9911',
            orderId: 'ord_8f912a7b',
            eventType: 'order.in_transit',
            status: 'SUCCESS',
            attempts: 1,
            httpStatusCode: 200,
            signature: '8f91b2c45e67a890123456789abcdef0123456789abcdef0123456789abcdef0',
            payload: {
              event: 'order.in_transit',
              timestamp: '2026-08-24T21:35:00Z',
              data: {
                order_id: 'ord_8f912a7b',
                merchant_reference: 'TIENDA-9941',
                status: 'IN_TRANSIT',
                driver: { name: 'Carlos M.', phone: '+59170000000', vehicle_plate: '1234-XYZ' },
                tracking_url: 'https://dsp.openplatform.com/track/ord_8f912a7b',
              },
            },
            createdAt: '2026-08-24T21:35:02Z',
          },
          {
            id: 'del_5e6f7a8b-2233',
            orderId: 'ord_91a02f3c',
            eventType: 'order.delivered',
            status: 'FAILED',
            attempts: 4,
            httpStatusCode: 504,
            errorMessage: 'Gateway Timeout tras 10000ms (Endpoint del comercio no responde)',
            signature: '33b2a1c90f87e6543210fedcba9876543210fedcba9876543210fedcba987654',
            payload: {
              event: 'order.delivered',
              timestamp: '2026-08-24T21:30:00Z',
              data: {
                order_id: 'ord_91a02f3c',
                merchant_reference: 'TIENDA-9942',
                status: 'DELIVERED',
                proof_photo_url: 'https://storage.dsp.com/proofs/photo_123.jpg',
              },
            },
            createdAt: '2026-08-24T21:30:05Z',
          },
        ]);
      });
  };

  useEffect(() => {
    fetchDeliveries();
    recalculateHmac();
  }, []);

  const recalculateHmac = () => {
    try {
      const sig = CryptoHelper.computeHmacSha256(testPayload, testSecret);
      setComputedSignature(sig);
    } catch {
      setComputedSignature('Payload JSON no válido');
    }
  };

  const handleManualRetry = async (deliveryId: string) => {
    setIsRetrying(deliveryId);
    try {
      await api.post(`/webhooks/deliveries/${deliveryId}/retry`, {});
      alert(`¡Evento ${deliveryId} re-encolado exitosamente a BullMQ!`);
      fetchDeliveries();
    } catch (err: any) {
      alert(`Error al reintentar: ${err.message}`);
    } finally {
      setIsRetrying(null);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Centro de Webhooks Salientes y DLQ</h2>
          <p className="text-xs text-slate-500 font-medium">
            Monitoreo de colas BullMQ, inspección de firmas HMAC y reintentos manuales para endpoints caídos
          </p>
        </div>
        <button
          onClick={fetchDeliveries}
          className="flex items-center gap-2 glass-card hover:bg-slate-100/80 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-xs"
        >
          <RefreshCw className="w-4 h-4 text-emerald-600" />
          Actualizar Registro
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla de Entregas de Webhooks */}
        <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-white/50">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <Webhook className="w-4 h-4 text-emerald-600" />
              Registro de Despachos en Vivo
            </h3>
            <span className="text-[11px] text-slate-500 font-mono font-semibold">Cola: webhooks-queue</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200/80 font-bold">
              <tr>
                <th className="py-3 px-5 font-semibold">Evento / Orden</th>
                <th className="py-3 px-5 font-semibold">Intentos</th>
                <th className="py-3 px-5 font-semibold">Código HTTP</th>
                <th className="py-3 px-5 font-semibold">Estado</th>
                <th className="py-3 px-5 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.map((del) => (
                <tr key={del.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-5">
                    <div>
                      <span className="font-bold text-slate-900 font-mono">{del.eventType}</span>
                      <p className="text-[11px] font-mono text-emerald-700 font-semibold">{del.orderId}</p>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-700 font-semibold">
                    {del.attempts} / 4
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-extrabold ${
                      del.httpStatusCode === 200
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {del.httpStatusCode ? `${del.httpStatusCode}` : 'TIMEOUT'}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                      del.status === 'SUCCESS'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {del.status === 'SUCCESS' ? 'EXITOSO' : 'FALLIDO (DLQ)'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right space-x-2">
                    <button
                      onClick={() => setSelectedDelivery(del)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      Inspeccionar
                    </button>
                    {del.status === 'FAILED' && (
                      <button
                        onClick={() => handleManualRetry(del.id)}
                        disabled={isRetrying === del.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        {isRetrying === del.id ? 'Reintentando...' : 'Re-despachar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Probador y Validador Interactivo de HMAC SHA-256 */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Probador de Firma HMAC SHA-256
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verifica cómo se calcula la cabecera <code className="text-emerald-700 font-bold bg-emerald-50 px-1 rounded">X-DSP-Signature</code> para las tiendas.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Secreto del Webhook</label>
              <input
                type="text"
                value={testSecret}
                onChange={(e) => { setTestSecret(e.target.value); recalculateHmac(); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-emerald-800 font-bold focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Payload JSON de Prueba</label>
              <textarea
                rows={5}
                value={testPayload}
                onChange={(e) => { setTestPayload(e.target.value); recalculateHmac(); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-500 transition-all"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-200">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  Cabecera X-DSP-Signature
                </label>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(computedSignature);
                    setCopiedSig(true);
                    setTimeout(() => setCopiedSig(false), 2000);
                  }}
                  className="text-slate-500 hover:text-emerald-700 text-xs flex items-center gap-1"
                >
                  {copiedSig ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span className="text-[10px] font-bold">{copiedSig ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] font-mono font-bold text-emerald-800 mt-1 break-all select-all leading-relaxed">
                {computedSignature}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Inspector de Payload */}
      {selectedDelivery && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-dropdown rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Inspector de Entrega de Webhook</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedDelivery.id}</p>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-slate-600 font-bold">Firma X-DSP-Signature</span>
                <p className="text-xs font-mono font-bold text-emerald-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 break-all select-all">
                  {selectedDelivery.signature}
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-600 font-bold">Payload JSON Crudo</span>
                <pre className="text-xs font-mono text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 overflow-x-auto max-h-56">
                  {JSON.stringify(selectedDelivery.payload, null, 2)}
                </pre>
              </div>

              {selectedDelivery.errorMessage && (
                <div>
                  <span className="text-[11px] text-red-600 font-bold">Registro de Error (DLQ)</span>
                  <p className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium">
                    {selectedDelivery.errorMessage}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedDelivery(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
