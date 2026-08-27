import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  MapPin,
  Package,
  Bike,
  Webhook,
  Calculator,
  FlaskConical,
  Receipt,
  Wallet,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();

  const navItems = [
    { label: 'Panel General', to: '/', icon: LayoutDashboard },
    { label: 'Tiendas y Claves API', to: '/tenants', icon: Store },
    { label: 'Cobranza a Comercios', to: '/merchant-settlements', icon: Receipt },
    { label: 'Pagos a Repartidores', to: '/driver-payouts', icon: Wallet },
    { label: 'Mapa de Flota en Vivo', to: '/live-map', icon: MapPin },
    { label: 'Órdenes y Auditoría', to: '/orders', icon: Package },
    { label: 'Conductores', to: '/drivers', icon: Bike },
    { label: 'Webhooks y DLQ', to: '/webhooks', icon: Webhook },
    { label: 'Simulador de Tarifas', to: '/quotes', icon: Calculator },
    { label: 'Laboratorio E2E & Webhooks', to: '/testing-lab', icon: FlaskConical },
  ];

  const apiBase =
    (process.env.API_BASE_URL as string) ||
    (import.meta.env.VITE_API_BASE_URL as string) ||
    'https://dsp-backend-q3mn.onrender.com/v1';
  const docsUrl = apiBase.replace(/\/v1\/?$/, '') + '/api/docs';

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shadow-sm z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 flex items-center justify-center shadow-sm border border-slate-200/80 shrink-0">
            <img src="/images/logo.png" alt="Chiringuito DSP" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900">
              Chiringuito DSP
            </h1>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/50">
              Centro de Operaciones
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm shadow-slate-900/20 translate-x-1'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info, Swagger Link & Logout */}
      <div className="p-4 space-y-2 border-t border-slate-100">
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-300 text-slate-700 hover:text-indigo-800 transition-all text-xs font-bold group"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Documentación Swagger</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
        </a>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-50/60 hover:bg-red-100/80 border border-red-200/60 text-red-700 transition-all text-xs font-bold cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-red-600" />
            <span>Cerrar Sesión</span>
          </div>
          <span className="text-[10px] text-red-500 font-normal">Salir</span>
        </button>

        <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-700">Cluster Activo</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
