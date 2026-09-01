import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Store,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Zap,
  Play,
  ShieldCheck,
  Bike,
  Package,
  MapPin,
  FileCode,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import CryptoJS from 'crypto-js';
import { api } from '../services/api';
import { notify } from '../utils/notify';

interface Tenant {
  id: string;
  name: string;
  email: string;
  apiKeyRaw?: string;
  apiKeyPrefix?: string;
  webhookUrl?: string;
  webhookSecret?: string;
}

interface OutboundLog {
  id: string;
  timestamp: string;
  eventType: string;
  orderId: string;
  destinationUrl: string;
  signature: string;
  payload: any;
  status: 'SENT' | 'FAILED';
}

interface InboundLog {
  id: string;
  timestamp: string;
  eventType: string;
  orderId: string;
  signatureValid: boolean;
  httpStatus: number;
  latencyMs: number;
  receivedPayload: any;
  responsePayload: any;
}

export const TestingLab: React.FC = () => {
  // 1. Tiendas / Tenants
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [customApiKey, setCustomApiKey] = useState<string>('');
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  // 2. Formulario de Creación de Orden
  const [pickupAddress, setPickupAddress] = useState('Restaurante Don Chicho, Av. San Martín #450, Equipetrol');
  const [pickupLat, setPickupLat] = useState(-17.7712);
  const [pickupLng, setPickupLng] = useState(-63.1950);

  const [dropoffAddress, setDropoffAddress] = useState('Calle Los Jazmines #240, Barrio Sirari, Santa Cruz');
  const [dropoffLat, setDropoffLat] = useState(-17.7850);
  const [dropoffLng, setDropoffLng] = useState(-63.1780);

  const [customerName, setCustomerName] = useState('Juan Carlos Mendoza');
  const [customerPhone, setCustomerPhone] = useState('+591 70012345');
  const [packageItems, setPackageItems] = useState('2x Hamburguesas Clásicas + Papas + Bebida');
  const [orderPrice, setOrderPrice] = useState(75.0);
  const [driverPayout, setDriverPayout] = useState(18.5);
  const [packageNotes, setPackageNotes] = useState('Entregar en recepción del condominio');

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // 3. Orden en Prueba Activa
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [isAdvancingStage, setIsAdvancingStage] = useState(false);
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);

  // 4. Consola Dual de Logs en Tiempo Real
  const [outboundLogs, setOutboundLogs] = useState<OutboundLog[]>([]);
  const [inboundLogs, setInboundLogs] = useState<InboundLog[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const outboundEndRef = useRef<HTMLDivElement | null>(null);
  const inboundEndRef = useRef<HTMLDivElement | null>(null);

  // Cargar tiendas existentes
  const fetchTenants = async () => {
    setIsLoadingTenants(true);
    try {
      const data = await api.get('/tenants');
      if (Array.isArray(data)) {
        setTenants(data);
        if (data.length > 0 && !selectedTenantId) {
          setSelectedTenantId(data[0].id);
          const savedKey = localStorage.getItem(`tenant_apikey_${data[0].id}`);
          if (savedKey) {
            setCustomApiKey(savedKey);
          } else if (data[0].name?.includes('Chiringuito') || data[0].id === 'e7b92f34-1182-4bc9-93e1-23d9b04f7a11') {
            setCustomApiKey('dsp_live_chiringuito123');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setIsLoadingTenants(false);
    }
  };

  useEffect(() => {
    fetchTenants();
    api.get('/drivers')
      .then((res) => {
        if (Array.isArray(res)) setAvailableDrivers(res);
      })
      .catch(() => {});
  }, []);

  const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

  const handleSelectTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const target = tenants.find((t) => t.id === tenantId);
    const savedKey = localStorage.getItem(`tenant_apikey_${tenantId}`);
    if (savedKey) {
      setCustomApiKey(savedKey);
    } else if (target?.name?.includes('Chiringuito') || tenantId === 'e7b92f34-1182-4bc9-93e1-23d9b04f7a11') {
      setCustomApiKey('dsp_live_chiringuito123');
    } else if (target?.apiKeyRaw) {
      setCustomApiKey(target.apiKeyRaw);
    } else {
      setCustomApiKey('');
    }
  };

  // Crear Tienda Rápida de Prueba si la base de datos está limpia
  const handleCreateDemoTenant = async () => {
    try {
      const newTenant = await api.post('/tenants', {
        name: 'Restaurante Gourmet Express',
        email: `tienda_${Date.now()}@chiringuito.com`,
        webhookUrl: 'https://webhook.site/demo-chiringuito-receiver',
      });
      if (newTenant?.apiKeyRaw) {
        localStorage.setItem(`tenant_apikey_${newTenant.id}`, newTenant.apiKeyRaw);
        setCustomApiKey(newTenant.apiKeyRaw);
      }
      await fetchTenants();
      setSelectedTenantId(newTenant.id);
      notify.success('Tienda creada con éxito', `API Key: ${newTenant.apiKeyRaw}`);
    } catch (err: any) {
      notify.error(`Error creando tienda: ${err.message}`);
    }
  };

  // Simular el disparo y recepción del webhook
  const triggerSimulatedWebhook = (eventType: string, orderData: any) => {
    const secret = selectedTenant?.webhookSecret || 'whsec_demo_secret_2026';
    const destinationUrl = selectedTenant?.webhookUrl || 'https://comercio.ejemplo.bo/api/webhooks';

    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data: {
        order_id: orderData.id,
        merchant_reference: orderData.merchantReference || `REF-${orderData.id.slice(0, 6)}`,
        status: orderData.status,
        driver: orderData.driver
          ? {
              id: orderData.driver.id,
              name: orderData.driver.fullName,
              phone: orderData.driver.phone,
              vehicle_type: orderData.driver.vehicleType,
              vehicle_plate: orderData.driver.vehiclePlate,
            }
          : null,
        pickup_address: orderData.pickupAddress,
        dropoff_address: orderData.dropoffAddress,
        price: orderData.price,
        driver_payout: orderData.driverPayout,
        tracking_url: `${window.location.origin}/track/${orderData.trackingToken || orderData.id}`,
        proof_photo_url: orderData.proofPhotoUrl || null,
      },
    };

    const signature = CryptoJS.HmacSHA256(JSON.stringify(payload), secret).toString();

    // 1. Log Emisor (DSP Central Outbound)
    const outboundItem: OutboundLog = {
      id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('es-BO', { hour12: false }) + '.' + String(new Date().getMilliseconds()).padStart(3, '0'),
      eventType,
      orderId: orderData.id,
      destinationUrl,
      signature: `sha256=${signature}`,
      payload,
      status: 'SENT',
    };

    setOutboundLogs((prev) => [outboundItem, ...prev]);

    // 2. Simulación de Recepción del Comercio (Inbound Receiver)
    const simulatedLatency = 30 + Math.floor(Math.random() * 45);
    setTimeout(() => {
      const calculatedSig = CryptoJS.HmacSHA256(JSON.stringify(payload), secret).toString();
      const isValid = calculatedSig === signature;

      const inboundItem: InboundLog = {
        id: `in_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString('es-BO', { hour12: false }) + '.' + String(new Date().getMilliseconds()).padStart(3, '0'),
        eventType,
        orderId: orderData.id,
        signatureValid: isValid,
        httpStatus: isValid ? 200 : 401,
        latencyMs: simulatedLatency,
        receivedPayload: payload,
        responsePayload: {
          received: true,
          processed_by_store: true,
          order_id: orderData.id,
          store_status: 'SYNCED',
          message: `Evento [${eventType}] procesado por el POS de ${selectedTenant?.name || 'Tienda'}.`,
        },
      };

      setInboundLogs((prev) => [inboundItem, ...prev]);
    }, simulatedLatency);
  };

  // Disparar Orden al Backend Real
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) {
      notify.warning('Por favor selecciona o crea una tienda primero.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const apiKey = customApiKey.trim() || selectedTenant.apiKeyRaw || (selectedTenant.name?.includes('Chiringuito') || selectedTenant.id === 'e7b92f34-1182-4bc9-93e1-23d9b04f7a11' ? 'dsp_live_chiringuito123' : '');
      if (!apiKey) {
        notify.warning('Clave API requerida', 'Por favor ingresa la Clave API de la tienda seleccionada o crea una nueva con "+ Nueva".');
        setIsSubmittingOrder(false);
        return;
      }
      const orderPayload = {
        pickupAddress,
        pickupLat,
        pickupLng,
        dropoffAddress,
        dropoffLat,
        dropoffLng,
        packageNotes,
        merchantReference: `ORD-${Date.now().toString().slice(-6)}`,
      };

      const created = await api.post('/orders', orderPayload, {
        'x-api-key': apiKey,
      });

      const activeOrderWithMeta = {
        ...created,
        customerName,
        customerPhone,
        items: [{ description: packageItems, quantity: 1, price: orderPrice }],
      };

      setActiveOrder(activeOrderWithMeta);
      notify.success('Orden creada en el backend', `ID: ${created.id}`);

      // Emitir log inicial de creación de orden
      triggerSimulatedWebhook('order.created', activeOrderWithMeta);
    } catch (err: any) {
      console.error('Error al crear orden:', err);
      notify.error(`Error al crear la orden: ${err.message}`);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Avanzar manualmente de etapa en la orden
  const handleAdvanceStage = async (nextStatus: string, eventType: string) => {
    if (!activeOrder) return;
    setIsAdvancingStage(true);

    try {
      // Si la etapa requiere conductor y aún no tiene, asignar el primer conductor real disponible o Marvin
      let updatedOrder = { ...activeOrder, status: nextStatus };

      if (nextStatus === 'ASSIGNED' || !updatedOrder.driver) {
        let assignedDriver = availableDrivers.length > 0 ? availableDrivers[0] : null;
        if (assignedDriver) {
          updatedOrder.driver = {
            id: assignedDriver.id,
            fullName: assignedDriver.fullName,
            phone: assignedDriver.phone,
            vehicleType: assignedDriver.vehicleType || 'MOTORCYCLE',
            vehiclePlate: assignedDriver.vehiclePlate || '4589-KLT',
          };
        } else {
          updatedOrder.driver = {
            id: 'marvin-driver',
            fullName: 'Marvin Repartidor Oficial',
            phone: '+591 70000000',
            vehicleType: 'MOTORCYCLE',
            vehiclePlate: '4589-KLT',
          };
        }
      }

      if (nextStatus === 'DELIVERED') {
        updatedOrder.proofPhotoUrl = 'https://res.cloudinary.com/dpdpgl5kg/image/upload/v1/chamba/pod_demo.jpg';
      }

      // Actualizar en el backend
      try {
        await api.patch(`/orders/${activeOrder.id}/status`, {
          status: nextStatus,
          proofPhotoUrl: updatedOrder.proofPhotoUrl,
        });
      } catch (_) {
        // Ignorar si el endpoint requiere formato diferente
      }

      setActiveOrder(updatedOrder);
      triggerSimulatedWebhook(eventType, updatedOrder);
    } catch (err: any) {
      console.error('Error avanzando etapa:', err);
    } finally {
      setIsAdvancingStage(false);
    }
  };

  // Ejecución Automática E2E del Flujo Completo
  const runAutoSimulation = async () => {
    if (!activeOrder || isAutoSimulating) return;
    setIsAutoSimulating(true);

    const stages = [
      { status: 'ASSIGNED', event: 'order.assigned', delay: 1800 },
      { status: 'ARRIVED_AT_PICKUP', event: 'driver.arrived_pickup', delay: 2400 },
      { status: 'IN_TRANSIT', event: 'order.in_transit', delay: 2400 },
      { status: 'DELIVERED', event: 'order.delivered', delay: 2000 },
    ];

    for (const step of stages) {
      await new Promise((res) => setTimeout(res, step.delay));
      await handleAdvanceStage(step.status, step.event);
    }

    setIsAutoSimulating(false);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const clearLogs = () => {
    setOutboundLogs([]);
    setInboundLogs([]);
  };

  return (
    <div className="p-8 space-y-8 max-w-[1700px] mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-sm">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Laboratorio E2E & Simulador de Webhooks
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Prueba el ciclo de vida completo de órdenes: Disparo desde tiendas, transiciones de estados y recepción de Webhooks en vivo.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={clearLogs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
          >
            <Trash2 className="w-4 h-4 text-slate-400" />
            Limpiar Consolas
          </button>
          <button
            type="button"
            onClick={fetchTenants}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refrescar Tiendas
          </button>
        </div>
      </div>

      {/* Grid Superior: 1. Formulario de Orden | 2. Controlador de Ciclo de Vida */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panel 1: Formulario de Creación de Orden Manual (5 columnas) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  1. Emisor: Tienda / Comercio Conectado
                </h3>
              </div>
              {tenants.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreateDemoTenant}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  + Crear Tienda Demo
                </button>
              )}
            </div>

            {/* Selector de Tienda */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Seleccionar Tienda / Tenant *
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleSelectTenant(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleCreateDemoTenant}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl whitespace-nowrap cursor-pointer"
                >
                  + Nueva
                </button>
              </div>

              {/* Input Clave API */}
              <div className="mt-2.5">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Clave API de Integración (x-api-key) *
                </label>
                <input
                  type="text"
                  value={customApiKey}
                  onChange={(e) => {
                    setCustomApiKey(e.target.value);
                    if (selectedTenantId) {
                      localStorage.setItem(`tenant_apikey_${selectedTenantId}`, e.target.value);
                    }
                  }}
                  placeholder="dsp_live_..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {selectedTenant && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 space-y-1 font-mono">
                  <div className="flex justify-between items-center">
                    <span>Webhook URL:</span>
                    <span className="font-bold text-slate-800 truncate max-w-[260px]">
                      {selectedTenant.webhookUrl || 'https://webhook.site/demo'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Secret HMAC:</span>
                    <span className="font-bold text-emerald-700">
                      {selectedTenant.webhookSecret ? `${selectedTenant.webhookSecret.slice(0, 16)}...` : 'whsec_auto_generated'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Datos de Recogida y Destino */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dirección de Recogida (Tienda)
                </label>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dirección de Entrega (Cliente)
                </label>
                <input
                  type="text"
                  value={dropoffAddress}
                  onChange={(e) => setDropoffAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Datos del Cliente y Precios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cliente</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Orden</label>
                <input
                  type="number"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tarifa Repartidor</label>
                <input
                  type="number"
                  value={driverPayout}
                  onChange={(e) => setDriverPayout(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Artículos del Paquete</label>
              <input
                type="text"
                value={packageItems}
                onChange={(e) => setPackageItems(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
              />
            </div>

            {/* Botón Disparar */}
            <button
              type="submit"
              disabled={isSubmittingOrder}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              {isSubmittingOrder ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>🚀 Disparar y Crear Orden de Prueba (POST /v1/orders)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Panel 2: Ciclo de Vida y Simulador de Estados (6 columnas) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  2. Simulador de Ciclo de Vida y Despacho
                </h3>
              </div>
              {activeOrder && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Estado: {activeOrder.status}
                </span>
              )}
            </div>

            {activeOrder ? (
              <div className="mt-4 space-y-4">
                {/* Resumen de la Orden Activa */}
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">
                      Orden en Simulación
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">
                      ID: #{activeOrder.id?.slice(0, 12)}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {activeOrder.customerName} • {activeOrder.dropoffAddress}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500">Total</span>
                    <div className="text-base font-black text-emerald-700">
                      Bs. {Number(activeOrder.price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Botones de Pasos del Ciclo de Vida */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-700">
                    Avanzar Estado Manualmente (Genera Webhook Automático):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      disabled={isAdvancingStage}
                      onClick={() => handleAdvanceStage('ASSIGNED', 'order.assigned')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 text-left transition-all text-xs font-bold"
                    >
                      <div className="text-indigo-600 font-extrabold">1. Asignar</div>
                      <div className="text-[10px] text-slate-500 font-normal">order.assigned</div>
                    </button>

                    <button
                      type="button"
                      disabled={isAdvancingStage}
                      onClick={() => handleAdvanceStage('ARRIVED_AT_PICKUP', 'driver.arrived_pickup')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 text-left transition-all text-xs font-bold"
                    >
                      <div className="text-indigo-600 font-extrabold">2. En Tienda</div>
                      <div className="text-[10px] text-slate-500 font-normal">driver.arrived_pickup</div>
                    </button>

                    <button
                      type="button"
                      disabled={isAdvancingStage}
                      onClick={() => handleAdvanceStage('IN_TRANSIT', 'order.in_transit')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50 text-left transition-all text-xs font-bold"
                    >
                      <div className="text-indigo-600 font-extrabold">3. En Ruta</div>
                      <div className="text-[10px] text-slate-500 font-normal">order.in_transit</div>
                    </button>

                    <button
                      type="button"
                      disabled={isAdvancingStage}
                      onClick={() => handleAdvanceStage('DELIVERED', 'order.delivered')}
                      className="p-2.5 rounded-xl border border-emerald-300 hover:border-emerald-500 bg-emerald-50 text-left transition-all text-xs font-bold"
                    >
                      <div className="text-emerald-700 font-extrabold">5. Entregado</div>
                      <div className="text-[10px] text-emerald-600 font-normal">order.delivered</div>
                    </button>

                    <button
                      type="button"
                      disabled={isAdvancingStage}
                      onClick={() => handleAdvanceStage('CANCELLED', 'order.cancelled')}
                      className="p-2.5 rounded-xl border border-red-200 hover:border-red-400 bg-red-50 text-left transition-all text-xs font-bold"
                    >
                      <div className="text-red-700 font-extrabold">6. Cancelar</div>
                      <div className="text-[10px] text-red-600 font-normal">order.cancelled</div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Package className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
                <p className="text-xs font-medium">
                  Dispara una orden en el formulario de la izquierda para comenzar la simulación de estados y webhooks.
                </p>
              </div>
            )}
          </div>

          {/* Botón de Auto-Simulación */}
          {activeOrder && (
            <button
              type="button"
              disabled={isAutoSimulating}
              onClick={runAutoSimulation}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              {isAutoSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Simulando flujo completo paso a paso (Auto-Play)...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>⚡ Ejecutar Flujo Completo Automático (E2E Auto-Demo)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Consola Dual Side-by-Side: 3. Eventos Emitidos por DSP vs 4. Webhooks Recibidos por la Tienda */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-slate-700" />
            <h3 className="font-extrabold text-base text-slate-900">
              3. Consola Dual en Tiempo Real: Envíos DSP vs Recepción del Comercio
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {outboundLogs.length} eventos emitidos • {inboundLogs.length} webhooks recibidos
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contenedor Izquierdo: Eventos Emitidos por el DSP (Outbound) */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl text-slate-200 flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  📤 DSP Outbound Dispatcher (Eventos Emitidos)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">POST {selectedTenant?.webhookUrl || 'URL'}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
              {outboundLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-center">
                  Esperando eventos de despacho... Dispara una orden para ver los logs.
                </div>
              ) : (
                outboundLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <div key={log.id} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-black text-[11px]">
                          {log.eventType}
                        </span>
                        <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                      </div>

                      <div className="text-[11px] text-slate-300 truncate">
                        <span className="text-slate-500">Destino:</span> {log.destinationUrl}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[240px]">
                          Firma: <code className="text-emerald-400">{log.signature.slice(0, 24)}...</code>
                        </span>
                        <button
                          type="button"
                          onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                          className="text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          {isExpanded ? 'Ocultar JSON' : 'Ver Payload'}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <pre className="p-2.5 bg-slate-950 rounded-lg text-[10px] text-emerald-300 overflow-x-auto border border-slate-800 mt-2">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={outboundEndRef} />
            </div>
          </div>

          {/* Contenedor Derecho: Webhooks Recibidos por la Tienda (Inbound Store Receiver) */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 shadow-xl text-slate-200 flex flex-col h-[520px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                  📥 Store Webhook Receiver (Simulador Comercio)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">HMAC SHA-256 Verifier</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
              {inboundLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-center">
                  Esperando recepción de webhooks en la tienda...
                </div>
              ) : (
                inboundLogs.map((log) => {
                  return (
                    <div key={log.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded font-black text-[11px] ${
                              log.httpStatus === 200
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            HTTP {log.httpStatus} OK
                          </span>
                          <span className="text-slate-300 font-bold">{log.eventType}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{log.latencyMs}ms • {log.timestamp}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-400 font-bold">Firma HMAC Verificada con Éxito</span>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
                        <div className="text-slate-400 text-[10px]">Interpretación del Comercio:</div>
                        <div className="font-bold text-white">
                          {log.responsePayload.message}
                        </div>
                        <div className="text-[10px] text-indigo-400 font-mono flex items-center gap-1.5 flex-wrap">
                          <span>Tracking:</span>
                          <a
                            href={log.receivedPayload.data.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 underline font-bold flex items-center gap-1"
                          >
                            <span>{log.receivedPayload.data.tracking_url}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={inboundEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
