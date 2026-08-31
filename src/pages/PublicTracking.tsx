import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import {
  Bike,
  MapPin,
  Clock,
  Phone,
  Store,
  CheckCircle2,
  AlertCircle,
  Share2,
  Navigation,
  FileImage,
} from 'lucide-react';
import { api } from '../services/api';

// Íconos SVG oficiales de entrega
const storePickupSvgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="38" height="46">
  <defs>
    <filter id="storeShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path d="M 50 10 C 27.9 10, 10 27.9, 10 50 C 10 78, 50 115, 50 115 C 50 115, 90 78, 90 50 C 90 27.9, 72.1 10, 50 10 Z" fill="#4F46E5" stroke="#FFFFFF" stroke-width="3.5" filter="url(#storeShadow)"/>
  <circle cx="50" cy="48" r="22" fill="#FFFFFF"/>
  <path d="M 36 43 L 38 35 H 62 L 64 43 Z" fill="#F59E0B"/>
  <path d="M 35 43 H 65 V 59 H 35 Z" fill="none" stroke="#F59E0B" stroke-width="3"/>
  <rect x="45" y="49" width="10" height="10" fill="#F59E0B"/>
</svg>
`;

const customerDropoffSvgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" width="38" height="46">
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

const createDriverIcon = (heading: number = 0, name: string = 'Repartidor') => {
  return new L.DivIcon({
    className: 'custom-driver-vehicle-marker',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; position:relative;">
        <div style="position:absolute; top:12px; width:52px; height:52px; border-radius:50%; background:rgba(16,185,129,0.25); border:2px solid #10B981; animation:pulse 2s infinite; pointer-events:none; z-index:1;"></div>
        <div style="background:#0F172A; color:#FFFFFF; font-size:10px; font-weight:800; padding:2px 8px; border-radius:8px; margin-bottom:2px; white-space:nowrap; box-shadow:0 3px 8px rgba(0,0,0,0.4); border:1px solid #334155; display:flex; align-items:center; gap:4px; z-index:3;">
          <span style="width:6px; height:6px; border-radius:50%; background:#10B981; display:inline-block;"></span>
          ${name}
        </div>
        <div style="transform: rotate(${heading}deg); width:48px; height:48px; display:flex; align-items:center; justify-content:center; z-index:2; transition: transform 0.3s ease-out;">
          <img src="/images/icon_driver.png" style="width:46px; height:46px; object-fit:contain; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.45));" alt="Driver" />
        </div>
      </div>
    `,
    iconSize: [90, 70],
    iconAnchor: [45, 35],
  });
};

const storeIcon = new L.DivIcon({
  className: 'custom-pickup-icon',
  html: storePickupSvgString,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
});

const dropoffIcon = new L.DivIcon({
  className: 'custom-dropoff-icon',
  html: customerDropoffSvgString,
  iconSize: [38, 46],
  iconAnchor: [19, 46],
});

const MapAutoFit: React.FC<{
  pickup: [number, number];
  dropoff: [number, number];
  driver?: [number, number] | null;
}> = ({ pickup, dropoff, driver }) => {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [pickup, dropoff];
    if (driver && driver[0] && driver[1]) points.push(driver);
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
  }, [pickup, dropoff, driver, map]);
  return null;
};

