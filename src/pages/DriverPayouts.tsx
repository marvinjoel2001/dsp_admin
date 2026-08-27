import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  QrCode,
  CreditCard,
  Building2,
  FileSpreadsheet,
  RefreshCw,
  Search,
  Check,
  X,
  Eye,
  User,
  ArrowDownToLine,
  Phone,
} from 'lucide-react';
import { api } from '../services/api';

interface DriverWithdrawalRow {
  id: string;
  driverId: string;
  amount: number;
  method: 'BANK_TRANSFER' | 'QR_PAYMENT';
  accountHolder: string;
  accountNumberOrPhone: string;
  qrPhotoUrl?: string;
  status: 'PENDING' | 'PAID' | 'REJECTED';
  paymentReference?: string;
  adminNotes?: string;
  paidAt?: string;
  createdAt: string;
  driver?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    ciNumber?: string;
    vehicleType?: string;
    avatarUrl?: string;
  };
}

export const DriverPayouts: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState<DriverWithdrawalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PAID'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal para Pagar al Repartidor
  const [payingWithdrawal, setPayingWithdrawal] = useState<DriverWithdrawalRow | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Modal para Ver QR / Datos Bancarios
  const [viewDetailsWithdrawal, setViewDetailsWithdrawal] = useState<DriverWithdrawalRow | null>(null);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const data = await api.get('/settlements/withdrawals');
      if (Array.isArray(data)) {
        setWithdrawals(data);
      }
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const driverName = w.driver?.fullName || w.accountHolder || '';
      const driverCi = w.driver?.ciNumber || '';
      const matchSearch =
        !searchQuery ||
        driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driverCi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.accountNumberOrPhone.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter === 'ALL') return true;
      return w.status === statusFilter;
    });
  }, [withdrawals, searchQuery, statusFilter]);

  // KPIs
  const pendingTotal = withdrawals
    .filter((w) => w.status === 'PENDING')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const paidTotal = withdrawals
    .filter((w) => w.status === 'PAID')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const pendingCount = withdrawals.filter((w) => w.status === 'PENDING').length;

  // Registrar Pago Realizado al Conductor
  const handleConfirmPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingWithdrawal) return;

    setIsSubmittingPay(true);
    try {
      await api.patch(`/settlements/withdrawals/${payingWithdrawal.id}/pay`, {
        paymentReference: paymentReference || `TRANS-${Date.now().toString().slice(-6)}`,
        adminNotes,
      });

      alert(`✅ Pago de Bs. ${Number(payingWithdrawal.amount).toFixed(2)} a ${payingWithdrawal.accountHolder} registrado con éxito.`);
      setPayingWithdrawal(null);
      setPaymentReference('');
      setAdminNotes('');
      fetchWithdrawals();
    } catch (err: any) {
      alert(`Error al registrar pago: ${err.message}`);
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // Rechazar solicitud de retiro
  const handleRejectWithdrawal = async (withdrawal: DriverWithdrawalRow) => {
    const reason = prompt('Indica el motivo del rechazo (se reembolsarán los fondos al conductor):', 'Datos bancarios erróneos');
    if (!reason) return;

    try {
      await api.patch(`/settlements/withdrawals/${withdrawal.id}/reject`, { reason });
      alert('Solicitud rechazada y fondos devueltos a la billetera del conductor.');
      fetchWithdrawals();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Exportar Planilla de Pagos a Excel (CSV)
  const exportPayoutsToCSV = () => {
    const headers = [
      'ID Solicitud',
      'Conductor',
      'CI',
      'Telefono',
      'Monto (Bs)',
      'Metodo de Pago',
      'Titular Cuenta / QR',
      'Numero Cuenta o Telefono',
      'Estado',
      'Fecha Solicitud',
      'Comprobante Pago',
    ];

    const rows = withdrawals.map((w) => [
      w.id,
      `"${w.driver?.fullName || w.accountHolder}"`,
      `"${w.driver?.ciNumber || 'N/A'}"`,
      `"${w.driver?.phone || 'N/A'}"`,
      Number(w.amount).toFixed(2),
      w.method === 'BANK_TRANSFER' ? 'Cuenta Bancaria' : 'QR Simple',
      `"${w.accountHolder}"`,
      `"${w.accountNumberOrPhone}"`,
      w.status,
      w.createdAt,
      `"${w.paymentReference || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planilla_pagos_drivers_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="p-8 space-y-8 max-w-[1700px] mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Pagos y Solicitudes de Retiro a Repartidores
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Gestión de transferencias interbancarias, abonos vía QR Simple y liquidación de ganancias de la flota.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportPayoutsToCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Descargar Planilla de Pagos (Excel)
          </button>
          <button
            type="button"
            onClick={fetchWithdrawals}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Tarjetas KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Cuentas por Pagar (Drivers)</span>
            <AlertCircle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            Bs. {pendingTotal.toFixed(2)}
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            {pendingCount} solicitudes pendientes de transferencia
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pagado Histórico</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            Bs. {paidTotal.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            Transferencias exitosas realizadas a conductores
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Solicitudes</span>
            <Building2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {withdrawals.length}
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1">
            Historial consolidado de retiros
          </div>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por conductor, CI o número de cuenta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
              {st === 'ALL' ? 'Todos' : st === 'PENDING' ? 'Pendientes' : 'Pagados'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Retiros */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-black text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Repartidor</th>
                <th className="px-6 py-4">Monto Solicitado</th>
                <th className="px-6 py-4">Método de Pago</th>
                <th className="px-6 py-4">Cuenta / Destino</th>
                <th className="px-6 py-4">Fecha Solicitud</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Comprobante</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Cargando solicitudes de retiro...
                  </td>
                </tr>
              ) : filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No hay solicitudes de retiro registradas en este momento.
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((w) => {
                  const isPending = w.status === 'PENDING';
                  return (
                    <tr key={w.id} className="hover:bg-slate-50/80 transition-colors font-medium">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-700 text-xs shrink-0 overflow-hidden">
                            {w.driver?.avatarUrl ? (
                              <img src={w.driver.avatarUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              w.driver?.fullName?.charAt(0) || 'D'
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm">
                              {w.driver?.fullName || w.accountHolder}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              CI: {w.driver?.ciNumber || 'N/A'} • {w.driver?.phone || ''}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-black text-sm text-slate-900">
                        Bs. {Number(w.amount).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {w.method === 'BANK_TRANSFER' ? (
                            <>
                              <Building2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>Banco</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                              <span>QR Simple</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{w.accountHolder}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {w.accountNumberOrPhone}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-[11px] font-mono">
                        {new Date(w.createdAt).toLocaleDateString('es-BO', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            w.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : w.status === 'REJECTED'
                              ? 'bg-red-50 text-red-700 border border-red-200/60'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          }`}
                        >
                          {w.status === 'PAID' ? 'Pagado' : w.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                        {w.paymentReference ? (
                          <span className="font-bold text-emerald-700">{w.paymentReference}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setViewDetailsWithdrawal(w)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                            title="Ver Datos Bancarios / QR"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setPayingWithdrawal(w);
                                  setPaymentReference(`TRANS-${Date.now().toString().slice(-6)}`);
                                }}
                                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                                title="Pagar y Registrar Comprobante"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Pagar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRejectWithdrawal(w)}
                                className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center gap-1 cursor-pointer"
                                title="Rechazar Retiro"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Realizar Pago y Registrar Comprobante */}
      {payingWithdrawal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                  Registrar Transferencia a Repartidor
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Abonar Bs. {Number(payingWithdrawal.amount).toFixed(2)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPayingWithdrawal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmPay} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1.5 text-xs text-slate-700">
                <div className="font-bold text-slate-900">Datos para la transferencia:</div>
                <div>Titular: <strong>{payingWithdrawal.accountHolder}</strong></div>
                <div>
                  Destino:{' '}
                  <strong>
                    {payingWithdrawal.method === 'BANK_TRANSFER' ? 'Cuenta Bancaria' : 'Teléfono / QR'}:{' '}
                    {payingWithdrawal.accountNumberOrPhone}
                  </strong>
                </div>
                {payingWithdrawal.driver?.ciNumber && (
                  <div>C.I. Repartidor: <strong>{payingWithdrawal.driver.ciNumber}</strong></div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  N° de Comprobante / Referencia Bancaria *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. BCP-4928192 o N° Transacción ACH"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas de Pago (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas internas de tesorería..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPayingWithdrawal(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingPay ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Pago</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Vista de Datos Bancarios / QR */}
      {viewDetailsWithdrawal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                Detalles del Destino de Retiro
              </h3>
              <button
                type="button"
                onClick={() => setViewDetailsWithdrawal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="text-slate-500">Conductor:</div>
                <div className="font-bold text-sm text-slate-900">
                  {viewDetailsWithdrawal.driver?.fullName || viewDetailsWithdrawal.accountHolder}
                </div>
                <div className="text-slate-500">C.I.: {viewDetailsWithdrawal.driver?.ciNumber || 'N/A'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="text-slate-500">Método de Destino:</div>
                <div className="font-extrabold text-slate-800">
                  {viewDetailsWithdrawal.method === 'BANK_TRANSFER' ? 'Cuenta Bancaria Interbancaria' : 'QR Simple'}
                </div>
                <div className="text-slate-500">Titular de la cuenta:</div>
                <div className="font-bold text-slate-900">{viewDetailsWithdrawal.accountHolder}</div>
                <div className="text-slate-500">Número de Cuenta / Teléfono QR:</div>
                <div className="font-mono font-black text-sm text-emerald-700">
                  {viewDetailsWithdrawal.accountNumberOrPhone}
                </div>
              </div>

              {viewDetailsWithdrawal.qrPhotoUrl && (
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <div className="text-xs font-bold text-slate-700 mb-2">Código QR del Conductor:</div>
                  <img
                    src={viewDetailsWithdrawal.qrPhotoUrl}
                    alt="QR de Pago"
                    className="w-48 h-48 mx-auto object-contain rounded-xl border border-slate-200 shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
