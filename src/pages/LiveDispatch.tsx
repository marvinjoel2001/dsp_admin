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
import { useAuth } from '../context/AuthContext';

// ==========================================
// VECTORES SVG OFICIALES DE LA APP
// ==========================================

const bicycleSvgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320" width="38" height="54">
  <defs>
    <filter id="bikeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.35"/>
    </filter>
  </defs>
  <g filter="url(#bikeShadow)" transform="translate(0, 5)">
    <rect x="96" y="45" width="8" height="65" rx="4" fill="#2C3E50"/>
    <rect x="98" y="48" width="4" height="59" rx="2" fill="#7F8C8D"/>
    <rect x="96" y="195" width="8" height="65" rx="4" fill="#2C3E50"/>
    <rect x="98" y="198" width="4" height="59" rx="2" fill="#7F8C8D"/>
    <path d="M 45 95 C 65 90, 80 92, 100 92 C 120 92, 135 90, 155 95" fill="none" stroke="#7F8C8D" stroke-width="5" stroke-linecap="round"/>
    <path d="M 45 95 L 45 108" stroke="#34495E" stroke-width="7" stroke-linecap="round"/>
    <path d="M 155 95 L 155 108" stroke="#34495E" stroke-width="7" stroke-linecap="round"/>
    <rect x="97" y="90" width="6" height="95" fill="#95A5A6"/>
    <line x1="65" y1="170" x2="135" y2="170" stroke="#7F8C8D" stroke-width="4" stroke-linecap="round"/>
    <rect x="60" y="163" width="12" height="14" rx="2" fill="#34495E"/>
    <rect x="128" y="163" width="12" height="14" rx="2" fill="#34495E"/>
    <path d="M 100 150 C 92 165, 82 185, 82 195 C 82 205, 92 210, 100 210 C 108 210, 118 205, 118 195 C 118 185, 108 165, 100 150 Z" fill="#2C3E50" stroke="#1A252F" stroke-width="2"/>
  </g>
</svg>
`;

const carSvgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 320" width="42" height="60">
  <defs>
    <filter id="carShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.4"/>
    </filter>
    <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#CBD5E1"/>
      <stop offset="20%" stop-color="#F1F5F9"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="80%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#94A3B8"/>
    </linearGradient>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
  <g filter="url(#carShadow)" transform="translate(0, 5)">
    <rect x="36" y="115" width="14" height="24" rx="6" fill="#94A3B8" stroke="#64748B" stroke-width="1.5"/>
    <rect x="150" y="115" width="14" height="24" rx="6" fill="#94A3B8" stroke="#64748B" stroke-width="1.5"/>
    <path d="M 55 60 C 55 45, 80 40, 100 40 C 120 40, 145 45, 145 60 L 148 210 C 148 245, 125 255, 100 255 C 75 255, 52 245, 52 210 Z" fill="url(#carBodyGrad)" stroke="#64748B" stroke-width="2"/>
    <path d="M 68 55 C 85 50, 115 50, 132 55" fill="none" stroke="#CBD5E1" stroke-width="2" stroke-linecap="round"/>
    <path d="M 62 100 C 80 93, 120 93, 138 100 L 132 125 C 115 122, 85 122, 68 125 Z" fill="url(#glassGrad)"/>
    <path d="M 67 128 C 85 125, 115 125, 133 128 L 135 185 C 115 188, 85 188, 65 185 Z" fill="url(#carBodyGrad)" stroke="#CBD5E0" stroke-width="1"/>
    <path d="M 66 190 C 85 187, 115 187, 134 190 L 130 208 C 115 212, 85 212, 70 208 Z" fill="url(#glassGrad)"/>
    <path d="M 56 230 C 56 242, 72 248, 78 248 L 78 238 C 70 238, 60 235, 56 230 Z" fill="#EF4444"/>
    <path d="M 144 230 C 144 242, 128 248, 122 248 L 122 238 C 130 238, 140 235, 144 230 Z" fill="#EF4444"/>
  </g>
</svg>
`;

const storePickupSvgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="36" height="44">
  <defs>
    <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M 50 10 C 27.9 10, 10 27.9, 10 50 C 10 78, 50 115, 50 115 C 50 115, 90 78, 90 50 C 90 27.9, 72.1 10, 50 10 Z" fill="#F59E0B" stroke="#FFFFFF" stroke-width="3.5" filter="url(#pinShadow)"/>
  <circle cx="50" cy="48" r="22" fill="#FFFFFF"/>
  <path d="M 36 43 L 38 35 H 62 L 64 43 Z" fill="#F59E0B"/>
  <path d="M 35 43 H 65 V 59 H 35 Z" fill="none" stroke="#F59E0B" stroke-width="3"/>
  <rect x="45" y="49" width="10" height="10" fill="#F59E0B"/>
</svg>
`;

const customerDropoffSvgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="36" height="44">
  <defs>
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M 50 10 C 27.9 10, 10 27.9, 10 50 C 10 78, 50 115, 50 115 C 50 115, 90 78, 90 50 C 90 27.9, 72.1 10, 50 10 Z" fill="#059669" stroke="#FFFFFF" stroke-width="3.5" filter="url(#dropShadow)"/>
  <circle cx="50" cy="48" r="22" fill="#FFFFFF"/>
  <path d="M 50 34 L 35 46 V 62 H 65 V 46 Z" fill="#059669"/>
  <rect x="46" y="50" width="8" height="12" fill="#FFFFFF"/>
</svg>
`;

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

