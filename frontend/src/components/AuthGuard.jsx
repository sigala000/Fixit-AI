import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AuthGuard({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');

  if (!token || !storedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect role mismatch
    const fallback = user.role === 'technician' ? '/tech-dashboard' : user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
}
