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
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  
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
      // Pre-populate form with existing data - add missing id property for Client
      handleClientSelect({ 
        id: editForm.id || 'temp-id', 
        name: editForm.clientName, 
        email: editForm.signingEmail 
      });
      // Use proper field names that exist in CloseoutFormTableData
      handleDataExtracted({
        filePath: editForm.filePath,
        partner: editForm.partner,
        manager: editForm.manager,
        years: editForm.years,
        jobNumber: editForm.jobNumber,
        invoiceAmount: editForm.invoiceAmount,
        wipRecovery: editForm.wipRecovery,
        paymentRequired: editForm.paymentRequired,
        billDetail: editForm.billDetail,
        recoveryReason: editForm.recoveryReason,
        t2091PrincipalResidence: editForm.t2091PrincipalResidence,
        t1135ForeignProperty: editForm.t1135ForeignProperty,
        t1032PensionSplit: editForm.t1032PensionSplit,
        hstDraftOrFinal: editForm.hstDraftOrFinal,
        otherNotes: editForm.otherNotes,
        priorPeriodsBalance: editForm.priorPeriodsBalance,
        taxesPayable: editForm.taxesPayable,
        installmentsDuringYear: editForm.installmentsDuringYear,
        installmentsAfterYear: editForm.installmentsAfterYear,
        amountOwing: editForm.amountOwing,
        dueDate: editForm.dueDate,
        hstPriorBalance: editForm.hstPriorBalance,
        hstPayable: editForm.hstPayable,
        hstInstallmentsDuring: editForm.hstInstallmentsDuring,
        hstInstallmentsAfter: editForm.hstInstallmentsAfter,
        hstPaymentDue: editForm.hstPaymentDue,
        hstDueDate: editForm.hstDueDate,
        familyMembers: editForm.familyMembers || [{
          id: '1',
          clientName: editForm.clientName,
          signingPerson: editForm.signingPerson,
          signingEmail: editForm.signingEmail,
          additionalEmails: editForm.additionalEmails || [],
          isT1: editForm.isT1,
          isS216: editForm.isS216,
          isS116: editForm.isS116,
          isPaperFiled: editForm.isPaperFiled,
          installmentsRequired: editForm.installmentsRequired,
          personalTaxPayment: '$0.00',
          installmentAttachment: editForm.installmentAttachment
        }]
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

  // Check if we should show comparison view
  const shouldShowComparison = () => {
    const previousForms = getPreviousYearForms();
    return !isNewClient && previousForms.length > 0;
  };

  const handleFormSubmit = (formData: CloseoutFormTableData) => {
    if (!user) return;
    
    const mappedFormData = mapTableDataToCloseoutForm(formData, user);
    
    if (editForm) {
      // Update existing form - pass the complete form object with required properties
      const updatedFormData = {
        ...editForm,
        ...mappedFormData,
        status: 'pending' as const
      };
      updateForm(editForm.id, updatedFormData);
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

  // Determine if we should use full screen mode
  const isComparisonView = step === 3 && shouldShowComparison();
  const shouldUseFullScreen = isComparisonView;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={
        shouldUseFullScreen
          ? "w-screen h-screen max-w-none max-h-none m-0 rounded-none overflow-y-auto"
          : step === 3 
          ? "sm:max-w-7xl max-h-[90vh] overflow-y-auto" 
          : "sm:max-w-2xl"
      }>
        <DialogHeader className={shouldUseFullScreen ? "p-6 border-b" : ""}>
          <DialogTitle>{editForm ? 'Edit Closeout Form' : getStepTitle()}</DialogTitle>
          <DialogDescription>
            {editForm ? 'Make changes to the closeout form and resubmit.' : getStepDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className={shouldUseFullScreen ? "flex-1" : ""}>
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
        </div>
        
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
