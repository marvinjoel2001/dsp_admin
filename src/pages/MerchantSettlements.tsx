import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { notify } from '../utils/notify';
import { Pagination } from '../components/Pagination';
import {
  Receipt,
  Store,
  DollarSign,
  Download,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Eye,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  X,
  QrCode,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface MerchantSettlementRow {
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  webhookUrl?: string;
  totalOrders: number;
  deliveredOrdersCount: number;
  totalGMV: number;
  totalDriverPayouts: number;
  totalCommissionOwed: number; // Comisión generada a cobrar
  totalPaidByMerchant: number;
  pendingBalance: number;
  status: 'PAID' | 'PARTIAL' | 'PENDING';
  lastSettlementDate?: string;
}

export const MerchantSettlements: React.FC = () => {
  const [settlements, setSettlements] = useState<MerchantSettlementRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal Detalle de Órdenes del Comercio
  const [selectedTenantForOrders, setSelectedTenantForOrders] = useState<MerchantSettlementRow | null>(null);
  const [tenantOrders, setTenantOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Modal Registrar Pago de Comercio
  const [paymentModalTenant, setPaymentModalTenant] = useState<MerchantSettlementRow | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'QR_SIMPLE' | 'BANK_TRANSFER' | 'CASH'>('QR_SIMPLE');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const fetchSettlements = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/settlements/merchants');
      if (Array.isArray(data)) {
        setSettlements(data);
      }
    } catch (err) {
      console.error('Error fetching settlements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const filteredSettlements = useMemo(() => {
    return settlements.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.tenantId?.toLowerCase().includes(q) ||
        s.tenantName?.toLowerCase().includes(q) ||
        s.tenantEmail?.toLowerCase().includes(q);

      if (!matchQuery) return false;
      if (statusFilter === 'PENDING') return s.pendingBalance > 0;
      if (statusFilter === 'PAID') return s.pendingBalance <= 0;
      return true;
    });
  }, [settlements, searchQuery, statusFilter]);

  const paginatedSettlements = useMemo(() => {
    const fromIndex = (currentPage - 1) * pageSize;
    return filteredSettlements.slice(fromIndex, fromIndex + pageSize);
  }, [filteredSettlements, currentPage, pageSize]);

  // KPIs
  const totalPendingToCollect = settlements.reduce((acc, curr) => acc + curr.pendingBalance, 0);
  const totalCollected = settlements.reduce((acc, curr) => acc + curr.totalPaidByMerchant, 0);
  const totalGMV = settlements.reduce((acc, curr) => acc + curr.totalGMV, 0);
  const storesWithDebt = settlements.filter((s) => s.pendingBalance > 0).length;

  // Abrir auditoría de órdenes de la tienda
  const handleOpenOrdersModal = async (tenant: MerchantSettlementRow) => {
    setSelectedTenantForOrders(tenant);
    setIsLoadingOrders(true);
    try {
      const orders = await api.get(`/settlements/merchants/${tenant.tenantId}/orders`);
      setTenantOrders(Array.isArray(orders) ? orders : []);
    } catch {
      setTenantOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Registrar cobro al comercio
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalTenant) return;

    setIsSubmittingPayment(true);
    try {
      await api.post(`/settlements/merchants/${paymentModalTenant.tenantId}/record-payment`, {
        amountPaid: paymentAmount,
        method: paymentMethod,
        paymentReference: paymentReference || `REC-${Date.now().toString().slice(-6)}`,
        ordersCount: paymentModalTenant.deliveredOrdersCount,
        notes: paymentNotes,
      });

      notify.success(`Cobro de Bs. ${paymentAmount.toFixed(2)} registrado correctamente.`);
      setPaymentModalTenant(null);
      setPaymentAmount(0);
      setPaymentReference('');
      setPaymentNotes('');
      fetchSettlements();
    } catch (err: any) {
      notify.error(`Error al registrar cobro: ${err.message}`);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Exportar Liquidación General a Excel (CSV)
  const exportSettlementsToCSV = () => {
    const headers = [
      'ID Comercio',
      'Nombre Comercio',
      'Correo',
      'Ordenes Entregadas',
      'Ventas Totales GMV (Bs)',
      'Tarifa Drivers (Bs)',
      'Comision DSP a Cobrar (Bs)',
      'Total Pagado por Comercio (Bs)',
      'Saldo Pendiente (Bs)',
      'Estado',
    ];

    const rows = settlements.map((s) => [
      s.tenantId,
      `"${s.tenantName}"`,
      s.tenantEmail,
      s.deliveredOrdersCount,
      s.totalGMV.toFixed(2),
      s.totalDriverPayouts.toFixed(2),
      s.totalCommissionOwed.toFixed(2),
      s.totalPaidByMerchant.toFixed(2),
      s.pendingBalance.toFixed(2),
      s.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `liquidacion_comercios_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Exportar Órdenes de un Comercio a Excel (CSV)
  const exportTenantOrdersToCSV = () => {
    if (!selectedTenantForOrders) return;

    const headers = [
      'ID Orden',
      'Referencia Comercio',
      'Fecha Creacion',
      'Estado',
      'Direccion Recogida',
      'Direccion Entrega',
      'Total Pedido (Bs)',
      'Pago al Repartidor (Bs)',
      'Comision DSP (Bs)',
    ];

    const rows = tenantOrders.map((o) => [
      o.id,
      `"${o.merchantReference || ''}"`,
      o.createdAt,
      o.status,
      `"${o.pickupAddress}"`,
      `"${o.dropoffAddress}"`,
      Number(o.price || 0).toFixed(2),
      Number(o.driverPayout || 0).toFixed(2),
      (Number(o.price || 0) - Number(o.driverPayout || 0)).toFixed(2),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `informe_ordenes_${selectedTenantForOrders.tenantName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="p-8 space-y-8 max-w-[1700px] mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Liquidación y Cobranza a Comercios
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Control de comisiones por tienda, auditoría de órdenes entregadas, estado de cuentas y exportación de informes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchSettlements()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Recargar liquidaciones de comercios"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualizando...' : 'Actualizar Liquidaciones'}</span>
          </button>

          <button
            type="button"
            onClick={exportSettlementsToCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exportar Liquidación (Excel)
          </button>
          <button
            type="button"
            onClick={fetchSettlements}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas KPIs Financieras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cuentas por Cobrar (DSP)</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            Bs. {totalPendingToCollect.toFixed(2)}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
            <span>{storesWithDebt} tiendas con saldo pendiente de pago</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cobrado / Liquidado</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            Bs. {totalCollected.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Comisiones efectivamente recaudadas
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas Totales (GMV)</span>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            Bs. {totalGMV.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            Valor de todas las órdenes entregadas
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Comercios Afiliados</span>
            <Store className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {settlements.length}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            {settlements.length - storesWithDebt} tiendas al día con sus pagos
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar tienda por nombre o correo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Estado:</span>
          {(['ALL', 'PENDING', 'PAID'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Todos' : st === 'PENDING' ? 'Con Deuda' : 'Al Día'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Comercios y Liquidaciones */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-black text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Comercio / Tienda</th>
                <th className="px-6 py-4">Órdenes Entregadas</th>
                <th className="px-6 py-4">Ventas GMV</th>
                <th className="px-6 py-4">Comisión DSP a Cobrar</th>
                <th className="px-6 py-4">Total Pagado</th>
                <th className="px-6 py-4">Saldo Pendiente</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Cargando balances de comercios...
                  </td>
                </tr>
              ) : filteredSettlements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron comercios registrados o que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedSettlements.map((item) => {
                  const hasDebt = item.pendingBalance > 0;
                  return (
                    <tr key={item.tenantId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm">
                            {item.tenantName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{item.tenantName}</div>
                            <div className="text-[11px] text-slate-400">{item.tenantEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-extrabold text-slate-900">{item.deliveredOrdersCount}</span>
                        <span className="text-slate-400 ml-1">/ {item.totalOrders}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">
                        Bs. {item.totalGMV.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-indigo-700">
                        Bs. {item.totalCommissionOwed.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-700">
                        Bs. {item.totalPaidByMerchant.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-black text-sm ${
                            hasDebt ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        >
                          Bs. {item.pendingBalance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : item.status === 'PARTIAL'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}
                        >
                          {item.status === 'PAID' ? 'Al Día' : item.status === 'PARTIAL' ? 'Pago Parcial' : 'Deuda Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenOrdersModal(item)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                            title="Auditar Órdenes y Descargar Informe"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Órdenes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentModalTenant(item);
                              setPaymentAmount(item.pendingBalance > 0 ? item.pendingBalance : 50);
                            }}
                            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                            title="Registrar Cobro / Liquidación"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Cobrar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación de Comercios y Liquidaciones */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSettlements.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Modal 1: Auditoría de Órdenes del Comercio con Exportación a Excel */}
      {selectedTenantForOrders && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                  Informe de Órdenes y Comisiones
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {selectedTenantForOrders.tenantName}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Saldo pendiente a cobrar: <strong className="text-amber-600">Bs. {selectedTenantForOrders.pendingBalance.toFixed(2)}</strong> • Total Órdenes: {tenantOrders.length}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={exportTenantOrdersToCSV}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  Descargar Informe (Excel)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTenantForOrders(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lista de Órdenes */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingOrders ? (
                <div className="py-12 text-center text-slate-400">Cargando órdenes del comercio...</div>
              ) : tenantOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400">Este comercio aún no tiene órdenes registradas.</div>
              ) : (
                <div className="space-y-3">
                  {tenantOrders.map((ord) => {
                    const commission = Number(ord.price || 0) - Number(ord.driverPayout || 0);
                    return (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">#{ord.id}</span>
                            {ord.merchantReference && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">
                                {ord.merchantReference}
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                ord.status === 'DELIVERED'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                          <div className="text-slate-500 font-medium">
                            {ord.pickupAddress} ➔ {ord.dropoffAddress}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {new Date(ord.createdAt).toLocaleString('es-BO')}
                          </div>
                        </div>

                        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4 min-w-[140px]">
                          <div className="text-[11px] text-slate-400">Total Pedido: <strong>Bs. {Number(ord.price || 0).toFixed(2)}</strong></div>
                          <div className="text-sm font-black text-indigo-600">
                            Comisión DSP: Bs. {commission.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-emerald-600 font-medium">
                            Driver: Bs. {Number(ord.driverPayout || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Registrar Cobro / Liquidación al Comercio */}
      {paymentModalTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                  Registrar Cobro
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {paymentModalTenant.tenantName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModalTenant(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monto a Cobrar (Bs.) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Saldo pendiente total: <strong>Bs. {paymentModalTenant.pendingBalance.toFixed(2)}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Método de Pago Recibido *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                >
                  <option value="QR_SIMPLE">QR Simple (Transferencia Móvil)</option>
                  <option value="BANK_TRANSFER">Transferencia Interbancaria ACH</option>
                  <option value="CASH">Efectivo / Cobro Directo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Número de Transacción / Comprobante
                </label>
                <input
                  type="text"
                  placeholder="Ej. BCP-948192 o N° Comprobante QR"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas de Liquidación
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionales o periodo liquidado..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalTenant(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingPayment ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registrar Cobro</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
