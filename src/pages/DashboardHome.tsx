
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardCards from '@/components/Dashboard/DashboardCards';

const DashboardHome = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your closeout forms and current tasks.
        </p>
      </div>
      
      <DashboardCards />
    </div>
  );
};

export default DashboardHome;
