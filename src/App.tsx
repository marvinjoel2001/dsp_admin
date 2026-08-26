import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Tenants } from './pages/Tenants';
import { Orders } from './pages/Orders';
import { Drivers } from './pages/Drivers';
import { LiveDispatch } from './pages/LiveDispatch';
import { WebhooksConsole } from './pages/WebhooksConsole';
import { QuoteSimulator } from './pages/QuoteSimulator';
import { Login } from './pages/Login';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/70 text-slate-800">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Centro de Operaciones Chiringuito DSP"
          subtitle="Plataforma de Despacho B2B y Gestión de Webhooks"
        />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/live-map" element={<LiveDispatch />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/webhooks" element={<WebhooksConsole />} />
            <Route path="/quotes" element={<QuoteSimulator />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </AuthProvider>
  );
};

