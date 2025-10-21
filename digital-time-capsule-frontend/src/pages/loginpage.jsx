// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/authcontext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
        setError("Please enter both email and password.");
        setIsLoading(false);
        return;
    }

    try {
      // The login function is expected to handle the API call and set the token
      const success = await login(email, password);
      
      if (success) {
        navigate('/dashboard'); 
      } else {
        // This fallback error is generally handled by the catch block
        setError("Login failed. Check your credentials.");
      }

    } catch (err) {
      console.error("Login failed:", err);
      // Display specific API error if available, otherwise use generic message
      setError(err.response?.data?.error || "Login failed. Check your credentials or network.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 1. Uses .login-container for centering and global background
    <div className="login-container">
      {/* 2. Uses the .card style for the form box (defined in CSS as .login-container > form) */}
      <form onSubmit={handleSubmit}> 
        <h2 style={{ color: 'var(--color-accent)', marginBottom: '30px', textAlign: 'center' }}>
          Login to Your Digital Capsule
        </h2>
        
        {/* Error Display Area, styled with .btn-danger background color for high visibility */}
        {error && (
            <p className="error-message" style={{ backgroundColor: 'var(--color-danger)', padding: '10px', borderRadius: '6px', marginBottom: '20px', color: 'white' }}>
                {error}
            </p>
        )}

        <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>Email</label>
        {/* Input styling relies on the global 'input[type="email"]' selector in CSS */}
        <input 
          type="email" 
          id="email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          placeholder="Enter your email" 
          required 
          disabled={isLoading}
        />

        <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', color: 'var(--color-text-muted)' }}>Password</label>
        {/* Input styling relies on the global 'input[type="password"]' selector in CSS */}
        <input 
          type="password" 
          id="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter your password" 
          required 
          disabled={isLoading}
        />
        
        {/* 3. Uses the defined .btn-primary class for the main action button */}
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isLoading}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {isLoading ? 'Authenticating...' : 'Log In'}
        </button>
        
        <p style={{ marginTop: '25px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9em' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;