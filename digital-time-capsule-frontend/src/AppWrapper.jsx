// src/main.jsx (Final Entry Point)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.jsx';
import './index.css'; 
import { AuthProvider } from './context/authcontext.jsx'; // Use .jsx for clarity
import { BrowserRouter } from 'react-router-dom';

// The entire application starts and renders here:
export function AppWrapper() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
}