import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useAutoSave } from '@/hooks/useAutoSave';
import { UnsavedChangesDialog } from '@/components/ui/confirm-dialog';
import LoadingSpinner, { ButtonLoading } from '@/components/ui/loading';
import CloseoutFormTable, { CloseoutFormTableData } from '@/components/CloseoutForms/CloseoutFormTable';
import { useFormSteps } from '@/components/CloseoutForms/hooks/useFormSteps';
import { mapTableDataToCloseoutForm } from '@/components/CloseoutForms/utils/formDataMapper';
import FormTypeSelection from '@/components/CloseoutForms/FormTypeSelection';
import ClientSearchStep from '@/components/CloseoutForms/steps/ClientSearchStep';
import DocumentUploadStep from '@/components/CloseoutForms/steps/DocumentUploadStep';

const CloseoutFormCreatePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
  } = useFormSteps();

  const [formType, setFormType] = React.useState<'personal' | 'corporate' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // Get form for editing if ID provided
  const editForm = id ? forms.find(form => form.id === id) : null;

  // If editing, pre-populate data
  React.useEffect(() => {
    if (editForm) {
      setFormType('personal');
      handleClientSelect({ 
        id: editForm.id || 'temp-id', 
        name: editForm.clientName, 
        email: editForm.signingEmail 
      });
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
        ontarioAnnualReturn: editForm.ontarioAnnualReturn || false,
        personalTaxInstallmentsRequired: editForm.installmentsRequired || false,
        hstInstallmentsRequired: editForm.hstInstallmentRequired || false,
        priorPeriodsBalance: editForm.priorPeriodsBalance,
        taxesPayable: editForm.taxesPayable,
        installmentsDuringYear: editForm.installmentsDuringYear,
        installmentsAfterYear: editForm.installmentsAfterYear,
        amountOwing: editForm.amountOwing,
        taxPaymentDueDate: editForm.dueDate,
        returnFilingDueDate: 'April 30',
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
          isT1: editForm.isT1 || true,
          isS216: editForm.isS216 || false,
          isS116: editForm.isS116 || false,
          isPaperFiled: editForm.isPaperFiled || false,
          installmentsRequired: editForm.installmentsRequired || false,
          personalTaxPayment: '$0.00',
          installmentAttachment: editForm.installmentAttachment
        }]
      });
      setStep(4);
    }
  }, [editForm]);

  const handleFormTypeSelect = (type: 'personal' | 'corporate') => {
    setFormType(type);
    setStep(2);
  };

  // Auto-save functionality
  const { isAutoSaving, hasUnsavedChanges, manualSave } = useAutoSave({
    data: extractedData,
    onSave: async (data) => {
      // Save to localStorage as draft
      localStorage.setItem(`form-draft-${user?.id}`, JSON.stringify({
        formType,
        selectedClient,
        extractedData: data,
        timestamp: new Date().toISOString()
      }));
    },
    enabled: step === 4 && !!extractedData,
    delay: 2000
  });

  const handleFormSubmit = async (formData: CloseoutFormTableData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const mappedFormData = mapTableDataToCloseoutForm(formData, user, formType || 'personal');
      
      if (editForm) {
        const updatedFormData = {
          ...editForm,
          ...mappedFormData,
          status: 'pending' as const
        };
        updateForm(editForm.id, updatedFormData);
      } else {
        createForm(mappedFormData);
      }
      
      // Clear draft from localStorage
      localStorage.removeItem(`form-draft-${user?.id}`);
      
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges && step === 4) {
      setShowUnsavedDialog(true);
      setPendingNavigation('/dashboard');
    } else {
      resetForm();
      setFormType(null);
      navigate('/dashboard');
    }
  };

  const handleBackToDashboard = () => {
    if (hasUnsavedChanges && step === 4) {
      setShowUnsavedDialog(true);
      setPendingNavigation('/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const confirmNavigation = () => {
    resetForm();
    setFormType(null);
    localStorage.removeItem(`form-draft-${user?.id}`);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  const getPageTitle = () => {
    if (editForm) return 'Edit Closeout Form';
    if (step === 1) return 'Select Form Type';
    if (step === 2) return 'Search Client';
    if (step === 3) return 'Upload Documents';
    return 'Create Closeout Form';
  };

  return (
    <div className="min-h-screen bg-background">
          <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="border-l border-border h-6"></div>
              <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
            </div>
            
            {step === 4 && extractedData && (
              <div className="flex items-center gap-3">
                {isAutoSaving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LoadingSpinner size="sm" />
                    <span>Auto-saving...</span>
                  </div>
                )}
                {hasUnsavedChanges && !isAutoSaving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Unsaved changes</span>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={manualSave}
                  disabled={isAutoSaving || !hasUnsavedChanges}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Draft
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {step === 1 && !editForm && (
          <div className="max-w-2xl mx-auto">
            <FormTypeSelection onTypeSelect={handleFormTypeSelect} />
          </div>
        )}

        {step === 2 && !editForm && (
          <div className="max-w-2xl mx-auto">
            <ClientSearchStep 
              onClientSelect={handleClientSelect}
              onNewClient={handleNewClient}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        )}

        {step === 3 && selectedClient && !editForm && (
          <div className="max-w-2xl mx-auto">
            <DocumentUploadStep 
              selectedClient={selectedClient}
              onDataExtracted={handleDataExtracted}
            />
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </div>
        )}
        
        {step === 4 && extractedData && (
          <CloseoutFormTable
            initialData={extractedData}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            showButtons={true}
            formType={formType || 'personal'}
          />
        )}
      </div>

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onConfirm={confirmNavigation}
        onCancel={() => {
          setShowUnsavedDialog(false);
          setPendingNavigation(null);
        }}
      />
    </div>
  );
};

export default CloseoutFormCreatePage;