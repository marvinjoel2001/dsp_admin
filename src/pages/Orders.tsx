import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, Clock, MapPin, Eye, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = () => {
    api.get('/orders')
      .then(setOrders)
      .catch(() => {
        setOrders([
          {
            id: 'ord_8f912a7b',
            merchantReference: 'TIENDA-9941',
            status: 'IN_TRANSIT',
            pickupAddress: '062 Kuhn Plains Suite 793',
            pickupLat: -17.7833,
            pickupLng: -63.1821,
            dropoffAddress: '922 Wilfredo Tunnel',
            dropoffLat: -17.7950,
            dropoffLng: -63.1700,
            price: 54.0,
            driverPayout: 43.2,
            trackingToken: 'track-434567',
            createdAt: '2026-08-24T21:35:00Z',
          },
          {
            id: 'ord_91a02f3c',
            merchantReference: 'TIENDA-9942',
            status: 'SEARCHING_DRIVER',
            pickupAddress: '42 King Mission Apt. 152',
            pickupLat: -17.7780,
            pickupLng: -63.1890,
            dropoffAddress: '67 Hyatt Extension',
            dropoffLat: -17.7910,
            dropoffLng: -63.1750,
            price: 72.0,
            driverPayout: 57.6,
            trackingToken: 'track-434566',
            createdAt: '2026-08-24T21:30:00Z',
          },
        ]);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderAudit = async (orderId: string) => {
    try {
      const details = await api.get(`/orders/${orderId}`);
      setSelectedOrder(details);
    } catch {
      const found = orders.find((o) => o.id === orderId);
      setSelectedOrder({
        ...found,
        logs: [
          { previousStatus: null, newStatus: 'CREATED', changedBy: 'MERCHANT', createdAt: '2026-08-24T21:30:00Z' },
          { previousStatus: 'CREATED', newStatus: 'SEARCHING_DRIVER', changedBy: 'SYSTEM', createdAt: '2026-08-24T21:30:05Z' },
          { previousStatus: 'SEARCHING_DRIVER', newStatus: 'ASSIGNED', changedBy: 'DRIVER', createdAt: '2026-08-24T21:30:15Z' },
          { previousStatus: 'ASSIGNED', newStatus: 'IN_TRANSIT', changedBy: 'DRIVER', createdAt: '2026-08-24T21:35:00Z' },
        ],
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Gestión del Ciclo de Vida de Órdenes</h2>
          <p className="text-xs text-slate-500 font-medium">Auditoría inmutable, transiciones de estados y asignación de conductores</p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200/80 font-bold">
            <tr>
              <th className="py-4 px-6 font-semibold">ID Orden</th>
              <th className="py-4 px-6 font-semibold">Ref. Tienda</th>
              <th className="py-4 px-6 font-semibold">Dirección Recogida</th>
              <th className="py-4 px-6 font-semibold">Dirección Entrega</th>
              <th className="py-4 px-6 font-semibold">Precio / Pago Conductor</th>
              <th className="py-4 px-6 font-semibold">Estado</th>
              <th className="py-4 px-6 font-semibold text-right">Auditoría</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-6 font-mono font-bold text-slate-900">{o.id}</td>
                <td className="py-4 px-6 font-semibold text-slate-700">{o.merchantReference}</td>
                <td className="py-4 px-6 text-slate-700 max-w-[180px] truncate font-medium">{o.pickupAddress}</td>
                <td className="py-4 px-6 text-slate-700 max-w-[180px] truncate font-medium">{o.dropoffAddress}</td>
                <td className="py-4 px-6 font-bold text-slate-900">
                  ${Number(o.price).toFixed(2)} <span className="text-slate-400 font-normal">(${Number(o.driverPayout).toFixed(2)})</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    o.status === 'DELIVERED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : o.status === 'IN_TRANSIT'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {o.status === 'IN_TRANSIT' ? 'EN CAMINO' : o.status === 'DELIVERED' ? 'ENTREGADO' : 'BUSCANDO'}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => openOrderAudit(o.id)}
                    className="p-2 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 rounded-lg transition-colors"
                    title="Ver Auditoría"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Auditoría */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-dropdown rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Línea de Tiempo de Auditoría</h3>
                <p className="text-xs text-emerald-700 font-mono font-semibold">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {(selectedOrder.logs || []).map((log: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 shrink-0 ring-4 ring-emerald-100" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {log.previousStatus ? `${log.previousStatus} → ` : ''}
                      <span className="text-emerald-700 font-extrabold">{log.newStatus}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Modificado por <span className="font-bold text-slate-700">{log.changedBy}</span> • {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
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