// Generador de Iconos Dinámicos SIN CÍRCULO BLANCO
const createVehicleIcon = (type: string = 'MOTORCYCLE', heading: number = 0, name: string = 'Repartidor', isDelivering: boolean = false) => {
  const vType = (type || 'MOTORCYCLE').toUpperCase();

  let vehicleGraphic = '';
  if (vType === 'BICYCLE') {
    vehicleGraphic = bicycleSvgString;
  } else if (vType === 'CAR') {
    vehicleGraphic = carSvgString;
  } else {
    // MOTORCYCLE: Usa la imagen oficial icon_driver.png con rotación directa y sombra
    vehicleGraphic = `<img src="/images/icon_driver.png" style="width:48px; height:48px; object-fit:contain; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));" alt="Driver" />`;
  }

  return new L.DivIcon({
    className: 'custom-driver-vehicle-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; pointer-events:auto; position:relative;">
        <!-- Radar / Halo Verde Translúcido de Ubicación GPS (Sin fondo blanco) -->
        <div style="position:absolute; top:12px; width:54px; height:54px; border-radius:50%; background:rgba(16,185,129,0.22); border:1.5px solid rgba(16,185,129,0.55); pointer-events:none; z-index:1;"></div>

        <!-- Etiqueta con Nombre del Conductor -->
        <div style="background:#0F172A; color:#FFFFFF; font-size:10px; font-weight:800; padding:2px 7px; border-radius:6px; margin-bottom:2px; white-space:nowrap; box-shadow:0 3px 8px rgba(0,0,0,0.4); border:1px solid #334155; display:flex; align-items:center; gap:4px; z-index:3;">
          <span style="width:6px; height:6px; border-radius:50%; background:${isDelivering ? '#A855F7' : '#10B981'}; display:inline-block;"></span>
          ${name}
        </div>

        <!-- Gráfico del Vehículo Directo con Rotación (Sin contenedor de círculo blanco) -->
        <div style="transform: rotate(${heading}deg); width: 48px; height: 48px; display:flex; align-items:center; justify-content:center; z-index:2; transition: transform 0.3s ease-out;">
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
  html: storePickupSvgString,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
});

const destinationIcon = new L.DivIcon({
  className: 'custom-destination-icon',
  html: customerDropoffSvgString,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
});

export const LiveDispatch: React.FC = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [flyCoord, setFlyCoord] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'online' | 'delivering' | 'offline'>('all');
  const [sidePanelOpen, setSidePanelOpen] = useState(true);
  const [sideTab, setSideTab] = useState<'orders' | 'drivers'>('orders');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar Datos Reales del Backend
  const loadRealData = async () => {
    setIsLoading(true);
    try {
      const driversEndpoint = user?.role === 'DSP_EXTERNAL' && user.dspPartnerId
        ? `/drivers?dspPartnerId=${user.dspPartnerId}`
        : '/drivers';
      const ordersEndpoint = user?.role === 'DSP_EXTERNAL' && user.dspPartnerId
        ? `/orders?delegatedDspId=${user.dspPartnerId}`
        : '/orders';

      const [driversData, ordersData] = await Promise.all([
        api.get(driversEndpoint).catch(() => []),
        api.get(ordersEndpoint).catch(() => []),
      ]);

      if (Array.isArray(driversData)) {
        const mapped = driversData.map((d: any, index: number) => ({
          driverId: d.id,
          id: d.id,
          name: d.fullName,
          fullName: d.fullName,
          phone: d.phone,
          vehicleType: d.vehicleType || 'MOTORCYCLE',
          plateNumber: d.vehiclePlate || d.plateNumber || 'N/A',
          rating: d.rating || 5.0,
          isOnline: d.isOnline ?? true,
          verificationStatus: d.verificationStatus || 'verified',
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

    // 2. Conectar WebSocket en Tiempo Real
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
            plateNumber: 'N/A',
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

  // Filtrar conductores para la lista
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        d.name?.toLowerCase().includes(q) ||
        d.phone?.includes(q) ||
        d.vehicleType?.toLowerCase().includes(q) ||
        d.plateNumber?.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterTab === 'online') return d.isOnline && !d.orderId;
      if (filterTab === 'delivering') return !!d.orderId;
      if (filterTab === 'offline') return !d.isOnline;
      return true;
    });
  }, [drivers, searchQuery, filterTab]);

  // Órdenes activas
  const activeOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'CANCELLED');
  }, [orders]);

  // Resultados de búsqueda combinada (Conductores y Órdenes)
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { drivers: [], orders: [] };

    const matchedDrivers = drivers.filter(
      (d) =>
        d.name?.toLowerCase().includes(q) ||
        d.phone?.includes(q) ||
        d.vehicleType?.toLowerCase().includes(q) ||
        d.plateNumber?.toLowerCase().includes(q)
    );

    const matchedOrders = orders.filter(
      (o) =>
        o.id?.toLowerCase().includes(q) ||
        o.merchantReference?.toLowerCase().includes(q) ||
        o.pickupAddress?.toLowerCase().includes(q) ||
        o.dropoffAddress?.toLowerCase().includes(q)
    );

    return { drivers: matchedDrivers, orders: matchedOrders };
  }, [drivers, orders, searchQuery]);

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

                {/* Marcador Tienda Pickup Oficial */}
                <Marker
                  position={[pLat, pLng]}
                  icon={storePickupIcon}
                  eventHandlers={{ click: () => handleSelectOrder(ord) }}
                >
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

                {/* Marcador Cliente Dropoff Oficial */}
                <Marker
                  position={[dLat, dLng]}
                  icon={destinationIcon}
                  eventHandlers={{ click: () => handleSelectOrder(ord) }}
                >
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

          {/* Marcadores de Conductores en Vivo (Sin fondo blanco, con SVG o icon_driver) */}
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
          <div className="bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-slate-200/80 space-y-2.5 relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar conductor, teléfono, placa o dirección..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setIsSearchFocused(false);
                    }}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
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

            {/* Menú Desplegable con Resultados de Búsqueda */}
            {searchQuery.trim() && isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 p-2 max-h-72 overflow-y-auto space-y-2 z-20">
                {searchResults.drivers.length === 0 && searchResults.orders.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">
                    No se encontraron conductores ni órdenes con "{searchQuery}"
                  </p>
                ) : (
                  <>
                    {searchResults.drivers.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-extrabold uppercase text-slate-400 px-2">Conductores</p>
                        {searchResults.drivers.map((d) => (
                          <div
                            key={d.id}
                            onClick={() => {
                              handleSelectDriver(d);
                              setIsSearchFocused(false);
                            }}
                            className="p-2 hover:bg-indigo-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Bike className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="text-xs font-bold text-slate-800">{d.name}</span>
                              <span className="text-[10px] text-slate-400">({d.phone})</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600">{d.vehicleType}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {searchResults.orders.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-100">
                        <p className="text-[10px] font-extrabold uppercase text-slate-400 px-2">Órdenes</p>
                        {searchResults.orders.map((o) => (
                          <div
                            key={o.id}
                            onClick={() => {
                              handleSelectOrder(o);
                              setIsSearchFocused(false);
                            }}
                            className="p-2 hover:bg-emerald-50 rounded-xl cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-xs font-mono font-bold text-slate-800">#{o.id.substring(0, 8)}</span>
                              <span className="text-[11px] text-slate-500 truncate">{o.dropoffAddress}</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-slate-900 shrink-0">Bs. {Number(o.price).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

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
