import React, { useState, useEffect } from 'react';
import { Bike, Star, Phone, CheckCircle2, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '../services/api';

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);

  const fetchDrivers = () => {
    api.get('/drivers')
      .then(setDrivers)
      .catch(() => {
        setDrivers([
          {
            id: 'c8716b1e-6240-4b2a-8c01-7faef83151cf',
            fullName: 'Alex Courier',
            phone: '+59170000000',
            email: 'alex.courier@fooddrive.com',
            vehicleType: 'MOTORCYCLE',
            vehiclePlate: '1234-XYZ',
            isOnline: true,
            isActive: true,
            rating: 4.9,
            walletBalance: 128.50,
          },
          {
            id: 'd9827c2f-7351-4c3b-9d12-8abfe94262de',
            fullName: 'Carlos Mendoza',
            phone: '+59171112233',
            email: 'carlos.m@fooddrive.com',
            vehicleType: 'MOTORCYCLE',
            vehiclePlate: '5678-ABC',
            isOnline: false,
            isActive: true,
            rating: 5.0,
            walletBalance: 84.00,
          },
        ]);
      });
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleToggleOnline = async (driverId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/drivers/${driverId}/online`, { isOnline: !currentStatus });
      fetchDrivers();
    } catch {
      setDrivers(drivers.map((d) => (d.id === driverId ? { ...d, isOnline: !currentStatus } : d)));
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Roster de la Flota de Conductores</h2>
        <p className="text-xs text-slate-500 font-medium">Turnos en línea/fuera de línea, calificaciones, vehículos y saldo acumulado</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((d) => (
          <div
            key={d.id}
            className="glass-card rounded-2xl p-6 space-y-4 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800 font-black text-lg shadow-xs">
                  {d.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{d.fullName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{d.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg text-amber-800 text-xs font-bold shadow-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {d.rating}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Vehículo</span>
                <p className="font-bold text-slate-800 mt-0.5">{d.vehicleType} ({d.vehiclePlate})</p>
              </div>
              <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Billetera</span>
                <p className="font-extrabold text-emerald-700 mt-0.5">${Number(d.walletBalance).toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                d.isOnline
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {d.isOnline ? 'En Línea / GPS Activo' : 'Fuera de Línea'}
              </span>

              <button
                onClick={() => handleToggleOnline(d.id, d.isOnline)}
                className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
              >
                {d.isOnline ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                Cambiar Turno
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
