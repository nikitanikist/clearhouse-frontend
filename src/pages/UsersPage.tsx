
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserRole } from '@/contexts/AuthContext';

// Dummy user data for demonstration
const dummyUsers = [
  {
    id: 'user-1',
    name: 'Taylor Smith',
    email: 'taylor@clearhouse.ca',
    role: 'preparer' as UserRole,
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 'user-2',
    name: 'Jordan Lee',
    email: 'jordan@clearhouse.ca',
    role: 'admin' as UserRole,
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
  {
    id: 'user-3',
    name: 'Casey Morgan',
    email: 'casey@clearhouse.ca',
    role: 'superadmin' as UserRole,
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=68',
  },
  {
    id: 'user-4',
    name: 'Alex Rivera',
    email: 'alex@clearhouse.ca',
    role: 'preparer' as UserRole,
    status: 'inactive',
    avatar: 'https://i.pravatar.cc/150?img=48',
  },
  {
    id: 'user-5',
    name: 'Morgan Chen',
    email: 'morgan@clearhouse.ca',
    role: 'admin' as UserRole,
    status: 'active',
    avatar: 'https://i.pravatar.cc/150?img=53',
  },
];

const UsersPage = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'superadmin') {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to access user management.</p>
      </div>
    );
  }
  
  const getRoleBadgeColor = (role: UserRole) => {
    switch(role) {
      case 'preparer':
        return 'bg-blue-100 text-blue-700';
      case 'admin':
        return 'bg-green-100 text-green-700';
      case 'superadmin':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage system users and permissions</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {dummyUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getRoleBadgeColor(user.role)} border-none`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  <Badge variant={user.status === 'active' ? 'outline' : 'secondary'}>
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
