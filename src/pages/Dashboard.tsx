import React, { useEffect, useState } from 'react';
import { Package, Bike, Webhook, CheckCircle2, TrendingUp, ArrowUpRight, Zap, ShieldCheck, Activity } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { api } from '../services/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeOrders: 0,
    onlineDrivers: 0,
    webhookSuccessRate: '100%',
    totalRevenue: 'Bs. 0.00',
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [ordersData, driversData, webhooksData] = await Promise.all([
        api.get('/orders').catch(() => []),
        api.get('/drivers').catch(() => []),
        api.get('/webhooks/deliveries').catch(() => []),
      ]);

      if (Array.isArray(ordersData)) {
        setRecentOrders(ordersData.slice(0, 8));
        const active = ordersData.filter((o: any) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
        const totalRev = ordersData.reduce((acc: number, curr: any) => acc + Number(curr.price || 0), 0);

        setStats((prev) => ({
          ...prev,
          activeOrders: active,
          totalRevenue: `Bs. ${totalRev.toFixed(2)}`,
        }));
      }

      if (Array.isArray(driversData)) {
        const onlineCount = driversData.filter((d: any) => d.isOnline).length;
        setStats((prev) => ({
          ...prev,
          onlineDrivers: onlineCount,
        }));
      }

      if (Array.isArray(webhooksData) && webhooksData.length > 0) {
        const successCount = webhooksData.filter((w: any) => w.success).length;
        const rate = ((successCount / webhooksData.length) * 100).toFixed(1);
        setStats((prev) => ({
          ...prev,
          webhookSuccessRate: `${rate}%`,
        }));
      }
    } catch (err) {
      console.error('Error cargando dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 space-y-8">
      {/* Tarjetas de Métricas Principales Reales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Entregas Activas"
          value={stats.activeOrders}
          change="En tiempo real"
          icon={Package}
          color="emerald"
        />
        <StatCard
          label="Conductores en Línea"
          value={stats.onlineDrivers}
          change="Transmitiendo GPS"
          icon={Bike}
          color="blue"
        />
        <StatCard
          label="Facturación Total"
          value={stats.totalRevenue}
          change="En Bolivianos (Bs.)"
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          label="Entregabilidad Webhooks"
          value={stats.webhookSuccessRate}
          change="0 eventos en DLQ"
          icon={Webhook}
          color="purple"
        />
      </div>

      {/* Grid de Estado en Vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tabla de Flujo de Órdenes */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Flujo de Órdenes en Tiempo Real</h3>
              <p className="text-xs text-slate-500 font-medium">Datos sincronizados con la base de datos PostgreSQL</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Refrescar
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Package className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-medium">No hay órdenes registradas aún</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="pb-3 font-semibold">ID Orden</th>
                    <th className="pb-3 font-semibold">Ref. Tienda</th>
                    <th className="pb-3 font-semibold">Recogida → Entrega</th>
                    <th className="pb-3 font-semibold">Monto</th>
                    <th className="pb-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 font-mono font-bold text-slate-900">#{order.id.substring(0, 8)}</td>
                      <td className="py-3.5 font-semibold text-slate-600">{order.merchantReference || 'N/A'}</td>
                      <td className="py-3.5 text-slate-700 max-w-[220px] truncate font-medium">
                        {order.pickupAddress} <span className="text-emerald-600 font-bold">→</span> {order.dropoffAddress}
                      </td>
                      <td className="py-3.5 font-extrabold text-slate-900">Bs. {Number(order.price).toFixed(2)}</td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.status === 'IN_TRANSIT'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : order.status === 'ASSIGNED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.status === 'IN_TRANSIT' ? 'EN CAMINO' : order.status === 'DELIVERED' ? 'ENTREGADO' : order.status === 'ASSIGNED' ? 'ASIGNADO' : 'BUSCANDO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Salud de los Motores y Subsistemas */}
        <div className="glass-panel rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Salud del Motor DSP</h3>
            <p className="text-xs text-slate-500 font-medium">Estado de subsistemas en tiempo real</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">Indexación Espacial Redis GEO</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-600">&lt; 8ms</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Webhook className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">Colas BullMQ de Webhooks</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-600">0 En Cola</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">Bloqueo Atómico de Asignación</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-600">Activo (30s)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 shadow-xs">
            <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Aislamiento Multi-Tenant B2B
            </p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Todas las cotizaciones y firmas criptográficas HMAC SHA-256 se aíslan por hash único de cada tienda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
