import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'preparer' | 'admin' | 'superadmin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  department?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string, requestedRole?: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  error: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL
const API_BASE_URL = 'http://localhost:5005/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token'); // Changed from 'auth_token' to 'token'
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/auth/user`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const userData = await response.json();
            // Update user state with backend data
            setUser({
              id: userData.user.id,
              name: userData.user.name,
              email: userData.user.email,
              role: userData.user.role,
              avatar: userData.user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
              phone: userData.user.phone || '',
              department: userData.user.department || '',
              bio: userData.user.bio || ''
            });
          } else {
            // Token invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, requestedRole?: UserRole): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, requestedRole }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store the token in localStorage as 'token' (not 'auth_token')
        localStorage.setItem('token', data.token);
        
        // Create user object
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          phone: data.user.phone || '',
          department: data.user.department || '',
          bio: data.user.bio || ''
        };
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set the user data in state
        setUser(userData);
        
        console.log('Login successful, token saved:', data.token);
        
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed');
        return false;
      }
    } catch (err) {
      setError('Network error. Please check if the backend server is running.');
      console.error('Login error:', err);
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Call logout endpoint if token exists
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless
      localStorage.removeItem('token'); // Changed from 'auth_token' to 'token'
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
    }
  };

  const value: AuthContextType = {
    user, 
    setUser,
    login, 
    logout,
    isAuthenticated: !!user,
    error,
    isLoading,
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