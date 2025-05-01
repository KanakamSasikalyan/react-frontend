import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <nav className="glass-navbar">
        <h1 className="logo">METAVERSE FASHION STUDIO</h1>
        <div className="nav-links">
          <Link to="/generate" className="nav-link">GENERATE DESIGNS</Link>
          <Link to="/marketplace" className="nav-link">MARKETPLACE</Link>
          <Link to="/try-on" className="nav-link">VTON</Link>
          <Link to="/merge-images" className="nav-link">MERGE</Link>
          <Link to="/try-on-camera" className="nav-link">CAM VTON</Link>
          <Link to="/github" className="nav-link">DOCS</Link>
          <Link to="/about" className="nav-link">ABOUT</Link>
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
      <footer className="dashboard-footer">
      &copy; {new Date().getFullYear()} Metaverse Fashion Studio, <a href="https://github.com/KanakamSasikalyan" target="_blank" rel="noopener noreferrer">GitHub Dev</a>
      </footer>
    </div>
  );
};

export default Dashboard;