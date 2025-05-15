import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import EmailList from '@/components/EmailManagement/EmailList';
import EmailView from '@/components/EmailManagement/EmailView';
import EmailCreate from '@/components/EmailManagement/EmailCreate';
import { Plus } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const EmailsPage = () => {
  const { user } = useAuth();
  const { emails } = useData();
  
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Only admin and superadmin can access emails
  if (user?.role === 'preparer') {
    return <Navigate to="/dashboard/closeout-forms" />;
  }
  
  // Filter emails based on status
  const pendingEmails = emails.filter(email => email.status === 'pending');
  const repliedEmails = emails.filter(email => email.status === 'replied');
  const weRepliedEmails = emails.filter(email => email.status === 'we-replied');
  
  // Filter emails based on user role
  const getFilteredEmails = (emailsList: typeof emails) => {
    if (user?.role === 'superadmin') {
      return emailsList; // Super admin sees all emails
    } else {
      // Admin sees emails assigned to them
      return emailsList.filter(email => email.assignedTo.id === user.id);
    }
  };

  const handleViewEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
    setEmailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Management</h1>
          <p className="text-muted-foreground">
            Communicate with clients and track email threads
          </p>
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Connect with Client
        </Button>
      </div>
      
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pending Replies
            {getFilteredEmails(pendingEmails).length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                {getFilteredEmails(pendingEmails).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="replied" className="relative">
            Client Replied
            {getFilteredEmails(repliedEmails).length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                {getFilteredEmails(repliedEmails).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="we-replied">We Replied</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <EmailList
            emails={getFilteredEmails(pendingEmails)}
            title="Pending Replies"
            description="Emails sent to clients awaiting response"
            emptyMessage="No pending replies"
            onViewEmail={handleViewEmail}
          />
        </TabsContent>
        
        <TabsContent value="replied">
          <EmailList
            emails={getFilteredEmails(repliedEmails)}
            title="Client Replied"
            description="Emails that clients have responded to"
            emptyMessage="No client replies"
            onViewEmail={handleViewEmail}
          />
        </TabsContent>
        
        <TabsContent value="we-replied">
          <EmailList
            emails={getFilteredEmails(weRepliedEmails)}
            title="We Replied"
            description="Email threads where we sent the last reply"
            emptyMessage="No outgoing replies"
            onViewEmail={handleViewEmail}
          />
        </TabsContent>
      </Tabs>
      
      <EmailView
        emailId={selectedEmailId}
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
      />
      
      <EmailCreate
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default EmailsPage;
