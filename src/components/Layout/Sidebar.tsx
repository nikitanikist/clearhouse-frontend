
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Home, Settings, Users, Clock, FileText, AlertCircle, CheckCircle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  console.log('Sidebar - Current user:', user);
  console.log('Sidebar - User role:', user?.role);
  
  // Base navigation links - available to preparers
  const preparerLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Pending Forms', href: '/dashboard/closeout-forms/pending', icon: Clock },
    { name: 'Amendment Forms', href: '/dashboard/closeout-forms/rejected', icon: AlertCircle },
    { name: 'Completed Forms', href: '/dashboard/closeout-forms/completed', icon: CheckCircle },
  ];

  // Links for admin and superadmin
  const adminLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Pending Forms', href: '/dashboard/closeout-forms/pending', icon: Clock },
    { name: 'Currently Working', href: '/dashboard/closeout-forms/active', icon: FileText },
    { name: 'Amendment Forms', href: '/dashboard/closeout-forms/rejected', icon: AlertCircle },
    { name: 'Completed Forms', href: '/dashboard/closeout-forms/completed', icon: CheckCircle },
  ];

  const superAdminLinks = [
    { name: 'User Management', href: '/dashboard/users', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  // Determine which links to show based on role
  let navLinks = [];
  
  if (user?.role === 'preparer') {
    navLinks = [...preparerLinks];
  } else if (user?.role === 'admin') {
    navLinks = [...adminLinks];
  } else if (user?.role === 'superadmin') {
    navLinks = [...adminLinks, ...superAdminLinks];
  }

  console.log('Sidebar - Navigation links:', navLinks);

  return (
    <div className="h-screen w-64 flex flex-col bg-sidebar border-r border-gray-200">
      <div className="p-4 flex items-center justify-center">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/b6db7de0-12ec-47d6-9bfc-6d74cde4f183.png" 
            alt="ClearHouse Logo" 
            className="h-8 w-auto"
          />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:bg-opacity-70"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-sidebar-border">
        <div className="px-3 py-2 text-xs font-medium text-sidebar-foreground opacity-70">
          <span>ClearHouse CRM v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
