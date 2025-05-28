
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EmailClientSearch from './EmailClientSearch';
import MultiPDFUpload from './MultiPDFUpload';
import CloseoutFormTable, { CloseoutFormTableData } from './CloseoutFormTable';
import PreviousYearForms from './PreviousYearForms';
import { Client } from './ClientSearch';

interface CloseoutFormCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CloseoutFormCreate = ({
  open,
  onOpenChange,
}: CloseoutFormCreateProps) => {
  const { user } = useAuth();
  const { createForm, forms } = useData();
  
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | { email: string; name?: string } | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<CloseoutFormTableData> | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);

  // Get previous year forms for selected client
  const getPreviousYearForms = () => {
    if (!selectedClient || !selectedClient.name) return [];
    return forms.filter(form => 
      form.clientName === selectedClient.name
    );
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setIsNewClient(false);
    setStep(2);
  };

  const handleNewClient = (email: string) => {
    setSelectedClient({ email, name: 'New Client' });
    setIsNewClient(true);
    setStep(2);
  };

  const handleDataExtracted = (data: Partial<CloseoutFormTableData>) => {
    setExtractedData(data);
    setStep(3);
  };

  const handleFormSubmit = (formData: CloseoutFormTableData) => {
    if (!user) return;
    
    const createdByInfo = {
      id: user.id,
      name: user.name,
      role: user.role,
    };
    
    // Convert the table format to the original CloseoutForm format using the first family member
    const primaryMember = formData.familyMembers[0];
    
    createForm({
      clientName: primaryMember.clientName,
      filePath: formData.filePath,
      signingPerson: primaryMember.signingPerson,
      signingEmail: primaryMember.signingEmail,
      additionalEmails: primaryMember.additionalEmails,
      partner: formData.partner,
      manager: formData.manager,
      years: formData.years,
      jobNumber: formData.jobNumber,
      invoiceAmount: formData.invoiceAmount,
      billDetail: formData.billDetail,
      paymentRequired: formData.paymentRequired,
      wipRecovery: formData.wipRecovery,
      recoveryReason: formData.recoveryReason,
      isT1: primaryMember.isT1,
      isS216: primaryMember.isS216,
      isS116: primaryMember.isS116,
      isPaperFiled: primaryMember.isPaperFiled,
      installmentsRequired: primaryMember.installmentsRequired,
      status: 'pending',
      assignedTo: null,
      createdBy: createdByInfo,
    });
    
    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedClient(null);
    setExtractedData(null);
    setIsNewClient(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Find Client';
      case 2: return 'Upload Documents';
      case 3: return 'Create Closeout Form';
      default: return 'Create Closeout Form';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Enter client email to search for existing clients or add new ones';
      case 2: return `Upload PDF documents for ${selectedClient?.name || selectedClient?.email}`;
      case 3: return 'Review and complete the closeout form details';
      default: return '';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={step === 3 ? "sm:max-w-7xl max-h-[90vh] overflow-y-auto" : "sm:max-w-2xl"}>
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
          <div className="py-4">
            <EmailClientSearch 
              onClientSelect={handleClientSelect}
              onNewClient={handleNewClient}
            />
          </div>
        )}

        {step === 2 && selectedClient && (
          <div className="py-4">
            <MultiPDFUpload 
              client={selectedClient}
              onDataExtracted={handleDataExtracted}
            />
          </div>
        )}
        
        {step === 3 && extractedData && (
          <div className="flex gap-6 max-h-[70vh] overflow-hidden">
            {/* Left side - Form creation */}
            <div className="flex-1 overflow-y-auto pr-2">
              <CloseoutFormTable
                initialData={extractedData}
                onSubmit={handleFormSubmit}
                onCancel={() => setStep(2)}
              />
            </div>

            {/* Right side - Previous year forms (only for existing clients) */}
            {!isNewClient && selectedClient && 'name' in selectedClient && (
              <div className="w-80 border-l pl-6">
                <div className="sticky top-0 max-h-[70vh] overflow-y-auto">
                  <PreviousYearForms 
                    client={selectedClient as Client} 
                    previousForms={getPreviousYearForms()} 
                  />
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          {step === 1 ? (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          ) : step === 2 ? (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>Back to Upload</Button>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseoutFormCreate;
