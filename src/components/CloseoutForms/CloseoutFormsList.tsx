import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Eye, Edit, ArrowLeft, Play, FileX, X, UserPlus, Search } from 'lucide-react';
import { format } from 'date-fns';
import CloseoutFormView from './CloseoutFormView';
import CloseoutFormCreate from './CloseoutFormCreate';

interface CloseoutFormsListProps {
  status: 'pending' | 'active' | 'completed' | 'rejected';
  onBack: () => void;
  onFormSelect?: (form: any) => void;
}

const CloseoutFormsList: React.FC<CloseoutFormsListProps> = ({ status, onBack, onFormSelect }) => {
  const { forms, updateFormStatus, assignForm } = useData();
  const { user } = useAuth();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [showFormView, setShowFormView] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingForm, setEditingForm] = useState<any>(null);
  const [showAmendmentDialog, setShowAmendmentDialog] = useState(false);
  const [amendmentNote, setAmendmentNote] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [actionFormId, setActionFormId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Available admins for assignment
  const availableAdmins = [
    { id: 'admin-1', name: 'Jordan Lee' },
    { id: 'admin-2', name: 'Sarah Chen' },
    { id: 'admin-3', name: 'Mike Davis' },
  ];

  // Filter forms based on user role and status
  const getFilteredForms = () => {
    console.log('CloseoutFormsList - All forms:', forms);
    console.log('CloseoutFormsList - Status filter:', status);
    console.log('CloseoutFormsList - User:', user);
    
    // Ensure we have forms and status
    if (!forms || !Array.isArray(forms)) {
      console.log('CloseoutFormsList - No forms array found');
      return [];
    }
    
    if (!status) {
      console.log('CloseoutFormsList - No status provided');
      return [];
    }
    
    let filteredForms = forms.filter(form => {
      console.log(`Checking form ${form.id} with status ${form.status} against filter ${status}`);
      return form.status === status;
    });
    
    console.log('CloseoutFormsList - Forms with matching status:', filteredForms);
    
    if (user?.role === 'superadmin') {
      // Super admin sees all forms
      console.log('CloseoutFormsList - Super admin sees all forms');
      return filteredForms;
    } else if (user?.role === 'admin') {
      if (status === 'pending') {
        // Admin sees all pending forms
        console.log('CloseoutFormsList - Admin sees all pending forms');
        return filteredForms;
      } else {
        // For other statuses, admin sees forms assigned to them
        const assignedForms = filteredForms.filter(form => form.assignedTo && form.assignedTo.id === user.id);
        console.log('CloseoutFormsList - Admin sees assigned forms:', assignedForms);
        return assignedForms;
      }
    } else if (user?.role === 'preparer') {
      // Preparer sees forms created by them
      const createdForms = filteredForms.filter(form => form.createdBy && form.createdBy.id === user.id);
      console.log('CloseoutFormsList - Preparer sees created forms:', createdForms);
      return createdForms;
    }
    
    console.log('CloseoutFormsList - Fallback to filtered forms:', filteredForms);
    return filteredForms;
  };

  // Filter forms by search query (client email)
  const searchFilteredForms = useMemo(() => {
    const filtered = getFilteredForms();
    
    if (!searchQuery.trim()) {
      return filtered;
    }
    
    return filtered.filter(form => 
      form.signingEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [forms, status, user, searchQuery]);

  console.log('CloseoutFormsList - Final filtered forms:', searchFilteredForms);
  console.log('CloseoutFormsList - Number of forms to display:', searchFilteredForms.length);

  const getStatusBadge = (formStatus: string) => {
    switch (formStatus) {
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

  const getStatusTitle = () => {
    switch (status) {
      case 'pending':
        return 'Pending Closeout Forms';
      case 'active':
        return 'Currently Working Forms';
      case 'completed':
        return 'Completed Closeout Forms';
      case 'rejected':
        return 'Amendment Forms';
      default:
        return 'Closeout Forms';
    }
  };

  const handleViewForm = (formId: string) => {
    const form = forms.find(f => f.id === formId);
    console.log('CloseoutFormsList - handleViewForm called with:', formId);
    console.log('CloseoutFormsList - Found form:', form);
    
    if (form && onFormSelect) {
      console.log('CloseoutFormsList - Calling onFormSelect with form');
      onFormSelect(form);
    } else {
      console.log('CloseoutFormsList - Using dialog view');
      setSelectedFormId(formId);
      setShowFormView(true);
    }
  };

  const handleEditForm = (form: any) => {
    setEditingForm(form);
    setShowEditForm(true);
  };

  const handleStartWorking = (formId: string) => {
    updateFormStatus(formId, 'active', 'Admin started working on this form');
  };

  const handleRequestAmendment = (formId: string) => {
    setActionFormId(formId);
    setShowAmendmentDialog(true);
  };

  const submitAmendment = () => {
    if (actionFormId && amendmentNote.trim()) {
      updateFormStatus(actionFormId, 'rejected', amendmentNote);
      setShowAmendmentDialog(false);
      setAmendmentNote('');
      setActionFormId(null);
    }
  };

  const handleAssignForm = (formId: string) => {
    setActionFormId(formId);
    setShowAssignDialog(true);
  };

  const submitAssignment = () => {
    if (actionFormId && selectedAssignee) {
      const assigneeName = availableAdmins.find(admin => admin.id === selectedAssignee)?.name || '';
      assignForm(actionFormId, selectedAssignee, assigneeName);
      setShowAssignDialog(false);
      setSelectedAssignee('');
      setActionFormId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', dateStr, error);
      return dateStr;
    }
  };

  const selectedForm = selectedFormId ? forms.find(form => form.id === selectedFormId) : null;

  const renderActionButtons = (form: any) => {
    // For pending status - different behavior for different roles
    if (status === 'pending') {
      if (user?.role === 'preparer') {
        // Preparer only sees view button for pending forms
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewForm(form.id)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        );
      } else if (user?.role === 'admin' || user?.role === 'superadmin') {
        // Admin/superadmin only sees view button (as requested)
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewForm(form.id)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
        );
      }
    }

    if (status === 'rejected' && (user?.role === 'preparer')) {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewForm(form.id)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditForm(form)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      );
    }

    // Default view button for other statuses
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleViewForm(form.id)}
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        View
      </Button>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onBack}
                  className="mr-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {getStatusTitle()}
              </CardTitle>
              <CardDescription>
                {searchFilteredForms.length} form{searchFilteredForms.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
          
          {/* Search Box */}
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by client email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {searchFilteredForms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery.trim() ? `No forms found matching "${searchQuery}"` : `No ${status} forms found.`}
              </p>
              {!searchQuery.trim() && (
                <p className="text-sm text-gray-500 mt-2">
                  Debug info: Status={status}, User role={user?.role}, Total forms={forms?.length || 0}
                </p>
              )}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Email ID</TableHead>
                    <TableHead>Job Number</TableHead>
                    <TableHead>Years</TableHead>
                    <TableHead>Partner</TableHead>
                    <TableHead>Invoice Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {searchFilteredForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.clientName || 'N/A'}</TableCell>
                      <TableCell>{form.signingEmail || 'N/A'}</TableCell>
                      <TableCell>{form.jobNumber || 'N/A'}</TableCell>
                      <TableCell>{form.years || 'N/A'}</TableCell>
                      <TableCell>{form.partner || 'N/A'}</TableCell>
                      <TableCell>{form.invoiceAmount || 'N/A'}</TableCell>
                      <TableCell>{getStatusBadge(form.status)}</TableCell>
                      <TableCell>{formatDate(form.createdAt)}</TableCell>
                      <TableCell>
                        {renderActionButtons(form)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Closeout Form View Dialog */}
      <Dialog open={showFormView} onOpenChange={setShowFormView}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Closeout Form Details</DialogTitle>
          </DialogHeader>
          {selectedForm && <CloseoutFormView form={selectedForm} />}
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <CloseoutFormCreate
        open={showEditForm}
        onOpenChange={setShowEditForm}
        editForm={editingForm}
      />

      {/* Amendment Request Dialog */}
      <Dialog open={showAmendmentDialog} onOpenChange={setShowAmendmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Amendment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amendment-note">Amendment Note</Label>
              <Textarea
                id="amendment-note"
                placeholder="Please describe what amendments are needed..."
                value={amendmentNote}
                onChange={(e) => setAmendmentNote(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAmendmentDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitAmendment}
                disabled={!amendmentNote.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Request Amendment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Form Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Form to Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignee">Select Admin</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an admin..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAdmins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitAssignment}
                disabled={!selectedAssignee}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Assign Form
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CloseoutFormsList;
