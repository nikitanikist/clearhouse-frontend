
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import CloseoutFormsPage from './CloseoutFormsPage';
import EmailsPage from './EmailsPage';
import NotFound from './NotFound';

const Dashboard = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route index element={<Navigate to="/closeout-forms" replace />} />
        <Route path="/closeout-forms" element={<CloseoutFormsPage />} />
        <Route path="/emails" element={<EmailsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};

export default Dashboard;
