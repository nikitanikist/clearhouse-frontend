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
import { Input } from '@/components/ui/input';
import { Check, Clock, FileCheck, X, Edit, UserPlus, Save } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import PreviousYearForms from './PreviousYearForms';
import InstallmentAttachmentUpload from './InstallmentAttachmentUpload';

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
  const { getFormById, updateFormStatus, getPreviousYearForms, assignForm, updateForm } = useData();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedForm, setEditedForm] = useState<CloseoutForm | null>(null);
  
  const form = formId ? getFormById(formId) : null;
  const previousForms = form ? getPreviousYearForms(form.clientName, form.id) : [];

  // Initialize editedForm when form changes
  React.useEffect(() => {
    if (form) {
      setEditedForm({ ...form });
    }
  }, [form]);

  // Mock data for available team members
  const availableAssignees = [
    { id: 'admin-1', name: 'Jordan Lee', role: 'admin' },
    { id: 'admin-2', name: 'Alex Chen', role: 'admin' },
    { id: 'admin-3', name: 'Morgan Davis', role: 'admin' },
    { id: 'superadmin-1', name: 'Sam Wilson', role: 'superadmin' },
  ];

  if (!form || !editedForm) {
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
    setIsEditing(!isEditing);
    // Reset editedForm to original form data when canceling edit
    if (isEditing) {
      setEditedForm({ ...form });
    }
  };

  const handleSaveForm = () => {
    if (editedForm && updateForm) {
      updateForm(editedForm.id, editedForm);
      setIsEditing(false);
    }
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

  const updateFormField = (field: string, value: any) => {
    setEditedForm(prev => {
      if (!prev) return null;
      
      if (field === 'additionalEmails' && typeof value === 'string') {
        return { ...prev, [field]: value.split(', ').filter(Boolean) };
      }
      
      return { ...prev, [field]: value };
    });
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
      name: editedForm.clientName,
      signingPerson: editedForm.signingPerson,
      email: editedForm.signingEmail,
      additionalEmails: editedForm.additionalEmails.join(', '),
      personalTaxPayment: editedForm.taxesPayable,
      hstPayment: editedForm.hstPayable
    }
  ];

  // Create a mock client object for PreviousYearForms component
  const clientForPreviousForms = {
    id: editedForm.clientName.toLowerCase().replace(/\s+/g, '-'),
    name: editedForm.clientName,
    email: editedForm.signingEmail
  };

  const EditableCell = ({ value, onChange, className = "text-center", type = "text" }: { 
    value: string | boolean; 
    onChange: (val: any) => void; 
    className?: string;
    type?: string;
  }) => {
    if (!isEditing) {
      if (typeof value === 'boolean') {
        return <TableCell className={className}>{value ? '✓' : ''}</TableCell>;
      }
      return <TableCell className={className}>{value}</TableCell>;
    }

    if (typeof value === 'boolean') {
      return (
        <TableCell className={className}>
          <Checkbox 
            checked={value} 
            onCheckedChange={onChange}
          />
        </TableCell>
      );
    }

    return (
      <TableCell className={className}>
        <Input 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 bg-transparent p-1 text-inherit"
        />
      </TableCell>
    );
  };

  const EditableTextAreaCell = ({ value, onChange, className = "text-left" }: { 
    value: string; 
    onChange: (val: string) => void; 
    className?: string;
  }) => {
    if (!isEditing) {
      return <TableCell className={className}>{value}</TableCell>;
    }

    return (
      <TableCell className={className}>
        <Textarea 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 bg-transparent p-1 text-inherit min-h-[60px]"
        />
      </TableCell>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Closing Out Request - T1</DialogTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(form.status)}
              {(canEdit || canApprove) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isEditing ? handleSaveForm : handleEditForm}
                >
                  {isEditing ? <Save className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
                  {isEditing ? 'Save' : 'Edit'}
                </Button>
              )}
            </div>
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
                    <TableHead className="w-48 bg-gray-100 font-semibold text-left">Field</TableHead>
                    {familyMembers.map((member, index) => (
                      <TableHead key={index} className="text-center bg-red-50 font-semibold text-red-600">
                        {member.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Name of Client</TableCell>
                    <EditableCell 
                      value={editedForm.clientName} 
                      onChange={(val) => updateFormField('clientName', val)}
                      className="text-center text-red-600 font-medium"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">File Path</TableCell>
                    <EditableCell 
                      value={editedForm.filePath} 
                      onChange={(val) => updateFormField('filePath', val)}
                      className="text-left text-sm"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Name of person signing</TableCell>
                    <EditableCell 
                      value={editedForm.signingPerson} 
                      onChange={(val) => updateFormField('signingPerson', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Email of person signing</TableCell>
                    <EditableCell 
                      value={editedForm.signingEmail} 
                      onChange={(val) => updateFormField('signingEmail', val)}
                      className="text-center text-blue-600 underline"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Additional emails to send package</TableCell>
                    <EditableCell 
                      value={editedForm.additionalEmails.join(', ')} 
                      onChange={(val) => updateFormField('additionalEmails', val)}
                      className="text-center"
                    />
                  </TableRow>
                  
                  {/* Partner & Manager Section */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Partner</TableCell>
                    <EditableCell 
                      value={editedForm.partner} 
                      onChange={(val) => updateFormField('partner', val)}
                      className="text-left"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Manager</TableCell>
                    <EditableCell 
                      value={editedForm.manager} 
                      onChange={(val) => updateFormField('manager', val)}
                      className="text-left"
                    />
                  </TableRow>
                  
                  {/* Year & Job Details */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Year(s)</TableCell>
                    <EditableCell 
                      value={editedForm.years} 
                      onChange={(val) => updateFormField('years', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Job #</TableCell>
                    <EditableCell 
                      value={editedForm.jobNumber} 
                      onChange={(val) => updateFormField('jobNumber', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Invoice amount (+ disb, HST)</TableCell>
                    <EditableCell 
                      value={editedForm.invoiceAmount} 
                      onChange={(val) => updateFormField('invoiceAmount', val)}
                      className="text-left"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Final Bill Detail</TableCell>
                    <EditableCell 
                      value={editedForm.billDetail} 
                      onChange={(val) => updateFormField('billDetail', val)}
                      className="text-left"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Payment required before filing? Yes/No</TableCell>
                    <EditableCell 
                      value={editedForm.paymentRequired ? 'Yes' : 'No'} 
                      onChange={(val) => updateFormField('paymentRequired', val === 'Yes')}
                      className="text-left"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">WIP recovery % (WIP + 20% Partner time)</TableCell>
                    <EditableCell 
                      value={editedForm.wipRecovery} 
                      onChange={(val) => updateFormField('wipRecovery', val)}
                      className="text-left"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Reason for Recovery below 100% - discussed with Partner</TableCell>
                    <EditableCell 
                      value={editedForm.recoveryReason || 'N/A'} 
                      onChange={(val) => updateFormField('recoveryReason', val)}
                      className="text-left"
                    />
                  </TableRow>
                  
                  {/* Tax Filing Types */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">T1</TableCell>
                    <EditableCell 
                      value={editedForm.isT1} 
                      onChange={(val) => updateFormField('isT1', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">S216</TableCell>
                    <EditableCell 
                      value={editedForm.isS216} 
                      onChange={(val) => updateFormField('isS216', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">S116</TableCell>
                    <EditableCell 
                      value={editedForm.isS116} 
                      onChange={(val) => updateFormField('isS116', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">To be paper filed - CRA copy to be signed</TableCell>
                    <EditableCell 
                      value={editedForm.isPaperFiled} 
                      onChange={(val) => updateFormField('isPaperFiled', val)}
                      className="text-center"
                    />
                  </TableRow>
                  
                  {/* Installments with conditional upload */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Are installments required? (Yes/No)</TableCell>
                    <EditableCell 
                      value={editedForm.installmentsRequired ? 'Yes' : 'No'} 
                      onChange={(val) => updateFormField('installmentsRequired', val === 'Yes')}
                      className="text-center"
                    />
                  </TableRow>
                  
                  {/* Conditional Installment Attachment Upload */}
                  {editedForm.installmentsRequired && (
                    <TableRow>
                      <TableCell className="font-medium bg-gray-50 text-left">Upload Installment Attachment</TableCell>
                      <TableCell className="text-left">
                        <InstallmentAttachmentUpload
                          attachment={editedForm.installmentAttachment}
                          onAttachmentChange={(attachment) => updateFormField('installmentAttachment', attachment)}
                          disabled={!isEditing}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  
                  {/* Yellow highlighted rows - now editable */}
                  <TableRow className="bg-yellow-100">
                    <TableCell className="font-medium text-left">T2091 (Principal residence sale)</TableCell>
                    <EditableCell 
                      value={editedForm.t2091PrincipalResidence} 
                      onChange={(val) => updateFormField('t2091PrincipalResidence', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow className="bg-yellow-100">
                    <TableCell className="font-medium text-left">T1135 (Foreign Property)</TableCell>
                    <EditableCell 
                      value={editedForm.t1135ForeignProperty} 
                      onChange={(val) => updateFormField('t1135ForeignProperty', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow className="bg-yellow-100">
                    <TableCell className="font-medium text-left">T1032 (Pension Split)</TableCell>
                    <EditableCell 
                      value={editedForm.t1032PensionSplit} 
                      onChange={(val) => updateFormField('t1032PensionSplit', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow className="bg-yellow-100">
                    <TableCell className="font-medium text-left">HST (Indicate Draft or Final)</TableCell>
                    <EditableCell 
                      value={editedForm.hstDraftOrFinal} 
                      onChange={(val) => updateFormField('hstDraftOrFinal', val)}
                      className="text-center"
                    />
                  </TableRow>
                  
                  {/* Other notes - now editable textarea */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Other notes</TableCell>
                    <EditableTextAreaCell 
                      value={editedForm.otherNotes} 
                      onChange={(val) => updateFormField('otherNotes', val)}
                      className="text-left"
                    />
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
                  
                  {/* T1 Summary Details - now editable */}
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Prior Periods Balance Outstanding</TableCell>
                    <EditableCell 
                      value={editedForm.priorPeriodsBalance} 
                      onChange={(val) => updateFormField('priorPeriodsBalance', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Taxes Payable (Refundable)</TableCell>
                    <EditableCell 
                      value={editedForm.taxesPayable} 
                      onChange={(val) => updateFormField('taxesPayable', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Installments during Calendar YE</TableCell>
                    <EditableCell 
                      value={editedForm.installmentsDuringYear} 
                      onChange={(val) => updateFormField('installmentsDuringYear', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Installments made after Calendar YE</TableCell>
                    <EditableCell 
                      value={editedForm.installmentsAfterYear} 
                      onChange={(val) => updateFormField('installmentsAfterYear', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Amount owing (Refund)</TableCell>
                    <EditableCell 
                      value={editedForm.amountOwing} 
                      onChange={(val) => updateFormField('amountOwing', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Due date</TableCell>
                    <EditableCell 
                      value={editedForm.dueDate} 
                      onChange={(val) => updateFormField('dueDate', val)}
                      className="text-center"
                    />
                  </TableRow>
                  
                  {/* HST Payment Section */}
                  <TableRow>
                    <TableCell className="text-center font-bold text-red-600 bg-gray-50" colSpan={familyMembers.length + 1}>
                      HST Payment (RT0001 Account)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Prior Periods Balance Outstanding</TableCell>
                    <EditableCell 
                      value={editedForm.hstPriorBalance} 
                      onChange={(val) => updateFormField('hstPriorBalance', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">HST Payable (Refund)</TableCell>
                    <EditableCell 
                      value={editedForm.hstPayable} 
                      onChange={(val) => updateFormField('hstPayable', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Installments during period</TableCell>
                    <EditableCell 
                      value={editedForm.hstInstallmentsDuring} 
                      onChange={(val) => updateFormField('hstInstallmentsDuring', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Payments made after period</TableCell>
                    <EditableCell 
                      value={editedForm.hstInstallmentsAfter} 
                      onChange={(val) => updateFormField('hstInstallmentsAfter', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Payment due (Refund) now</TableCell>
                    <EditableCell 
                      value={editedForm.hstPaymentDue} 
                      onChange={(val) => updateFormField('hstPaymentDue', val)}
                      className="text-center"
                    />
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50 text-left">Due date</TableCell>
                    <EditableCell 
                      value={editedForm.hstDueDate} 
                      onChange={(val) => updateFormField('hstDueDate', val)}
                      className="text-center"
                    />
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