export const PublicTracking: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<any | null>(null);
  const [driverLocation, setDriverLocation] = useState<{
    lat: number;
    lng: number;
    heading: number;
    speed: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 1. Cargar Datos Públicos del Pedido
  const loadTrackingData = async () => {
    if (!token) return;
    try {
      const data = await api.get(`/orders/track/${token}`);
      setOrder(data);
      if (data.driver?.currentLat && data.driver?.currentLng) {
        setDriverLocation((prev) => {
          // Si no había ubicación o cambió, actualizar
          if (!prev || prev.lat !== data.driver.currentLat || prev.lng !== data.driver.currentLng) {
            return {
              lat: Number(data.driver.currentLat),
              lng: Number(data.driver.currentLng),
              heading: prev?.heading || 0,
              speed: prev?.speed || 0,
            };
          }
          return prev;
        });
      }
      setError(null);
    } catch (err: any) {
      console.error('Error cargando tracking público:', err);
      setError(err.message || 'No se encontró la información del pedido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrackingData();
    const interval = setInterval(loadTrackingData, 5000); // Polling cada 5s para precisión total
    return () => clearInterval(interval);
  }, [token]);

  // 2. Conectar WebSocket de Telemetría en Vivo
  useEffect(() => {
    if (!order?.orderId) return;

    const wsUrl =
      (process.env.WS_URL as string) ||
      (import.meta.env.VITE_WS_URL as string) ||
      'https://dsp-backend-q3mn.onrender.com/tracking';

    const socket = io(wsUrl, { transports: ['websocket', 'polling'] });

    socket.emit('order:subscribe', { orderId: order.orderId });

    socket.on('order:location_update', (ping: any) => {
      if (ping.lat && ping.lng) {
        setDriverLocation({
          lat: ping.lat,
          lng: ping.lng,
          heading: ping.heading || 0,
          speed: ping.speed || 0,
        });
      }
    });

    socket.on('fleet:driver_location', (ping: any) => {
      if (order.driver && (ping.driverId === order.driver.id || ping.orderId === order.orderId)) {
        setDriverLocation({
          lat: ping.lat,
          lng: ping.lng,
          heading: ping.heading || 0,
          speed: ping.speed || 0,
        });
      }
    });

    return () => {
      socket.emit('order:unsubscribe', { orderId: order.orderId });
      socket.disconnect();
    };
  }, [order?.orderId]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Seguimiento de Pedido #${order?.merchantReference || ''}`,
        text: `Sigue en vivo la entrega de tu pedido en Chiringuito DSP`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-spin">
          <Bike className="w-7 h-7" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-black tracking-tight">Cargando Seguimiento en Vivo...</h2>
          <p className="text-xs text-slate-400 mt-1">Conectando con el GPS del repartidor</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black">Pedido No Encontrado</h2>
        <p className="text-xs text-slate-400 max-w-sm mt-2">
          El enlace de rastreo no es válido o ha expirado. Verifica el link enviado por el comercio.
        </p>
      </div>
    );
  }

  const pickupCoord: [number, number] = [order.pickupLat || -17.7833, order.pickupLng || -63.1821];
  const dropoffCoord: [number, number] = [order.dropoffLat || -17.7850, order.dropoffLng || -63.1780];
  const driverCoord: [number, number] | null = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : order.driver?.currentLat && order.driver?.currentLng
    ? [order.driver.currentLat, order.driver.currentLng]
    : null;

  const getStatusBadge = () => {
    switch (order.status) {
      case 'DELIVERED':
        return {
          label: '¡Pedido Entregado con Éxito!',
          desc: 'Tu paquete ha sido recibido.',
          color: 'bg-emerald-500 text-white',
          icon: <CheckCircle2 className="w-5 h-5" />,
        };
      case 'IN_TRANSIT':
        return {
          label: 'Repartidor en Camino a tu Domicilio',
          desc: 'El repartidor ya recogió tu paquete y está en ruta.',
          color: 'bg-indigo-600 text-white',
          icon: <Bike className="w-5 h-5 animate-bounce" />,
        };
      case 'ARRIVED_AT_PICKUP':
        return {
          label: 'Repartidor en el Local / Tienda',
          desc: 'Esperando que empaquen tu pedido para iniciar el viaje.',
          color: 'bg-amber-500 text-white',
          icon: <Store className="w-5 h-5" />,
        };
      case 'ASSIGNED':
        return {
          label: 'Repartidor Asignado',
          desc: 'En camino hacia la tienda para recoger tu pedido.',
          color: 'bg-blue-600 text-white',
          icon: <Navigation className="w-5 h-5" />,
        };
      case 'CANCELLED':
        return {
          label: 'Pedido Cancelado',
          desc: 'Esta orden fue cancelada por la tienda.',
          color: 'bg-rose-600 text-white',
          icon: <AlertCircle className="w-5 h-5" />,
        };
      default:
        return {
          label: 'Buscando Repartidor Cercano',
          desc: 'Coordinando con las motos activas en tu zona...',
          color: 'bg-slate-700 text-white',
          icon: <Clock className="w-5 h-5 animate-pulse" />,
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Header Móvil Optimizado (WhatsApp Friendly) */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-wider uppercase text-emerald-400">Chiringuito DSP</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <h1 className="text-sm font-extrabold text-white">
              Pedido #{order.merchantReference || order.orderId?.slice(0, 8)}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
        </button>
      </header>

      {/* Contenedor Responsive: Mapa arriba/dividido y Tarjetas Abajo */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* Sección del Mapa en Tiempo Real */}
        <div className="w-full lg:w-3/5 h-[48vh] lg:h-auto relative z-10 bg-slate-900">
          <MapContainer
            center={pickupCoord}
            zoom={14}
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <MapAutoFit pickup={pickupCoord} dropoff={dropoffCoord} driver={driverCoord} />

            {/* Marcador: Tienda / Recogida */}
            <Marker position={pickupCoord} icon={storeIcon}>
              <Popup className="font-sans">
                <div className="p-1">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase">Punto de Recogida</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{order.pickupAddress}</p>
                </div>
              </Popup>
            </Marker>

            {/* Marcador: Destino del Cliente */}
            <Marker position={dropoffCoord} icon={dropoffIcon}>
              <Popup className="font-sans">
                <div className="p-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Punto de Entrega</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">{order.dropoffAddress}</p>
                </div>
              </Popup>
            </Marker>

            {/* Marcador: Conductor en Vivo con Rotación y Halo */}
            {driverCoord && (
              <Marker
                position={driverCoord}
                icon={createDriverIcon(driverLocation?.heading || 0, order.driver?.fullName || 'Repartidor')}
              >
                <Popup className="font-sans">
                  <div className="p-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Repartidor en Vivo</span>
                    <p className="text-xs font-bold text-slate-900">{order.driver?.fullName}</p>
                    <p className="text-[11px] text-slate-500">{order.driver?.vehiclePlate}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Líneas de Ruta Guía */}
            <Polyline
              positions={
                driverCoord
                  ? [driverCoord, dropoffCoord]
                  : [pickupCoord, dropoffCoord]
              }
              pathOptions={{
                color: '#10B981',
                weight: 4,
                opacity: 0.7,
                dashArray: '8, 8',
              }}
            />
          </MapContainer>

          {/* Badge Flotante de GPS En Vivo */}
          <div className="absolute top-4 left-4 z-[400] pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] font-extrabold text-white">GPS Activo en Vivo</span>
            </div>
          </div>
        </div>

        {/* Panel Lateral / Inferior: Datos del Repartidor, Estado y Direcciones */}
        <div className="w-full lg:w-2/5 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-900/95 border-t lg:border-t-0 lg:border-l border-slate-800">
          {/* Tarjeta de Estado Principal */}
          <div className={`p-4 rounded-2xl ${statusBadge.color} shadow-lg space-y-1`}>
            <div className="flex items-center gap-2">
              {statusBadge.icon}
              <h3 className="text-sm font-black tracking-tight">{statusBadge.label}</h3>
            </div>
            <p className="text-xs opacity-90 pl-7">{statusBadge.desc}</p>
          </div>

          {/* Tarjeta del Repartidor Asignado */}
          {order.driver ? (
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-lg">
                    {order.driver.fullName?.substring(0, 2).toUpperCase() || 'DR'}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Tu Repartidor</span>
                    <h4 className="text-sm font-extrabold text-white">{order.driver.fullName}</h4>
                    <p className="text-xs text-slate-400">
                      {order.driver.vehicleType || 'Motocicleta'} • Placa: <strong className="text-slate-200">{order.driver.vehiclePlate || 'N/A'}</strong>
                    </p>
                  </div>
                </div>

                {order.driver.phone && (
                  <a
                    href={`https://wa.me/${order.driver.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center cursor-pointer"
                    title="Llamar o chatear por WhatsApp"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center space-y-1">
              <p className="text-xs font-bold text-slate-300">Asignando el motorizado más cercano</p>
              <p className="text-[11px] text-slate-500">Recibirás sus datos en tiempo real apenas acepte el pedido.</p>
            </div>
          )}

          {/* Direcciones del Pedido */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Itinerario del Paquete</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Recoger en:</span>
                  <p className="font-semibold text-slate-200">{order.pickupAddress}</p>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-700 ml-3 h-3"></div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Entregar en:</span>
                  <p className="font-semibold text-slate-200">{order.dropoffAddress}</p>
                  {order.packageNotes && (
                    <p className="text-[11px] text-amber-400 mt-0.5 font-medium">Nota: {order.packageNotes}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comprobante de Entrega si la orden ya concluyó */}
          {(order.proofPhotoUrl || order.signatureSvg) && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <FileImage className="w-4 h-4" />
                <span>Comprobante Fotográfico de Entrega (POD)</span>
              </div>
              {order.proofPhotoUrl && (
                <div className="rounded-xl overflow-hidden border border-emerald-700/50 bg-black aspect-video flex items-center justify-center">
                  <img src={order.proofPhotoUrl} alt="Comprobante" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}

          {/* Pie informativo */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-slate-500 font-medium">
              Chiringuito DSP • Seguimiento seguro punto a punto en tiempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
