
import React from 'react';
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
import { CloseoutFormTableData } from './CloseoutFormTable';
import { Client } from './ClientSearch';
import { useFormSteps } from './hooks/useFormSteps';
import { mapTableDataToCloseoutForm } from './utils/formDataMapper';
import ClientSearchStep from './steps/ClientSearchStep';
import DocumentUploadStep from './steps/DocumentUploadStep';
import FormCompletionStep from './steps/FormCompletionStep';

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
  
  const {
    step,
    setStep,
    selectedClient,
    extractedData,
    isNewClient,
    handleClientSelect,
    handleNewClient,
    handleDataExtracted,
    resetForm,
    getStepTitle,
    getStepDescription,
  } = useFormSteps();

  // Get previous year forms for selected client
  const getPreviousYearForms = () => {
    if (!selectedClient || !selectedClient.name) return [];
    return forms.filter(form => 
      form.clientName === selectedClient.name
    );
  };

  const handleFormSubmit = (formData: CloseoutFormTableData) => {
    if (!user) return;
    
    const mappedFormData = mapTableDataToCloseoutForm(formData, user);
    createForm(mappedFormData);
    
    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
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
          <ClientSearchStep 
            onClientSelect={handleClientSelect}
            onNewClient={handleNewClient}
          />
        )}

        {step === 2 && selectedClient && (
          <DocumentUploadStep 
            selectedClient={selectedClient}
            onDataExtracted={handleDataExtracted}
          />
        )}
        
        {step === 3 && extractedData && (
          <FormCompletionStep 
            extractedData={extractedData}
            selectedClient={selectedClient!}
            isNewClient={isNewClient}
            previousForms={getPreviousYearForms()}
            onSubmit={handleFormSubmit}
            onCancel={() => setStep(2)}
          />
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
