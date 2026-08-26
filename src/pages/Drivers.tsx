import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { api } from '../services/api';

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriverForDocs, setSelectedDriverForDocs] = useState<any | null>(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<{ title: string; url: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'online'>('all');

  const fetchDrivers = () => {
    api.get('/drivers')
      .then((data: any) => {
        if (Array.isArray(data)) setDrivers(data);
      })
      .catch((err) => {
        console.error('Error fetching drivers:', err);
      });
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

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
    } catch (err) {
      console.error('Error al actualizar estado de verificación:', err);
    } finally {
      setIsUpdating(false);
      fetchDrivers();
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    if (filter === 'pending') return d.verificationStatus === 'pending';
    if (filter === 'verified') return d.verificationStatus === 'verified';
    if (filter === 'online') return d.isOnline;
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-emerald-600" />
            Flota de Conductores y Verificación de Documentos
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Revisión de expedientes, licencias, SOAT, turnos en vivo y aprobación de repartidores
          </p>
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Todos ({drivers.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              filter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Pendientes ({drivers.filter((d) => d.verificationStatus === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              filter === 'verified' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verificados ({drivers.filter((d) => d.verificationStatus === 'verified').length})
          </button>
          <button
            onClick={() => setFilter('online')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === 'online' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
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
                  <span className="text-[10px] text-slate-500 uppercase font-bold">Billetera</span>
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
