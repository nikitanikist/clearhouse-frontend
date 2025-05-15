
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';
import { DataProvider } from '@/contexts/DataContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  // Determine what to render based on authentication state
  return (
    <>
      {!isAuthenticated ? (
        <Login />
      ) : (
        <DataProvider>
          <Dashboard />
        </DataProvider>
      )}
    </>
  );
};

export default Index;
