import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import {
  Bike,
  Navigation,
  Search,
  Package,
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  Eye,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Filter,
  Activity,
  X,
  Crosshair,
  TrendingUp,
  User,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';

// Componente para volar la cámara del mapa suavemente a coordenadas específicas
const MapFlyTo: React.FC<{ center: [number, number] | null; zoom?: number }> = ({ center, zoom = 15 }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

// Generador de Iconos Dinámicos para Vehículos con Icono Real PNG para Motos
const createVehicleIcon = (type: string = 'MOTORCYCLE', heading: number = 0, name: string = 'Repartidor', isDelivering: boolean = false) => {
  const isMotorcycle = type.toUpperCase() === 'MOTORCYCLE';
  const iconEmoji = type.toUpperCase() === 'BICYCLE' ? '🚴' : type.toUpperCase() === 'CAR' ? '🚗' : '🏍️';
  const badgeColor = isDelivering ? '#7C3AED' : '#059669';

  const vehicleGraphic = isMotorcycle
    ? `<img src="/images/icon_driver.png" style="width:36px; height:36px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));" alt="Driver" />`
    : `<div style="font-size:20px;">${iconEmoji}</div>`;

  return new L.DivIcon({
    className: 'custom-driver-vehicle-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; pointer-events:auto; position:relative;">
        <!-- Halo / Radar de Ubicación Activa -->
        <div style="position:absolute; top:12px; width:46px; height:46px; border-radius:50%; background:rgba(16,185,129,0.22); border:1.5px solid rgba(16,185,129,0.5); z-index:1;"></div>

        <!-- Etiqueta con Nombre del Conductor -->
        <div style="background:#0F172A; color:#FFFFFF; font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px; margin-bottom:3px; white-space:nowrap; box-shadow:0 3px 8px rgba(0,0,0,0.35); border:1px solid #334155; display:flex; items-center; gap:3px; z-index:3;">
          <span style="width:6px; height:6px; border-radius:50%; background:${isDelivering ? '#A855F7' : '#10B981'}; display:inline-block; margin-top:2px;"></span>
          ${name}
        </div>

        <!-- Contenedor del Vehículo con Rotación por Rumbo GPS -->
        <div style="transform: rotate(${heading}deg); width: 42px; height: 42px; background: white; border: 2.5px solid ${badgeColor}; border-radius: 50%; box-shadow: 0 4px 14px rgba(0,0,0,0.25); display:flex; align-items:center; justify-content:center; z-index:2; transition: transform 0.3s ease-out;">
          ${vehicleGraphic}
        </div>
      </div>
    `,
    iconSize: [90, 70],
    iconAnchor: [45, 35],
  });
};

const storePickupIcon = new L.DivIcon({
  className: 'custom-pickup-icon',
  html: `<div style="background:#F59E0B; width:38px; height:38px; border-radius:50%; border:3px solid white; box-shadow:0 4px 14px rgba(245,158,11,0.5); display:flex; align-items:center; justify-content:center; color:white; font-size:18px;">🏪</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

const destinationIcon = new L.DivIcon({
  className: 'custom-destination-icon',
  html: `<div style="background:#059669; width:38px; height:38px; border-radius:50%; border:3px solid white; box-shadow:0 4px 14px rgba(5,150,105,0.5); display:flex; align-items:center; justify-content:center; color:white; font-size:18px;">🏠</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
});

export const LiveDispatch: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [flyCoord, setFlyCoord] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'online' | 'delivering' | 'offline'>('all');
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [sideTab, setSideTab] = useState<'orders' | 'drivers'>('orders');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar Datos Reales del Backend
  const loadRealData = async () => {
    setIsLoading(true);
    try {
      const [driversData, ordersData] = await Promise.all([
        api.get('/drivers').catch(() => []),
        api.get('/orders').catch(() => []),
      ]);

      if (Array.isArray(driversData)) {
        // Enriquecer datos con coordenadas por defecto si el conductor está activo
        const mapped = driversData.map((d: any, index: number) => ({
          driverId: d.id,
          id: d.id,
          name: d.fullName,
          fullName: d.fullName,
          phone: d.phone,
          vehicleType: d.vehicleType || 'MOTORCYCLE',
          plateNumber: d.plateNumber || 'N/A',
          rating: d.rating || 5.0,
          isOnline: d.isOnline ?? true,
          verificationStatus: d.verificationStatus || 'VERIFIED',
          lat: d.currentLat || -17.7833 + (index * 0.005 - 0.002),
          lng: d.currentLng || -63.1821 + (index * 0.004 - 0.002),
          heading: d.heading || 45,
          speed: d.speed || 0,
          orderId: d.currentOrderId || null,
        }));
        setDrivers(mapped);
      }

      if (Array.isArray(ordersData)) {
        setOrders(ordersData);
      }
    } catch (err) {
      console.error('Error cargando datos de flota:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();

    // 2. Conectar WebSocket en Tiempo Real para Telemetría de Conductores
    const wsUrl =
      (process.env.WS_URL as string) ||
      (import.meta.env.VITE_WS_URL as string) ||
      'https://dsp-backend-q3mn.onrender.com/tracking';

    const socket = io(wsUrl, { transports: ['websocket', 'polling'] });

    socket.on('fleet:driver_location', (data: any) => {
      setDrivers((prev) => {
        const idx = prev.findIndex((d) => d.driverId === data.driverId || d.id === data.driverId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            lat: data.lat,
            lng: data.lng,
            heading: data.heading || 0,
            speed: data.speed || 0,
            orderId: data.orderId || updated[idx].orderId,
            isOnline: true,
          };
          return updated;
        }
        return [
          ...prev,
          {
            driverId: data.driverId,
            id: data.driverId,
            name: data.driverName || 'Conductor en Ruta',
            fullName: data.driverName || 'Conductor en Ruta',
            phone: data.phone || '+591 70000000',
            vehicleType: data.vehicleType || 'MOTORCYCLE',
            rating: 5.0,
            isOnline: true,
            lat: data.lat,
            lng: data.lng,
            heading: data.heading || 0,
            speed: data.speed || 0,
            orderId: data.orderId || null,
          },
        ];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filtrar conductores para la búsqueda
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchSearch =
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone?.includes(searchQuery) ||
        d.vehicleType?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (filterTab === 'online') return d.isOnline && !d.orderId;
      if (filterTab === 'delivering') return !!d.orderId;
      if (filterTab === 'offline') return !d.isOnline;
      return true;
    });
  }, [drivers, searchQuery, filterTab]);

  // Órdenes activas (no entregadas ni canceladas)
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'CANCELLED');
  }, [orders]);

  const handleSelectDriver = (d: any) => {
    setSelectedDriver(d);
    setFlyCoord([d.lat, d.lng]);
    if (d.orderId) {
      const ord = orders.find((o) => o.id === d.orderId);
      if (ord) setSelectedOrder(ord);
    }
  };

  const handleSelectOrder = (o: any) => {
    setSelectedOrder(o);
    if (o.pickupLat && o.pickupLng) {
      setFlyCoord([o.pickupLat, o.pickupLng]);
    } else if (o.dropoffLat && o.dropoffLng) {
      setFlyCoord([o.dropoffLat, o.dropoffLng]);
    }
    if (o.driverId) {
      const drv = drivers.find((d) => d.id === o.driverId || d.driverId === o.driverId);
      if (drv) setSelectedDriver(drv);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] overflow-hidden bg-slate-900 flex">
      {/* 1. MAPA LEAFLET A PANTALLA COMPLETA */}
      <div className="flex-1 h-full relative z-0">
        <MapContainer
          center={[-17.7833, -63.1821]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapFlyTo center={flyCoord} zoom={16} />

          {/* Rutas Polilíneas de Órdenes Activas */}
          {activeOrders.map((ord) => {
            const pLat = ord.pickupLat || -17.7833;
            const pLng = ord.pickupLng || -63.1821;
            const dLat = ord.dropoffLat || -17.795;
            const dLng = ord.dropoffLng || -63.17;
            const isSelected = selectedOrder?.id === ord.id;

            return (
              <React.Fragment key={`route-${ord.id}`}>
                <Polyline
                  positions={[
                    [pLat, pLng],
                    [dLat, dLng],
                  ]}
                  color={isSelected ? '#7C3AED' : '#059669'}
                  weight={isSelected ? 6 : 3.5}
                  opacity={isSelected ? 0.95 : 0.6}
                  dashArray={isSelected ? undefined : '8, 8'}
                />

                {/* Marcador Pickup */}
                <Marker position={[pLat, pLng]} icon={storePickupIcon}>
                  <Popup>
                    <div className="p-2 space-y-1">
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        TIENDA ORIGEN
                      </span>
                      <p className="text-xs font-bold text-slate-800">{ord.pickupAddress}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Orden: #{ord.id.substring(0, 8)}</p>
                    </div>
                  </Popup>
                </Marker>

                {/* Marcador Dropoff */}
                <Marker position={[dLat, dLng]} icon={destinationIcon}>
                  <Popup>
                    <div className="p-2 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        CLIENTE DESTINO
                      </span>
                      <p className="text-xs font-bold text-slate-800">{ord.dropoffAddress}</p>
                      <p className="text-[11px] font-extrabold text-emerald-600">Bs. {Number(ord.price).toFixed(2)}</p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* Marcadores de Conductores en Vivo con Icono Real */}
          {drivers.map((d) => {
            const isDelivering = !!d.orderId;
            return (
              <Marker
                key={d.driverId || d.id}
                position={[d.lat, d.lng]}
                icon={createVehicleIcon(d.vehicleType || 'MOTORCYCLE', d.heading || 0, d.name, isDelivering)}
                eventHandlers={{
                  click: () => handleSelectDriver(d),
                }}
              >
                <Popup>
                  <div className="p-2 space-y-1.5 min-w-[180px]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{d.name}</h4>
                      <span className="text-[10px] font-bold text-amber-600">⭐ {d.rating || 5.0}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{d.phone}</p>
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className={`font-bold ${isDelivering ? 'text-purple-600' : 'text-emerald-600'}`}>
                        {isDelivering ? '🟣 En Entrega' : '🟢 Disponible'}
                      </span>
                      <span className="font-mono text-slate-400">{d.vehicleType}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* 2. HUD SUPERIOR FLOTANTE: BÚSQUEDA Y FILTROS */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 max-w-md w-full pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar conductor por nombre, celular o placa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={loadRealData}
                title="Recargar datos de flota"
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
              >
                <Activity className="w-4 h-4" />
              </button>
            </div>

            {/* Pestañas de Filtro de Conductor */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] font-bold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterTab === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({drivers.length})
              </button>
              <button
                onClick={() => setFilterTab('online')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  filterTab === 'online' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Disponibles ({drivers.filter((d) => d.isOnline && !d.orderId).length})
              </button>
              <button
                onClick={() => setFilterTab('delivering')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  filterTab === 'delivering' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                En Viaje ({drivers.filter((d) => !!d.orderId).length})
              </button>
            </div>
          </div>
        </div>

        {/* 3. BOTÓN FLOTANTE PARA ABRIR / CERRAR PANEL LATERAL */}
        <button
          onClick={() => setSidePanelOpen(!sidePanelOpen)}
          className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-xl p-2.5 rounded-2xl shadow-xl border border-slate-200/80 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold text-xs flex items-center gap-2 pointer-events-auto"
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>{sidePanelOpen ? 'Ocultar Panel' : `Órdenes & Flota (${activeOrders.length})`}</span>
          {sidePanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* 4. TARJETA MODAL INFERIOR DEL CONDUCTOR SELECCIONADO */}
        {selectedDriver && (
          <div className="absolute bottom-6 left-6 z-10 max-w-sm w-full bg-white/95 backdrop-blur-2xl p-4 rounded-3xl shadow-2xl border border-slate-200/80 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-800 font-extrabold text-sm shadow-xs">
                  {selectedDriver.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedDriver.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">{selectedDriver.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriver(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Vehículo / Placa:</span>
                <span className="font-bold text-slate-800">{selectedDriver.vehicleType} • {selectedDriver.plateNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Estado de Turno:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  selectedDriver.orderId ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedDriver.orderId ? '🟣 En Entrega' : '🟢 En Línea Disponible'}
                </span>
              </div>

              {selectedDriver.orderId && (
                <div className="mt-2 p-2.5 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-900 space-y-1">
                  <p className="text-[11px] font-bold flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-purple-600" />
                    Llevando Orden #{selectedDriver.orderId.substring(0, 8)}
                  </p>
                  {selectedOrder && (
                    <p className="text-[10px] text-purple-800 leading-tight">
                      Hacia: {selectedOrder.dropoffAddress}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setFlyCoord([selectedDriver.lat, selectedDriver.lng])}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Centrar en Mapa
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. PANEL LATERAL DESPLEGABLE (RIGHT DRAWER) */}
      {sidePanelOpen && (
        <div className="w-96 h-full bg-white/95 backdrop-blur-2xl border-l border-slate-200/80 shadow-2xl flex flex-col z-10 transition-all duration-300">
          {/* Header del Panel */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Centro de Monitoreo</h3>
              <p className="text-[11px] text-slate-500 font-medium">Órdenes y conductores en tiempo real</p>
            </div>
            <button
              onClick={() => setSidePanelOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Selector de Pestañas del Panel */}
          <div className="grid grid-cols-2 p-2 gap-1 bg-slate-100/80 mx-4 my-3 rounded-xl border border-slate-200/60 text-xs font-bold">
            <button
              onClick={() => setSideTab('orders')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                sideTab === 'orders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              Órdenes ({activeOrders.length})
            </button>
            <button
              onClick={() => setSideTab('drivers')}
              className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                sideTab === 'drivers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Bike className="w-3.5 h-3.5 text-indigo-600" />
              Flota ({drivers.length})
            </button>
          </div>

          {/* Lista de Contenidos */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
            {sideTab === 'orders' ? (
              activeOrders.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">No hay órdenes activas en este momento</p>
                </div>
              ) : (
                activeOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => handleSelectOrder(ord)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      selectedOrder?.id === ord.id
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                        : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">#{ord.id.substring(0, 8)}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                          ord.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ord.status === 'IN_TRANSIT'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ord.status === 'ASSIGNED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <Store className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">{ord.pickupAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{ord.dropoffAddress}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-900">Bs. {Number(ord.price).toFixed(2)}</span>
                      <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        Ver Ruta <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              filteredDrivers.map((drv) => (
                <div
                  key={drv.id}
                  onClick={() => handleSelectDriver(drv)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    selectedDriver?.id === drv.id
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        {drv.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{drv.name}</h4>
                        <p className="text-[10px] text-slate-500">{drv.phone}</p>
                      </div>
                    </div>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                        drv.orderId ? 'bg-purple-500' : drv.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{drv.vehicleType}</span>
                    <span className="font-bold text-amber-600">⭐ {drv.rating || 5.0}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
