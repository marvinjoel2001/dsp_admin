import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ToggleLeft,
  ToggleRight,
  FileText,
  X,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  Camera,
  Car,
  AlertTriangle,
  Coins,
  Wallet,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Drivers: React.FC = () => {
  const { user } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverForDocs, setSelectedDriverForDocs] = useState<any | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{ title: string; url: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'online'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal Registro Conductor
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [regForm, setRegForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    ciNumber: '',
    homeAddress: '',
    vehicleType: 'MOTORCYCLE',
    vehiclePlate: '',
    dspPartnerId: '',
  });

  // Modal Ajuste de Saldo / Billetera
  const [adjustDriver, setAdjustDriver] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(50);
  const [adjustType, setAdjustType] = useState<'BONUS' | 'PENALTY'>('BONUS');
  const [adjustDescription, setAdjustDescription] = useState('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  const fetchDrivers = () => {
    const endpoint = user?.role === 'DSP_EXTERNAL' && user.dspPartnerId
      ? `/drivers?dspPartnerId=${user.dspPartnerId}`
      : '/drivers';

    api.get(endpoint)
      .then((data: any) => {
        if (Array.isArray(data)) setDrivers(data);
      })
      .catch((err) => {
        console.error('Error fetching drivers:', err);
      });
  };

  useEffect(() => {
    fetchDrivers();

    if (user?.role === 'ADMIN') {
      api.get('/dsp-partners')
        .then((data: any) => {
          if (Array.isArray(data)) setPartnersList(data);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleRegisterDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.fullName || !regForm.phone || !regForm.email || !regForm.password) {
      alert('Por favor completa todos los campos requeridos (*)');
      return;
    }

    setRegisterSubmitting(true);
    try {
      await api.post('/drivers', {
        fullName: regForm.fullName.trim(),
        phone: regForm.phone.trim(),
        email: regForm.email.trim().toLowerCase(),
        password: regForm.password,
        ciNumber: regForm.ciNumber.trim() || undefined,
        homeAddress: regForm.homeAddress.trim() || undefined,
        vehicleType: regForm.vehicleType,
        vehiclePlate: regForm.vehiclePlate.trim().toUpperCase() || undefined,
        dspPartnerId: user?.role === 'DSP_EXTERNAL' ? user.dspPartnerId : (regForm.dspPartnerId || undefined),
      });

      alert('✅ Conductor registrado y verificado exitosamente.');
      setIsRegisterModalOpen(false);
      setRegForm({
        fullName: '',
        phone: '',
        email: '',
        password: '',
        ciNumber: '',
        homeAddress: '',
        vehicleType: 'MOTORCYCLE',
        vehiclePlate: '',
        dspPartnerId: '',
      });
      fetchDrivers();
    } catch (err: any) {
      alert(`Error al registrar conductor: ${err.message}`);
    } finally {
      setRegisterSubmitting(false);
    }
  };

  const handleToggleOnline = async (driverId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/drivers/${driverId}/online`, { isOnline: !currentStatus });
      fetchDrivers();
    } catch {
      setDrivers(drivers.map((d) => (d.id === driverId ? { ...d, isOnline: !currentStatus } : d)));
    }
  };

  const handleVerifyDriver = async (driverId: string, status: 'verified' | 'rejected') => {
    setIsUpdating(true);
    try {
      await api.patch(`/drivers/${driverId}/verify`, { status });
      // Actualizar estado local
      setDrivers((prev) =>
        prev.map((d) => (d.id === driverId ? { ...d, verificationStatus: status } : d))
      );
      if (selectedDriverForDocs && selectedDriverForDocs.id === driverId) {
        setSelectedDriverForDocs({ ...selectedDriverForDocs, verificationStatus: status });
      }
    } catch (err: any) {
      alert(`Error al actualizar estado: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustDriver) return;
    setIsSubmittingAdjust(true);
    try {
      const realAmount = adjustType === 'PENALTY' ? -Math.abs(adjustAmount) : Math.abs(adjustAmount);
      await api.post(`/drivers/${adjustDriver.id}/adjust-balance`, {
        amount: realAmount,
        type: adjustType,
        description: adjustDescription || 'Ajuste operativo de soporte/admin',
      });
      alert(`✅ Saldo de ${adjustDriver.fullName} ajustado con éxito.`);
      setAdjustDriver(null);
      setAdjustDescription('');
      fetchDrivers();
    } catch (err: any) {
      alert(`Error al ajustar saldo: ${err.message}`);
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      d.fullName?.toLowerCase().includes(q) ||
      d.phone?.includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.vehiclePlate?.toLowerCase().includes(q) ||
      d.vehicleType?.toLowerCase().includes(q);

    if (!matchSearch) return false;

    const vStatus = (d.verificationStatus || '').toLowerCase();
    if (filter === 'pending') return vStatus === 'pending';
    if (filter === 'verified') return vStatus === 'verified';
    if (filter === 'online') return !!d.isOnline;
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-emerald-600" />
            {user?.role === 'DSP_EXTERNAL' ? 'Motorizados de la Asociación' : 'Flota de Conductores y Verificación'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {user?.role === 'DSP_EXTERNAL'
              ? 'Gestiona a los miembros de tu asociación, regístralos y monitorea sus turnos.'
              : 'Revisión de expedientes, licencias, SOAT, turnos en vivo y registro de repartidores'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRegisterModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Conductor</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros de Conductores */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Buscar conductor por nombre, celular, correo, placa o tipo de vehículo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl transition-all ${
              filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({drivers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
              filter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pendientes ({drivers.filter((d) => (d.verificationStatus || '').toLowerCase() === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
              filter === 'verified' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verificados ({drivers.filter((d) => (d.verificationStatus || '').toLowerCase() === 'verified').length})
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`px-3 py-2 rounded-xl transition-all ${
              filter === 'online' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            En Línea ({drivers.filter((d) => d.isOnline).length})
          </button>
        </div>
      </div>

      {/* Grid de Conductores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map((d) => {
          const isVerified = d.verificationStatus === 'verified';
          const isPending = d.verificationStatus === 'pending';
          const isRejected = d.verificationStatus === 'rejected';

          return (
            <div
              key={d.id}
              className="glass-card rounded-2xl p-6 space-y-4 hover:shadow-md transition-all border border-slate-200/80 bg-white"
            >
              {/* Header de Tarjeta */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800 font-black text-lg shadow-xs">
                    {d.fullName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900">{d.fullName}</h3>
                      {isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{d.phone}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{d.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg text-amber-800 text-xs font-bold shadow-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {d.rating || 5.0}
                </div>
              </div>

              {/* Insignia de Estado de Documentación */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  {isVerified && (
                    <span className="flex items-center gap-1 text-emerald-700 font-extrabold text-[11px]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Documentación Aprobada
                    </span>
                  )}
                  {isPending && (
                    <span className="flex items-center gap-1 text-amber-700 font-extrabold text-[11px]">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      Documentos Pendientes
                    </span>
                  )}
                  {isRejected && (
                    <span className="flex items-center gap-1 text-rose-700 font-extrabold text-[11px]">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      Documentos Rechazados
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedDriverForDocs(d)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] rounded-lg border border-slate-300 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-600" />
                  Verificar Fotos
                </button>
              </div>

              {/* Estadísticas de Vehículo y Billetera */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Vehículo</span>
                  <p className="font-bold text-slate-800 mt-0.5">{d.vehicleType} ({d.vehiclePlate || 'N/A'})</p>
                </div>
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Billetera</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustDriver(d);
                        setAdjustAmount(50);
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Ajustar / Bono
                    </button>
                  </div>
                  <p className="font-extrabold text-emerald-700 mt-0.5">Bs. {Number(d.walletBalance || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Barra de Turno Online */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    d.isOnline
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {d.isOnline ? 'En Línea / GPS Activo' : 'Fuera de Línea'}
                </span>

                <button
                  onClick={() => handleToggleOnline(d.id, d.isOnline)}
                  className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
                >
                  {d.isOnline ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                  Cambiar Turno
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Verificación de Documentos */}
      {selectedDriverForDocs && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-black">
                  {selectedDriverForDocs.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Expediente de Documentos: {selectedDriverForDocs.fullName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Tel: {selectedDriverForDocs.phone} • Vehículo: {selectedDriverForDocs.vehicleType} ({selectedDriverForDocs.vehiclePlate})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDriverForDocs(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido de Documentos */}
            <div className="p-6 space-y-6">
              {/* Estado Actual */}
              <div className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-slate-700" />
                  <div>
                    <span className="text-xs font-bold text-slate-500">Estado de Verificación</span>
                    <p className="text-sm font-black text-slate-900 uppercase">
                      {selectedDriverForDocs.verificationStatus || 'Pendiente'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={isUpdating}
                    onClick={() => handleVerifyDriver(selectedDriverForDocs.id, 'rejected')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={() => handleVerifyDriver(selectedDriverForDocs.id, 'verified')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Aprobar y Verificar
                  </button>
                </div>
              </div>

              {/* Grid de las 4 Fotografías de Documentos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Cédula de Identidad */}
                <DocumentCard
                  title="1. Cédula de Identidad (CI)"
                  subtitle="Frontal / Reverso"
                  url={selectedDriverForDocs.idCardUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'}
                  onView={() =>
                    setSelectedPreviewImage({
                      title: 'Cédula de Identidad',
                      url: selectedDriverForDocs.idCardUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
                    })
                  }
                />

                {/* 2. Licencia de Conducir */}
                <DocumentCard
                  title="2. Licencia de Conducir"
                  subtitle="Categoría Profesional M / A / P"
                  url={selectedDriverForDocs.licenseUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'}
                  onView={() =>
                    setSelectedPreviewImage({
                      title: 'Licencia de Conducir',
                      url: selectedDriverForDocs.licenseUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
                    })
                  }
                />

                {/* 3. SOAT / Seguro Obligatorio */}
                <DocumentCard
                  title="3. Certificado SOAT Vigente"
                  subtitle="Roseta / Comprobante de Cobertura"
                  url={selectedDriverForDocs.soatUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80'}
                  onView={() =>
                    setSelectedPreviewImage({
                      title: 'SOAT Seguro de Tránsito',
                      url: selectedDriverForDocs.soatUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
                    })
                  }
                />

                {/* 4. Fotografía del Vehículo y Placa */}
                <DocumentCard
                  title="4. Foto del Vehículo y Placa"
                  subtitle={`Placa: ${selectedDriverForDocs.vehiclePlate || '1234-XYZ'}`}
                  url={selectedDriverForDocs.vehiclePhotoUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80'}
                  onView={() =>
                    setSelectedPreviewImage({
                      title: 'Fotografía del Vehículo y Placa',
                      url: selectedDriverForDocs.vehiclePhotoUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
                    })
                  }
                />
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
              <button
                onClick={() => setSelectedDriverForDocs(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Zoom de Imagen */}
      {selectedPreviewImage && (
        <div
          onClick={() => setSelectedPreviewImage(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-3xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-white">
              <h4 className="text-sm font-bold">{selectedPreviewImage.title}</h4>
              <button
                onClick={() => setSelectedPreviewImage(null)}
                className="p-1 rounded-full hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src={selectedPreviewImage.url}
                alt={selectedPreviewImage.title}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajuste de Billetera / Bono */}
      {adjustDriver && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-indigo-600" />
                Ajustar Saldo: {adjustDriver.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setAdjustDriver(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalance} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                Saldo actual: <strong className="text-emerald-700">Bs. {Number(adjustDriver.walletBalance || 0).toFixed(2)}</strong>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Tipo de Operación *
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900"
                >
                  <option value="BONUS">➕ Bonificación / Acreditación Positiva (+)</option>
                  <option value="PENALTY">➖ Penalización / Deducción Negativa (-)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Monto en Bolivianos (Bs.) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motivo o Justificación del Ajuste *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Ej. Compensación por demora en comercio o lluvia..."
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustDriver(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isSubmittingAdjust ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Aplicar Ajuste</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Nuevo Conductor */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Registrar Nuevo Conductor
                </h3>
                <p className="text-xs text-slate-400">
                  {user?.role === 'DSP_EXTERNAL'
                    ? 'Agrega un motorizado a tu asociación. Quedará verificado automáticamente.'
                    : 'Crea un repartidor verificado para la flota interna o una asociación específica.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleRegisterDriver} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    placeholder="Ej: Marcelo Suárez"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Celular / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="+591 70012345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="marcelo@ejemplo.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contraseña de Acceso *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="Ej: 123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Cédula de Identidad (CI)
                  </label>
                  <input
                    type="text"
                    value={regForm.ciNumber}
                    onChange={(e) => setRegForm({ ...regForm, ciNumber: e.target.value })}
                    placeholder="8472910 SC"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Placa del Vehículo
                  </label>
                  <input
                    type="text"
                    value={regForm.vehiclePlate}
                    onChange={(e) => setRegForm({ ...regForm, vehiclePlate: e.target.value.toUpperCase() })}
                    placeholder="3456-XYZ"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tipo de Vehículo
                  </label>
                  <select
                    value={regForm.vehicleType}
                    onChange={(e) => setRegForm({ ...regForm, vehicleType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MOTORCYCLE">🏍️ Motocicleta</option>
                    <option value="BICYCLE">🚲 Bicicleta</option>
                    <option value="CAR">🚗 Automóvil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Dirección Domicilio
                  </label>
                  <input
                    type="text"
                    value={regForm.homeAddress}
                    onChange={(e) => setRegForm({ ...regForm, homeAddress: e.target.value })}
                    placeholder="Barrio / Zona / Calle"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Si es Super Admin, puede elegir la asociación */}
              {user?.role === 'ADMIN' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Asignar a Asociación de Motos / DSP (Opcional)
                  </label>
                  <select
                    value={regForm.dspPartnerId}
                    onChange={(e) => setRegForm({ ...regForm, dspPartnerId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">🏢 Flota Directa Propia (Sin Asociación)</option>
                    {partnersList.map((p) => (
                      <option key={p.id} value={p.id}>
                        🏍️ {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registerSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20"
                >
                  {registerSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Guardar y Activar Conductor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface DocumentCardProps {
  title: string;
  subtitle: string;
  url: string | null;
  onView: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ title, subtitle, url, onView }) => {
  return (
    <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 transition-all space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900">{title}</h4>
          <p className="text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <button
          onClick={onView}
          className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 shadow-2xs"
          title="Ampliar Imagen"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>

      {url ? (
        <div
          onClick={onView}
          className="relative h-32 rounded-xl overflow-hidden cursor-pointer group border border-slate-200 bg-slate-200"
        >
          <img src={url} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
          <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-white font-bold text-xs bg-slate-900/70 px-3 py-1 rounded-lg backdrop-blur-xs transition-opacity">
              Ampliar Foto
            </span>
          </div>
        </div>
      ) : (
        <div className="h-32 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400">
          <Camera className="w-6 h-6 mb-1 text-slate-300" />
          <span className="text-xs font-medium">Sin documento adjunto</span>
        </div>
      )}
    </div>
  );
};
