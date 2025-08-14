// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // Check if a Discord‐authenticated user exists in localStorage
  const isAuthenticated = Boolean(localStorage.getItem('flyiq_user'));

  // If authenticated, render the children; otherwise redirect to “/”
  return isAuthenticated ? children : <Navigate to="/" replace />;
}
