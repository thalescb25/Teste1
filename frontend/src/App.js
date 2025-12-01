import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Pages
import Login from './pages/Login';
import DoormanPanel from './pages/DoormanPanel';
import BuildingAdminPanel from './pages/BuildingAdminPanel';
import SuperAdminPanel from './pages/SuperAdminPanel';
import PublicRegistration from './pages/PublicRegistration';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;
export const API = `${BACKEND_URL}/api`;

// Axios interceptor para adicionar token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Protected Route
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData, tokens) => {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('user_role', userData.role);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/registrar" element={<PublicRegistration />} />
          
          <Route
            path="/porteiro"
            element={
              <ProtectedRoute allowedRoles={['doorman']}>
                <DoormanPanel user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['building_admin']}>
                <BuildingAdminPanel user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/super-admin"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <SuperAdminPanel user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
