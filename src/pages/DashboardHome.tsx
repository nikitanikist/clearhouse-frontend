
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardCards from '@/components/Dashboard/DashboardCards';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CloseoutFormCreate from '@/components/CloseoutForms/CloseoutFormCreate';

const DashboardHome = () => {
  const { user } = useAuth();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here's an overview of your closeout forms and current tasks.
            </p>
          </div>
          
          {user?.role === 'preparer' && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Closeout Form
            </Button>
          )}
        </div>
      </div>
      
      <DashboardCards />
      
      <CloseoutFormCreate
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default DashboardHome;
