import React from 'react';
import { Bell, Search, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onToggleMobileMenu }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 sm:h-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 shadow-2xs transition-colors shrink-0 cursor-pointer"
          title="Abrir menú de navegación"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">{title}</h2>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {/* Search Input (Hidden on extra small screens for clean UX) */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar órdenes, repartidores..."
            className="bg-slate-100/80 border border-slate-200 text-xs text-slate-800 rounded-xl pl-10 pr-4 py-2.5 w-56 lg:w-64 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* Notifications Button */}
        <button
          type="button"
          className="p-2 sm:p-2.5 bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 transition-colors relative shadow-2xs cursor-pointer"
          title="Notificaciones operativas"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-8 h-8 sm:w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800 font-black text-xs shadow-2xs">
            {user?.fullName?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="hidden lg:block text-left max-w-[140px]">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'Administrador'}</p>
            <p className="text-[10px] text-emerald-700 font-black uppercase tracking-wider truncate">
              {user?.role === 'DSP_EXTERNAL' ? 'Asociación Motos' : 'Super Admin'}
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Cerrar sesión"
            className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
