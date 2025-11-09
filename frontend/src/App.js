import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './components/auth/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import ExcelPage from './pages/ExcelPage';
import UsersPage from './pages/UsersPage';
import LogsPage from './pages/LogsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Redirect raiz para dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardHome />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard/excel"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ExcelPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Rotas admin apenas */}
          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute adminOnly>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/dashboard/logs"
            element={
              <ProtectedRoute adminOnly>
                <DashboardLayout>
                  <LogsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
