
import React, { useState } from 'react';
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
import { Eye, Edit, ArrowLeft, Play, FileX, X, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import CloseoutFormView from './CloseoutFormView';
import CloseoutFormCreate from './CloseoutFormCreate';

interface CloseoutFormsListProps {
  status: 'pending' | 'active' | 'completed' | 'rejected';
  onBack: () => void;
}

const CloseoutFormsList: React.FC<CloseoutFormsListProps> = ({ status, onBack }) => {
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

  // Available admins for assignment
  const availableAdmins = [
    { id: 'admin-1', name: 'Jordan Lee' },
    { id: 'admin-2', name: 'Sarah Chen' },
    { id: 'admin-3', name: 'Mike Davis' },
  ];

  // Filter forms based on user role and status
  const getFilteredForms = () => {
    let filteredForms = forms.filter(form => form.status === status);
    
    console.log('Filtering forms for status:', status);
    console.log('User role:', user?.role);
    console.log('Forms with matching status:', filteredForms);
    
    if (user?.role === 'superadmin') {
      // Super admin sees all forms
      return filteredForms;
    } else if (user?.role === 'admin') {
      if (status === 'pending') {
        // Admin sees all pending forms
        return filteredForms;
      } else {
        // For other statuses, admin sees forms assigned to them
        return filteredForms.filter(form => form.assignedTo && form.assignedTo.id === user.id);
      }
    } else if (user?.role === 'preparer') {
      // Preparer sees forms created by them
      return filteredForms.filter(form => form.createdBy.id === user.id);
    }
    
    return filteredForms;
  };

  const filteredForms = getFilteredForms();

  console.log('Final filtered forms:', filteredForms);

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
    setSelectedFormId(formId);
    setShowFormView(true);
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
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy');
  };

  const selectedForm = selectedFormId ? forms.find(form => form.id === selectedFormId) : null;

  const renderActionButtons = (form: any) => {
    // For pending status, only show view button in table
    if (status === 'pending') {
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
                {filteredForms.length} form{filteredForms.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredForms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No {status} forms found.</p>
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
                  {filteredForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="font-medium">{form.clientName}</TableCell>
                      <TableCell>{form.signingEmail}</TableCell>
                      <TableCell>{form.jobNumber}</TableCell>
                      <TableCell>{form.years}</TableCell>
                      <TableCell>{form.partner}</TableCell>
                      <TableCell>{form.invoiceAmount}</TableCell>
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
