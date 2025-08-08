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
  const { login, error } = useAuth();
  const [currentStep, setCurrentStep] = useState<LoginStep>('role-selection');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    defaultValues: {
      emailOrKey: '',
      password: '',
    },
  });

  const roleCards = [
    { 
      role: 'preparer' as UserRole, 
      title: 'Preparer', 
      icon: FileText, 
      description: 'Document preparation and submission'
    },
    { 
      role: 'admin' as UserRole, 
      title: 'Admin', 
      icon: User, 
      description: 'User management and reporting'
    },
    { 
      role: 'superadmin' as UserRole, 
      title: 'Super Admin', 
      icon: Settings, 
      description: 'Full system access and configuration'
    },
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentStep('login-form');
  };

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Debug: Log the backend URL being used
      console.log('Attempting login to backend at port 5005');
      
      // Use the actual email and password from the form, with selected role
      const success = await login(data.emailOrKey, data.password, selectedRole || undefined);
      
      if (!success) {
        // Error is already set in AuthContext
        form.setError('password', { message: error || 'Invalid credentials' });
      }
      // If successful, the Dashboard will be shown automatically
    } catch (error) {
      console.error('Login submission error:', error);
      // More specific error message for network issues
      const errorMessage = error instanceof Error && error.message.includes('fetch') 
        ? 'Network error. Please check if the backend server is running on port 5005'
        : 'Login failed. Please try again.';
      form.setError('password', { message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep('role-selection');
    setSelectedRole(null);
    form.reset();
  };

  const getRoleInfo = () => {
    return roleCards.find(card => card.role === selectedRole);
  };

  if (currentStep === 'role-selection') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
        <div className="max-w-5xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-6">
              <img src="/clearhouse-logo.svg" alt="ClearHouse" className="h-16" />
            </div>
            <h1 className="text-4xl font-bold mb-2">ClearHouse CRM</h1>
            <p className="text-muted-foreground text-lg">Select your role to continue</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roleCards.map((card) => (
              <Card 
                key={card.role} 
                className="cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 hover:border-primary"
                onClick={() => handleRoleSelect(card.role)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <card.icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{card.title}</CardTitle>
                  <CardDescription className="mt-2">{card.description}</CardDescription>
                </CardHeader>
                <CardFooter className="justify-center">
                  <Button variant="outline" className="w-full">
                    Continue as {card.title}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-12">
            © 2025 ClearHouse Tax Consultancy
          </p>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img src="/clearhouse-logo.svg" alt="ClearHouse" className="h-16" />
          </div>
          <h1 className="text-4xl font-bold mb-2">ClearHouse CRM</h1>
          <p className="text-muted-foreground">Login as {roleInfo?.title}</p>
        </div>
        
        <Card>
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mb-4"
              onClick={handleBack}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              {roleInfo && <roleInfo.icon className="w-6 h-6 text-primary" />}
              <CardTitle>Login as {roleInfo?.title}</CardTitle>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Enter your email" 
                          {...field} 
                          disabled={isLoading}
                        />
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
                        <Input 
                          type="password" 
                          placeholder="Enter your password" 
                          {...field} 
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : `Login as ${roleInfo?.title}`}
                </Button>
              </form>
            </Form>
            
            {roleInfo && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Login with your assigned credentials</strong><br />
                  Contact your administrator if you need access
                </p>
              </div>
            )}
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