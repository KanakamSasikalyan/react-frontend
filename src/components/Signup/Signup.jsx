import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import API_BASE_URL from '../../config/apiConfig';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        alert('Signup or account creation successful');
        setTimeout(() => {
          navigate('/login');
        }, 500); // 500ms delay before redirect
      } else {
        const errorData = await response.json();
        alert(`Signup failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="brand-title">AI Fashion Studio</div>
        <h2>Sign Up</h2>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
            disabled={false}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            disabled={false}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            disabled={false}
          />
        </div>
        <button type="submit">Sign Up</button>
        <div className="auth-links">
          <a href="#" onClick={e => { e.preventDefault(); navigate('/login'); }}>
            Go back to login
          </a>
        </div>
      </form>
    </div>
  );
};

export default Signup;
