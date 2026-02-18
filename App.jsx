import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import HomePage from './HomePage';
import AuthCallback from './AuthCallback';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Login page */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Sign up page */}
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Dashboard/Home page (after login) */}
        <Route path="/home" element={<HomePage />} />
        
        {/* OAuth callback handler */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
