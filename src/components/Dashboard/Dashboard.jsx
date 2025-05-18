// Dashboard.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';
import API_BASE_URL from '../../config/apiConfig';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== 'true') {
      navigate('/login');
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'visible';
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="glass-navbar">
        <h1 className="logo">AI FASHION STUDIO</h1>
        <div className="nav-links-container">
          <div className="nav-links">
            <Link to="/generate" className="nav-link">DESIGN LAB</Link>
            <Link to="/marketplace" className="nav-link">MARKETPLACE</Link>
            <Link to="/try-on" className="nav-link">DIGITAL FITTING</Link>
            <Link to="/cam-try-on" className="nav-link">CAM TRY ON</Link>
            <Link to="/outfit-suggestion" className="nav-link">WHAT2WEAR</Link>
            <Link to="/comparision" className="nav-link">TOP CHOICE</Link>
            <Link to="/about" className="nav-link">ABOUT</Link>
          </div>
        </div>
      </nav>

      <div className="animated-gradient-bg">
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
        &copy; {new Date().getFullYear()} Enhancing Fashion Market using Virtual Fashion Studio Powered by AI, <a href="https://github.com/KanakamSasikalyan" target="_blank" rel="noopener noreferrer">GitHub Dev</a>
      </footer>
    </div>
  );
};

export default Dashboard;