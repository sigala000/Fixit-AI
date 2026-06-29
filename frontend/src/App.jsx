import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import CustomerDashboard from './pages/CustomerDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RepairRequestPage from './pages/RepairRequestPage';
import EstimatePage from './pages/EstimatePage';
import AppointmentPage from './pages/AppointmentPage';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import NotificationCenter from './pages/NotificationCenter';
import AuthGuard from './components/AuthGuard';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />

        {/* Protected Customer Routes */}
        <Route 
          path="/dashboard" 
          element={
            <AuthGuard allowedRoles={['customer']}>
              <CustomerDashboard />
            </AuthGuard>
          } 
        />

        {/* Protected Technician Routes */}
        <Route 
          path="/tech-dashboard" 
          element={
            <AuthGuard allowedRoles={['technician']}>
              <TechnicianDashboard />
            </AuthGuard>
          } 
        />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AdminDashboard />
            </AuthGuard>
          } 
        />

        {/* Shared Private Routes */}
        <Route 
          path="/requests" 
          element={
            <AuthGuard>
              <RepairRequestPage />
            </AuthGuard>
          } 
        />
        <Route 
          path="/estimates" 
          element={
            <AuthGuard>
              <EstimatePage />
            </AuthGuard>
          } 
        />
        <Route 
          path="/appointments" 
          element={
            <AuthGuard>
              <AppointmentPage />
            </AuthGuard>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <AuthGuard allowedRoles={['admin']}>
              <AnalyticsDashboard />
            </AuthGuard>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <AuthGuard>
              <NotificationCenter />
            </AuthGuard>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
