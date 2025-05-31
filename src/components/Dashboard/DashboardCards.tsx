
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Mail, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';

const DashboardCards = () => {
  const { user } = useAuth();
  const { forms, emails } = useData();

  console.log('Current user:', user);
  console.log('All forms:', forms);
  console.log('Forms count by status:', {
    pending: forms.filter(f => f.status === 'pending').length,
    active: forms.filter(f => f.status === 'active').length,
    completed: forms.filter(f => f.status === 'completed').length,
    rejected: forms.filter(f => f.status === 'rejected').length
  });

  // Filter forms based on user role
  const getFilteredForms = (status: string) => {
    let filteredForms = forms.filter(form => form.status === status);
    
    if (user?.role === 'admin') {
      filteredForms = filteredForms.filter(form => form.assignedTo && form.assignedTo.id === user.id);
    } else if (user?.role === 'preparer') {
      filteredForms = filteredForms.filter(form => form.createdBy.id === user.id);
    }
    
    return filteredForms;
  };

  const pendingForms = forms.filter(form => form.status === 'pending');
  const activeForms = getFilteredForms('active');
  const completedForms = getFilteredForms('completed');
  const rejectedForms = getFilteredForms('rejected');

  console.log('Pending forms for admin:', pendingForms);
  console.log('User role:', user?.role);

  const getFormCards = () => {
    if (user?.role === 'preparer') {
      return (
        <>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeForms.length}</div>
              <p className="text-xs text-muted-foreground">Currently working on</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amendment Forms</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedForms.length}</div>
              <p className="text-xs text-muted-foreground">Require amendments</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Forms</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedForms.length}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>
        </>
      );
    }

    if (user?.role === 'admin' || user?.role === 'superadmin') {
      return (
        <>
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Forms</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingForms.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Currently Working</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeForms.length}</div>
              <p className="text-xs text-muted-foreground">Forms in progress</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amendment Required</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedForms.length}</div>
              <p className="text-xs text-muted-foreground">Need amendments</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Forms</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedForms.length}</div>
              <p className="text-xs text-muted-foreground">Successfully completed</p>
            </CardContent>
          </Card>
        </>
      );
    }

    return null;
  };

  const emailStats = {
    pending: emails.filter(e => e.status === 'pending').length,
    replied: emails.filter(e => e.status === 'replied').length,
    weReplied: emails.filter(e => e.status === 'we-replied').length,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {getFormCards()}
      
      {(user?.role === 'admin' || user?.role === 'superadmin') && (
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Threads</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.length}</div>
            <div className="flex gap-1 mt-1">
              {emailStats.pending > 0 && (
                <Badge variant="outline" className="text-xs">
                  {emailStats.pending} pending
                </Badge>
              )}
              {emailStats.replied > 0 && (
                <Badge variant="outline" className="text-xs">
                  {emailStats.replied} replied
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardCards;
