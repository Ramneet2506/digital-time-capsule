// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/loginpage';
import RegisterPage from './pages/registerpage'; 
import DashboardPage from './pages/dashboardpage'; // Placeholder for the main app page
import CreateCapsulePage from './pages/createcapsulepage'; // Placeholder
import ProtectedRoute from './components/protectedroute';
import CapsuleDetailPage from './pages/capsuledetailpage';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateCapsulePage /></ProtectedRoute>} />
        
        {/* NEW ROUTE for viewing a specific capsule */}
        <Route path="/capsule/:capsuleId" element={<ProtectedRoute><CapsuleDetailPage /></ProtectedRoute>} /> 
        
        <Route path="*" element={<h1>404 Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;