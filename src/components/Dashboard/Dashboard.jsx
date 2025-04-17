import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <nav className="glass-navbar">
        <h1 className="logo">Metaverse Fashion Studio</h1>
        <div className="nav-links">
          <Link to="/generate" className="nav-link">Generate Designs</Link>
          <Link to="/marketplace" className="nav-link">Marketplace</Link>
          <Link to="/try-on" className="nav-link">Virtual Try-On</Link>
          <Link to="/github" className="nav-link">Docs</Link>
          <Link to="/about" className="nav-link">About</Link>
        </div>
      </nav>

      <div className="gradient-bg">
        <div className="welcome-screen">
          <h2>Create Your Digital Fashion</h2>
          <p>Design, explore, and try on virtual clothing in the metaverse</p>
          <div className="welcome-buttons">
            <Link to="/generate" className="cta-button">Start Designing</Link>
            <Link to="/marketplace" className="cta-button secondary">Browse Designs</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;