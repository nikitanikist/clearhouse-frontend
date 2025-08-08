
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Edit } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';
import AddUserDialog from '@/components/Users/AddUserDialog';
import { fetchUsers, createUser, deleteUser, updateUser } from '@/services/api';

const UsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState<string | null>(null);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchUsers()
        .then(setUsers)
        .catch(err => {
          setError(err.message);
          setUsers([]); // Defensive: set to empty array on error
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

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

  // Handle adding new user
  const handleAddUser = async (userData: { name: string; email: string; password: string; role: UserRole; is_active?: boolean }) => {
    setIsCreatingUser(true);
    setError('');
    
    try {
      const newUser = await createUser(userData);
      setUsers(prevUsers => [newUser, ...prevUsers]);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle updating user
  const handleUpdateUser = async (userId: string, userData: { name: string; email: string; password?: string; role: UserRole; is_active?: boolean }) => {
    setIsUpdatingUser(true);
    setError('');
    
    try {
      const updatedUser = await updateUser(userId, userData);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, ...updatedUser } : user
        )
      );
      setUserToEdit(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'Failed to update user');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Handle deleting user
  const handleDeleteUser = async (userId: string) => {
    setIsDeletingUser(userId);
    setError('');
    
    try {
      console.log('DEBUG: Starting delete process for user:', userId);
      const result = await deleteUser(userId);
      console.log('DEBUG: Delete successful, result:', result);
      
      // Remove the user from the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      console.log('DEBUG: User permanently removed from frontend state');
    } catch (err) {
      console.error('DEBUG: Delete failed with error:', err);
      console.error('DEBUG: Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setIsDeletingUser(null);
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
          <div className="flex justify-between items-center">
            <CardTitle>System Users</CardTitle>
            <AddUserDialog 
              onAddUser={handleAddUser} 
              onUpdateUser={handleUpdateUser}
              isLoading={isCreatingUser || isUpdatingUser} 
            />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-600 text-sm">{error}</div>
            </div>
          )}
          {loading ? (
            <div>Loading users...</div>
          ) : Array.isArray(users) && users.length > 0 ? (
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
                     <Badge variant={userItem.is_active ? 'outline' : 'secondary'}>
                       {userItem.is_active ? 'Active' : 'Inactive'}
                     </Badge>
                     <AddUserDialog
                       mode="edit"
                       userToEdit={userItem}
                       onAddUser={handleAddUser}
                       onUpdateUser={handleUpdateUser}
                       isLoading={isCreatingUser || isUpdatingUser}
                       trigger={
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="text-blue-600 hover:text-blue-800"
                           disabled={isUpdatingUser}
                         >
                           <Edit className="w-4 h-4" />
                         </Button>
                       }
                     />
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-800"
                          disabled={isDeletingUser === userItem.id}
                        >
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
                          <AlertDialogCancel disabled={isDeletingUser === userItem.id}>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteUser(userItem.id)}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={isDeletingUser === userItem.id}
                          >
                            {isDeletingUser === userItem.id ? 'Deleting...' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No users found.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
