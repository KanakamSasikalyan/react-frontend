import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import GenerateDesign from './components/GenerateDesign/GenerateDesign';
import Marketplace from './components/Marketplace/Marketplace';
import VirtualTryOn from './components/VirtualTryOn/VirtualTryOn';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/generate" element={<GenerateDesign />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/try-on" element={<VirtualTryOn />} />
      </Routes>
    </Router>
  );
}

export default App;