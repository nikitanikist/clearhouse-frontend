
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'preparer' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for each role
const mockUsers: Record<UserRole, User> = {
  preparer: {
    id: 'preparer-1',
    name: 'Taylor Smith',
    email: 'taylor@clearhouse.ca',
    role: 'preparer',
    avatar: 'https://i.pravatar.cc/150?img=11',
  },
  admin: {
    id: 'admin-1',
    name: 'Jordan Lee',
    email: 'jordan@clearhouse.ca',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
  superadmin: {
    id: 'superadmin-1',
    name: 'Casey Morgan',
    email: 'casey@clearhouse.ca',
    role: 'superadmin',
    avatar: 'https://i.pravatar.cc/150?img=68',
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    const selectedUser = mockUsers[role];
    setUser(selectedUser);
  };

  const logout = () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user, 
    login, 
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
