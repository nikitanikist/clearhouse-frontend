
import React from 'react';
import { CloseoutForm } from '@/contexts/DataContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

interface CloseoutFormGridProps {
  forms: CloseoutForm[];
  title: string;
  description?: string;
  emptyMessage?: string;
  onViewForm: (formId: string) => void;
}

const CloseoutFormGrid: React.FC<CloseoutFormGridProps> = ({
  forms,
  title,
  description,
  emptyMessage = "No forms found",
  onViewForm,
}) => {
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

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-10">
            <div className="text-center">
              <FileText className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => (
            <Card key={form.id} className="card-hover overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="truncate">{form.clientName}</CardTitle>
                  {getStatusBadge(form.status)}
                </div>
                <CardDescription>Job #{form.jobNumber}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="truncate">{form.filePath}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Year: {form.years}</span>
                </div>
                {form.assignedTo && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="mr-2 h-4 w-4" />
                    <span>Assigned to: {form.assignedTo.name}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })}
                </div>
                <Button variant="ghost" size="sm" onClick={() => onViewForm(form.id)}>
                  View Form
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloseoutFormGrid;
