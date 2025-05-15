
import React, { useState } from 'react';
import { useData, EmailThread } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowUpRight, Download, FileDown, Mail, Paperclip, SendHorizontal, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface EmailViewProps {
  emailId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmailView: React.FC<EmailViewProps> = ({
  emailId,
  open,
  onOpenChange,
}) => {
  const { getEmailById, addEmailReply, addEmailNote, reassignEmail } = useData();
  const { user } = useAuth();
  
  const [replyContent, setReplyContent] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isReassigning, setIsReassigning] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  
  const emailThread = emailId ? getEmailById(emailId) : null;

  if (!emailThread) {
    return null;
  }

  // Mock admin users for reassignment
  const adminUsers = [
    { id: 'admin-1', name: 'Jordan Lee' },
    { id: 'admin-2', name: 'Alex Johnson' },
    { id: 'admin-3', name: 'Sam Taylor' },
  ];

  const handleSendReply = () => {
    if (emailId && replyContent.trim()) {
      addEmailReply(emailId, { content: replyContent });
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleAddNote = () => {
    if (emailId && noteContent.trim()) {
      addEmailNote(emailId, noteContent);
      setNoteContent('');
      setIsAddingNote(false);
    }
  };

  const handleReassign = () => {
    if (emailId && selectedAssignee) {
      const assignee = adminUsers.find(admin => admin.id === selectedAssignee);
      if (assignee) {
        reassignEmail(emailId, assignee.id, assignee.name);
        setSelectedAssignee('');
        setIsReassigning(false);
      }
    }
  };
  
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy h:mm a');
  };
  
  // Get the initial for the avatar
  const getInitial = (email: string) => {
    if (email.includes('@clearhouse.ca')) {
      return email[0].toUpperCase();
    } else {
      return email[0].toUpperCase();
    }
  };

  // Decide on avatar color 
  const getAvatarColor = (email: string) => {
    if (email.includes('@clearhouse.ca')) {
      return 'bg-primary-500 text-primary-foreground';
    } else {
      return 'bg-accent text-accent-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="truncate flex-1">{emailThread.subject}</DialogTitle>
            {getStatusBadge(emailThread.status)}
          </div>
          <DialogDescription className="flex justify-between">
            <span>Client: {emailThread.clientName} &lt;{emailThread.clientEmail}&gt;</span>
            <span>Assigned to: {emailThread.assignedTo.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Email Thread */}
          <div className="space-y-4">
            {emailThread.messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`flex gap-4 ${message.from.includes('@clearhouse.ca') ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <Avatar className={`${getAvatarColor(message.from)}`}>
                  <AvatarImage src={message.from.includes('@clearhouse.ca') ? user?.avatar : undefined} />
                  <AvatarFallback>{getInitial(message.from)}</AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 p-4 rounded-lg max-w-[75%] ${
                  message.from.includes('@clearhouse.ca') 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'bg-primary-50 text-primary-800'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium text-sm">
                      {message.from.includes('@clearhouse.ca') ? 'ClearHouse' : 'Client'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(message.sentAt)}
                    </div>
                  </div>
                  
                  <div className="whitespace-pre-line text-sm">
                    {message.content}
                  </div>
                  
                  {message.attachments.length > 0 && (
                    <div className="mt-3 border-t border-border pt-2">
                      <p className="text-xs text-muted-foreground mb-1 flex items-center">
                        <Paperclip className="h-3 w-3 mr-1" />
                        Attachments ({message.attachments.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {message.attachments.map((attachment, i) => (
                          <div key={i} className="flex items-center px-2 py-1 bg-background rounded text-xs gap-1">
                            <FileDown className="h-3 w-3" />
                            <span>{attachment.name}</span>
                            <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Internal Notes */}
          {emailThread.notes.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Internal Notes</h3>
                <div className="space-y-2">
                  {emailThread.notes.map(note => (
                    <div key={note.id} className="bg-muted p-3 rounded-md text-sm">
                      <div className="font-medium">{note.createdBy}</div>
                      <div className="text-muted-foreground text-xs">{formatDate(note.createdAt)}</div>
                      <div className="mt-1">{note.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Reply Form */}
          {isReplying && (
            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-sm font-medium">Reply to Client</h3>
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply here..."
                className="min-h-[150px]"
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsReplying(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSendReply} disabled={!replyContent.trim()}>
                  <SendHorizontal className="mr-2 h-4 w-4" />
                  Send Reply
                </Button>
              </div>
            </div>
          )}
          
          {/* Add Note Form */}
          {isAddingNote && (
            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-sm font-medium">Add Internal Note</h3>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type your note here..."
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
                  Save Note
                </Button>
              </div>
            </div>
          )}
          
          {/* Reassign Form */}
          {isReassigning && (
            <div className="space-y-2 border-t border-border pt-4">
              <h3 className="text-sm font-medium">Reassign Email Thread</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminUsers.map(admin => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleReassign} disabled={!selectedAssignee}>
                  Reassign
                </Button>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsReassigning(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between items-center border-t border-border pt-4">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsAddingNote(true);
                setIsReplying(false);
                setIsReassigning(false);
              }}
              disabled={isAddingNote}
            >
              Add Note
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setIsReassigning(true);
                setIsAddingNote(false);
                setIsReplying(false);
              }}
              disabled={isReassigning}
            >
              <Users className="mr-2 h-4 w-4" />
              Reassign
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsReplying(true);
                setIsAddingNote(false);
                setIsReassigning(false);
              }}
              disabled={isReplying}
            >
              <Mail className="mr-2 h-4 w-4" />
              Reply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailView;
