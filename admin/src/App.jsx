import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UnderConstruction from './shared/UnderConstruction';
import ClientApp from './client/App';
import AdminApp from './admin/App';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<UnderConstruction />} />

        {/* Admin Routes handled by AdminApp */}
        <Route path="/admin/*" element={<AdminApp />} />
        
        {/* Client Routes handled by ClientApp */}
        <Route path="/reservacion/*" element={<ClientApp />} />

        {/* Catch-all for legacy or typos */}
        <Route path="/reservar/*" element={<ClientApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
