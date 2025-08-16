import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import API_BASE_URL from '../../config/apiConfig';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [error, setError] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    // At least 8 chars, one uppercase, one number, one special char
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(pwd);
  };

  const validateEmail = (email) => {
    // Accept gmail, hotmail, protonmail, outlook, edu, ac, university, etc.
    const regex = /^[\w-.]+@([\w-]+\.)?(gmail|hotmail|protonmail|outlook|yahoo|icloud|edu|ac|university)\.[a-zA-Z]{2,}$/i;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setEmailError('');
    setError('');
    setRedirecting(false);
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters, include a number, an uppercase letter, and a special symbol.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email (gmail, hotmail, protonmail, outlook, edu, ac, university, etc.)');
      return;
    }
    try {
      const payload = { username, email, password };
      console.log('Signup payload:', payload);
      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setError('Signup or account creation successful');
        setRedirecting(true);
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="brand-title">AI Fashion Studio</div>
        <h2>Sign Up</h2>
        {error && (
          <div className={error === 'Signup or account creation successful' ? "success-message" : "error-message"}>
            {error}
            {redirecting && (
              <div style={{ marginTop: '0.5rem', color: '#16a34a', fontSize: '0.95rem' }}>
                Redirecting to Login page...
              </div>
            )}
          </div>
        )}
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
            autoComplete="email"
          />
          {emailError && <div className="error-message">{emailError}</div>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={false}
              minLength={8}
              autoComplete="new-password"
              style={{ paddingRight: '2.5rem' }}
            />
            <span
              className="password-toggle"
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>
          {passwordError && <div className="error-message">{passwordError}</div>}
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
