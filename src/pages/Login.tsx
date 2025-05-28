import React, { useState } from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, FileText, Settings, User } from 'lucide-react';
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
          icon: FileText,
        };
      case 'admin':
        return {
          title: 'Admin',
          icon: User,
        };
      case 'superadmin':
        return {
          title: 'Super Admin',
          icon: Settings,
        };
    }
  };

  if (currentStep === 'role-selection') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-4xl w-full px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">ClearHouse CRM</h1>
            <p className="text-gray-600 text-lg">Please select your access role to continue</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {(['preparer', 'admin', 'superadmin'] as UserRole[]).map((role) => {
              const roleInfo = getRoleInfo(role);
              const IconComponent = roleInfo.icon;
              return (
                <Card key={role} className="text-center hover:shadow-lg transition-shadow cursor-pointer bg-white border border-gray-200">
                  <CardContent className="pt-8 pb-6">
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">{roleInfo.title}</h3>
                    <Button 
                      onClick={() => handleRoleSelect(role)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Continue as {roleInfo.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          <div className="text-center">
            <p className="text-gray-500 text-sm">Version: v1.0.0</p>
          </div>
        </div>
      </div>
    );
  }

  // Login form step
  const roleInfo = selectedRole ? getRoleInfo(selectedRole) : null;
  const IconComponent = roleInfo?.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-4">
        <div className="text-center mb-8">
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
                {IconComponent && (
                  <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <IconComponent className="h-4 w-4 text-orange-600" />
                  </div>
                )}
                <div>
                  <CardTitle>Login as {roleInfo?.title}</CardTitle>
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
