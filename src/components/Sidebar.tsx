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
  ShieldCheck,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Panel General', to: '/', icon: LayoutDashboard },
    { label: 'Tiendas y Claves API', to: '/tenants', icon: Store },
    { label: 'Mapa de Flota en Vivo', to: '/live-map', icon: MapPin },
    { label: 'Órdenes y Auditoría', to: '/orders', icon: Package },
    { label: 'Conductores', to: '/drivers', icon: Bike },
    { label: 'Webhooks y DLQ', to: '/webhooks', icon: Webhook },
    { label: 'Simulador de Tarifas', to: '/quotes', icon: Calculator },
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/80 flex flex-col justify-between h-screen sticky top-0 shadow-sm z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-slate-900">
              OpenDSP Core
            </h1>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/50">
              Panel de Control
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm shadow-emerald-500/5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer Info & Swagger Link */}
      <div className="p-4 space-y-2 border-t border-slate-100">
        <a
          href="http://localhost:3000/api/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition-all text-xs font-bold group"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Documentación Swagger</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </a>

        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">Cluster Activo</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
