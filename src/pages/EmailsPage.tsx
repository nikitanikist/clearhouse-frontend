
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const EmailsPage = () => {
  const { user } = useAuth();
  
  // Only admin and superadmin can access emails
  if (user?.role === 'preparer') {
    return <Navigate to="/dashboard/closeout-forms" />;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            This feature has been removed
          </p>
        </div>
      </div>
      
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          Email management functionality has been removed from this application.
        </p>
      </div>
    </div>
  );
};

export default EmailsPage;
