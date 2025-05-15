
import React from 'react';
import { useAuth, UserRole } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CheckCheck, ChevronDown, UserCheck } from 'lucide-react';

const RoleSwitcher: React.FC = () => {
  const { login, user } = useAuth();
  
  const roleOptions: { label: string; value: UserRole; icon: JSX.Element }[] = [
    { label: 'Preparer', value: 'preparer', icon: <UserCheck className="mr-2 h-4 w-4" /> },
    { label: 'Admin', value: 'admin', icon: <UserCheck className="mr-2 h-4 w-4" /> },
    { label: 'Super Admin', value: 'superadmin', icon: <CheckCheck className="mr-2 h-4 w-4" /> },
  ];

  const currentRoleOption = roleOptions.find(option => option.value === user?.role);
  
  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {currentRoleOption?.icon || <UserCheck className="h-4 w-4" />}
            <span>Role: {currentRoleOption?.label || 'Select Role'}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {roleOptions.map(option => (
            <DropdownMenuItem 
              key={option.value} 
              onClick={() => login(option.value)}
              className="flex items-center"
            >
              {option.icon}
              <span>{option.label}</span>
              {user?.role === option.value && (
                <CheckCheck className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default RoleSwitcher;
