import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-spinner"></div>; // Or some other loading state
  }

  // If authenticated, redirect away from public-only pages (like login/register)
  return isAuthenticated ? <Navigate to="/tasks" replace /> : <Outlet />;
};

export default PublicRoute;