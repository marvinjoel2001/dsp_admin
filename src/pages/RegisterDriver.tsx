import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserPlus,
  Bike,
  Car,
  ShieldCheck,
  Key,
  Phone,
  Mail,
  User,
  MapPin,
  FileBadge,
  Sparkles,
  Copy,
  Check,
  ArrowLeft,
  AlertCircle,
  Coins,
  Send,
} from 'lucide-react';
import { api } from '../services/api';

export const RegisterDriver: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState<'MOTORCYCLE' | 'BICYCLE' | 'CAR' | 'VAN'>('MOTORCYCLE');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [ciNumber, setCiNumber] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [autoVerify, setAutoVerify] = useState(true);
  const [initialBonus, setInitialBonus] = useState<number>(0);

  // Status & Success
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    driver: any;
    plainPassword: string;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Generador de contraseña rápida
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // 1. Registro en el backend NestJS (POST /v1/auth/register-driver)
      const res = await api.post('/auth/register-driver', {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        vehicleType,
        vehiclePlate: vehiclePlate.trim() || undefined,
        ciNumber: ciNumber.trim() || undefined,
        homeAddress: homeAddress.trim() || undefined,
      });

      const newDriver = res.driver;

      // 2. Si se marcó autoverificación, aprobar inmediatamente (PATCH /v1/drivers/:id/verify)
      if (autoVerify && newDriver?.id) {
        try {
          await api.patch(`/drivers/${newDriver.id}/verify`, { status: 'verified' });
          newDriver.verificationStatus = 'verified';
        } catch (vErr) {
          console.warn('Advertencia al autoverificar:', vErr);
        }
      }

      // 3. Si se definió un bono inicial, acreditarlo (POST /v1/drivers/:id/adjust-balance)
      if (initialBonus > 0 && newDriver?.id) {
        try {
          await api.post(`/drivers/${newDriver.id}/adjust-balance`, {
            amount: initialBonus,
            type: 'BONUS',
            description: 'Bono de bienvenida acreditado por Administrador',
          });
          newDriver.walletBalance = initialBonus;
        } catch (bErr) {
          console.warn('Advertencia al acreditar bono:', bErr);
        }
      }

      // Mostrar pantalla de éxito con los datos para WhatsApp
      setSuccessData({
        driver: newDriver,
        plainPassword: password.trim(),
      });

      // Limpiar campos para próximo registro
      setFullName('');
      setPhone('');
      setEmail('');
      setPassword('');
      setVehiclePlate('');
      setCiNumber('');
      setHomeAddress('');
      setInitialBonus(0);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al registrar conductor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyWhatsAppMessage = () => {
    if (!successData) return;
    const text = `🛵 *BIENVENIDO A CHIRINGUITO DRIVER* 🛵\n\nHola *${successData.driver.fullName}*, tu cuenta de repartidor ha sido dada de alta en nuestra plataforma.\n\n📲 *Credenciales para la App Móvil:*\n✉️ *Correo / Usuario:* ${successData.driver.email}\n🔑 *Contraseña temporal:* ${successData.plainPassword}\n🏍️ *Vehículo:* ${successData.driver.vehicleType} (Placa: ${successData.driver.vehiclePlate || 'S/P'})\n🛡️ *Estado de cuenta:* ${successData.driver.verificationStatus === 'verified' ? '✅ VERIFICADO (Listo para trabajar)' : '⏳ Pendiente de revisión'}\n\nIngresa a la aplicación, inicia sesión y activa tu turno para comenzar a recibir órdenes de entrega.`;
    navigator.clipboard.writeText(text);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Encabezado y Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
            <Link to="/drivers" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Flota de Conductores
            </Link>
            <span>/</span>
            <span className="text-emerald-600">Registro de Conductor</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserPlus className="w-6 h-6 text-emerald-600" />
            Registrar Nuevo Conductor
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Alta oficial de repartidores en la base de datos de OpenDSP con credenciales móviles para la app
          </p>
        </div>

        <Link
          to="/drivers"
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors self-start sm:self-auto"
        >
          <Bike className="w-4 h-4 text-slate-600" />
          Ver Todos los Conductores
        </Link>
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold">Error en el registro:</p>
            <p className="mt-0.5 font-medium">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Modal / Banner de Éxito con Credenciales para Enviar por WhatsApp */}
      {successData && (
        <div className="bg-emerald-50/80 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200/70 text-emerald-900 px-2.5 py-0.5 rounded-md">
                  Alta Exitosa en Producción
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  ¡Conductor Registrado: {successData.driver.fullName}!
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyWhatsAppMessage}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20"
              >
                {copiedCredentials ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {copiedCredentials ? '¡Copiado para WhatsApp!' : 'Copiar Mensaje para WhatsApp'}
              </button>

              <button
                type="button"
                onClick={() => setSuccessData(null)}
                className="px-3 py-2.5 bg-white border border-emerald-200 text-slate-700 hover:bg-emerald-100/50 rounded-xl text-xs font-bold transition-colors"
              >
                Cerrar Aviso
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Correo / Usuario</p>
              <p className="font-mono font-bold text-slate-900 mt-0.5 select-all">{successData.driver.email}</p>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Contraseña Temporal</p>
              <p className="font-mono font-bold text-emerald-800 mt-0.5 select-all">{successData.plainPassword}</p>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono Móvil</p>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{successData.driver.phone}</p>
            </div>
            <div className="p-3 bg-white/90 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Estado y Billetera</p>
              <p className="font-bold text-emerald-700 mt-0.5">
                {successData.driver.verificationStatus.toUpperCase()} • Bs. {Number(successData.driver.walletBalance || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal: Formulario a la Izquierda + Preview en Vivo a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario Principal (2 columnas de ancho) */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sección 1: Datos Personales y Acceso */}
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <User className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  1. Información Personal y Cuenta
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nombre y Apellido Completos <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza Ramos"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Teléfono Celular / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+591 70012345"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Correo Electrónico (Para Login en App) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos.mendoza@dsp.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Contraseña de Acceso <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Generar Segura
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Identificación Legal y Domicilio */}
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <FileBadge className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  2. Documentación e Identidad Legal
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    C.I. / Carnet de Identidad (Con Expedido)
                  </label>
                  <input
                    type="text"
                    value={ciNumber}
                    onChange={(e) => setCiNumber(e.target.value)}
                    placeholder="Ej. 8945612 SC"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Dirección de Domicilio Particular
                  </label>
                  <input
                    type="text"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    placeholder="Ej. Calle Charcas #120, Barrio Central"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sección 3: Vehículo de Entregas */}
            <div>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <Bike className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  3. Datos del Vehículo de Reparto
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tipo de Vehículo <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e: any) => setVehicleType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  >
                    <option value="MOTORCYCLE">🛵 Motocicleta Express</option>
                    <option value="BICYCLE">🚲 Bicicleta / E-Bike Urbana</option>
                    <option value="CAR">🚗 Automóvil / Sedán</option>
                    <option value="VAN">🛺 Torito / Furgoneta de Carga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Número de Placa / Matrícula
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                    placeholder="Ej. 1234-XYZ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 uppercase font-mono font-bold placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Sección 4: Configuración de Activación Administrativa */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Aprobar y Verificar Conductor Inmediatamente</p>
                    <p className="text-[11px] text-slate-500">Permite al repartidor iniciar turno sin esperar revisión manual de documentos</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoVerify}
                  onChange={(e) => setAutoVerify(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 border-slate-300"
                />
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Bono de Bienvenida en Billetera (Bs.)</p>
                    <p className="text-[11px] text-slate-500">Saldo inicial acreditado para viáticos o saldo a favor</p>
                  </div>
                </div>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={initialBonus}
                  onChange={(e) => setInitialBonus(Number(e.target.value))}
                  className="w-24 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-right font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/drivers')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/25 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registrando en Base de Datos...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Completar Registro de Conductor
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Panel Lateral: Vista Previa en Vivo de la Credencial */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                Vista Previa de Ficha
              </span>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                EN TIEMPO REAL
              </span>
            </div>

            {/* Tarjeta de Ficha de Conductor Simulada */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-4 relative overflow-hidden">
              {/* Marca de agua sutil */}
              <div className="absolute -right-6 -bottom-6 opacity-10 text-white pointer-events-none">
                {vehicleType === 'BICYCLE' ? <Bike className="w-32 h-32" /> : <Car className="w-32 h-32" />}
              </div>

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md">
                    {fullName ? fullName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white tracking-tight">
                      {fullName || 'Nombre del Repartidor'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {phone || '+591 70000000'}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                    autoVerify ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {autoVerify ? 'VERIFICADO' : 'PENDIENTE'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 relative z-10">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Vehículo</p>
                  <p className="font-bold text-white mt-0.5">
                    {vehicleType === 'MOTORCYCLE' && '🛵 Moto'}
                    {vehicleType === 'BICYCLE' && '🚲 E-Bike'}
                    {vehicleType === 'CAR' && '🚗 Auto'}
                    {vehicleType === 'VAN' && '🛺 Furgoneta'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Placa</p>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">
                    {vehiclePlate || 'S/P'}
                  </p>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-700/50">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Correo de Acceso</p>
                  <p className="font-mono text-slate-300 mt-0.5 truncate">
                    {email || 'repartidor@dsp.com'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 relative z-10">
                <span className="text-[11px] text-slate-400">Saldo Billetera Inicial:</span>
                <span className="font-extrabold text-emerald-400 font-mono">
                  Bs. {initialBonus.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Tips Operativos */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-2">
              <p className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Flujo Operativo Recomendado:
              </p>
              <ul className="space-y-1.5 text-[11px] text-indigo-800/90 list-disc pl-4 font-medium">
                <li>El repartidor usará este correo y contraseña para ingresar en la APK.</li>
                <li>Con el check de autoverificación, puede activar su turno de inmediato.</li>
                <li>Podrás ver sus ubicaciones en el <strong>Mapa de Flota en Vivo</strong> en cuanto se conecte.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
