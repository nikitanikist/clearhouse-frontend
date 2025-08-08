
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit } from 'lucide-react';
import { UserRole } from '@/contexts/AuthContext';

interface UserData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  is_active?: boolean;
}

interface AddUserDialogProps {
  onAddUser: (userData: UserData) => void;
  onUpdateUser?: (userId: string, userData: UserData) => void;
  isLoading?: boolean;
  mode?: 'add' | 'edit';
  userToEdit?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    is_active: boolean;
  } | null;
  trigger?: React.ReactNode;
}

const AddUserDialog = ({ 
  onAddUser, 
  onUpdateUser, 
  isLoading = false, 
  mode = 'add', 
  userToEdit = null,
  trigger 
}: AddUserDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('preparer');
  const [isActive, setIsActive] = useState(true);

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && userToEdit) {
      setName(userToEdit.name);
      setEmail(userToEdit.email);
      setRole(userToEdit.role);
      setIsActive(userToEdit.is_active);
      setPassword(''); // Don't populate password for security
    } else {
      // Reset form for add mode
      setName('');
      setEmail('');
      setPassword('');
      setRole('preparer');
      setIsActive(true);
    }
  }, [mode, userToEdit, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'edit') {
      // Edit mode - password is optional
      if (name && email && role && userToEdit) {
        const userData: UserData = { name, email, role, is_active: isActive };
        if (password) {
          userData.password = password;
        }
        onUpdateUser?.(userToEdit.id, userData);
        setOpen(false);
      }
    } else {
      // Add mode - password is required
      if (name && email && password && role) {
        onAddUser({ name, email, password, role, is_active: isActive });
        setOpen(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="mb-4">
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter user name"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password {mode === 'edit' && '(leave blank to keep current)'}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'edit' ? 'Leave blank to keep current password' : 'Enter password'}
              required={mode === 'add'}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preparer">Preparer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === 'edit' && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={isActive ? 'active' : 'inactive'} onValueChange={(value) => setIsActive(value === 'active')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update User' : 'Add User')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1" disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
