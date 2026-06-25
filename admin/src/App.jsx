import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ClientApp from './client/App';
import AdminApp from './admin/App';
import { ToastProvider } from './admin/components/Toast/ToastContext';
import NotFound from './admin/pages/NotFound';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Navigate to="/reservacion" replace />} />

          {/* Admin Routes handled by AdminApp */}
          <Route path="/admin/*" element={<AdminApp />} />
          
          {/* Client Routes handled by ClientApp */}
          <Route path="/reservacion/*" element={<ClientApp />} />

          {/* Catch-all for legacy or typos */}
          <Route path="/reservar/*" element={<ClientApp />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
