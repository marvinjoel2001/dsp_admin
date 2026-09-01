import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Package,
  Search,
  Filter,
  Clock,
  MapPin,
  Eye,
  ShieldCheck,
  X,
  RefreshCw,
  AlertTriangle,
  Send,
  UserCheck,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Bike,
  Store,
  Phone,
  FileImage,
  Layers,
  Zap,
  Share2,
  ArrowRightLeft,
  PlusCircle,
  Calendar,
  DollarSign,
  Compass,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { notify } from '../utils/notify';

// Íconos visuales de Mapa para Recogida y Entrega
const pickupMarkerIcon = new L.DivIcon({
  className: 'custom-pickup-marker',
  html: `
    <div style="background:#4F46E5; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.35); font-weight:900; font-size:16px;">
      🏪
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

const dropoffMarkerIcon = new L.DivIcon({
  className: 'custom-dropoff-marker',
  html: `
    <div style="background:#059669; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.35); font-weight:900; font-size:16px;">
      📍
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// Componente clickeable en el mapa para fijar puntos de recogida y entrega
const LocationPicker: React.FC<{
  mode: 'pickup' | 'dropoff';
  onLocationSelect: (lat: number, lng: number) => void;
}> = ({ mode, onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(parseFloat(e.latlng.lat.toFixed(6)), parseFloat(e.latlng.lng.toFixed(6)));
    },
  });
  return null;
};

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modales Operativos
  const [isForceStatusModalOpen, setIsForceStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState('DELIVERED');
  const [forceReason, setForceReason] = useState('');
  const [creditDriver, setCreditDriver] = useState(true);
  const [overrideProofPhoto, setOverrideProofPhoto] = useState('');
  const [isSubmittingForce, setIsSubmittingForce] = useState(false);

  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [selectedDriverForReassign, setSelectedDriverForReassign] = useState('');
  const [isSubmittingReassign, setIsSubmittingReassign] = useState(false);

  // Modales Delegación DSP / Asociación
  const [dspPartners, setDspPartners] = useState<any[]>([]);
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [selectedDspForDelegation, setSelectedDspForDelegation] = useState('');
  const [delegationPayout, setDelegationPayout] = useState<number>(5.0);
  const [isSubmittingDelegation, setIsSubmittingDelegation] = useState(false);

  const [isDspAssignModalOpen, setIsDspAssignModalOpen] = useState(false);
  const [dspDriverToAssign, setDspDriverToAssign] = useState('');
  const [isSubmittingDspAssign, setIsSubmittingDspAssign] = useState(false);

  const [isResendingWebhook, setIsResendingWebhook] = useState(false);
  const [isRetryingMatch, setIsRetryingMatch] = useState(false);

  // Estados del Modal Crear Pedido Manual con Mapa
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [activePickerMode, setActivePickerMode] = useState<'pickup' | 'dropoff'>('pickup');
  const [newMerchantRef, setNewMerchantRef] = useState('');
  const [newPickupAddress, setNewPickupAddress] = useState('Restaurante Don Chicho, Av. San Martín #450');
  const [newPickupLat, setNewPickupLat] = useState(-17.7833);
  const [newPickupLng, setNewPickupLng] = useState(-63.1821);
  const [newDropoffAddress, setNewDropoffAddress] = useState('Condominio Las Palmas, Av. Busch #820');
  const [newDropoffLat, setNewDropoffLat] = useState(-17.7950);
  const [newDropoffLng, setNewDropoffLng] = useState(-63.1700);
  const [newPackageNotes, setNewPackageNotes] = useState('Entregar en recepción. Tocar timbre.');
  const [newPickupTime, setNewPickupTime] = useState('Inmediato (10-15 min)');
  const [newDeliveryTime, setNewDeliveryTime] = useState('Estimado 30-40 min');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const fetchOrders = () => {
    setIsLoading(true);
    const endpoint = user?.role === 'DSP_EXTERNAL' && user.dspPartnerId
      ? `/orders?delegatedDspId=${user.dspPartnerId}`
      : '/orders';

    api.get(endpoint)
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

  const fetchDrivers = () => {
    const endpoint = user?.role === 'DSP_EXTERNAL' && user.dspPartnerId
      ? `/drivers?dspPartnerId=${user.dspPartnerId}`
      : '/drivers';

    api.get(endpoint)
      .then((data) => {
        if (Array.isArray(data)) setDrivers(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchOrders();
    fetchDrivers();

    if (user?.role === 'ADMIN') {
      api.get('/dsp-partners')
        .then((data) => {
          if (Array.isArray(data)) setDspPartners(data);
        })
        .catch(() => {});

      api.get('/tenants')
        .then((data) => {
          if (Array.isArray(data)) {
            setTenants(data);
            if (data.length > 0) setSelectedTenantId(data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleDelegateOrder = async () => {
    if (!selectedOrder || !selectedDspForDelegation) {
      notify.warning('Por favor selecciona una asociación de motos.');
      return;
    }
    setIsSubmittingDelegation(true);
    try {
      await api.post(`/orders/${selectedOrder.id}/delegate-dsp`, {
        dspPartnerId: selectedDspForDelegation,
        dspPayout: Number(delegationPayout),
      });
      notify.success('Pedido delegado con éxito a la asociación.');
      setIsDelegateModalOpen(false);
      fetchOrders();
      openOrderAudit(selectedOrder.id);
    } catch (err: any) {
      notify.error(`Error al delegar: ${err.message}`);
    } finally {
      setIsSubmittingDelegation(false);
    }
  };

  const handleDspAcceptOrder = async () => {
    if (!selectedOrder || !user?.dspPartnerId) return;
    try {
      await api.post(`/orders/${selectedOrder.id}/dsp-accept`, {
        dspPartnerId: user.dspPartnerId,
      });
      notify.success('Has aceptado el pedido para tu asociación.');
      fetchOrders();
      openOrderAudit(selectedOrder.id);
    } catch (err: any) {
      notify.error(`Error al aceptar pedido: ${err.message}`);
    }
  };

  const handleDspAssignDriver = async () => {
    if (!selectedOrder || !user?.dspPartnerId || !dspDriverToAssign) {
      notify.warning('Por favor selecciona un motorizado de tu lista.');
      return;
    }
    setIsSubmittingDspAssign(true);
    try {
      await api.post(`/orders/${selectedOrder.id}/dsp-assign`, {
        dspPartnerId: user.dspPartnerId,
        driverId: dspDriverToAssign,
      });
      notify.success('Pedido asignado exitosamente al conductor.');
      setIsDspAssignModalOpen(false);
      fetchOrders();
      openOrderAudit(selectedOrder.id);
    } catch (err: any) {
      notify.error(`Error al asignar motorizado: ${err.message}`);
    } finally {
      setIsSubmittingDspAssign(false);
    }
  };

  // Detector de Órdenes Colgadas o Atascadas
  const stuckOrders = useMemo(() => {
    const now = Date.now();
    return orders.filter((o) => {
      const createdTime = new Date(o.createdAt).getTime();
      const updatedTime = new Date(o.updatedAt || o.createdAt).getTime();
      const ageMinutes = (now - createdTime) / (1000 * 60);
      const sinceUpdateMinutes = (now - updatedTime) / (1000 * 60);

      if (o.status === 'SEARCHING_DRIVER' && ageMinutes > 10) return true;
      if ((o.status === 'ASSIGNED' || o.status === 'IN_TRANSIT') && sinceUpdateMinutes > 40) return true;
      return false;
    });
  }, [orders]);

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

      if (statusFilter === 'STUCK') {
        return stuckOrders.some((s) => s.id === o.id);
      }
      if (statusFilter !== 'ALL') {
        return o.status === statusFilter;
      }
      return true;
    });
  }, [orders, searchQuery, statusFilter, stuckOrders]);

  const openOrderAudit = async (orderId: string, directOrderObj?: any) => {
    const localOrder = directOrderObj || orders.find((o) => o.id === orderId);
    if (localOrder) {
      setSelectedOrder(localOrder);
    }
    try {
      const details = await api.get(`/orders/${orderId}`);
      if (details && details.id) {
        setSelectedOrder(details);
      }
    } catch (err) {
      console.error('Error cargando auditoría de orden:', err);
      if (!localOrder) {
        notify.error('No se pudo encontrar la información de la orden');
      }
    }
  };

  // 1. Forzar Estado de Orden
  const handleForceStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmittingForce(true);
    try {
      await api.post(`/orders/${selectedOrder.id}/force-status`, {
        status: targetStatus,
        reason: forceReason || 'Intervención manual del operador de central',
        creditDriver: creditDriver,
        proofPhotoUrl: overrideProofPhoto || selectedOrder.proofPhotoUrl || null,
      });

      notify.success(`Estado forzado exitosamente a ${targetStatus}.`, `Orden #${selectedOrder.id}`);
      setIsForceStatusModalOpen(false);
      setForceReason('');
      setOverrideProofPhoto('');
      openOrderAudit(selectedOrder.id);
      fetchOrders();
    } catch (err: any) {
      notify.error(`Error al forzar estado: ${err.message}`);
    } finally {
      setIsSubmittingForce(false);
    }
  };

  // 2. Reasignación de Emergencia de Conductor
  const handleReassignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedDriverForReassign) return;

    setIsSubmittingReassign(true);
    try {
      await api.post('/dispatch/manual-assign', {
        orderId: selectedOrder.id,
        driverId: selectedDriverForReassign,
      });

      notify.success(`Orden #${selectedOrder.id} reasignada con éxito.`);
      setIsReassignModalOpen(false);
      setSelectedDriverForReassign('');
      openOrderAudit(selectedOrder.id);
      fetchOrders();
    } catch (err: any) {
      notify.error(`Error en reasignación: ${err.message}`);
    } finally {
      setIsSubmittingReassign(false);
    }
  };

  // 3. Reenviar Webhook a la Tienda
  const handleResendWebhook = async () => {
    if (!selectedOrder) return;
    setIsResendingWebhook(true);
    try {
      await api.post(`/orders/${selectedOrder.id}/resend-webhook`, {});
      notify.success(`Webhook [${selectedOrder.status}] re-emitido con firma criptográfica a la tienda.`);
    } catch (err: any) {
      notify.error(`Error reenviando webhook: ${err.message}`);
    } finally {
      setIsResendingWebhook(false);
    }
  };

  // 4. Reintentar Búsqueda de Repartidores (Matchmaking)
  const handleRetryMatch = async () => {
    if (!selectedOrder) return;
    setIsRetryingMatch(true);
    try {
      const res = await api.post(`/dispatch/orders/${selectedOrder.id}/match`, {});
      notify.info(`Búsqueda disparada`, `Candidatos en línea encontrados: ${res.candidatesCount || 0}`);
      openOrderAudit(selectedOrder.id);
      fetchOrders();
    } catch (err: any) {
      notify.error(`Error disparando búsqueda: ${err.message}`);
    } finally {
      setIsRetryingMatch(false);
    }
  };

  // Cálculo dinámico de distancia y tarifa Haversine para la orden manual
  const calculatedMetrics = useMemo(() => {
    const R = 6371;
    const dLat = ((newDropoffLat - newPickupLat) * Math.PI) / 180;
    const dLon = ((newDropoffLng - newPickupLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((newPickupLat * Math.PI) / 180) *
        Math.cos((newDropoffLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = parseFloat((R * c).toFixed(2));
    const durationMinutes = Math.max(Math.ceil((distanceKm / 22) * 60 + 8), 10);
    const price = parseFloat((5.0 + distanceKm * 2.50).toFixed(2));
    const driverPayout = parseFloat((price * 0.80).toFixed(2));

    return { distanceKm, durationMinutes, price, driverPayout };
  }, [newPickupLat, newPickupLng, newDropoffLat, newDropoffLng]);

  // Enviar Creación de Orden Manual
  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPickupAddress || !newDropoffAddress) {
      notify.warning('Por favor ingresa las direcciones de recogida y entrega.');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const payload = {
        tenantId: selectedTenantId || undefined,
        merchantReference: newMerchantRef || `MANUAL-${Math.floor(1000 + Math.random() * 9000)}`,
        pickupAddress: newPickupAddress,
        pickupLat: newPickupLat,
        pickupLng: newPickupLng,
        dropoffAddress: newDropoffAddress,
        dropoffLat: newDropoffLat,
        dropoffLng: newDropoffLng,
        packageNotes: `${newPackageNotes ? newPackageNotes + ' | ' : ''}Horario sugerido: ${newPickupTime} -> ${newDeliveryTime}`,
      };

      const result: any = await api.post('/orders/manual', payload);
      notify.success(`¡Orden #${result.id} creada exitosamente!`, 'Matchmaking y despacho geoespacial activado.');
      setIsCreateModalOpen(false);
      fetchOrders();
      openOrderAudit(result.id);
    } catch (err: any) {
      notify.error(`Error creando orden manual: ${err.message}`);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const copyProofUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    notify.success('Enlace de prueba copiado al portapapeles');
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1700px] mx-auto">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-600" />
            Gestión Operativa & Ciclo de Vida de Órdenes
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Resolución de incidencias, auditoría inmutable, comprobantes POD con foto y reasignación de flota de emergencia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all shrink-0 shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Crear Despacho Manual</span>
          </button>

          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refrescar
          </button>
        </div>
      </div>

      {/* Banner de Alerta: Órdenes Colgadas / SLA en Riesgo */}
      {stuckOrders.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-amber-950">
                ⚠️ Atención Operativa: {stuckOrders.length} orden(es) en riesgo de retraso o colgadas
              </div>
              <p className="text-xs text-amber-800">
                Existen pedidos sin repartidor asignado por más de 10 minutos o en tránsito prolongado. Intervén para reasignar o forzar entrega.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStatusFilter('STUCK')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
          >
            Filtrar Colgadas ({stuckOrders.length})
          </button>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por ID, referencia de tienda, dirección de recogida o entrega..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

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
            En Camino ({orders.filter((o) => o.status === 'IN_TRANSIT').length})
          </button>
          <button
            onClick={() => setStatusFilter('DELIVERED')}
            className={`px-3 py-2 rounded-xl transition-all ${
              statusFilter === 'DELIVERED' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Entregados ({orders.filter((o) => o.status === 'DELIVERED').length})
          </button>
          {stuckOrders.length > 0 && (
            <button
              onClick={() => setStatusFilter('STUCK')}
              className={`px-3 py-2 rounded-xl transition-all ${
                statusFilter === 'STUCK' ? 'bg-red-600 text-white shadow-xs animate-pulse' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              ⚠️ Colgadas ({stuckOrders.length})
            </button>
          )}
        </div>
      </div>

      {/* Tabla Principal de Órdenes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase font-black text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">ID Pedido / Referencia</th>
                <th className="px-6 py-4">Ruta (Recogida ➔ Entrega)</th>
                <th className="px-6 py-4">Total Pedido</th>
                <th className="px-6 py-4">Repartidor</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Comprobante POD</th>
                <th className="px-6 py-4 text-right">Acciones Operativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Cargando pedidos en tiempo real...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No se encontraron pedidos coincidentes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isStuck = stuckOrders.some((s) => s.id === o.id);
                  const isDelivered = o.status === 'DELIVERED';
                  const hasPOD = !!o.proofPhotoUrl;

                  return (
                    <tr
                      key={o.id}
                      className={`hover:bg-slate-50/80 transition-colors font-medium ${
                        isStuck ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm font-mono">
                            #{o.id.slice(0, 10)}
                          </span>
                          {isStuck && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white font-black text-[9px] uppercase animate-pulse">
                              Colgada
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Ref: {o.merchantReference || 'S/R'} • {new Date(o.createdAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-700 max-w-[260px]">
                        <div className="truncate font-semibold text-slate-900">{o.pickupAddress}</div>
                        <div className="truncate text-slate-500 text-[11px]">➔ {o.dropoffAddress}</div>
                      </td>

                      <td className="px-6 py-4 font-black text-slate-900">
                        Bs. {Number(o.price || 0).toFixed(2)}
                        <div className="text-[10px] text-emerald-600 font-medium">
                          Driver: Bs. {Number(o.driverPayout || 0).toFixed(2)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {o.driverId ? (
                          <div className="flex items-center gap-2 font-bold text-slate-800">
                            <Bike className="w-3.5 h-3.5 text-slate-400" />
                            <span>{o.driver?.fullName || 'Conductor Asignado'}</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-bold text-[11px]">Sin Conductor</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            o.status === 'DELIVERED'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.status === 'IN_TRANSIT'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : o.status === 'ASSIGNED'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : o.status === 'CANCELLED'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {o.status === 'IN_TRANSIT'
                            ? 'EN CAMINO'
                            : o.status === 'DELIVERED'
                            ? 'ENTREGADO'
                            : o.status === 'ASSIGNED'
                            ? 'ASIGNADO'
                            : o.status === 'CANCELLED'
                            ? 'CANCELADO'
                            : 'BUSCANDO'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {hasPOD ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-[11px]">
                            <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Foto Respaldada</span>
                          </div>
                        ) : isDelivered ? (
                          <span className="text-slate-400 text-[11px]">Sin Foto POD</span>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(o);
                              setTargetStatus(o.status === 'DELIVERED' ? 'CANCELLED' : 'DELIVERED');
                              setIsForceStatusModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all font-extrabold text-[11px] flex items-center gap-1 cursor-pointer border border-emerald-200"
                            title="Cambiar estado forzosamente"
                          >
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>Forzar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrder(o);
                              setSelectedDriverForReassign(o.driverId || '');
                              setIsReassignModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all font-extrabold text-[11px] flex items-center gap-1 cursor-pointer border border-indigo-200"
                            title="Reasignar conductor"
                          >
                            <Bike className="w-3 h-3 text-indigo-600" />
                            <span>Reasignar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openOrderAudit(o.id, o)}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all font-bold text-xs flex items-center gap-1 cursor-pointer"
                            title="Auditoría Completa y Soporte Operativo"
                          >
                            <Eye className="w-4 h-4 text-slate-600" />
                            <span>Gestionar</span>
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
      </div>

      {/* Modal Integral de Soporte, Forzar Estados, POD y Auditoría */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 modal-overlay-root bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                  Centro de Control de Orden
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  #{selectedOrder.id}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-black uppercase ${
                      selectedOrder.status === 'DELIVERED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedOrder.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Ref: {selectedOrder.merchantReference} • Creada: {new Date(selectedOrder.createdAt).toLocaleString('es-BO')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`/track/${selectedOrder.trackingToken || selectedOrder.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Abrir mapa de rastreo público para el cliente"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ver Tracking en Vivo</span>
                </a>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hola, puedes seguir la entrega de tu pedido #${selectedOrder.merchantReference} en vivo aquí: ${window.location.origin}/track/${selectedOrder.trackingToken || selectedOrder.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  title="Enviar enlace de rastreo por WhatsApp al cliente"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Enviar por WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Modal */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Barra de Herramientas de Intervención Rápida */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-sm">
                <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Herramientas de Resolución Operativa {user?.role === 'DSP_EXTERNAL' ? '(Asociación de Motos)' : '(Super Admin)'}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {user?.role === 'DSP_EXTERNAL' ? (
                    <>
                      {/* Aceptar Orden Delegada si está OFFERED */}
                      {selectedOrder.dspStatus === 'OFFERED' && (
                        <button
                          type="button"
                          onClick={handleDspAcceptOrder}
                          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aceptar Orden</span>
                        </button>
                      )}

                      {/* Asignar Motorizado de la Asociación */}
                      <button
                        type="button"
                        onClick={() => {
                          setDspDriverToAssign('');
                          setIsDspAssignModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Asignar Mi Motorizado</span>
                      </button>

                      {/* Forzar Estado */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetStatus('DELIVERED');
                          setIsForceStatusModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Actualizar Estado</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Super Admin: Delegar a Asociación de Motos / DSP */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDspForDelegation(selectedOrder.delegatedDspId || '');
                          setDelegationPayout(Number(selectedOrder.dspPayout || 4.5));
                          setIsDelegateModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Delegar a Asociación</span>
                      </button>

                      {/* Forzar Estado */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetStatus('DELIVERED');
                          setIsForceStatusModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Forzar Estado</span>
                      </button>

                      {/* Reasignar Conductor */}
                      <button
                        type="button"
                        onClick={() => setIsReassignModalOpen(true)}
                        className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Reasignar Driver</span>
                      </button>

                      {/* Reenviar Webhook a Tienda */}
                      <button
                        type="button"
                        disabled={isResendingWebhook}
                        onClick={handleResendWebhook}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{isResendingWebhook ? 'Enviando...' : 'Reenviar Webhook'}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Datos de Ruta y Precios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="font-extrabold text-slate-900">Ruta de Entrega</div>
                  <div>
                    <span className="text-slate-500 font-medium">Origen:</span>{' '}
                    <strong className="text-slate-800">{selectedOrder.pickupAddress}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Destino:</span>{' '}
                    <strong className="text-slate-800">{selectedOrder.dropoffAddress}</strong>
                  </div>
                  {selectedOrder.packageNotes && (
                    <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Nota: {selectedOrder.packageNotes}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="font-extrabold text-slate-900">Conductor & Tarifa</div>
                  <div>
                    <span className="text-slate-500 font-medium">Conductor:</span>{' '}
                    <strong>{selectedOrder.driver?.fullName || 'Ninguno asignado'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Teléfono Driver:</span>{' '}
                    <strong>{selectedOrder.driver?.phone || '—'}</strong>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span>Total Pedido: <strong>Bs. {Number(selectedOrder.price || 0).toFixed(2)}</strong></span>
                    <span className="text-emerald-700 font-black">
                      Pago Driver: Bs. {Number(selectedOrder.driverPayout || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comprobante de Entrega POD (Foto y Firma) */}
              {(selectedOrder.proofPhotoUrl || selectedOrder.signatureSvg) && (
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-xs text-emerald-900 flex items-center gap-2">
                      <FileImage className="w-4 h-4 text-emerald-700" />
                      Comprobante Oficial de Entrega (Proof of Delivery - POD)
                    </h4>
                    {selectedOrder.proofPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => copyProofUrl(selectedOrder.proofPhotoUrl)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar URL Foto'}</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {selectedOrder.proofPhotoUrl && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700">Foto del Paquete Entregado:</span>
                        <div className="rounded-xl overflow-hidden border border-emerald-300 shadow-sm bg-white aspect-video flex items-center justify-center">
                          <img
                            src={selectedOrder.proofPhotoUrl}
                            alt="Comprobante POD"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    {selectedOrder.signatureSvg && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-700">Firma Digital del Cliente:</span>
                        <div
                          className="rounded-xl p-3 border border-emerald-300 shadow-sm bg-white aspect-video flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: selectedOrder.signatureSvg }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Auditoría Inmutable */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  Línea de Tiempo de Auditoría Inmutable
                </h4>

                <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                  {(selectedOrder.logs || []).map((log: any, idx: number) => (
                    <div key={idx} className="relative pl-4 space-y-0.5 text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
                      <div className="font-extrabold text-slate-800">
                        {log.previousStatus ? `${log.previousStatus} ➔ ` : ''}
                        <span className="text-emerald-700">{log.newStatus}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Por <strong>{log.changedBy}</strong> • {new Date(log.createdAt).toLocaleString('es-BO')}
                        {log.metadata?.reason && (
                          <div className="text-amber-800 font-medium mt-0.5">
                            Motivo: "{log.metadata.reason}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Operativo 1: Forzar Estado Manualmente */}
      {isForceStatusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] modal-overlay-child bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                Forzar Estado de la Orden #{selectedOrder.id.slice(0, 8)}
              </h3>
              <button
                type="button"
                onClick={() => setIsForceStatusModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleForceStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nuevo Estado a Forzar *
                </label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="DELIVERED">✅ DELIVERED (Marcar como Entregada)</option>
                  <option value="CANCELLED">❌ CANCELLED (Cancelar Pedido)</option>
                  <option value="SEARCHING_DRIVER">🔄 SEARCHING_DRIVER (Reactivar Búsqueda)</option>
                  <option value="IN_TRANSIT">🛵 IN_TRANSIT (Marcar En Tránsito)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo de la Intervención *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej. Confirmado por llamada con cliente, repartidor se quedó sin batería..."
                  value={forceReason}
                  onChange={(e) => setForceReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>

              {targetStatus === 'DELIVERED' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      URL de Foto de Entrega (Opcional):
                    </label>
                    <input
                      type="url"
                      placeholder="https://res.cloudinary.com/..."
                      value={overrideProofPhoto}
                      onChange={(e) => setOverrideProofPhoto(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <input
                      type="checkbox"
                      id="creditDriver"
                      checked={creditDriver}
                      onChange={(e) => setCreditDriver(e.target.checked)}
                      className="rounded border-emerald-400 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="creditDriver" className="font-bold text-emerald-900">
                      Acreditar tarifa de Bs. {Number(selectedOrder.driverPayout || 0).toFixed(2)} al repartidor
                    </label>
                  </div>
                </>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsForceStatusModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingForce}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingForce ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirmar Cambio</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Operativo 2: Reasignación de Conductor */}
      {isReassignModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] modal-overlay-child bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bike className="w-4 h-4 text-indigo-600" />
                Reasignar Conductor de Emergencia
              </h3>
              <button
                type="button"
                onClick={() => setIsReassignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReassignDriver} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                Conductor actual: <strong>{selectedOrder.driver?.fullName || 'Ninguno'}</strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Seleccionar Nuevo Conductor Disponible *
                </label>
                <select
                  required
                  value={selectedDriverForReassign}
                  onChange={(e) => setSelectedDriverForReassign(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="">-- Elige un conductor --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} ({d.vehicleType || 'Moto'} - {d.phone}) {d.isOnline ? '🟢 En Línea' : '⚪ Desconectado'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReassign || !selectedDriverForReassign}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingReassign ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Reasignar Ahora</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delegar Orden a Asociación de Motos / DSP */}
      {isDelegateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] modal-overlay-child bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-600" />
                Delegar Pedido a Asociación / DSP
              </h3>
              <button
                type="button"
                onClick={() => setIsDelegateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-900 space-y-1">
                <div>Pedido: <strong>#{selectedOrder.id}</strong></div>
                <div>Destino: <strong>{selectedOrder.dropoffAddress}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Seleccionar Asociación de Motos / DSP *
                </label>
                <select
                  value={selectedDspForDelegation}
                  onChange={(e) => {
                    setSelectedDspForDelegation(e.target.value);
                    const partner = dspPartners.find((p) => p.id === e.target.value);
                    if (partner && partner.payoutPerOrder) {
                      setDelegationPayout(Number(partner.payoutPerOrder));
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="">-- Selecciona una asociación --</option>
                  {dspPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      🏍️ {p.name} ({p.code}) - {p.city || 'Santa Cruz'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tarifa acordada para la Asociación ($)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={delegationPayout}
                  onChange={(e) => setDelegationPayout(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDelegateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDelegation || !selectedDspForDelegation}
                  onClick={handleDelegateOrder}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingDelegation ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Confirmar y Enviar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal DSP: Asignar Motorizado de su Asociación */}
      {isDspAssignModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] modal-overlay-child bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-600" />
                Asignar Conductor de Mi Asociación
              </h3>
              <button
                type="button"
                onClick={() => setIsDspAssignModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900 space-y-1">
                <div>Pedido: <strong>#{selectedOrder.id}</strong></div>
                <div>Destino: <strong>{selectedOrder.dropoffAddress}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Seleccionar Motorizado de tu Flota *
                </label>
                <select
                  value={dspDriverToAssign}
                  onChange={(e) => setDspDriverToAssign(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="">-- Elige un conductor de tu lista --</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      🏍️ {d.fullName} ({d.vehiclePlate || 'S/P'} - {d.phone}) {d.isOnline ? '🟢 Conectado' : '⚪ Desconectado'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDspAssignModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingDspAssign || !dspDriverToAssign}
                  onClick={handleDspAssignDriver}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingDspAssign ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Asignar y Despachar</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Despacho Manual con Mapa Interactivo */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 modal-overlay-root bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200/80 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-emerald-600" />
                  Nuevo Despacho Manual con Mapa Interactivo
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Haz clic en el mapa para posicionar el origen y destino con cálculo de ruta y tarifa en tiempo real.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <form onSubmit={handleCreateManualOrder} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Selector de Tienda / Tenant y Referencia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Comercio Emisor (Tenant)
                  </label>
                  <select
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                  >
                    <option value="">-- Usar Comercio Principal por Defecto --</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        🏢 {t.name} ({t.city || 'Santa Cruz'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nº de Referencia de Pedido (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: PEDIDO-9481"
                    value={newMerchantRef}
                    onChange={(e) => setNewMerchantRef(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* Botones de Selector de Modo en Mapa */}
              <div className="flex items-center justify-between bg-slate-100 p-2 rounded-2xl">
                <span className="text-xs font-bold text-slate-600 pl-2">
                  📍 Modo de Marcado en Mapa:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePickerMode('pickup')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      activePickerMode === 'pickup'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>🏪 Origen / Tienda</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePickerMode('dropoff')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                      activePickerMode === 'dropoff'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>📍 Destino / Entrega</span>
                  </button>
                </div>
              </div>

              {/* Mapa Interactivo con Leaflet */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-[280px] shadow-inner">
                <MapContainer
                  center={[newPickupLat, newPickupLng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  
                  {/* Listener de Clics en el Mapa */}
                  {React.createElement(() => {
                    useMapEvents({
                      click(e) {
                        if (activePickerMode === 'pickup') {
                          setNewPickupLat(Number(e.latlng.lat.toFixed(6)));
                          setNewPickupLng(Number(e.latlng.lng.toFixed(6)));
                        } else {
                          setNewDropoffLat(Number(e.latlng.lat.toFixed(6)));
                          setNewDropoffLng(Number(e.latlng.lng.toFixed(6)));
                        }
                      },
                    });
                    return null;
                  })}

                  {/* Marcador de Recogida */}
                  <Marker position={[newPickupLat, newPickupLng]} icon={pickupMarkerIcon}>
                    <Popup>
                      <div className="text-xs">
                        <strong>🏪 Origen / Recogida</strong>
                        <div>{newPickupAddress}</div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Marcador de Destino */}
                  <Marker position={[newDropoffLat, newDropoffLng]} icon={dropoffMarkerIcon}>
                    <Popup>
                      <div className="text-xs">
                        <strong>📍 Destino / Entrega</strong>
                        <div>{newDropoffAddress}</div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Línea de Trayectoria Estimada */}
                  <Polyline
                    positions={[
                      [newPickupLat, newPickupLng],
                      [newDropoffLat, newDropoffLng],
                    ]}
                    color="#4F46E5"
                    dashArray="6, 8"
                    weight={3}
                  />
                </MapContainer>

                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-3 py-1.5 rounded-lg z-[400] font-medium">
                  {activePickerMode === 'pickup' ? '👉 Haz clic para mover el punto de RECOGIDA (🏪)' : '👉 Haz clic para mover el punto de ENTREGA (📍)'}
                </div>
              </div>

              {/* Inputs de Direcciones y Horarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-indigo-600" />
                    Punto de Recogida (Origen)
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dirección de Recogida *</label>
                    <input
                      type="text"
                      required
                      value={newPickupAddress}
                      onChange={(e) => setNewPickupAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                    <div>Lat: {newPickupLat}</div>
                    <div>Lng: {newPickupLng}</div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      Hora Sugerida de Recogida:
                    </label>
                    <input
                      type="text"
                      value={newPickupTime}
                      onChange={(e) => setNewPickupTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                  <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Punto de Entrega (Destino)
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dirección de Entrega *</label>
                    <input
                      type="text"
                      required
                      value={newDropoffAddress}
                      onChange={(e) => setNewDropoffAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-mono">
                    <div>Lat: {newDropoffLat}</div>
                    <div>Lng: {newDropoffLng}</div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      Hora Sugerida de Entrega:
                    </label>
                    <input
                      type="text"
                      value={newDeliveryTime}
                      onChange={(e) => setNewDeliveryTime(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Indicaciones para el Repartidor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notas de Entrega para el Conductor
                </label>
                <input
                  type="text"
                  placeholder="Ej: Tocar timbre 2B, paquete frágil con alimentos calientes."
                  value={newPackageNotes}
                  onChange={(e) => setNewPackageNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium"
                />
              </div>

              {/* Resumen de Métricas Calculadas en Tiempo Real */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-2">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Distancia Estimada</div>
                  <div className="text-base font-black text-emerald-400 mt-0.5">{calculatedMetrics.distanceKm} km</div>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Tiempo de Viaje</div>
                  <div className="text-base font-black text-white mt-0.5">~{calculatedMetrics.durationMinutes} min</div>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Tarifa al Cliente</div>
                  <div className="text-base font-black text-indigo-400 mt-0.5">Bs. {calculatedMetrics.price.toFixed(2)}</div>
                </div>
                <div className="p-2 border-l border-slate-800">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Ganancia Driver (80%)</div>
                  <div className="text-base font-black text-emerald-400 mt-0.5">Bs. {calculatedMetrics.driverPayout.toFixed(2)}</div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOrder}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isCreatingOrder ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>Crear Despacho y Activar Radar</span>
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
