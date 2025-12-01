import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../services/authService';
import { getProfile } from '../services/userService';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LoginForm = ({ onLoginSuccess }) => {
  const [emailOrStudentNumber, setEmailOrStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!emailOrStudentNumber.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await login({ emailOrStudentNumber, password });
      const accessToken = response.access_token;
      console.log('LoginForm: Login response:', { accessToken });
      
      if (!accessToken) {
        setError('Login failed: No access token received. Please try again.');
        return;
      }
      
      // Verify token by fetching profile
      try {
        const profile = await getProfile(accessToken);
        const userId = profile.id;
        console.log('LoginForm: Profile fetched:', { userId });
        
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('user_id', userId);
        onLoginSuccess(accessToken, userId);
      } catch (profileErr) {
        console.error('LoginForm: Profile fetch error:', profileErr);
        // If profile fetch fails but we have a token, still try to proceed
        if (accessToken) {
          localStorage.setItem('access_token', accessToken);
          // Try to get user_id from token or use a default
          const userId = profileErr.response?.data?.id || null;
          if (userId) {
            localStorage.setItem('user_id', userId);
          }
          onLoginSuccess(accessToken, userId);
        } else {
          setError('Login failed: Could not verify user profile. Please try again.');
        }
      }
    } catch (err) {
      console.error('LoginForm: Error:', err);
      // Provide more specific error messages
      if (err.response) {
        // Server responded with error
        const errorMessage = err.response.data?.detail || err.response.data?.message || 'Invalid credentials. Please check your email/student number and password.';
        setError(errorMessage);
      } else if (err.request) {
        // Request was made but no response received
        setError('Cannot connect to server. Please make sure the backend is running.');
      } else {
        // Something else happened
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
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
            id="emailOrStudentNumber"
            type="text"
            placeholder="Email or Student Number"
            value={emailOrStudentNumber}
            onChange={(e) => setEmailOrStudentNumber(e.target.value)}
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

export default LoginForm;