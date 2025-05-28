
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
import { Eye, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import CloseoutFormView from './CloseoutFormView';

interface CloseoutFormsListProps {
  status: 'pending' | 'active' | 'completed' | 'rejected';
  onBack: () => void;
}

const CloseoutFormsList: React.FC<CloseoutFormsListProps> = ({ status, onBack }) => {
  const { forms } = useData();
  const { user } = useAuth();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [showFormView, setShowFormView] = useState(false);

  // Filter forms based on user role and status
  const getFilteredForms = () => {
    let filteredForms = forms.filter(form => form.status === status);
    
    if (user?.role === 'admin') {
      filteredForms = filteredForms.filter(form => form.assignedTo && form.assignedTo.id === user.id);
    } else if (user?.role === 'preparer') {
      filteredForms = filteredForms.filter(form => form.createdBy.id === user.id);
    }
    
    return filteredForms;
  };

  const filteredForms = getFilteredForms();

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
        return 'Active Closeout Forms';
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMM d, yyyy');
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewForm(form.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Closeout Form
                        </Button>
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
      <CloseoutFormView 
        formId={selectedFormId}
        open={showFormView}
        onOpenChange={setShowFormView}
      />
    </>
  );
};

export default CloseoutFormsList;
