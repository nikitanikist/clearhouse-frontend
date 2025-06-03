import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CloseoutFormGrid from '@/components/CloseoutForms/CloseoutFormGrid';
import CloseoutFormsList from '@/components/CloseoutForms/CloseoutFormsList';
import CloseoutFormView from '@/components/CloseoutForms/CloseoutFormView';
import CloseoutFormCreate from '@/components/CloseoutForms/CloseoutFormCreate';
import { Plus } from 'lucide-react';

interface CloseoutFormsPageProps {
  status?: 'pending' | 'active' | 'completed' | 'rejected';
}

const CloseoutFormsPage: React.FC<CloseoutFormsPageProps> = ({ status: defaultStatus }) => {
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
      // Admin sees forms assigned to them OR all pending forms
      if (formsList === pendingForms) {
        return formsList; // Admin sees all pending forms
      }
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

  const selectedForm = selectedFormId ? forms.find(form => form.id === selectedFormId) : null;

  // If a specific status is provided, show only that tab content
  if (defaultStatus) {
    let targetForms = [];
    let title = '';
    let emptyMessage = '';
    
    switch (defaultStatus) {
      case 'pending':
        // For pending forms, show all pending forms for admins and superadmins
        if (user?.role === 'admin' || user?.role === 'superadmin') {
          targetForms = pendingForms; // Show all pending forms
        } else {
          targetForms = getFilteredForms(pendingForms); // Filter for preparers
        }
        title = 'Pending Closeout Forms';
        emptyMessage = 'No pending forms found';
        break;
      case 'active':
        targetForms = getFilteredForms(activeForms);
        title = 'Currently Working Forms';
        emptyMessage = 'No working forms found';
        break;
      case 'completed':
        targetForms = getFilteredForms(completedForms);
        title = 'Completed Closeout Forms';
        emptyMessage = 'No completed forms found';
        break;
      case 'rejected':
        targetForms = getFilteredForms(rejectedForms);
        title = 'Amendment Closeout Forms';
        emptyMessage = 'No amendment forms found';
        break;
    }

    console.log('Target forms for status', defaultStatus, ':', targetForms);
    console.log('User role:', user?.role);
    console.log('All forms:', forms);

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          </div>
          
          {user?.role === 'preparer' && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Form
            </Button>
          )}
        </div>
        
        {/* Use table format for all statuses when accessed via URL */}
        <CloseoutFormsList
          status={defaultStatus}
          onBack={() => window.history.back()}
        />
        
        {/* Closeout Form View Dialog */}
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Closeout Form Details</DialogTitle>
            </DialogHeader>
            {selectedForm && <CloseoutFormView form={selectedForm} />}
          </DialogContent>
        </Dialog>
        
        <CloseoutFormCreate
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    );
  }

  // Default view with tabs
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
              Working
              {getFilteredForms(activeForms).length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                  {getFilteredForms(activeForms).length}
                </span>
              )}
            </TabsTrigger>
          )}
          
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            Amendment
            {getFilteredForms(rejectedForms).length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs flex items-center justify-center text-destructive-foreground">
                {getFilteredForms(rejectedForms).length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <CloseoutFormsList
            status="pending"
            onBack={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="active">
          <CloseoutFormsList
            status="active"
            onBack={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <CloseoutFormsList
            status="completed"
            onBack={() => {}}
          />
        </TabsContent>
        
        <TabsContent value="rejected">
          <CloseoutFormsList
            status="rejected"
            onBack={() => {}}
          />
        </TabsContent>
      </Tabs>
      
      {/* Closeout Form View Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Closeout Form Details</DialogTitle>
          </DialogHeader>
          {selectedForm && <CloseoutFormView form={selectedForm} />}
        </DialogContent>
      </Dialog>
      
      <CloseoutFormCreate
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default CloseoutFormsPage;
