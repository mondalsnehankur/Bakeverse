import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="text-4xl animate-bounce">🧁</span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const StorefrontRoute = ({ children }) => {
  const { user, loading, isStorefront } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="text-4xl animate-bounce">🧁</span>
      </div>
    );
  }

  if (!user || !isStorefront) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="text-4xl animate-bounce">🧁</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const LoginRequiredRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="text-4xl animate-bounce">🧁</span>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export const CustomerOnlyRoute = ({ children }) => {
  const { user, loading, isCustomer } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <span className="text-4xl animate-bounce">🧁</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return isCustomer ? children : <Navigate to="/" replace />;
};
