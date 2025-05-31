
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import DashboardHome from './DashboardHome';
import SettingsPage from './SettingsPage';
import UsersPage from './UsersPage';
import NotFound from './NotFound';
import { DataProvider } from '@/contexts/DataContext';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <DataProvider>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          
          {/* Super Admin only routes */}
          {user?.role === 'superadmin' && (
            <>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </>
          )}
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </DataProvider>
  );
};

export default Dashboard;
