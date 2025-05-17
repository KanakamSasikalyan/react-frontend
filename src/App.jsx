import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import GenerateDesign from './components/GenerateDesign/GenerateDesign';
import Marketplace from './components/Marketplace/Marketplace';
import VirtualTryOn from './components/VirtualTryOn/VirtualTryOn';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
// import MergeTryOnPage from './components/MergeTryOn/MergeTryOnPage';
import SmartTryOnCamera from './components/MergeTryOn/SmartTryOnCamera';
import About from './components/About/About'
import OutfitSuggestion from './components/OutfitSuggestion/OutfitSuggestion'
import ShirtComparision from './components/ShirtComparison/ShirtComparison'
import CamVirtualTryOn from './components/CamVirtualTryOn/CamVirtualTryOn';

const PrivateRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  return isLoggedIn ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
        <Route
          path="/try-on-camera"
          element={
            <PrivateRoute>
              <SmartTryOnCamera />
            </PrivateRoute>
          }
        />

        <Route
          path="/cam-try-on"
          element={
            <PrivateRoute>
              <CamVirtualTryOn />
            </PrivateRoute>
          }
        />    

        <Route
          path="/outfit-suggestion"
          element={
            <PrivateRoute>
              <OutfitSuggestion />
            </PrivateRoute>
          }
        />


      <Route
          path="/comparision"
          element={
            <PrivateRoute>
              <ShirtComparision />
            </PrivateRoute>
          }
        />

        <Route
          path="/about"
          element={
            <PrivateRoute>
              <About />
            </PrivateRoute>
          }
        />    

        {/* <Route
          path="/merge-images"
          element={
            <PrivateRoute>
              <MergeTryOnPage />
            </PrivateRoute>
          }
        /> */}
      </Routes>
    </Router>
  );
}

export default App;