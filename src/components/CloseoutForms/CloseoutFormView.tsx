import React, { useState } from 'react';
import { useData, CloseoutForm, FormStatus } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Check, Clock, FileCheck, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface CloseoutFormViewProps {
  formId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CloseoutFormView: React.FC<CloseoutFormViewProps> = ({
  formId,
  open,
  onOpenChange,
}) => {
  const { getFormById, updateFormStatus } = useData();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  
  const form = formId ? getFormById(formId) : null;

  if (!form) {
    return null;
  }

  const canApprove = user?.role === 'admin' || user?.role === 'superadmin';
  const canReject = user?.role === 'admin' || user?.role === 'superadmin';
  const canComplete = (user?.role === 'admin' || user?.role === 'superadmin') && form.status === 'active';
  
  const handleStatusChange = (status: FormStatus) => {
    if (formId) {
      updateFormStatus(formId, status, status === 'rejected' ? comment : undefined);
      setComment('');
      onOpenChange(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="status-badge status-pending">Pending</Badge>;
      case 'active':
        return <Badge variant="outline" className="status-badge status-active">Active</Badge>;
      case 'completed':
        return <Badge variant="outline" className="status-badge status-completed">Completed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="status-badge status-rejected">Rejected</Badge>;
      default:
        return null;
    }
  };

  // Format date from ISO string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Closeout Form</DialogTitle>
            {getStatusBadge(form.status)}
          </div>
          <DialogDescription>
            Created on {formatDate(form.createdAt)} by {form.createdBy.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Client Information</h3>
              <div className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Client Name:</span> {form.clientName}
                </div>
                <div className="text-sm">
                  <span className="font-medium">File Path:</span> {form.filePath}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Signing Person:</span> {form.signingPerson}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Signing Email:</span> {form.signingEmail}
                </div>
                {form.additionalEmails.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Additional Emails:</span> {form.additionalEmails.join(', ')}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Tax Return Information</h3>
              <div className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Partner:</span> {form.partner}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Manager:</span> {form.manager}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Year(s):</span> {form.years}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Job #:</span> {form.jobNumber}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Invoice Amount:</span> {form.invoiceAmount}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Bill Detail:</span> {form.billDetail}
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Processing Details</h3>
              <div className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Payment Required Before Filing:</span> {form.paymentRequired ? 'Yes' : 'No'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">WIP Recovery:</span> {form.wipRecovery}
                </div>
                {form.recoveryReason && (
                  <div className="text-sm">
                    <span className="font-medium">Recovery Reason:</span> {form.recoveryReason}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Filing Types</h3>
              <div className="mt-2 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">T1:</span> {form.isT1 ? 'Yes' : 'No'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">S216:</span> {form.isS216 ? 'Yes' : 'No'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">S116:</span> {form.isS116 ? 'Yes' : 'No'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Paper Filed:</span> {form.isPaperFiled ? 'Yes' : 'No'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Installments Required:</span> {form.installmentsRequired ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {form.comments.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Comments</h3>
              {form.comments.map((comment) => (
                <div key={comment.id} className="text-sm bg-muted p-3 rounded-md">
                  <div className="font-medium">{comment.createdBy}</div>
                  <div className="text-muted-foreground text-xs">{formatDate(comment.createdAt)}</div>
                  <div className="mt-1">{comment.text}</div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {form.status === 'rejected' && canApprove && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium">Fix and Resubmit</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This form was rejected. You can approve it after the issues have been fixed.
              </p>
            </div>
          </>
        )}
        
        {canReject && form.status === 'pending' && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Rejection Reason</h3>
              <Textarea 
                placeholder="Please provide a reason for rejection..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
              />
            </div>
          </>
        )}
        
        <DialogFooter>
          {form.status === 'pending' && canApprove && (
            <Button 
              onClick={() => handleStatusChange('active')}
              className="bg-success hover:bg-success-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          
          {form.status === 'pending' && canReject && (
            <Button 
              variant="destructive" 
              onClick={() => handleStatusChange('rejected')}
              disabled={comment === ''}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          )}
          
          {form.status === 'active' && canComplete && (
            <Button 
              onClick={() => handleStatusChange('completed')}
              className="bg-success hover:bg-success-600"
            >
              <FileCheck className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>
          )}
          
          {form.status === 'rejected' && canApprove && (
            <Button 
              onClick={() => handleStatusChange('active')}
              className="bg-success hover:bg-success-600"
            >
              <Clock className="mr-2 h-4 w-4" />
              Approve After Fix
            </Button>
          )}
          
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseoutFormView;
