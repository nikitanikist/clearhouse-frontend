
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Bell, Layers } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();

  // Define tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [
      { value: 'preferences', label: 'Preferences', icon: Settings }
    ];

    if (user?.role === 'admin' || user?.role === 'superadmin') {
      baseTabs.push({ value: 'notifications', label: 'Notifications', icon: Bell });
    }

    if (user?.role === 'superadmin') {
      baseTabs.push(
        { value: 'security', label: 'Security', icon: Shield },
        { value: 'integrations', label: 'Integrations', icon: Layers }
      );
    }

    return baseTabs;
  };

  const availableTabs = getAvailableTabs();
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          {user?.role === 'superadmin' 
            ? 'Configure system-wide settings and preferences'
            : 'Manage your personal settings and preferences'
          }
        </p>
      </div>
      
      <Tabs defaultValue={availableTabs[0]?.value || 'preferences'}>
        <TabsList className="mb-4">
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Customize your application experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Theme</h4>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Light</Button>
                    <Button variant="outline" size="sm">Dark</Button>
                    <Button variant="outline" size="sm">System</Button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Language</h4>
                  <p className="text-sm text-muted-foreground mb-3">Select your preferred language</p>
                  <Button variant="outline" size="sm">English (US)</Button>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Date Format</h4>
                  <p className="text-sm text-muted-foreground mb-3">Choose how dates are displayed</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">MM/DD/YYYY</Button>
                    <Button variant="outline" size="sm">DD/MM/YYYY</Button>
                    <Button variant="outline" size="sm">YYYY-MM-DD</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Form Status Updates</h4>
                  <p className="text-sm text-muted-foreground">Get notified when form status changes</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Assignment Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive notifications for new assignments</p>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure system security policies</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Security configuration options will appear here in the full implementation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>System Integrations</CardTitle>
              <CardDescription>Connect with other services</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Integration configuration options will appear here in the full implementation.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
