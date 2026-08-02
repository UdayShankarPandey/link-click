import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Skeleton from './Skeleton';

const FounderRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Skeleton variant="profile" />
      </div>
    );
  }

  if (user?.role !== 'founder') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default FounderRoute;
