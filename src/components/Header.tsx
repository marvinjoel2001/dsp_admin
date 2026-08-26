import React from 'react';
import { Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div>
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar órdenes, claves, repartidores..."
            className="bg-slate-100/80 border border-slate-200 text-xs text-slate-800 rounded-xl pl-10 pr-4 py-2.5 w-64 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        <button className="p-2.5 bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition-colors relative shadow-xs">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2 ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-800 font-extrabold text-xs shadow-xs">
            {user?.fullName?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900">{user?.fullName || 'Administrador Chiringuito'}</p>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{user?.role || 'Super Administrador'}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Cerrar sesión"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

