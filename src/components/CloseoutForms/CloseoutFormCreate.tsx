import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  editForm?: any; // For editing existing forms
}

const CloseoutFormCreate = ({
  open,
  onOpenChange,
  editForm
}: CloseoutFormCreateProps) => {
  const { user } = useAuth();
  const { createForm, updateForm, forms } = useData();
  
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

  // If editing, pre-populate data
  React.useEffect(() => {
    if (editForm && open) {
      // Pre-populate form with existing data
      handleClientSelect({ name: editForm.clientName, email: editForm.signingEmail });
      handleDataExtracted({
        clientName: editForm.clientName,
        partner: editForm.partner,
        manager: editForm.manager,
        years: editForm.years,
        jobNumber: editForm.jobNumber,
        invoiceAmount: editForm.invoiceAmount,
        wipRecovery: editForm.wipRecovery,
        paymentRequired: editForm.paymentRequired,
        billDetail: editForm.billDetail,
        recoveryReason: editForm.recoveryReason,
        // ... other fields
      });
      setStep(3); // Go directly to form completion step
    }
  }, [editForm, open]);

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
    
    if (editForm) {
      // Update existing form
      updateForm(editForm.id, { ...mappedFormData, status: 'pending' });
    } else {
      // Create new form
      createForm(mappedFormData);
    }
    
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
          <DialogTitle>{editForm ? 'Edit Closeout Form' : getStepTitle()}</DialogTitle>
          <DialogDescription>
            {editForm ? 'Make changes to the closeout form and resubmit.' : getStepDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && !editForm && (
          <ClientSearchStep 
            onClientSelect={handleClientSelect}
            onNewClient={handleNewClient}
          />
        )}

        {step === 2 && selectedClient && !editForm && (
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
            onCancel={() => editForm ? handleClose() : setStep(2)}
          />
        )}
        
        {/* Only show footer for non-completion steps */}
        {step !== 3 && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            {step === 1 ? (
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
            ) : step === 2 ? (
              <>
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
              </>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CloseoutFormCreate;
