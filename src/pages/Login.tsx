
import React from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const Login: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = (role: UserRole) => {
    login(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary-500 flex items-center justify-center">
              <Archive className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">ClearHouse CRM</h1>
          <p className="text-gray-500 mt-2">Closeout & Email Management Tool</p>
        </div>
        
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Select Role to Continue</CardTitle>
            <CardDescription>Log in with one of the following roles to access the CRM</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => handleLogin('preparer')}
            >
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-4">P</div>
              <div className="text-left">
                <div className="font-medium">Preparer</div>
                <div className="text-xs text-muted-foreground">Create and manage closeout forms</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => handleLogin('admin')}
            >
              <div className="h-8 w-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mr-4">A</div>
              <div className="text-left">
                <div className="font-medium">Admin</div>
                <div className="text-xs text-muted-foreground">Approve forms and manage client communications</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex justify-start items-center h-14"
              onClick={() => handleLogin('superadmin')}
            >
              <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mr-4">SA</div>
              <div className="text-left">
                <div className="font-medium">Super Admin</div>
                <div className="text-xs text-muted-foreground">Full system access and user management</div>
              </div>
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground w-full text-center">
              This is a demo environment for ClearHouse CRM
            </p>
          </CardFooter>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2025 ClearHouse Tax Consultancy
        </p>
      </div>
    </div>
  );
};

export default Login;
