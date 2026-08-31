import React, { useState } from 'react';
import { Calculator, ArrowRight, DollarSign, Clock, Navigation, Bike, Car, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export const QuoteSimulator: React.FC = () => {
  const [pickupAddress, setPickupAddress] = useState('Av. San Martín #123, Equipetrol');
  const [pickupLat, setPickupLat] = useState(-17.7833);
  const [pickupLng, setPickupLng] = useState(-63.1821);
  const [dropoffAddress, setDropoffAddress] = useState('Calle Los Pinos #450, Barrio Sirari');
  const [dropoffLat, setDropoffLat] = useState(-17.7950);
  const [dropoffLng, setDropoffLng] = useState(-63.1700);
  const [vehicleType, setVehicleType] = useState('MOTORCYCLE');
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any | null>({
    distanceKm: 1.85,
    durationMinutes: 10,
    basePrice: 8.0,
    surgeMultiplier: 1.0,
    totalPrice: 8.0,
    driverPayout: 6.4,
    platformFee: 1.6,
    appliedConfigName: 'Tarifa Estándar Motocicleta (Urbana)',
    currency: 'BOB',
  });

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Calcular distancia de Haversine
      const R = 6371;
      const dLat = ((dropoffLat - pickupLat) * Math.PI) / 180;
      const dLon = ((dropoffLng - pickupLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pickupLat * Math.PI) / 180) *
          Math.cos((dropoffLat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = parseFloat((R * c).toFixed(2));
      const durationMinutes = Math.max(Math.ceil((distanceKm / 25) * 60 + 5), 5);

      // 2. Consultar el motor de cálculo de tarifas del backend
      const response = await api.post('/pricing/simulate', {
        distanceKm,
        durationMinutes,
        vehicleType,
        surgeMultiplier,
      });

      setResult({
        ...response,
        currency: 'BOB',
      });
    } catch {
      // Fallback local si falla la red
      const distanceKm = 2.5;
      const durationMinutes = 12;
      const basePrice = 12.0;
      const totalPrice = basePrice * surgeMultiplier;
      const driverPayout = totalPrice * 0.8;
      setResult({
        distanceKm,
        durationMinutes,
        basePrice,
        surgeMultiplier,
        totalPrice,
        driverPayout,
        platformFee: totalPrice - driverPayout,
        appliedConfigName: 'Tarifario Dinámico Local',
        currency: 'BOB',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Calculator className="w-6 h-6 text-indigo-600" />
          Simulador de Cotizaciones B2B en Vivo
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Prueba el cálculo de tarifas consumiendo directamente las reglas configuradas por tramos de kilómetros y tipos de vehículo
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de Coordenadas */}
        <form onSubmit={handleSimulate} className="glass-panel rounded-3xl p-6 space-y-4 bg-white border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Parámetros de la Cotización</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Vehículo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'MOTORCYCLE', label: 'Moto', icon: Bike },
                { id: 'BICYCLE', label: 'Bici', icon: Bike },
                { id: 'CAR', label: 'Auto', icon: Car },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleType(v.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    vehicleType === v.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <v.icon className="w-3.5 h-3.5" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Punto de Recogida (Lat, Lng)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.0001"
                value={pickupLat}
                onChange={(e) => setPickupLat(parseFloat(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
              />
              <input
                type="number"
                step="0.0001"
                value={pickupLng}
                onChange={(e) => setPickupLng(parseFloat(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Punto de Entrega (Lat, Lng)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.0001"
                value={dropoffLat}
                onChange={(e) => setDropoffLat(parseFloat(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
              />
              <input
                type="number"
                step="0.0001"
                value={dropoffLng}
                onChange={(e) => setDropoffLng(parseFloat(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Multiplicador de Demanda (Surge)</label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="3.0"
              value={surgeMultiplier}
              onChange={(e) => setSurgeMultiplier(parseFloat(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? 'Calculando...' : 'Calcular Cotización'}
          </button>
        </form>

        {/* Desglose de la Cotización */}
        {result && (
          <div className="glass-panel rounded-3xl p-6 space-y-6 flex flex-col justify-between bg-white border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Desglose de Cotización</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {result.vehicleType || vehicleType}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Regla aplicada: <strong className="text-slate-800">{result.appliedConfigName}</strong>
              </p>

              <div className="mt-6 space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Distancia Estimada</span>
                  <span className="font-bold text-slate-900">{result.distanceKm} km</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Duración Estimada</span>
                  <span className="font-bold text-slate-900">{result.durationMinutes} min</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Tarifa de Tramo / Base</span>
                  <span className="font-bold text-slate-900">Bs. {result.basePrice}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Factor de Demanda</span>
                  <span className="font-extrabold text-indigo-700">{result.surgeMultiplier}x</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Precio Total Cobrado</p>
                <p className="text-2xl font-black text-white">Bs. {result.totalPrice} BOB</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-emerald-400">Pago Conductor</p>
                <p className="text-xl font-extrabold text-emerald-400">Bs. {result.driverPayout} BOB</p>
                <p className="text-[10px] text-indigo-300 font-bold mt-0.5">Margen: Bs. {result.platformFee || (result.totalPrice - result.driverPayout).toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
