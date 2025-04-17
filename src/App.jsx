import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import GenerateDesign from './components/GenerateDesign/GenerateDesign';
import Marketplace from './components/Marketplace/Marketplace';
import VirtualTryOn from './components/VirtualTryOn/VirtualTryOn';
import Login from './components/Login/Login';

const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <PrivateRoute>
              <GenerateDesign />
            </PrivateRoute>
          }
        />
        <Route
          path="/marketplace"
          element={
            <PrivateRoute>
              <Marketplace />
            </PrivateRoute>
          }
        />
        <Route
          path="/try-on"
          element={
            <PrivateRoute>
              <VirtualTryOn />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;