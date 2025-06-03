
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import AddUserDialog from '@/components/Users/AddUserDialog';

// Initial dummy user data
const initialUsers = [
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
  const [users, setUsers] = useState(initialUsers);
  
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

  const handleAddUser = (userData: { name: string; email: string; password: string; role: UserRole }) => {
    const newUser = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'active',
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    };
    setUsers([...users, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(u => u.id !== userId));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage system users and permissions</p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>System Users</CardTitle>
            <AddUserDialog onAddUser={handleAddUser} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {users.map(userItem => (
              <div key={userItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={userItem.avatar} alt={userItem.name} />
                    <AvatarFallback>{userItem.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{userItem.name}</div>
                    <div className="text-sm text-muted-foreground">{userItem.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${getRoleBadgeColor(userItem.role)} border-none`}>
                    {userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                  </Badge>
                  <Badge variant={userItem.status === 'active' ? 'outline' : 'secondary'}>
                    {userItem.status.charAt(0).toUpperCase() + userItem.status.slice(1)}
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {userItem.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteUser(userItem.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
