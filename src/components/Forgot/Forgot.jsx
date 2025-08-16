import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Forgot.css';
import API_BASE_URL from '../../config/apiConfig';

const Forgot = () => {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    return regex.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters, include a number, an uppercase letter, and a special symbol.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(data.message);
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.message || 'Password reset failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="forgot-container">
      <form onSubmit={handleSubmit} className="forgot-form">
        <div className="brand-title">AI Fashion Studio</div>
        <h2>Reset Password</h2>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        <div className="form-group">
          <label>Email or Username</label>
          <input
            type="text"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            placeholder="Enter your email or username"
          />
        </div>
        <div className="form-group">
          <label>New Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            placeholder="Enter new password"
            minLength={8}
          />
        </div>
        <div className="form-group">
          <label>Confirm Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm new password"
            minLength={8}
          />
        </div>
        <div className="form-group">
          <label>
            <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(v => !v)} /> Show Password
          </label>
        </div>
        <button type="submit">Update Password</button>
        <div className="auth-links">
          <a href="#" onClick={e => { e.preventDefault(); navigate('/login'); }}>
            Go back to login
          </a>
        </div>
      </form>
    </div>
  );
};

export default Forgot;
