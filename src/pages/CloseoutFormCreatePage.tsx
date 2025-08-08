import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
import { fetchAdmins } from '@/services/api';

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
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [pendingFormData, setPendingFormData] = useState(null);
  
  // Get form for editing if ID provided
  const editForm = id ? forms.find(form => form.id === id) : null;

  // If editing, pre-populate data
  React.useEffect(() => {
    if (editForm) {
      setFormType('personal');
      handleClientSelect({ 
        id: `client-${editForm.signingEmail}`, 
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

  const openAdminModal = async () => {
    setShowAdminModal(true);
    try {
      const adminList = await fetchAdmins();
      setAdmins(adminList);
      
      // Set Laureen as default selected admin
      const laureen = adminList.find(admin => admin.name === 'Laureen');
      if (laureen) {
        setSelectedAdmin(laureen);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleFormSubmit = async (formData: CloseoutFormTableData) => {
    setPendingFormData(formData);
    openAdminModal();
  };

  const handleAdminModalSubmit = async () => {
    if (!user || !selectedAdmin || !pendingFormData) {
      console.error('Missing required data:', { user: !!user, selectedAdmin: !!selectedAdmin, pendingFormData: !!pendingFormData });
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('DEBUG: Starting form submission with:', { user, selectedAdmin, pendingFormData });
      const mappedFormData = mapTableDataToCloseoutForm(pendingFormData, user, formType || 'personal');
      console.log('DEBUG: Mapped form data:', mappedFormData);
      
      // Assign the form to the selected admin
      mappedFormData.assignedTo = {
        id: selectedAdmin.id,
        name: selectedAdmin.name,
        role: selectedAdmin.role || 'admin',
      };

      console.log('DEBUG: Calling createForm with:', mappedFormData);
      await createForm(mappedFormData);
      console.log('DEBUG: Form created successfully');
      localStorage.removeItem(`form-draft-${user?.id}`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      // Show error to user
      alert(`Failed to submit form: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setShowAdminModal(false);
      setSelectedAdmin(null);
      setPendingFormData(null);
    }
  };

  const handleAdminModalCancel = () => {
    setShowAdminModal(false);
    setSelectedAdmin(null);
    setPendingFormData(null);
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
          (() => { console.log('DEBUG: extractedData passed to CloseoutFormTable:', extractedData); return null; })()
        )}
        {step === 4 && extractedData && (
          <CloseoutFormTable
            initialData={extractedData}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            showButtons={true}
            formType={formType || 'personal'}
            selectedClientEmail={selectedClient?.email}
            selectedClient={selectedClient}
            isNewClient={isNewClient}
          />
        )}
      </div>

            {showAdminModal && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-[60]">
          <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
            <div className="mb-4">
              <label className="font-medium mr-2">Submit to:</label>
              <select
                value={selectedAdmin?.id || ''}
                onChange={e => setSelectedAdmin(admins.find(a => a.id === e.target.value))}
                className="border rounded px-2 py-1 w-full mt-2"
              >
                <option value="" disabled>Select admin</option>
                {admins.map(admin => (
                  <option key={admin.id} value={admin.id}>{admin.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={handleAdminModalSubmit}
                disabled={!selectedAdmin || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                className="px-4 py-2 bg-gray-300 rounded"
                onClick={handleAdminModalCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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