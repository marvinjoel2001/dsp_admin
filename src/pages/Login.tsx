import React, { useState } from 'react';
import {
  User,
  Key,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Crown,
  Zap,
  Navigation,
  Activity,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleQuickFill = (user: string, pass: string, autoSubmit = false) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setErrorMessage(null);
    if (autoSubmit) {
      setTimeout(() => {
        executeLogin(user, pass);
      }, 50);
    }
  };

  const executeLogin = async (userToSubmit: string, passToSubmit: string) => {
    setErrorMessage(null);
    if (!userToSubmit.trim() || !passToSubmit) {
      setErrorMessage('Por favor ingresa tu usuario/correo y contraseña.');
      return;
    }

    const res = await login(userToSubmit.trim(), passToSubmit);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales incorrectas. Verifica tus datos.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(usernameOrEmail, password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden font-sans select-none bg-slate-50">
      {/* Background Image — Full Canvas Light Mode */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-100 contrast-100"
        style={{
          backgroundImage: `url('/images/background-login.jpg')`,
        }}
      />

      {/* Gentle transparent wash */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
      
      {/* Soft Ambient Halo behind the right side */}
      <div className="absolute top-1/2 right-12 -translate-y-1/2 w-[550px] h-[650px] bg-emerald-300/20 rounded-[3rem] blur-3xl pointer-events-none" />

      {/* Main Responsive Grid: Left Collage / Right Login Card */}
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* ================= LEFT SIDE: Floating Newspaper / Editorial Collage ================= */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6 pr-4 animate-in fade-in slide-in-from-left-6 duration-700">
          
          {/* Sticker 1: Top Tag */}
          <div className="inline-flex items-center gap-2 self-start bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl border-2 border-emerald-400/60 shadow-[0_8px_20px_rgba(16,185,129,0.2)] -rotate-2 hover:rotate-0 transition-transform duration-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-black tracking-wider uppercase text-emerald-900">
              Open DSP Platform • Red de Despacho Inteligente
            </span>
          </div>

          {/* Dynamic Headline Collage (Mixed typography sizes like newspaper cutouts) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                LO MÁS
              </span>
              <span className="text-4xl xl:text-5xl font-black bg-[#4ade80] text-slate-950 px-4 py-1 rounded-2xl border-2 border-[#22c55e] shadow-md -rotate-1 hover:rotate-0 transition-transform">
                RÁPIDO.
              </span>
              <span className="text-3xl xl:text-4xl font-extrabold text-slate-800 tracking-tight">
                LO MÁS
              </span>
              <span className="text-3xl xl:text-4xl font-black bg-white/95 text-emerald-800 px-3.5 py-1 rounded-2xl border-2 border-emerald-300 shadow-md rotate-2 hover:rotate-0 transition-transform">
                EFICIENTE.
              </span>
            </div>

            <h2 className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Control centralizado de flotas, pedidos y conductores en tiempo real.
            </h2>
          </div>

          {/* Floating Editorial Badges / Feature Cards */}
          <div className="grid grid-cols-2 gap-3.5 pt-2">
            
            {/* Feature 1 */}
            <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-emerald-300/70 shadow-[0_10px_25px_rgba(0,0,0,0.04)] transform hover:-translate-y-1 transition-all duration-300 -rotate-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900">Auto-Despacho &lt; 15ms</span>
              </div>
              <p className="text-[11px] font-bold text-slate-600 leading-snug">
                Algoritmos geoespaciales asignan la orden al motorizado más cercano en milisegundos.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-emerald-300/70 shadow-[0_10px_25px_rgba(0,0,0,0.04)] transform hover:-translate-y-1 transition-all duration-300 rotate-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
                  <Navigation className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900">Rastreo GPS Write-Behind</span>
              </div>
              <p className="text-[11px] font-bold text-slate-600 leading-snug">
                Telemetría en memoria Redis con persistencia por lotes preparada para 1,000+ conductores.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-emerald-300/70 shadow-[0_10px_25px_rgba(0,0,0,0.04)] transform hover:-translate-y-1 transition-all duration-300 rotate-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900">Tarifas Dinámicas por Tramo</span>
              </div>
              <p className="text-[11px] font-bold text-slate-600 leading-snug">
                Configuración personalizada de precios para Moto, Auto y Bici con simulador integrado.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border-2 border-emerald-300/70 shadow-[0_10px_25px_rgba(0,0,0,0.04)] transform hover:-translate-y-1 transition-all duration-300 -rotate-1">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-black text-slate-900">Multi-Tenancy &amp; DSPs</span>
              </div>
              <p className="text-[11px] font-bold text-slate-600 leading-snug">
                Delegación automática a asociaciones de conductores con cálculo de comisiones exacto.
              </p>
            </div>

          </div>

          {/* Sticker Bottom Pill */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-black text-slate-800">Servidores en Línea (99.9% Uptime)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-300 shadow-xs">
              <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="text-[11px] font-black text-slate-800">WebSockets de Baja Latencia</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Glassmorphic Login Card ================= */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[400px] relative z-10 animate-in fade-in zoom-in-95 duration-400 pt-5">
            
            {/* Floating Badge with Mascot (Small Compact Size) */}
            <div className="flex justify-center -mb-6 relative z-20">
              <div className="relative group cursor-pointer" onClick={() => handleQuickFill('admin', 'admin')}>
                {/* Outer Mint Glow */}
                <div className="absolute -inset-1 bg-emerald-400/50 rounded-full blur-md opacity-80 group-hover:opacity-100 transition duration-300" />
                
                {/* Glass Bubble Container (Compact 44px) */}
                <div className="relative w-12 h-12 rounded-full bg-white/95 p-1 backdrop-blur-xl border-2 border-white shadow-[0_8px_20px_rgba(16,185,129,0.35)] flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/pulpo-icon.png"
                    alt="Chiringuito Mascot"
                    className="w-full h-full object-cover rounded-full shadow-inner transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Card Body — Ultra Transparent Glass */}
            <div className="bg-white/40 hover:bg-white/50 transition-all duration-300 backdrop-blur-md rounded-[2rem] p-6 sm:p-7 pt-9 border-2 border-white/80 shadow-[0_20px_45px_rgba(0,0,0,0.06),inset_0_1px_3px_rgba(255,255,255,0.9)] relative overflow-hidden">
              
              {/* Brand Header */}
              <div className="text-center mb-4">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  Chiringuito DSP
                </h1>
                <p className="text-xs font-extrabold text-slate-800 mt-0.5 tracking-wide">
                  Centro de Operaciones
                </p>
                <p className="text-[11px] font-semibold text-slate-600 mt-0.5">
                  Inicia sesión para continuar
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-3.5 p-2.5 bg-red-50/95 border-2 border-red-300 rounded-xl flex items-start gap-2 text-xs text-red-900 shadow-sm animate-in fade-in duration-200 backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-bold">{errorMessage}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Input Usuario */}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-emerald-700">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="admin, motos@dsp.com o correo"
                    className="w-full bg-white/80 hover:bg-white/95 focus:bg-white backdrop-blur-sm border-2 border-emerald-400/70 hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/40 rounded-xl pl-10 pr-4 py-2.5 text-xs font-extrabold text-slate-950 placeholder-slate-500 shadow-xs transition-all focus:outline-none"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>

                {/* Input Contraseña */}
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-emerald-700">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/80 hover:bg-white/95 focus:bg-white backdrop-blur-sm border-2 border-emerald-400/70 hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/40 rounded-xl pl-10 pr-10 py-2.5 text-xs font-extrabold text-slate-950 placeholder-slate-500 shadow-xs transition-all focus:outline-none"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-500 hover:text-slate-800 transition-colors p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Options Row */}
                <div className="flex items-center justify-between text-[11px] px-1 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-bold">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-300/40 accent-emerald-600"
                    />
                    <span>Recordarme</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin', 'admin')}
                    className="text-slate-700 hover:text-emerald-800 font-extrabold transition-colors cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {/* Iniciar Sesión Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1 py-2.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-[#4ade80] hover:bg-[#22c55e] border border-[#22c55e] shadow-[0_6px_18px_rgba(74,222,128,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <span className="tracking-wide">Iniciar Sesión</span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-3.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-400/30" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600">
                  <span className="bg-white/90 px-2 py-0.5 rounded-full border border-emerald-300/50 shadow-2xs backdrop-blur-sm">
                    o continúa con
                  </span>
                </div>
              </div>

              {/* Quick Access Badges */}
              <div className="space-y-2">
                {/* Super Admin Pill */}
                <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-white/80 hover:bg-white/95 backdrop-blur-sm border-2 border-emerald-400/40 hover:border-emerald-500 shadow-2xs transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <Crown className="w-3 h-3 text-emerald-700" />
                    </div>
                    <div className="text-[11px] font-black text-slate-900">
                      <span>Súper Admin: </span>
                      <span className="text-slate-700 font-bold">admin</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('admin', 'admin', true)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#4ade80] hover:bg-[#22c55e] text-slate-950 border border-[#22c55e] shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    Cargar
                  </button>
                </div>

                {/* DSP / Motos Pill */}
                <div className="flex items-center justify-between p-2 px-3 rounded-xl bg-white/80 hover:bg-white/95 backdrop-blur-sm border-2 border-emerald-400/40 hover:border-emerald-500 shadow-2xs transition-all">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <Building2 className="w-3 h-3 text-emerald-700" />
                    </div>
                    <div className="text-[11px] font-black text-slate-900">
                      <span>DSP: </span>
                      <span className="text-slate-700 font-bold">motos@dsp.com</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('motos@dsp.com', 'admin123', true)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#4ade80] hover:bg-[#22c55e] text-slate-950 border border-[#22c55e] shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    Cargar
                  </button>
                </div>
              </div>

              {/* SSO / Acceso Corporativo Directo */}
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'admin', true)}
                  className="w-full py-2 px-3 rounded-xl text-[11px] font-black text-slate-800 bg-white/80 hover:bg-white backdrop-blur-sm border-2 border-slate-300 hover:border-emerald-400 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>SSO / Acceso Directo</span>
                </button>
              </div>

              {/* Footer Note */}
              <div className="text-center mt-3.5">
                <p className="text-[11px] text-slate-700 font-bold">
                  ¿No tienes acceso?{' '}
                  <a
                    href="#help"
                    onClick={(e) => {
                      e.preventDefault();
                      handleQuickFill('admin', 'admin');
                    }}
                    className="text-emerald-800 hover:text-emerald-950 font-black transition-colors underline decoration-emerald-500/40"
                  >
                    Contacta al administrador
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
