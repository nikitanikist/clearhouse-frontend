
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import CloseoutFormGrid from '@/components/CloseoutForms/CloseoutFormGrid';
import CloseoutFormView from '@/components/CloseoutForms/CloseoutFormView';
import CloseoutFormCreate from '@/components/CloseoutForms/CloseoutFormCreate';
import { Plus } from 'lucide-react';

const CloseoutFormsPage = () => {
  const { user } = useAuth();
  const { forms } = useData();
  
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Filter forms based on status
  const pendingForms = forms.filter(form => form.status === 'pending');
  const activeForms = forms.filter(form => form.status === 'active');
  const completedForms = forms.filter(form => form.status === 'completed');
  const rejectedForms = forms.filter(form => form.status === 'rejected');
  
  // Filter forms based on user role
  const getFilteredForms = (formsList: typeof forms) => {
    if (user?.role === 'superadmin') {
      return formsList; // Super admin sees all forms
    } else if (user?.role === 'admin') {
      // Admin sees forms assigned to them
      return formsList.filter(form => form.assignedTo && form.assignedTo.id === user.id);
    } else {
      // Preparer sees forms created by them
      return formsList.filter(form => form.createdBy.id === user.id);
    }
  };

  const handleViewForm = (formId: string) => {
    setSelectedFormId(formId);
    setFormDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Closeout Forms</h1>
          <p className="text-muted-foreground">
            Manage tax return closeout forms and track their status
          </p>
        </div>
        
        {user?.role === 'preparer' && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Form
          </Button>
        )}
      </div>
      
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending
            {getFilteredForms(pendingForms).length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                {getFilteredForms(pendingForms).length}
              </span>
            )}
          </TabsTrigger>
          
          {user?.role !== 'preparer' && (
            <TabsTrigger value="active" className="relative">
              Active
              {getFilteredForms(activeForms).length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                  {getFilteredForms(activeForms).length}
                </span>
              )}
            </TabsTrigger>
          )}
          
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            Rejected
            {getFilteredForms(rejectedForms).length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs flex items-center justify-center text-destructive-foreground">
                {getFilteredForms(rejectedForms).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <CloseoutFormGrid
            forms={getFilteredForms(pendingForms)}
            title="Pending Closeout Forms"
            description="Forms awaiting review and approval"
            emptyMessage="No pending forms found"
            onViewForm={handleViewForm}
          />
        </TabsContent>
        
        <TabsContent value="active">
          <CloseoutFormGrid
            forms={getFilteredForms(activeForms)}
            title="Active Closeout Forms"
            description="Forms that are currently being processed"
            emptyMessage="No active forms found"
            onViewForm={handleViewForm}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <CloseoutFormGrid
            forms={getFilteredForms(completedForms)}
            title="Completed Closeout Forms"
            description="Forms that have been finalized and closed"
            emptyMessage="No completed forms found"
            onViewForm={handleViewForm}
          />
        </TabsContent>
        
        <TabsContent value="rejected">
          <CloseoutFormGrid
            forms={getFilteredForms(rejectedForms)}
            title="Rejected Closeout Forms"
            description="Forms that require revisions"
            emptyMessage="No rejected forms found"
            onViewForm={handleViewForm}
          />
        </TabsContent>
      </Tabs>
      
      <CloseoutFormView
        formId={selectedFormId}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
      />
      
      <CloseoutFormCreate
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default CloseoutFormsPage;
