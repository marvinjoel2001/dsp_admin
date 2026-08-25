import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Tenants } from './pages/Tenants';
import { Orders } from './pages/Orders';
import { Drivers } from './pages/Drivers';
import { LiveDispatch } from './pages/LiveDispatch';
import { WebhooksConsole } from './pages/WebhooksConsole';
import { QuoteSimulator } from './pages/QuoteSimulator';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50/70 text-slate-800">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header title="Centro de Operaciones OpenDSP" subtitle="Plataforma de Despacho B2B y Gestión de Webhooks" />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/live-map" element={<LiveDispatch />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/webhooks" element={<WebhooksConsole />} />
              <Route path="/quotes" element={<QuoteSimulator />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
};
