import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  Bike,
  Wallet,
  ShieldCheck,
  Tag,
  FileSpreadsheet,
  Store,
  Webhook,
  FlaskConical,
  Receipt,
  MapPin,
  UserPlus,
  BookOpen,
  ExternalLink,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavSection {
  title?: string;
  items: {
    label: string;
    to: string;
    icon: React.ComponentType<{ className?: string }>;
    hasArrow?: boolean;
  }[];
}

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('dsp_sidebar_collapsed') === 'true';
  });

  const isDspExternal = user?.role === 'DSP_EXTERNAL';

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('dsp_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const superAdminSections: NavSection[] = [
    {
      title: 'PRINCIPAL',
      items: [
        { label: 'Panel General', to: '/', icon: LayoutGrid },
      ],
    },
    {
      title: 'GESTIÓN',
      items: [
        { label: 'Órdenes y Auditoría', to: '/orders', icon: Package, hasArrow: true },
        { label: 'Conductores', to: '/drivers', icon: Bike },
        { label: 'Pagos a Repartidores', to: '/driver-payouts', icon: Wallet },
        { label: 'Asociaciones DSP / Motos', to: '/dsp-partners', icon: ShieldCheck },
      ],
    },
    {
      title: 'CONFIGURACIÓN',
      items: [
        { label: 'Configuración de Tarifas', to: '/pricing', icon: Tag },
        { label: 'Simulador de Tarifas', to: '/quotes', icon: FileSpreadsheet },
        { label: 'Tiendas y Claves API', to: '/tenants', icon: Store },
        { label: 'Webhooks y DLQ', to: '/webhooks', icon: Webhook },
        { label: 'Laboratorio E2E & Webhooks', to: '/testing-lab', icon: FlaskConical },
      ],
    },
    {
      title: 'COMERCIOS',
      items: [
        { label: 'Cobranza a Comercios', to: '/merchant-settlements', icon: Receipt },
      ],
    },
    {
      title: 'FLOTA',
      items: [
        { label: 'Mapa de Flota en Vivo', to: '/live-map', icon: MapPin },
      ],
    },
    {
      title: 'CONDUCTORES',
      items: [
        { label: 'Registrar Conductor', to: '/register-driver', icon: UserPlus },
      ],
    },
  ];

  const dspExternalSections: NavSection[] = [
    {
      title: 'PRINCIPAL',
      items: [
        { label: 'Panel General', to: '/', icon: LayoutGrid },
      ],
    },
    {
      title: 'GESTIÓN ASOCIACIÓN',
      items: [
        { label: 'Órdenes Delegadas', to: '/orders', icon: Package, hasArrow: true },
        { label: 'Mis Motorizados', to: '/drivers', icon: Bike },
        { label: 'Mis Liquidaciones', to: '/driver-payouts', icon: Wallet },
      ],
    },
    {
      title: 'CONFIGURACIÓN',
      items: [
        { label: 'Mis Tarifas por Tramo', to: '/pricing', icon: Tag },
      ],
    },
    {
      title: 'FLOTA',
      items: [
        { label: 'Mapa de Mi Flota', to: '/live-map', icon: MapPin },
      ],
    },
  ];

  const sections = isDspExternal ? dspExternalSections : superAdminSections;

  const apiBase =
    (process.env.API_BASE_URL as string) ||
    (import.meta.env.VITE_API_BASE_URL as string) ||
    'https://dsp-backend-q3mn.onrender.com/v1';
  const docsUrl = apiBase.replace(/\/v1\/?$/, '') + '/api/docs';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`bg-white border-r border-slate-200/80 flex flex-col justify-between h-screen fixed lg:sticky top-0 shadow-[0_4px_25px_rgba(0,0,0,0.04)] z-50 lg:z-30 transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[78px] w-[270px]' : 'w-[270px]'}`}
      >
        {/* Header & Navigation Container */}
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Brand Header */}
          <div className={`p-4 border-b border-slate-100 flex items-center justify-between gap-2.5 transition-all ${
            isCollapsed ? 'lg:flex-col lg:gap-3 lg:justify-center lg:py-5' : ''
          }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/60 p-1 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src="/images/pulpo-icon.png"
                  alt="Chiringuito DSP"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Text info - visible on mobile drawer or when desktop expanded */}
              <div className={`min-w-0 flex-1 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
                <h1
                  className="font-extrabold text-[13px] tracking-tight text-slate-900 truncate leading-tight"
                  title={user?.fullName || 'Administrador DSP'}
                >
                  {user?.fullName || 'Administrador DSP'}
                </h1>
                <span className={`text-[9px] font-black uppercase tracking-wider block mt-0.5 ${
                  isDspExternal ? 'text-emerald-700' : 'text-emerald-600'
                }`}>
                  {isDspExternal ? 'ASOCIACIÓN MOTOS' : 'SUPER ADMIN'}
                </span>
              </div>
            </div>

            {/* Desktop Toggle Button */}
            <button
              type="button"
              onClick={toggleCollapse}
              className="hidden lg:flex w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 items-center justify-center text-slate-500 hover:text-slate-800 transition-all cursor-pointer shrink-0 shadow-2xs active:scale-95"
              title={isCollapsed ? 'Expandir barra lateral' : 'Comprimir barra lateral'}
            >
              {isCollapsed ? (
                <ChevronsRight className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronsLeft className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 custom-scrollbar">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {/* Category Header */}
                {section.title && (
                  <div className={`px-3 pt-2 pb-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase ${
                    isCollapsed ? 'lg:hidden' : 'block'
                  }`}>
                    {section.title}
                  </div>
                )}

                {/* Category Divider when collapsed */}
                {isCollapsed && sIdx > 0 && (
                  <div className="hidden lg:block my-2 border-t border-slate-100 mx-2" />
                )}

                {/* Nav Items */}
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={handleNavClick}
                    title={isCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl text-xs font-bold transition-all duration-200 group relative ${
                        isCollapsed
                          ? 'lg:justify-center lg:p-2.5 lg:my-1 justify-between px-3.5 py-2.5'
                          : 'justify-between px-3.5 py-2.5'
                      } ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-900 font-extrabold shadow-2xs border border-emerald-200/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3 min-w-0">
                          <item.icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-emerald-700'
                                : 'text-slate-500 group-hover:text-slate-800'
                            }`}
                          />
                          <span className={`truncate tracking-tight ${isCollapsed ? 'lg:hidden' : 'inline'}`}>
                            {item.label}
                          </span>
                        </div>

                        {item.hasArrow && (
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? 'lg:hidden' : 'inline'} ${
                              isActive
                                ? 'text-emerald-600 translate-x-0.5'
                                : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Info, Swagger Link & Logout */}
        <div className={`p-3 border-t border-slate-100 space-y-2 bg-slate-50/40 ${
          isCollapsed ? 'lg:px-2' : ''
        }`}>
          
          {/* Swagger Link */}
          <a
            href={docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={isCollapsed ? 'Documentación Swagger' : undefined}
            className={`flex items-center rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/70 text-emerald-900 transition-all text-xs font-bold group ${
              isCollapsed ? 'lg:justify-center lg:p-2.5 justify-between p-2.5 px-3' : 'justify-between p-2.5 px-3'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className={isCollapsed ? 'lg:hidden' : 'inline'}>Documentación Swagger</span>
            </div>
            <ExternalLink className={`w-3.5 h-3.5 text-emerald-600/70 group-hover:text-emerald-800 transition-colors ${
              isCollapsed ? 'lg:hidden' : 'inline'
            }`} />
          </a>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            title={isCollapsed ? 'Cerrar Sesión' : undefined}
            className={`w-full flex items-center rounded-xl bg-red-50/60 hover:bg-red-100/90 border border-red-200/60 text-red-700 transition-all text-xs font-bold cursor-pointer active:scale-98 ${
              isCollapsed ? 'lg:justify-center lg:p-2.5 justify-between p-2.5 px-3' : 'justify-between p-2.5 px-3'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-red-600 shrink-0" />
              <span className={isCollapsed ? 'lg:hidden' : 'inline'}>Cerrar Sesión</span>
            </div>
            <span className={`text-[10px] text-red-500 font-semibold ${isCollapsed ? 'lg:hidden' : 'inline'}`}>
              Salir
            </span>
          </button>

          {/* Cluster / Version Status Pill */}
          <div className={`rounded-xl p-2 bg-white border border-slate-200/80 flex items-center shadow-2xs ${
            isCollapsed ? 'lg:justify-center justify-between px-3' : 'justify-between px-3'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className={`text-[11px] font-bold text-slate-700 ${isCollapsed ? 'lg:hidden' : 'inline'}`}>
                Cluster Activo
              </span>
            </div>
            <span className={`text-[10px] font-mono text-slate-400 font-bold ${isCollapsed ? 'lg:hidden' : 'inline'}`}>
              v1.0.0
            </span>
          </div>

        </div>
      </aside>
    </>
  );
};
