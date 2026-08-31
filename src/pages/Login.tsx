import React, { useState } from 'react';
import {
  User,
  Key,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
  Crown,
  CheckCircle2,
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02] filter brightness-95"
        style={{
          backgroundImage: `url('/images/background-login.jpg')`,
        }}
      />

      {/* Atmospheric Overlays for Depth, Soft Light & Warmth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/25 via-emerald-950/15 to-orange-500/15 backdrop-blur-[1.5px]" />
      
      {/* Radial Neon Halo Glows behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[660px] bg-gradient-to-br from-emerald-400/40 via-teal-300/30 to-orange-400/25 rounded-[3rem] blur-3xl pointer-events-none animate-pulse" />

      {/* Main Glassmorphic Login Card */}
      <div className="w-full max-w-[430px] relative z-10 animate-in fade-in zoom-in-95 duration-400 pt-6">
        
        {/* Floating 3D Badge / Avatar */}
        <div className="flex justify-center -mb-8 relative z-20">
          <div className="relative group cursor-pointer" onClick={() => handleQuickFill('admin', 'admin')}>
            {/* Outer Mint Glow Ring */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-400 via-teal-300 to-orange-400 rounded-full blur-md opacity-85 group-hover:opacity-100 transition duration-300" />
            
            {/* Glass Bubble Container */}
            <div className="relative w-16 h-16 rounded-full bg-white/95 p-1 backdrop-blur-xl border-2 border-emerald-300 shadow-[0_10px_25px_rgba(16,185,129,0.5)] flex items-center justify-center">
              {/* Mascot / Icon Badge */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500 flex items-center justify-center shadow-inner">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '8s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-white/85 hover:bg-white/90 transition-colors duration-300 backdrop-blur-2xl rounded-[2.2rem] p-7 sm:p-8 pt-11 border-2 border-emerald-400/50 shadow-[0_25px_60px_rgba(16,185,129,0.3),0_10px_30px_rgba(0,0,0,0.12),inset_0_1px_3px_rgba(255,255,255,1)] relative overflow-hidden">
          
          {/* Subtle water / light reflection highlight */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-gradient-to-br from-white/70 to-transparent rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-gradient-to-tl from-emerald-300/40 to-transparent rounded-full blur-2xl pointer-events-none" />

          {/* Brand Header */}
          <div className="text-center mb-5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
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
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-400/60 rounded-2xl flex items-start gap-2.5 text-xs text-red-900 shadow-sm animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-bold">{errorMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
                className="w-full bg-white/90 hover:bg-white focus:bg-white border-2 border-emerald-400/60 hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-400/30 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-extrabold text-slate-950 placeholder-slate-500 shadow-sm transition-all focus:outline-none"
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
                className="w-full bg-white/90 hover:bg-white focus:bg-white border-2 border-emerald-400/60 hover:border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-400/30 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-extrabold text-slate-950 placeholder-slate-500 shadow-sm transition-all focus:outline-none"
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-900 transition-colors p-1 cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Options Row (Recordarme & Olvidé contraseña) */}
            <div className="flex items-center justify-between text-[11px] px-1 pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-800 font-bold">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-emerald-500 text-emerald-600 focus:ring-emerald-400/30 accent-emerald-600"
                />
                <span>Recordarme</span>
              </label>

              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin')}
                className="text-slate-700 hover:text-orange-600 font-extrabold transition-colors cursor-pointer"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Iniciar Sesión Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1.5 py-3 px-4 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:via-teal-200 hover:to-emerald-300 border-2 border-emerald-400/80 shadow-[0_8px_25px_rgba(16,185,129,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <span className="tracking-wide">Iniciar Sesión</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-400/40" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-600">
              <span className="bg-white/95 px-2.5 py-0.5 rounded-full border border-emerald-300/40 shadow-xs">
                o continúa con
              </span>
            </div>
          </div>

          {/* Quick Access Badges */}
          <div className="space-y-2">
            {/* Super Admin Pill */}
            <div className="flex items-center justify-between p-2 px-3 rounded-2xl bg-white/90 hover:bg-white border-2 border-emerald-400/50 hover:border-emerald-500 shadow-sm transition-all">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div className="text-[11px] font-black text-slate-900">
                  <span>Súper Admin: </span>
                  <span className="text-slate-600 font-bold">admin / admin</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin', true)}
                className="px-3 py-1 rounded-xl text-[10px] font-black bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Cargar
              </button>
            </div>

            {/* DSP / Motos Pill */}
            <div className="flex items-center justify-between p-2 px-3 rounded-2xl bg-white/90 hover:bg-white border-2 border-emerald-400/50 hover:border-emerald-500 shadow-sm transition-all">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-800">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                </div>
                <div className="text-[11px] font-black text-slate-900">
                  <span>DSP / Motos: </span>
                  <span className="text-slate-600 font-bold">motos@dsp.com</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleQuickFill('motos@dsp.com', 'admin123', true)}
                className="px-3 py-1 rounded-xl text-[10px] font-black bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-600 shadow-sm transition-all cursor-pointer active:scale-95"
              >
                Cargar
              </button>
            </div>
          </div>

          {/* SSO / Acceso Corporativo Directo */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin', true)}
              className="w-full py-2 px-3 rounded-2xl text-[11px] font-black text-slate-800 bg-white/90 hover:bg-white border-2 border-slate-300 hover:border-emerald-500 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>SSO / Acceso Directo</span>
            </button>
          </div>

          {/* Footer Note */}
          <div className="text-center mt-4">
            <p className="text-[11px] text-slate-600 font-bold">
              ¿No tienes acceso?{' '}
              <a
                href="#help"
                onClick={(e) => {
                  e.preventDefault();
                  handleQuickFill('admin', 'admin');
                }}
                className="text-emerald-800 hover:text-orange-600 font-black transition-colors underline decoration-emerald-500/40"
              >
                Contacta al administrador
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
