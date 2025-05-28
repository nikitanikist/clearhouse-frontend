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
import { Check, Clock, FileCheck, X, Edit, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PreviousYearForms from './PreviousYearForms';

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
  const { getFormById, updateFormStatus, getPreviousYearForms, assignForm } = useData();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  
  const form = formId ? getFormById(formId) : null;
  const previousForms = form ? getPreviousYearForms(form.clientName, form.id) : [];

  // Mock data for available team members (in a real app, this would come from a users API)
  const availableAssignees = [
    { id: 'admin-1', name: 'Jordan Lee', role: 'admin' },
    { id: 'admin-2', name: 'Alex Chen', role: 'admin' },
    { id: 'admin-3', name: 'Morgan Davis', role: 'admin' },
    { id: 'superadmin-1', name: 'Sam Wilson', role: 'superadmin' },
  ];

  if (!form) {
    return null;
  }

  const canApprove = user?.role === 'admin' || user?.role === 'superadmin';
  const canReject = user?.role === 'admin' || user?.role === 'superadmin';
  const canComplete = (user?.role === 'admin' || user?.role === 'superadmin') && form.status === 'active';
  const canEdit = user?.role === 'preparer' && form.status === 'rejected' && form.createdBy.id === user.id;
  const canAssign = user?.role === 'admin' || user?.role === 'superadmin';
  
  const handleStatusChange = (status: FormStatus) => {
    if (formId) {
      updateFormStatus(formId, status, status === 'rejected' ? comment : undefined);
      setComment('');
      onOpenChange(false);
    }
  };

  const handleEditForm = () => {
    onOpenChange(false);
    console.log('Edit form clicked for form ID:', formId);
  };

  const handleAssignForm = () => {
    if (formId && selectedAssignee) {
      const assignee = availableAssignees.find(a => a.id === selectedAssignee);
      if (assignee) {
        assignForm(formId, assignee.id, assignee.name);
        setSelectedAssignee('');
      }
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="status-badge status-pending">Pending</Badge>;
      case 'active':
        return <Badge variant="outline" className="status-badge status-active">Working</Badge>;
      case 'completed':
        return <Badge variant="outline" className="status-badge status-completed">Completed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="status-badge status-rejected">Amendment</Badge>;
      default:
        return null;
    }
  };

  // Format date from ISO string
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy');
  };

  // Create mock family members data to match the screenshot format
  const familyMembers = [
    {
      name: form.clientName,
      signingPerson: form.signingPerson,
      email: form.signingEmail,
      additionalEmails: form.additionalEmails.join(', '),
      personalTaxPayment: '-3,762.00',
      hstPayment: '0'
    }
  ];

  // Create a mock client object for PreviousYearForms component
  const clientForPreviousForms = {
    id: form.clientName.toLowerCase().replace(/\s+/g, '-'),
    name: form.clientName,
    email: form.signingEmail
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Closing Out Request - T1</DialogTitle>
            {getStatusBadge(form.status)}
          </div>
          <DialogDescription>
            Created on {formatDate(form.createdAt)} by {form.createdBy.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Closeout Form Table - Takes up 3/4 of the width */}
          <div className="lg:col-span-3">
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48 bg-gray-100 font-semibold">Field</TableHead>
                    {familyMembers.map((member, index) => (
                      <TableHead key={index} className="text-center bg-red-50 font-semibold text-red-600">
                        {member.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Name of Client</TableCell>
                    {familyMembers.map((member, index) => (
                      <TableCell key={index} className="text-center text-red-600 font-medium">
                        {member.name}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">File Path</TableCell>
                    <TableCell className="text-sm">{form.filePath}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Name of person signing</TableCell>
                    {familyMembers.map((member, index) => (
                      <TableCell key={index} className="text-center">{member.signingPerson}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Email of person signing</TableCell>
                    {familyMembers.map((member, index) => (
                      <TableCell key={index} className="text-center text-blue-600 underline">
                        {member.email}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Additional emails to send package</TableCell>
                    {familyMembers.map((member, index) => (
                      <TableCell key={index} className="text-center">{member.additionalEmails || ''}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Partner & Manager Section */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Partner</TableCell>
                    <TableCell>{form.partner}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Manager</TableCell>
                    <TableCell>{form.manager}</TableCell>
                  </TableRow>
                  
                  {/* Year & Job Details */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Year(s)</TableCell>
                    <TableCell className="text-center">{form.years}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Job #</TableCell>
                    <TableCell className="text-center">{form.jobNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Invoice amount (+ disb, HST)</TableCell>
                    <TableCell>{form.invoiceAmount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Final Bill Detail</TableCell>
                    <TableCell>{form.billDetail}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Payment required before filing? Yes/No</TableCell>
                    <TableCell>{form.paymentRequired ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">WIP recovery % (WIP + 20% Partner time)</TableCell>
                    <TableCell>{form.wipRecovery}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Reason for Recovery below 100% - discussed with Partner</TableCell>
                    <TableCell>{form.recoveryReason || 'N/A'}</TableCell>
                  </TableRow>
                  
                  {/* Tax Filing Types */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">T1</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center">{form.isT1 ? '✓' : ''}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">S216</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center">{form.isS216 ? '✓' : ''}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">S116</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center">{form.isS116 ? '✓' : ''}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">To be paper filed - CRA copy to be signed</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center">{form.isPaperFiled ? '✓' : ''}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Installments */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Are installments required? (Yes/No)</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center">{form.installmentsRequired ? 'Yes' : 'No'}</TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Yellow highlighted rows */}
                  <TableRow className="bg-yellow-100">
                    <TableCell className="font-medium">T2091 (Principle residence sale)</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-yellow-100">
                    <TableCell className="font-medium">T1135 (Foreign Property)</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-yellow-100">
                    <TableCell className="font-medium">T1032 (Pension Split)</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="bg-yellow-100">
                    <TableCell className="font-medium">HST (Indicate Draft or Final)</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                  
                  {/* Other notes */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Other notes</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  
                  {/* Personal Tax Payment Section */}
                  <TableRow>
                    <TableCell className="text-center font-bold text-red-600 bg-gray-50" colSpan={familyMembers.length + 1}>
                      Personal Tax Payment
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-center font-medium bg-red-50" colSpan={familyMembers.length + 1}>
                      {familyMembers.map(member => member.name).join(' | ')}
                    </TableCell>
                  </TableRow>
                  
                  {/* Tax Payment Details */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Prior Periods Balance Outstanding</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center">-</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Taxes Payable (Refundable)</TableCell>
                    {familyMembers.map((member, index) => (
                      <TableCell key={index} className="text-center">{member.personalTaxPayment}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Installments during Calendar YE</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Installments made after Calendar YE</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Amount owing (Refund)</TableCell>
                    {familyMembers.map((member, index) => (
                      <TableCell key={index} className="text-center">{member.personalTaxPayment}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Due date</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                  
                  {/* HST Payment Section */}
                  <TableRow>
                    <TableCell className="text-center font-bold text-red-600 bg-gray-50" colSpan={familyMembers.length + 1}>
                      HST Payment (RT0001 Account)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Prior Periods Balance Outstanding</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center">-</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">HST Payable (Refund)</TableCell>
                    {familyMembers.map((member, index) => (
                      <TableCell key={index} className="text-center">{member.hstPayment}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Installments during period</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Payments made after period</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center">-</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Payment due (Refund) now</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Due date</TableCell>
                    {familyMembers.map((_, index) => (
                      <TableCell key={index} className="text-center"></TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Comments Section */}
            {form.comments.length > 0 && (
              <>
                <Separator className="my-4" />
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
            
            {/* Amendment Section */}
            {form.status === 'rejected' && canApprove && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="text-sm font-medium">Fix and Resubmit</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This form requires amendments. You can mark it as working after the issues have been fixed.
                  </p>
                </div>
              </>
            )}
            
            {canReject && form.status === 'pending' && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Amendment Reason</h3>
                  <Textarea 
                    placeholder="Please provide amendment reason..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="resize-none"
                  />
                </div>
              </>
            )}

            {canAssign && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Assign Form</h3>
                  <div className="flex gap-2">
                    <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAssignees.map((assignee) => (
                          <SelectItem key={assignee.id} value={assignee.id}>
                            {assignee.name} ({assignee.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleAssignForm}
                      disabled={!selectedAssignee}
                      variant="outline"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      Assign
                    </Button>
                  </div>
                  {form.assignedTo && (
                    <p className="text-sm text-muted-foreground">
                      Currently assigned to: {form.assignedTo.name}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Previous Year Forms - Takes up 1/4 of the width */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-4 h-full bg-muted/10">
              <PreviousYearForms 
                client={clientForPreviousForms} 
                previousForms={previousForms} 
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          {canEdit && (
            <Button 
              onClick={handleEditForm}
              className="bg-primary hover:bg-primary-600"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Form
            </Button>
          )}

          {form.status === 'pending' && canApprove && (
            <Button 
              onClick={() => handleStatusChange('active')}
              className="bg-success hover:bg-success-600"
            >
              <Check className="mr-2 h-4 w-4" />
              Working on it
            </Button>
          )}
          
          {form.status === 'pending' && canReject && (
            <Button 
              variant="destructive" 
              onClick={() => handleStatusChange('rejected')}
              disabled={comment === ''}
            >
              <X className="mr-2 h-4 w-4" />
              Need Amendment
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
              Working on it
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
