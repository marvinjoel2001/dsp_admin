import React, { useState } from 'react';
import { Calculator, ArrowRight, DollarSign, Clock, Navigation } from 'lucide-react';

export const QuoteSimulator: React.FC = () => {
  const [pickupAddress, setPickupAddress] = useState('062 Kuhn Plains Suite 793');
  const [pickupLat, setPickupLat] = useState(-17.7833);
  const [pickupLng, setPickupLng] = useState(-63.1821);
  const [dropoffAddress, setDropoffAddress] = useState('922 Wilfredo Tunnel');
  const [dropoffLat, setDropoffLat] = useState(-17.7950);
  const [dropoffLng, setDropoffLng] = useState(-63.1700);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);

  const [result, setResult] = useState<any | null>({
    distanceKm: 1.85,
    durationMinutes: 10,
    basePrice: 5.22,
    surgeMultiplier: 1.0,
    totalPrice: 5.22,
    driverPayout: 4.18,
    currency: 'USD',
  });

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
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
    const rawPrice = (2.50 + distanceKm * 1.20 + durationMinutes * 0.25) * surgeMultiplier;
    const totalPrice = parseFloat(rawPrice.toFixed(2));
    const driverPayout = parseFloat((totalPrice * 0.8).toFixed(2));

    setResult({
      distanceKm,
      durationMinutes,
      basePrice: parseFloat((2.50 + distanceKm * 1.20 + durationMinutes * 0.25).toFixed(2)),
      surgeMultiplier,
      totalPrice,
      driverPayout,
      currency: 'USD',
    });
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Simulador de Tarifas Dinámicas y Fórmula Haversine</h2>
        <p className="text-xs text-slate-500 font-medium">Prueba el cálculo de tarifas con precio base, cobro por kilómetro y factor de sobreprecio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario de Coordenadas */}
        <form onSubmit={handleSimulate} className="glass-panel rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Coordenadas de la Ruta</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Punto de Recogida (Lat, Lng)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.0001"
                value={pickupLat}
                onChange={(e) => setPickupLat(parseFloat(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
              />
              <input
                type="number"
                step="0.0001"
                value={pickupLng}
                onChange={(e) => setPickupLng(parseFloat(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
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
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
              />
              <input
                type="number"
                step="0.0001"
                value={dropoffLng}
                onChange={(e) => setDropoffLng(parseFloat(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
          >
            Calcular Cotización
          </button>
        </form>

        {/* Desglose de la Cotización */}
        {result && (
          <div className="glass-panel rounded-2xl p-6 space-y-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Desglose de Cotización</h3>
              <p className="text-xs text-slate-500 mt-1">Calculado mediante la fórmula ortodrómica de Haversine</p>

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
                  <span className="text-slate-600 font-medium">Tarifa Base + Tarifa KM</span>
                  <span className="font-bold text-slate-900">Bs. {result.basePrice}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium">Factor de Demanda</span>
                  <span className="font-extrabold text-emerald-700">{result.surgeMultiplier}x</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-800">Precio Total B2B</p>
                <p className="text-2xl font-black text-slate-900">Bs. {result.totalPrice} BOB</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500">Pago Conductor (80%)</p>
                <p className="text-xl font-extrabold text-emerald-700">Bs. {result.driverPayout} BOB</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
