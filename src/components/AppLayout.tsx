import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Homepage from './public/Homepage';
import BusinessDashboard from './dashboard/BusinessDashboard';
import AdminPanel from './admin/AdminPanel';

const AppLayout: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Loading Doorly...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen">
        <Homepage />
      </div>
    );
  }

  if (user.role === 'admin') {
    return (
      <div className="min-h-screen">
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BusinessDashboard />
    </div>
  );
};

export default AppLayout;
