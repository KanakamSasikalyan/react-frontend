// Dashboard.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

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
    localStorage.removeItem('user'); // Also clear user info if stored
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-glass-navbar">
        <h1 className="dashboard-logo">AI FASHION STUDIO</h1>
        <div className="dashboard-nav-links-container">
          <div className="dashboard-nav-links">
            <Link to="/generate" className="dashboard-nav-link">DESIGN LAB</Link>
            <Link to="/basic-model" className="dashboard-nav-link">STANDARD MODEL</Link>
            <Link to="/marketplace" className="dashboard-nav-link">MARKETPLACE</Link>
            <Link to="/try-on" className="dashboard-nav-link">DIGITAL FITTING</Link>
            <Link to="/cam-try-on" className="dashboard-nav-link">CAM TRY ON</Link>
            <Link to="/outfit-suggestion" className="dashboard-nav-link">OUTFIT SGSTR</Link>
            <Link to="/comparision" className="dashboard-nav-link">TOP CHOICE</Link>
            <Link to="/about" className="dashboard-nav-link">BLOG</Link>
            <button className="dashboard-nav-link dashboard-logout-btn" onClick={handleLogout}>LOGOUT</button>
          </div>
        </div>
      </nav>

      <div className="dashboard-animated-gradient-bg">
        <div className="dashboard-welcome-screen">
          <h2>Create Your Digital Fashion</h2>
          <p>Design, explore, and try on virtual clothing in the AI Studio</p>
          <div className="dashboard-welcome-buttons">
            <Link to="/generate" className="dashboard-cta-button">Start Designing</Link>
            <Link to="/marketplace" className="dashboard-cta-button dashboard-secondary">Browse Designs</Link>
          </div>
        </div>
      </div>
      
      <footer className="dashboard-footer">
        &copy; {new Date().getFullYear()} Enhancing Fashion Market using Virtual Fashion Studio Powered by AI, <a href="https://github.com/" target="_blank" rel="noopener noreferrer">GitHub Dev</a>
      </footer>
    </div>
  );
};

export default Dashboard;