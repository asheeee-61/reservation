import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ClientApp from './client/App';
import AdminApp from './admin/App';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes handled by AdminApp */}
        <Route path="/admin/*" element={<AdminApp />} />
        
        {/* Client Routes handled by ClientApp */}
        <Route path="/*" element={<ClientApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
