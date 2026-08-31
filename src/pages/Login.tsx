import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Loader2,
  AlertCircle,
  Sparkles,
  Bike,
  Building2,
  Crown,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type RoleTab = 'admin' | 'dsp' | 'driver';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleTab>('admin');
  const [usernameOrEmail, setUsernameOrEmail] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectRole = (role: RoleTab) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'admin') {
      setUsernameOrEmail('admin');
      setPassword('admin');
    } else if (role === 'dsp') {
      setUsernameOrEmail('motos@dsp.com');
      setPassword('admin123');
    } else {
      setUsernameOrEmail('driver@dsp.com');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Por favor ingresa tu usuario/correo y contraseña.');
      return;
    }

    const res = await login(usernameOrEmail.trim(), password);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales incorrectas. Verifica tus datos.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0F19] p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Dynamic Background Glows & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Main Login Card */}
      <div className="w-full max-w-[460px] bg-[#111827]/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border border-slate-800/80 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3.5 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-2xl blur-sm opacity-70 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-14 h-14 rounded-2xl bg-[#0F172A] p-2.5 flex items-center justify-center border border-slate-700/60 shadow-xl">
              <ShieldCheck className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold tracking-wide uppercase mb-2">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Open DSP Platform</span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            Chiringuito DSP
          </h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Centro de Despacho, Flotas y Tarifas Dinámicas
          </p>
        </div>

        {/* Role Selector Tabs (1-Click Switch) */}
        <div className="mb-6 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 flex items-center gap-1">
          <button
            type="button"
            onClick={() => selectRole('admin')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>Super Admin</span>
          </button>

          <button
            type="button"
            onClick={() => selectRole('dsp')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'dsp'
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-cyan-300" />
            <span>Asociación DSP</span>
          </button>

          <button
            type="button"
            onClick={() => selectRole('driver')}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'driver'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-emerald-300" />
            <span>Repartidor</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 ml-1">
              Usuario o Correo
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-4 text-slate-500 pointer-events-none" />
              <input
                id="username"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="admin, motos@dsp.com o correo"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setPassword('admin123')}
                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Autocompletar
              </button>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-4 text-slate-500 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-11 pr-11 py-3 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Status */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20 focus:ring-offset-0 transition-colors"
              />
              <span className="text-xs font-medium text-slate-400">Recordar sesión</span>
            </label>

            <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Servidor Activo</span>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 text-white font-extrabold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-indigo-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <span>Ingresar al Panel de Control</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Badges */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            Accesos Rápidos Demo
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                selectRole('admin');
                handleSubmit({ preventDefault: () => {} } as any);
              }}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left group cursor-pointer"
            >
              <div className="text-[11px] font-bold text-white flex items-center justify-between">
                <span>Super Admin</span>
                <Crown className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">admin / admin</div>
            </button>

            <button
              type="button"
              onClick={() => {
                selectRole('dsp');
                handleSubmit({ preventDefault: () => {} } as any);
              }}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all text-left group cursor-pointer"
            >
              <div className="text-[11px] font-bold text-white flex items-center justify-between">
                <span>Asoc. Motos</span>
                <Building2 className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">motos@dsp.com</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-5">
          <p className="text-[11px] text-slate-500 font-medium">
            Chiringuito DSP v1.0 • Despacho Inteligente de Última Milla
          </p>
        </div>
      </div>
    </div>
  );
};
