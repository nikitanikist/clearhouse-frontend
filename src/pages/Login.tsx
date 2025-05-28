
import React, { useState } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Archive, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

type LoginStep = 'role-selection' | 'login-form';

interface LoginFormData {
  emailOrKey: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState<LoginStep>('role-selection');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const form = useForm<LoginFormData>({
    defaultValues: {
      emailOrKey: '',
      password: '',
    },
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentStep('login-form');
    // Pre-fill demo credentials
    form.setValue('emailOrKey', '12345');
    form.setValue('password', '12345');
  };

  const handleLogin = (data: LoginFormData) => {
    // Demo credentials validation
    if (data.emailOrKey === '12345' && data.password === '12345' && selectedRole) {
      login(selectedRole);
    } else {
      form.setError('password', { message: 'Invalid credentials. Use demo: 12345/12345' });
    }
  };

  const handleBack = () => {
    setCurrentStep('role-selection');
    setSelectedRole(null);
    form.reset();
  };

  const getRoleInfo = (role: UserRole) => {
    switch (role) {
      case 'preparer':
        return {
          title: 'Preparer',
          description: 'Create and manage closeout forms',
          icon: 'P',
          color: 'bg-blue-100 text-blue-700',
        };
      case 'admin':
        return {
          title: 'Admin',
          description: 'Approve forms and manage client communications',
          icon: 'A',
          color: 'bg-green-100 text-green-700',
        };
      case 'superadmin':
        return {
          title: 'Super Admin',
          description: 'Full system access and user management',
          icon: 'SA',
          color: 'bg-purple-100 text-purple-700',
        };
    }
  };

  if (currentStep === 'role-selection') {
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
            <p className="text-gray-500 mt-2">Please select your access role to continue</p>
          </div>
          
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Select Your Role</CardTitle>
              <CardDescription>Choose your access level to proceed to login</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {(['preparer', 'admin', 'superadmin'] as UserRole[]).map((role) => {
                const roleInfo = getRoleInfo(role);
                return (
                  <Button 
                    key={role}
                    variant="outline" 
                    className="flex justify-start items-center h-16 p-4"
                    onClick={() => handleRoleSelect(role)}
                  >
                    <div className={`h-10 w-10 rounded-full ${roleInfo.color} flex items-center justify-center mr-4 text-sm font-semibold`}>
                      {roleInfo.icon}
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium text-base">Continue as {roleInfo.title}</div>
                      <div className="text-xs text-muted-foreground">{roleInfo.description}</div>
                    </div>
                  </Button>
                );
              })}
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
  }

  // Login form step
  const roleInfo = selectedRole ? getRoleInfo(selectedRole) : null;

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
          <p className="text-gray-500 mt-2">Login as {roleInfo?.title}</p>
        </div>
        
        <Card className="animate-fade-in">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full ${roleInfo?.color} flex items-center justify-center text-xs font-semibold`}>
                  {roleInfo?.icon}
                </div>
                <div>
                  <CardTitle>Login as {roleInfo?.title}</CardTitle>
                  <CardDescription>{roleInfo?.description}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="emailOrKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email ID or Access Key</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email or access key" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full">
                  Login as {roleInfo?.title}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Demo Credentials:</strong><br />
                Email/Key: 12345<br />
                Password: 12345
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2025 ClearHouse Tax Consultancy
        </p>
      </div>
    </div>
  );
};

export default Login;
