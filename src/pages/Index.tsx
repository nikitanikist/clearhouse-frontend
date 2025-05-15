
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // Determine what to render based on authentication state
  return (
    <>
      {!isAuthenticated ? (
        <Login />
      ) : (
        <Dashboard />
      )}
    </>
  );
};

export default Index;
