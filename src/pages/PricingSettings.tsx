import React, { useState, useEffect } from 'react';
import {
  Coins,
  Bike,
  Car,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Calculator,
  Building2,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface DistanceBracket {
  fromKm: number;
  toKm: number;
  price: number;
  driverPayout: number;
}

export interface PricingConfigData {
  id?: string;
  dspPartnerId?: string | null;
  vehicleType: string;
  name: string;
  baseFare: number;
  baseDistanceKm: number;
  perKmBeyondBase: number;
  perMinuteRate: number;
  driverPayoutPercentage: number;
  minPrice: number;
  maxPrice?: number;
  brackets: DistanceBracket[];
  isActive: boolean;
}

export interface DspPartnerItem {
  id: string;
  name: string;
  code: string;
  city?: string;
}

export const PricingSettings: React.FC = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Selector de Flota / DSP
  const [dspPartners, setDspPartners] = useState<DspPartnerItem[]>([]);
  const [selectedDspPartnerId, setSelectedDspPartnerId] = useState<string>(
    user?.role === 'DSP_EXTERNAL' && user?.dspPartnerId ? user.dspPartnerId : ''
  );

  // Tipo de vehículo activo: 'MOTORCYCLE' | 'BICYCLE' | 'CAR'
  const [activeVehicleType, setActiveVehicleType] = useState<'MOTORCYCLE' | 'BICYCLE' | 'CAR'>('MOTORCYCLE');

  // Lista completa de configuraciones cargadas del backend
  const [allConfigs, setAllConfigs] = useState<PricingConfigData[]>([]);

  // Configuración en edición para el tipo de vehículo y flota seleccionados
  const [currentConfig, setCurrentConfig] = useState<PricingConfigData>({
    vehicleType: 'MOTORCYCLE',
    name: 'Tarifario Motocicletas',
    baseFare: 8.0,
    baseDistanceKm: 2.0,
    perKmBeyondBase: 2.5,
    perMinuteRate: 0.25,
    driverPayoutPercentage: 80.0,
    minPrice: 8.0,
    brackets: [
      { fromKm: 0, toKm: 2, price: 8.0, driverPayout: 6.4 },
      { fromKm: 2, toKm: 4, price: 12.0, driverPayout: 9.6 },
      { fromKm: 4, toKm: 7, price: 18.0, driverPayout: 14.4 },
      { fromKm: 7, toKm: 12, price: 28.0, driverPayout: 22.4 },
      { fromKm: 12, toKm: 20, price: 42.0, driverPayout: 33.6 },
    ],
    isActive: true,
  });

  // Simulador interactivo en tiempo real
  const [simKm, setSimKm] = useState<number>(3.5);
  const [simSurge, setSimSurge] = useState<number>(1.0);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar DSP partners si es Super Admin
      if (isSuperAdmin) {
        try {
          const partners = await api.get('/dsp-partners');
          setDspPartners(Array.isArray(partners) ? partners : []);
        } catch {
          // Ignorar si no hay permisos
        }
      }

      // Cargar configuraciones de precios
      const configs = await api.get('/pricing');
      if (Array.isArray(configs)) {
        setAllConfigs(configs);
      }
    } catch (e: any) {
      showToast(`Error al cargar tarifas: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Actualizar la configuración activa cuando cambia el vehículo o la flota seleccionada
  useEffect(() => {
    const targetDspId = selectedDspPartnerId || null;
    const found = allConfigs.find(
      (c) =>
        c.vehicleType === activeVehicleType &&
        (targetDspId ? c.dspPartnerId === targetDspId : !c.dspPartnerId)
    );

    if (found) {
      setCurrentConfig({
        ...found,
        brackets: found.brackets && found.brackets.length > 0 ? [...found.brackets] : [],
      });
    } else {
      // Plantilla por defecto según el vehículo
      if (activeVehicleType === 'MOTORCYCLE') {
        setCurrentConfig({
          dspPartnerId: targetDspId,
          vehicleType: 'MOTORCYCLE',
          name: targetDspId ? 'Tarifa Especial Motos DSP' : 'Tarifa Estándar Motocicletas',
          baseFare: 8.0,
          baseDistanceKm: 2.0,
          perKmBeyondBase: 2.5,
          perMinuteRate: 0.25,
          driverPayoutPercentage: 80.0,
          minPrice: 8.0,
          brackets: [
            { fromKm: 0, toKm: 2, price: 8.0, driverPayout: 6.4 },
            { fromKm: 2, toKm: 4, price: 12.0, driverPayout: 9.6 },
            { fromKm: 4, toKm: 7, price: 18.0, driverPayout: 14.4 },
            { fromKm: 7, toKm: 12, price: 28.0, driverPayout: 22.4 },
          ],
          isActive: true,
        });
      } else if (activeVehicleType === 'BICYCLE') {
        setCurrentConfig({
          dspPartnerId: targetDspId,
          vehicleType: 'BICYCLE',
          name: targetDspId ? 'Tarifa Especial Bicicletas DSP' : 'Tarifa Estándar Bicicletas / E-Bikes',
          baseFare: 6.0,
          baseDistanceKm: 1.5,
          perKmBeyondBase: 2.0,
          perMinuteRate: 0.2,
          driverPayoutPercentage: 85.0,
          minPrice: 6.0,
          brackets: [
            { fromKm: 0, toKm: 1.5, price: 6.0, driverPayout: 5.1 },
            { fromKm: 1.5, toKm: 3.5, price: 10.0, driverPayout: 8.5 },
            { fromKm: 3.5, toKm: 6.0, price: 15.0, driverPayout: 12.75 },
          ],
          isActive: true,
        });
      } else {
        setCurrentConfig({
          dspPartnerId: targetDspId,
          vehicleType: 'CAR',
          name: targetDspId ? 'Tarifa Especial Automóviles DSP' : 'Tarifa Automóviles / Paquetería',
          baseFare: 15.0,
          baseDistanceKm: 3.0,
          perKmBeyondBase: 3.5,
          perMinuteRate: 0.4,
          driverPayoutPercentage: 80.0,
          minPrice: 15.0,
          brackets: [
            { fromKm: 0, toKm: 3, price: 15.0, driverPayout: 12.0 },
            { fromKm: 3, toKm: 6, price: 25.0, driverPayout: 20.0 },
            { fromKm: 6, toKm: 10, price: 38.0, driverPayout: 30.4 },
            { fromKm: 10, toKm: 20, price: 60.0, driverPayout: 48.0 },
          ],
          isActive: true,
        });
      }
    }
  }, [activeVehicleType, selectedDspPartnerId, allConfigs]);

  // Manejo de tramos
  const handleAddBracket = () => {
    const brackets = [...currentConfig.brackets];
    const last = brackets.length > 0 ? brackets[brackets.length - 1] : null;
    const fromKm = last ? last.toKm : 0;
    const toKm = fromKm + 3;
    const price = last ? Number((last.price + 8).toFixed(2)) : 10.0;
    const driverPayout = Number(((price * currentConfig.driverPayoutPercentage) / 100).toFixed(2));

    brackets.push({ fromKm, toKm, price, driverPayout });
    setCurrentConfig({ ...currentConfig, brackets });
  };

  const handleRemoveBracket = (index: number) => {
    const brackets = currentConfig.brackets.filter((_, i) => i !== index);
    setCurrentConfig({ ...currentConfig, brackets });
  };

  const handleBracketChange = (index: number, field: keyof DistanceBracket, value: number) => {
    const brackets = [...currentConfig.brackets];
    brackets[index] = { ...brackets[index], [field]: value };

    // Si cambia el precio, recalcular automáticamente el driver payout sugerido
    if (field === 'price') {
      brackets[index].driverPayout = Number(
        ((value * currentConfig.driverPayoutPercentage) / 100).toFixed(2)
      );
    }
    setCurrentConfig({ ...currentConfig, brackets });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...currentConfig,
        dspPartnerId: selectedDspPartnerId || undefined,
        baseFare: Number(currentConfig.baseFare),
        baseDistanceKm: Number(currentConfig.baseDistanceKm),
        perKmBeyondBase: Number(currentConfig.perKmBeyondBase),
        perMinuteRate: Number(currentConfig.perMinuteRate || 0),
        driverPayoutPercentage: Number(currentConfig.driverPayoutPercentage),
        minPrice: Number(currentConfig.minPrice),
        brackets: currentConfig.brackets.map((b) => ({
          fromKm: Number(b.fromKm),
          toKm: Number(b.toKm),
          price: Number(b.price),
          driverPayout: Number(b.driverPayout),
        })),
      };

      if (currentConfig.id) {
        await api.put(`/pricing/${currentConfig.id}`, payload);
      } else {
        await api.post('/pricing', payload);
      }

      showToast('✅ ¡Tarifario y tramos guardados exitosamente!', 'success');
      await loadData();
    } catch (e: any) {
      showToast(`Error al guardar: ${e.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Cálculo en vivo para el simulador
  const calculateSimulatedPrice = () => {
    const distanceKm = Math.max(0.1, simKm);
    const brackets = [...currentConfig.brackets].sort((a, b) => a.fromKm - b.fromKm);

    let matchedBracket: DistanceBracket | undefined;
    let basePrice = 0;
    let driverPayout = 0;

    if (brackets.length > 0) {
      matchedBracket = brackets.find((b) => distanceKm >= b.fromKm && distanceKm < b.toKm);
      if (matchedBracket) {
        basePrice = Number(matchedBracket.price);
        driverPayout = Number(matchedBracket.driverPayout);
      } else {
        const last = brackets[brackets.length - 1];
        if (distanceKm >= last.toKm) {
          const excessKm = distanceKm - last.toKm;
          const excessPrice = excessKm * Number(currentConfig.perKmBeyondBase);
          basePrice = Number(last.price) + excessPrice;
          driverPayout =
            Number(last.driverPayout) + (excessPrice * currentConfig.driverPayoutPercentage) / 100;
        } else {
          basePrice = Number(brackets[0].price);
          driverPayout = Number(brackets[0].driverPayout);
        }
      }
    } else {
      const excess = Math.max(0, distanceKm - currentConfig.baseDistanceKm);
      basePrice = Number(currentConfig.baseFare) + excess * Number(currentConfig.perKmBeyondBase);
      driverPayout = (basePrice * currentConfig.driverPayoutPercentage) / 100;
    }

    const totalPrice = Math.max(Number(currentConfig.minPrice), basePrice * simSurge);
    const finalPayout = Math.min(
      totalPrice * 0.95,
      driverPayout * (totalPrice / Math.max(1, basePrice))
    );
    const platformFee = Math.max(0, totalPrice - finalPayout);

    return {
      basePrice: Number(basePrice.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
      driverPayout: Number(finalPayout.toFixed(2)),
      platformFee: Number(platformFee.toFixed(2)),
      matchedBracket,
    };
  };

  const simResult = calculateSimulatedPrice();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-red-900 text-red-100 border-red-700'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
            <Coins className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Configuración de Tarifas y Tramos
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                En Vivo
              </span>
            </h1>
            <p className="text-sm font-semibold text-slate-500">
              Personaliza precios por tramos de kilómetros, tipo de vehículo y flota de repartidores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs flex items-center gap-2 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Guardando...' : 'Guardar Tarifario'}
          </button>
        </div>
      </div>

      {/* Selector de Ámbito (Super Admin vs DSP Partner) */}
      {isSuperAdmin && (
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-400">
                Ámbito de Configuración
              </div>
              <div className="text-sm font-bold text-slate-200">
                Selecciona si deseas editar la tarifa global o una flota de asociación específica
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDspPartnerId}
              onChange={(e) => setSelectedDspPartnerId(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">🌐 Flota Principal (Super Admin - Global)</option>
              {dspPartners.map((dsp) => (
                <option key={dsp.id} value={dsp.id}>
                  🛡️ {dsp.name} ({dsp.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tabs por Tipo de Vehículo */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {[
          { type: 'MOTORCYCLE', label: 'Motocicleta (Urbano)', icon: Bike, color: 'indigo' },
          { type: 'BICYCLE', label: 'Bicicleta / E-Bike (Corto)', icon: Bike, color: 'emerald' },
          { type: 'CAR', label: 'Automóvil / Paquetería', icon: Car, color: 'amber' },
        ].map((tab) => {
          const isActive = activeVehicleType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setActiveVehicleType(tab.type as any)}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-xs transition-all border cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 border-indigo-500 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/20'
                  : 'bg-white/60 hover:bg-white text-slate-600 border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {currentConfig.id && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Configurada en Base de Datos" />
              )}
            </button>
          );
        })}
      </div>

      {/* Grid Principal: Parámetros + Tramos + Simulador */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda & Centro: Editor de Tramos y Parámetros */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjeta de Parámetros Base */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Parámetros Generales de la Tarifa
              </h2>
              <span className="text-xs font-bold text-slate-400">
                {currentConfig.vehicleType} • {selectedDspPartnerId ? 'DSP Específico' : 'Global'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block text-slate-500 mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  value={currentConfig.name}
                  onChange={(e) => setCurrentConfig({ ...currentConfig, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Tarifa de Arranque (Bs.)</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentConfig.baseFare}
                  onChange={(e) =>
                    setCurrentConfig({ ...currentConfig, baseFare: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">% Pago Conductor</label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="50"
                    max="100"
                    value={currentConfig.driverPayoutPercentage}
                    onChange={(e) =>
                      setCurrentConfig({
                        ...currentConfig,
                        driverPayoutPercentage: parseFloat(e.target.value) || 80,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-2 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Costo Km Excedente (Bs./km)</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentConfig.perKmBeyondBase}
                  onChange={(e) =>
                    setCurrentConfig({
                      ...currentConfig,
                      perKmBeyondBase: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Tarifa Mínima Garantizada (Bs.)</label>
                <input
                  type="number"
                  step="0.5"
                  value={currentConfig.minPrice}
                  onChange={(e) =>
                    setCurrentConfig({ ...currentConfig, minPrice: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Costo por Minuto Tráfico (Bs.)</label>
                <input
                  type="number"
                  step="0.05"
                  value={currentConfig.perMinuteRate}
                  onChange={(e) =>
                    setCurrentConfig({
                      ...currentConfig,
                      perMinuteRate: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Tabla de Tramos de Kilómetros */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Escala de Tramos por Kilómetros
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Define el precio cerrado cobrado al comercio y la comisión para el conductor en cada radio
                </p>
              </div>

              <button
                onClick={handleAddBracket}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-xs flex items-center gap-1.5 border border-emerald-200 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Añadir Tramo
              </button>
            </div>

            {currentConfig.brackets.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No hay tramos de distancia configurados.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Se calculará con la fórmula lineal estándar. Haz clic en "Añadir Tramo" para fijar precios por km.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Tramo</th>
                      <th className="pb-3">Desde (km)</th>
                      <th className="pb-3">Hasta (km)</th>
                      <th className="pb-3">Tarifa Cobrada (Bs.)</th>
                      <th className="pb-3">Pago Conductor (Bs.)</th>
                      <th className="pb-3">Margen Plataforma</th>
                      <th className="pb-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentConfig.brackets.map((bracket, index) => {
                      const platformMargin = Math.max(0, bracket.price - bracket.driverPayout);
                      const marginPct = bracket.price > 0 ? (platformMargin / bracket.price) * 100 : 0;

                      return (
                        <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 font-extrabold text-slate-900">
                            <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-mono text-[11px]">
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-3 font-bold">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={bracket.fromKm}
                              onChange={(e) =>
                                handleBracketChange(index, 'fromKm', parseFloat(e.target.value) || 0)
                              }
                              className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-mono"
                            />
                            <span className="text-slate-400 ml-1">km</span>
                          </td>
                          <td className="py-3 font-bold">
                            <input
                              type="number"
                              step="0.5"
                              min="0.1"
                              value={bracket.toKm}
                              onChange={(e) =>
                                handleBracketChange(index, 'toKm', parseFloat(e.target.value) || 0)
                              }
                              className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-mono"
                            />
                            <span className="text-slate-400 ml-1">km</span>
                          </td>
                          <td className="py-3 font-extrabold text-slate-900">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">Bs.</span>
                              <input
                                type="number"
                                step="0.5"
                                value={bracket.price}
                                onChange={(e) =>
                                  handleBracketChange(index, 'price', parseFloat(e.target.value) || 0)
                                }
                                className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-900 font-bold"
                              />
                            </div>
                          </td>
                          <td className="py-3 font-bold text-emerald-700">
                            <div className="flex items-center gap-1">
                              <span className="text-emerald-500">Bs.</span>
                              <input
                                type="number"
                                step="0.5"
                                value={bracket.driverPayout}
                                onChange={(e) =>
                                  handleBracketChange(index, 'driverPayout', parseFloat(e.target.value) || 0)
                                }
                                className="w-20 bg-emerald-50 border border-emerald-200 rounded-lg px-2 py-1 text-emerald-800 font-bold"
                              />
                            </div>
                          </td>
                          <td className="py-3 font-bold text-slate-600">
                            <span className="text-indigo-600 font-extrabold">Bs. {platformMargin.toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 ml-1.5">({marginPct.toFixed(0)}%)</span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleRemoveBracket(index)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Eliminar Tramo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Simulador Interactivo en Tiempo Real */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-base text-white">Simulador en Vivo</h3>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Motor Quotes
              </span>
            </div>

            {/* Slider de Distancia */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Distancia de Entrega:</span>
                <span className="text-indigo-300 font-mono text-sm">{simKm.toFixed(1)} km</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="20"
                step="0.1"
                value={simKm}
                onChange={(e) => setSimKm(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>0.5 km</span>
                <span>5 km</span>
                <span>10 km</span>
                <span>20 km</span>
              </div>
            </div>

            {/* Surge Multiplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Demanda / Clima (Surge)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1.0, 1.2, 1.35, 1.5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSimSurge(val)}
                    className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      simSurge === val
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {val}x
                  </button>
                ))}
              </div>
            </div>

            {/* Tarjeta de Resultados del Desglose */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-400">Total Cotización:</span>
                <span className="text-2xl font-black text-white tracking-tight">
                  Bs. {simResult.totalPrice.toFixed(2)}
                </span>
              </div>

              <div className="h-px bg-slate-700/80" />

              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex justify-between text-emerald-400">
                  <span>Pago al Conductor (Chofer):</span>
                  <span>Bs. {simResult.driverPayout.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-300">
                  <span>Margen Plataforma / DSP:</span>
                  <span>Bs. {simResult.platformFee.toFixed(2)}</span>
                </div>
              </div>

              {simResult.matchedBracket ? (
                <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>
                    Aplica Tramo: {simResult.matchedBracket.fromKm} - {simResult.matchedBracket.toKm} km
                  </span>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Supera tramos: Aplica tarifa de km excedente</span>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                Las cotizaciones de WhatsApp, tiendas web y panel consumirán directamente este tarifario.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
