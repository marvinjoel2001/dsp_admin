import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Eye, EyeOff, Shield, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    const res = await login(usernameOrEmail.trim(), password);
    if (!res.success) {
      setErrorMessage(res.error || 'Credenciales incorrectas');
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsernameOrEmail(user);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-4 relative overflow-hidden">
      {/* Background Decorative Blurs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-[420px] bg-white/90 backdrop-blur-2xl rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(79,70,229,0.08)] border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-white p-2 flex items-center justify-center shadow-lg shadow-slate-200/80 border border-slate-100 mb-4 group transition-transform hover:scale-105">
            <img src="/images/logo.png" alt="Chiringuito DSP" className="w-full h-full object-contain" />
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mb-1">
            Chiringuito DSP
          </h1>
          <p className="text-sm font-semibold text-slate-600 mb-1">
            Centro de Operaciones
          </p>
          <p className="text-xs text-slate-400 font-medium">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-red-50/90 border border-red-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email Input */}
          <div>
            <div className="relative flex items-center">
              <User className="w-4 h-4 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                id="username"
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="Usuario o correo electrónico"
                className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 absolute left-4 text-slate-400 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full bg-slate-50/80 border border-slate-200/90 rounded-2xl pl-11 pr-11 py-3.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 transition-colors"
              />
              <span className="text-xs font-medium text-slate-600">Recordarme</span>
            </label>

            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-slate-200/80 w-full" />
          <span className="bg-white px-3 text-[11px] font-medium text-slate-400 absolute">
            o continúa con
          </span>
        </div>

        {/* SSO Button */}
        <button
          type="button"
          onClick={() => handleQuickFill('admin', 'admin')}
          className="w-full bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold py-3 px-4 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs hover:border-slate-300"
        >
          <Shield className="w-4 h-4 text-indigo-600" />
          <span>SSO / Single Sign-On</span>
        </button>

        {/* Quick Access Credential Helper Pills */}
        <div className="mt-5 space-y-2">
          <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="text-[11px] font-medium text-indigo-900">
                Super Admin: <strong className="font-bold">admin / admin</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin')}
              className="text-[10px] font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-lg transition-all"
            >
              Llenar
            </button>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-medium text-emerald-900">
                DSP / Motos: <strong className="font-bold">motos@dsp.com / admin123</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickFill('motos@dsp.com', 'admin123')}
              className="text-[10px] font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded-lg transition-all"
            >
              Llenar
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center mt-6">
          <p className="text-xs text-slate-400 font-medium">
            ¿No tienes acceso?{' '}
            <a
              href="mailto:soporte@chiringuitodsp.com"
              className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors hover:underline"
            >
              Contacta al administrador
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
