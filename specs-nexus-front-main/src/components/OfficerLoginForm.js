import React, { useState } from 'react';
import { officerLogin } from '../services/officerAuthService';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const OfficerLoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await officerLogin({ email, password });
      localStorage.setItem('officerAccessToken', response.access_token);
      localStorage.setItem('officerInfo', JSON.stringify(response.officer));
      onLoginSuccess();
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-form">
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            id="email"
            type="email"
            placeholder="Officer Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="password-container">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <span className="password-toggle" onClick={togglePasswordVisibility}>
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        <button 
          type="submit" 
          className="modal-login-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  );
};

export default OfficerLoginForm;