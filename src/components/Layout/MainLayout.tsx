
import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return children;
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen flex bg-gray-50">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-full z-30">
          <Sidebar />
        </div>
        
        {/* Main Content Area with left margin to account for fixed sidebar */}
        <div className="flex-1 flex flex-col ml-64">
          <div className="sticky top-0 z-20">
            <Navbar />
          </div>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
};

export default MainLayout;
