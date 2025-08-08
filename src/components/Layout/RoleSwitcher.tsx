import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCheck } from 'lucide-react';

const RoleSwitcher: React.FC = () => {
  const { user } = useAuth();
  
  // Display current role only (no switching with real auth)
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'preparer': return 'Preparer';
      case 'admin': return 'Admin';
      case 'superadmin': return 'Super Admin';
      default: return 'User';
    }
  };
  
  return (
    <div className="flex items-center">
      <Button variant="outline" className="flex items-center gap-2" disabled>
        <UserCheck className="h-4 w-4" />
        <span>Role: {getRoleLabel(user?.role || '')}</span>
      </Button>
    </div>
  );
};

export default RoleSwitcher;
