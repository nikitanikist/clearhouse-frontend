
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, FileText, User } from 'lucide-react';
import { CloseoutForm } from '@/contexts/DataContext';
import { Client } from './ClientSearch';

interface PreviousYearFormsProps {
  client: Client;
  previousForms: CloseoutForm[];
}

const PreviousYearForms = ({ client, previousForms }: PreviousYearFormsProps) => {
  if (previousForms.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No previous year forms found for {client.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <User className="h-4 w-4" />
        Previous Forms for {client.name}
      </h3>
      
      <div className="space-y-3">
        {previousForms.map((form) => (
          <Card key={form.id} className="text-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Tax Year {form.years}
                </CardTitle>
                <Badge 
                  variant={
                    form.status === 'completed' ? 'default' : 
                    form.status === 'active' ? 'secondary' :
                    form.status === 'rejected' ? 'destructive' : 'outline'
                  }
                >
                  {form.status}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Job #{form.jobNumber}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Partner</p>
                  <p className="font-medium">{form.partner}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Manager</p>
                  <p className="font-medium">{form.manager}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs">
                  <DollarSign className="h-3 w-3" />
                  <span className="font-medium">{form.invoiceAmount}</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="text-xs">
                <p className="text-muted-foreground">Bill Detail</p>
                <p className="font-medium line-clamp-2">{form.billDetail}</p>
              </div>
              
              <div className="flex gap-1 text-xs">
                {form.isT1 && <Badge variant="outline" className="text-xs">T1</Badge>}
                {form.isS216 && <Badge variant="outline" className="text-xs">S216</Badge>}
                {form.isS116 && <Badge variant="outline" className="text-xs">S116</Badge>}
                {form.isPaperFiled && <Badge variant="outline" className="text-xs">Paper Filed</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PreviousYearForms;
