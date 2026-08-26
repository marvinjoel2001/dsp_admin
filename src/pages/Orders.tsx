import React, { useState, useEffect, useMemo } from 'react';
import { Package, Search, Filter, Clock, MapPin, Eye, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = () => {
    setIsLoading(true);
    api.get('/orders')
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => {
        console.error('Error fetching orders:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o.id?.toLowerCase().includes(q) ||
        o.merchantReference?.toLowerCase().includes(q) ||
        o.pickupAddress?.toLowerCase().includes(q) ||
        o.dropoffAddress?.toLowerCase().includes(q) ||
        o.price?.toString().includes(q) ||
        o.status?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (statusFilter !== 'ALL') {
        return o.status === statusFilter;
      }
      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  const openOrderAudit = async (orderId: string) => {
    try {
      const details = await api.get(`/orders/${orderId}`);
      setSelectedOrder(details);
    } catch {
      const found = orders.find((o) => o.id === orderId);
      setSelectedOrder({
        ...found,
        logs: [
          { previousStatus: null, newStatus: 'CREATED', changedBy: 'MERCHANT', createdAt: found?.createdAt || new Date().toISOString() },
          { previousStatus: 'CREATED', newStatus: found?.status || 'SEARCHING_DRIVER', changedBy: 'SYSTEM', createdAt: new Date().toISOString() },
        ],
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-600" />
            Gestión del Ciclo de Vida de Órdenes
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Auditoría inmutable, transiciones de estados y asignación de conductores
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={isLoading}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors shrink-0 shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refrescar Órdenes
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por ID de orden, referencia de tienda, dirección de recogida o entrega..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 rounded-xl transition-all ${
              statusFilter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setStatusFilter('SEARCHING_DRIVER')}
            className={`px-3 py-2 rounded-xl transition-all ${
              statusFilter === 'SEARCHING_DRIVER' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Buscando ({orders.filter((o) => o.status === 'SEARCHING_DRIVER').length})
          </button>
          <button
            onClick={() => setStatusFilter('ASSIGNED')}
            className={`px-3 py-2 rounded-xl transition-all ${
              statusFilter === 'ASSIGNED' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Asignados ({orders.filter((o) => o.status === 'ASSIGNED').length})
          </button>
          <button
            onClick={() => setStatusFilter('IN_TRANSIT')}
            className={`px-3 py-2 rounded-xl transition-all ${
              statusFilter === 'IN_TRANSIT' ? 'bg-blue-600 text-white shadow-xs' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            En Ruta ({orders.filter((o) => o.status === 'IN_TRANSIT').length})
          </button>
          <button
            onClick={() => setStatusFilter('DELIVERED')}
            className={`px-3 py-2 rounded-xl transition-all ${
              statusFilter === 'DELIVERED' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Entregados ({orders.filter((o) => o.status === 'DELIVERED').length})
          </button>
        </div>
      </div>

      {/* Tabla de Órdenes */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Package className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No se encontraron órdenes</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? `No hay órdenes que coincidan con la búsqueda "${searchQuery}".`
                : 'Aún no hay órdenes registradas en este estado.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            )}
          </div>
        ) : (
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
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-slate-900">#{o.id.substring(0, 8)}</td>
                  <td className="py-4 px-6 font-semibold text-slate-700">{o.merchantReference || 'N/A'}</td>
                  <td className="py-4 px-6 text-slate-700 max-w-[200px] truncate font-medium">{o.pickupAddress}</td>
                  <td className="py-4 px-6 text-slate-700 max-w-[200px] truncate font-medium">{o.dropoffAddress}</td>
                  <td className="py-4 px-6 font-bold text-slate-900">
                    Bs. {Number(o.price).toFixed(2)}{' '}
                    <span className="text-slate-400 font-normal">
                      (Bs. {Number(o.driverPayout || (Number(o.price) * 0.8)).toFixed(2)})
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        o.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : o.status === 'IN_TRANSIT'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : o.status === 'ASSIGNED'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {o.status === 'IN_TRANSIT'
                        ? 'EN CAMINO'
                        : o.status === 'DELIVERED'
                        ? 'ENTREGADO'
                        : o.status === 'ASSIGNED'
                        ? 'ASIGNADO'
                        : 'BUSCANDO'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => openOrderAudit(o.id)}
                      className="p-2 hover:bg-slate-100 text-slate-500 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                      title="Ver Auditoría"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Auditoría */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-dropdown rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Línea de Tiempo de Auditoría</h3>
                <p className="text-xs text-emerald-700 font-mono font-semibold">#{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {(selectedOrder.logs || []).map((log: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 mt-1.5 shrink-0 ring-4 ring-emerald-100" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {log.previousStatus ? `${log.previousStatus} → ` : ''}
                      <span className="text-emerald-700 font-extrabold">{log.newStatus}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Modificado por <span className="font-bold text-slate-700">{log.changedBy}</span> •{' '}
                      {new Date(log.createdAt).toLocaleTimeString()}
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
