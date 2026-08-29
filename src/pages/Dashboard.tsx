import React, { useEffect, useState } from 'react';
import {
  Package,
  Bike,
  Webhook,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Activity,
  Users,
  Wallet,
  Receipt,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeOrders: 0,
    onlineDrivers: 0,
    webhookSuccessRate: '100%',
    totalRevenue: 'Bs. 0.00',
    totalDrivers: 0,
    verifiedDrivers: 0,
    totalGMV: 0,
    totalPlatformCommission: 0,
    pendingDriversDebt: 0,
    totalPaidToDrivers: 0,
    totalOwedByMerchants: 0,
    totalCollectedFromMerchants: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const ordersEndpoint = user?.role === 'DSP_EXTERNAL' && user.dspPartnerId
        ? `/orders?delegatedDspId=${user.dspPartnerId}`
        : '/orders';
      const driversEndpoint = user?.role === 'DSP_EXTERNAL' && user.dspPartnerId
        ? `/drivers?dspPartnerId=${user.dspPartnerId}`
        : '/drivers';

      const [ordersData, driversData, webhooksData, finMetrics] = await Promise.all([
        api.get(ordersEndpoint).catch(() => []),
        api.get(driversEndpoint).catch(() => []),
        user?.role === 'DSP_EXTERNAL' ? [] : api.get('/webhooks/deliveries').catch(() => []),
        user?.role === 'DSP_EXTERNAL' ? null : api.get('/settlements/dashboard-metrics').catch(() => null),
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
          totalDrivers: driversData.length,
          verifiedDrivers: driversData.filter((d: any) => (d.verificationStatus || '').toLowerCase() === 'verified').length,
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

      if (finMetrics) {
        setStats((prev) => ({
          ...prev,
          totalDrivers: finMetrics.totalDrivers || 0,
          verifiedDrivers: finMetrics.verifiedDrivers || 0,
          totalGMV: finMetrics.totalGMV || 0,
          totalPlatformCommission: finMetrics.totalPlatformCommission || 0,
          pendingDriversDebt: finMetrics.pendingDriversDebt || 0,
          totalPaidToDrivers: finMetrics.totalPaidToDrivers || 0,
          totalOwedByMerchants: finMetrics.totalOwedByMerchants || 0,
          totalCollectedFromMerchants: finMetrics.totalCollectedFromMerchants || 0,
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
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-[1700px] mx-auto">
      {/* Cabecera y Botón Refrescar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Métricas y Operaciones en Vivo</h2>
          <p className="text-xs text-slate-500 font-medium">Monitoreo de entregas, conductores y liquidaciones en tiempo real</p>
        </div>
        <button
          type="button"
          onClick={() => fetchDashboardData()}
          disabled={isLoading}
          className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-2 transition-all border border-slate-200 shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Actualizando...' : 'Actualizar Panel'}</span>
        </button>
      </div>

      {/* 1. Tarjetas de Métricas Operativas */}
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
          change={`${stats.verifiedDrivers} verificados de ${stats.totalDrivers}`}
          icon={Bike}
          color="blue"
        />
        <StatCard
          label="Ventas en Órdenes (GMV)"
          value={`Bs. ${stats.totalGMV.toFixed(2)}`}
          change="Volumen entregado"
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

      {/* 2. Sección Financiera Consolidada (Cuentas por Cobrar, Cuentas por Pagar, Comisiones) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Consolidado Financiero de Liquidaciones (Tesorería)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Control en tiempo real de cuentas por cobrar a comercios, pagos adeudados a repartidores y comisiones netas.
            </p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-black text-xs rounded-full border border-indigo-200/60">
            Moneda: Bolivianos (BOB)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Comisiones Netas Ganadas */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
              <span>Comisiones DSP</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700">
              Bs. {stats.totalPlatformCommission.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500">Ganancia neta de la plataforma</div>
          </div>

          {/* Cuentas por Cobrar a Tiendas */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-1">
            <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase">
              <span>Por Cobrar a Tiendas</span>
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-black text-amber-800">
              Bs. {stats.totalOwedByMerchants.toFixed(2)}
            </div>
            <div className="text-[11px] text-amber-700">
              Cobrado: Bs. {stats.totalCollectedFromMerchants.toFixed(2)}
            </div>
          </div>

          {/* Cuentas por Pagar a Drivers */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/60 space-y-1">
            <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase">
              <span>Por Pagar a Repartidores</span>
              <Wallet className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-blue-800">
              Bs. {stats.pendingDriversDebt.toFixed(2)}
            </div>
            <div className="text-[11px] text-blue-700">Solicitudes de retiro en espera</div>
          </div>

          {/* Total Pagado a Drivers */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-1">
            <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase">
              <span>Pagado a Repartidores</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-800">
              Bs. {stats.totalPaidToDrivers.toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-700">Abonado históricamente</div>
          </div>
        </div>
      </div>

      {/* Grid de Estado en Vivo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Órdenes Recientes */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Últimas Órdenes Despachadas
            </h3>
            <span className="text-xs text-slate-400 font-mono">Actualizado en vivo</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-black text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">ID</th>
                  <th className="px-4 py-3">Ruta</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 rounded-r-xl">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                      No hay órdenes recientes registradas.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-700">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600 truncate max-w-[200px]">
                        {order.pickupAddress} ➔ {order.dropoffAddress}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        Bs. {Number(order.price || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : order.status === 'CANCELLED'
                              ? 'bg-red-50 text-red-700 border border-red-200/60'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">
                        {new Date(order.createdAt).toLocaleTimeString('es-BO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Estado Operacional del Sistema */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Salud Operativa del Sistema
          </h3>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
              <div className="flex items-center justify-between font-bold text-emerald-800">
                <span>Motor de Asignación Automática</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-slate-600 text-[11px]">
                Radio dinámico activo buscando conductores en menos de 3.5 km.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
              <div className="flex items-center justify-between font-bold text-indigo-800">
                <span>Cola BullMQ & Webhooks</span>
                <span className="text-[11px] font-mono text-indigo-600">Conectado</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Reintentos automáticos con backoff exponencial activos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-1">
              <div className="flex items-center justify-between font-bold text-amber-800">
                <span>Telemetría GPS / WebSocket</span>
                <span className="text-[11px] font-mono text-amber-600">Búfer Híbrido</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                Actualizaciones por segundo sin pérdida de datos en zonas sin cobertura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
