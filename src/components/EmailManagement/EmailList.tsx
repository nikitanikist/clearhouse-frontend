
import React from 'react';
import { EmailThread } from '@/contexts/DataContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Mail, Paperclip, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface EmailListProps {
  emails: EmailThread[];
  title: string;
  description?: string;
  emptyMessage?: string;
  onViewEmail: (emailId: string) => void;
}

const EmailList: React.FC<EmailListProps> = ({
  emails,
  title,
  description,
  emptyMessage = "No emails found",
  onViewEmail,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="status-badge status-pending">Pending Reply</Badge>;
      case 'replied':
        return <Badge variant="outline" className="status-badge status-active">Client Replied</Badge>;
      case 'we-replied':
        return <Badge variant="outline" className="status-badge status-completed">We Replied</Badge>;
      default:
        return null;
    }
  };
  
  // Function to get time since last contact
  const getTimeSince = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };

  // Function to get excerpt from the last message
  const getMessageExcerpt = (email: EmailThread) => {
    if (email.messages.length === 0) return 'No messages yet';
    const lastMessage = email.messages[email.messages.length - 1];
    const content = lastMessage.content;
    return content.length > 100 ? `${content.substring(0, 100)}...` : content;
  };
  
  // Function to check if there are attachments in the last message
  const hasAttachments = (email: EmailThread) => {
    if (email.messages.length === 0) return false;
    const lastMessage = email.messages[email.messages.length - 1];
    return lastMessage.attachments && lastMessage.attachments.length > 0;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      {emails.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center">
              <Mail className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {emails.map((email) => (
            <Card key={email.id} className="card-hover overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate">{email.subject}</CardTitle>
                  {getStatusBadge(email.status)}
                </div>
                <CardDescription>Client: {email.clientName} &lt;{email.clientEmail}&gt;</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {getMessageExcerpt(email)}
                </div>
                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{getTimeSince(email.lastContactDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="mr-1 h-3 w-3" />
                    <span>{email.assignedTo.name}</span>
                  </div>
                  {hasAttachments(email) && (
                    <div className="flex items-center">
                      <Paperclip className="mr-1 h-3 w-3" />
                      <span>Has attachments</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-1">
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => onViewEmail(email.id)}>
                  View Thread
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailList;
