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
    <div className="min-h-screen w-full flex items-center justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans select-none bg-slate-50">
      {/* Background Image — Centered Character Artwork */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-100 contrast-100"
        style={{
          backgroundImage: `url('/images/background-login.jpg')`,
        }}
      />

      {/* Gentle transparent wash */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[0.5px]" />
      
      {/* Soft Ambient Halo on the right side */}
      <div className="absolute top-1/2 -right-10 -translate-y-1/2 w-[480px] h-[580px] bg-emerald-300/20 rounded-[3rem] blur-3xl pointer-events-none" />

      {/* Main Responsive Container: Left Hero / Center Clear / Right Login */}
      <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* ================= LEFT SIDE: Compact Left-Aligned Collage ================= */}
        <div className="hidden lg:flex flex-col justify-center max-w-[420px] space-y-4 animate-in fade-in slide-in-from-left-6 duration-700">
          
          {/* Sticker 1: Top Tag */}
          <div className="inline-flex items-center gap-2 self-start bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-2xl border-2 border-emerald-400/60 shadow-[0_6px_16px_rgba(16,185,129,0.15)] -rotate-1 hover:rotate-0 transition-transform">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[10px] font-black tracking-wider uppercase text-emerald-950">
              Open DSP • Despacho Inteligente
            </span>
          </div>

          {/* Dynamic Headline Collage */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tight drop-shadow-xs">
                LO MÁS
              </span>
              <span className="text-3xl xl:text-4xl font-black bg-[#4ade80] text-slate-950 px-3 py-0.5 rounded-xl border-2 border-[#22c55e] shadow-sm -rotate-1">
                RÁPIDO.
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl xl:text-3xl font-extrabold text-slate-800 tracking-tight">
                LO MÁS
              </span>
              <span className="text-2xl xl:text-3xl font-black bg-white/95 text-emerald-800 px-3 py-0.5 rounded-xl border-2 border-emerald-300 shadow-sm rotate-1">
                EFICIENTE.
              </span>
            </div>

            <p className="text-xs font-bold text-slate-800 tracking-wide leading-snug pt-1">
              Control centralizado de flotas, pedidos y conductores en tiempo real.
            </p>
          </div>

          {/* Compact Left-Stacked Feature Badges */}
          <div className="space-y-2.5 pt-1">
            
            {/* Feature 1 */}
            <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md p-2.5 px-3 rounded-xl border-2 border-emerald-300/60 shadow-2xs transform hover:scale-[1.02] transition-all -rotate-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-black text-slate-900 block">Auto-Despacho &lt; 15ms</span>
                  <span className="text-[10px] font-bold text-slate-600 leading-none">Asignación ultra-rápida por algoritmos geoespaciales.</span>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md p-2.5 px-3 rounded-xl border-2 border-emerald-300/60 shadow-2xs transform hover:scale-[1.02] transition-all rotate-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 shrink-0">
                  <Navigation className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-black text-slate-900 block">Rastreo GPS Write-Behind</span>
                  <span className="text-[10px] font-bold text-slate-600 leading-none">Telemetría en memoria Redis para 1,000+ conductores.</span>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/85 hover:bg-white/95 backdrop-blur-md p-2.5 px-3 rounded-xl border-2 border-emerald-300/60 shadow-2xs transform hover:scale-[1.02] transition-all -rotate-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-black text-slate-900 block">Tarifas Dinámicas por Tramo</span>
                  <span className="text-[10px] font-bold text-slate-600 leading-none">Precios configurables por km para Moto, Auto y Bici.</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Indicators */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] font-black text-slate-800">Uptime 99.9%</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
              <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-[10px] font-black text-slate-800">WebSockets Baja Latencia</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Compact Glassmorphic Login Card ================= */}
        <div className="w-full lg:w-auto flex justify-center lg:justify-end">
          <div className="w-full max-w-[380px] relative z-10 animate-in fade-in zoom-in-95 duration-400 pt-5">
            
            {/* Floating Badge with Mascot */}
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
            <div className="bg-white/45 hover:bg-white/55 transition-all duration-300 backdrop-blur-md rounded-[2rem] p-5 sm:p-6 pt-8 border-2 border-white/80 shadow-[0_20px_45px_rgba(0,0,0,0.06),inset_0_1px_3px_rgba(255,255,255,0.9)] relative overflow-hidden">
              
              {/* Brand Header */}
              <div className="text-center mb-3.5">
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
                <div className="mb-3 p-2 bg-red-50/95 border-2 border-red-300 rounded-xl flex items-start gap-2 text-xs text-red-900 shadow-sm animate-in fade-in duration-200 backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1 font-bold">{errorMessage}</div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-2.5">
                {/* Input Usuario */}
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none text-emerald-700">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="admin, motos@dsp.com o correo"
                    className="w-full bg-white/80 hover:bg-white/95 focus:bg-white backdrop-blur-sm border-2 border-emerald-400/70 hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/40 rounded-xl pl-9 pr-4 py-2 text-xs font-extrabold text-slate-950 placeholder-slate-500 shadow-xs transition-all focus:outline-none"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                </div>

                {/* Input Contraseña */}
                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center pointer-events-none text-emerald-700">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/80 hover:bg-white/95 focus:bg-white backdrop-blur-sm border-2 border-emerald-400/70 hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-300/40 rounded-xl pl-9 pr-9 py-2 text-xs font-extrabold text-slate-950 placeholder-slate-500 shadow-xs transition-all focus:outline-none"
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
                <div className="flex items-center justify-between text-[11px] px-1">
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
                  className="w-full mt-0.5 py-2.5 px-4 rounded-xl text-xs font-black text-slate-950 bg-[#4ade80] hover:bg-[#22c55e] border border-[#22c55e] shadow-[0_6px_18px_rgba(74,222,128,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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
              <div className="relative my-3">
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
              <div className="space-y-1.5">
                {/* Super Admin Pill */}
                <div className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 backdrop-blur-sm border-2 border-emerald-400/40 hover:border-emerald-500 shadow-2xs transition-all">
                  <div className="flex items-center gap-1.5">
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
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-[#4ade80] hover:bg-[#22c55e] text-slate-950 border border-[#22c55e] shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    Cargar
                  </button>
                </div>

                {/* DSP / Motos Pill */}
                <div className="flex items-center justify-between p-1.5 px-2.5 rounded-xl bg-white/80 hover:bg-white/95 backdrop-blur-sm border-2 border-emerald-400/40 hover:border-emerald-500 shadow-2xs transition-all">
                  <div className="flex items-center gap-1.5">
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
                    className="px-2.5 py-0.5 rounded-lg text-[10px] font-black bg-[#4ade80] hover:bg-[#22c55e] text-slate-950 border border-[#22c55e] shadow-xs transition-all cursor-pointer active:scale-95"
                  >
                    Cargar
                  </button>
                </div>
              </div>

              {/* SSO / Acceso Corporativo Directo */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'admin', true)}
                  className="w-full py-1.5 px-3 rounded-xl text-[10px] font-black text-slate-800 bg-white/80 hover:bg-white backdrop-blur-sm border-2 border-slate-300 hover:border-emerald-400 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>SSO / Acceso Directo</span>
                </button>
              </div>

              {/* Footer Note */}
              <div className="text-center mt-2.5">
                <p className="text-[10px] text-slate-700 font-bold">
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
