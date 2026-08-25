import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { Bike, Navigation, Layers } from 'lucide-react';

const createVehicleIcon = (type: string = 'MOTORCYCLE', heading: number = 0) => {
  let iconPath = '/icons/motorcycle.svg';
  if (type === 'BICYCLE') iconPath = '/icons/bicycle.svg';
  if (type === 'CAR') iconPath = '/icons/car.svg';

  return new L.DivIcon({
    className: 'vehicle-nav-icon',
    html: `<div style="transform: rotate(${heading}deg); width: 32px; height: 50px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.18));">
      <img src="${iconPath}" style="width: 100%; height: 100%; object-fit: contain;" />
    </div>`,
    iconSize: [32, 50],
    iconAnchor: [16, 25],
  });
};

const storePickupIcon = new L.DivIcon({
  className: 'custom-pickup-icon',
  html: `<div style="background:#F59E0B; width:36px; height:36px; border-radius:50%; border:3px solid white; box-shadow:0 4px 12px rgba(245,158,11,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">🏪</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const destinationIcon = new L.DivIcon({
  className: 'custom-destination-icon',
  html: `<div style="background:#059669; width:36px; height:36px; border-radius:50%; border:3px solid white; box-shadow:0 4px 12px rgba(5,150,105,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">🏠</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export const LiveDispatch: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([
    { driverId: 'c8716b1e-6240-4b2a-8c01-7faef83151cf', name: 'Alex Repartidor', vehicleType: 'MOTORCYCLE', lat: -17.7833, lng: -63.1821, heading: 45, orderId: 'ord_8f912a7b' },
    { driverId: 'd9827c2f-7351-4c3b-9d12-8abfe94262de', name: 'Carlos E-Bike', vehicleType: 'BICYCLE', lat: -17.7780, lng: -63.1890, heading: 180, orderId: null },
  ]);

  useEffect(() => {
    const socket = io('http://localhost:3000/tracking', { transports: ['websocket'] });

    socket.on('fleet:driver_location', (data: any) => {
      setDrivers((prev) => {
        const idx = prev.findIndex((d) => d.driverId === data.driverId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            lat: data.lat,
            lng: data.lng,
            heading: data.heading || 0,
            orderId: data.orderId,
          };
          return updated;
        }
        return [
          ...prev,
          {
            driverId: data.driverId,
            name: 'Repartidor Activo',
            vehicleType: data.vehicleType || 'MOTORCYCLE',
            lat: data.lat,
            lng: data.lng,
            heading: data.heading || 0,
            orderId: data.orderId,
          },
        ];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Mapa de Flota en Vivo (Estilo Mapbox Claro)</h2>
          <p className="text-xs text-slate-500 font-medium">Telemetría GPS en tiempo real transmitida mediante Socket.IO y Redis GEO</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Telemetría en Vivo
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden h-[600px] relative shadow-lg">
        <MapContainer
          center={[-17.7833, -63.1821]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Ruta en Curso */}
          <Polyline
            positions={[
              [-17.7833, -63.1821],
              [-17.7880, -63.1780],
              [-17.7950, -63.1700],
            ]}
            color="#059669"
            weight={5}
            opacity={0.8}
            dashArray="10, 10"
          />

          {/* Comercio Pickup */}
          <Marker position={[-17.7833, -63.1821]} icon={storePickupIcon}>
            <Popup>
              <div className="p-2">
                <p className="text-xs font-bold text-slate-800">Restaurante El Chiringuito Central</p>
                <p className="text-[10px] text-slate-500">Punto de Recogida</p>
              </div>
            </Popup>
          </Marker>

          {/* Destino Cliente */}
          <Marker position={[-17.7950, -63.1700]} icon={destinationIcon}>
            <Popup>
              <div className="p-2">
                <p className="text-xs font-bold text-slate-800">Av. Las Palmas #420</p>
                <p className="text-[10px] text-slate-500">Punto de Entrega</p>
              </div>
            </Popup>
          </Marker>

          {/* Conductores en Vivo con Iconos de Vehículo Reales y Heading */}
          {drivers.map((d) => (
            <Marker
              key={d.driverId}
              position={[d.lat, d.lng]}
              icon={createVehicleIcon(d.vehicleType || 'MOTORCYCLE', d.heading || 0)}
            >
              <Popup>
                <div className="p-2 space-y-1">
                  <p className="text-xs font-bold text-slate-800">{d.name}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    {d.orderId ? `Asignado a: ${d.orderId}` : 'Disponible (En espera)'}
                  </p>
                  <p className="text-[10px] text-slate-400">Tipo: {d.vehicleType || 'Motocicleta'}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
