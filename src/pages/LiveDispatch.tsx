import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { Bike, Navigation, Layers } from 'lucide-react';

const courierIcon = new L.DivIcon({
  className: 'custom-courier-icon',
  html: '<div style="background:#10b981; width:34px; height:34px; border-radius:50%; border:3px solid white; box-shadow:0 4px 12px rgba(16,185,129,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">🏍️</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

const destinationIcon = new L.DivIcon({
  className: 'custom-destination-icon',
  html: '<div style="background:#059669; width:34px; height:34px; border-radius:50%; border:3px solid white; box-shadow:0 4px 12px rgba(5,150,105,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:16px;">🏠</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 17],
});

export const LiveDispatch: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([
    { driverId: 'c8716b1e-6240-4b2a-8c01-7faef83151cf', name: 'Alex Courier', lat: -17.7833, lng: -63.1821, orderId: 'ord_8f912a7b' },
    { driverId: 'd9827c2f-7351-4c3b-9d12-8abfe94262de', name: 'Carlos Mendoza', lat: -17.7780, lng: -63.1890, orderId: null },
  ]);

  useEffect(() => {
    const socket = io('http://localhost:3000/tracking', { transports: ['websocket'] });

    socket.on('fleet:driver_location', (data: any) => {
      setDrivers((prev) => {
        const idx = prev.findIndex((d) => d.driverId === data.driverId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], lat: data.lat, lng: data.lng, orderId: data.orderId };
          return updated;
        }
        return [...prev, { driverId: data.driverId, name: 'Repartidor Activo', lat: data.lat, lng: data.lng, orderId: data.orderId }];
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
          {/* Mapbox Light / Carto Positron Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Ruta Polyline Verde Esmeralda */}
          <Polyline
            positions={[
              [-17.7833, -63.1821],
              [-17.7863, -63.1801],
              [-17.7910, -63.1750],
              [-17.7950, -63.1700],
            ]}
            pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9 }}
          />

          {/* Marcador de Destino */}
          <Marker position={[-17.7950, -63.1700]} icon={destinationIcon}>
            <Popup>
              <div className="p-1 font-sans">
                <p className="font-bold text-slate-900">Punto de Entrega</p>
                <p className="text-xs text-slate-600">922 Wilfredo Tunnel</p>
              </div>
            </Popup>
          </Marker>

          {/* Marcadores de Conductores */}
          {drivers.map((d) => (
            <Marker key={d.driverId} position={[d.lat, d.lng]} icon={courierIcon}>
              <Popup>
                <div className="p-1 font-sans">
                  <p className="font-bold text-slate-900">{d.name}</p>
                  <p className="text-xs text-emerald-700 font-bold">
                    {d.orderId ? `En Entrega Activa (${d.orderId})` : 'Disponible para asignación'}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
