import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Upload, Eye } from 'lucide-react';
import InstallmentAttachmentUpload from './InstallmentAttachmentUpload';
import FamilyMemberPDFUpload from './FamilyMemberPDFUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CloseoutFormView from './CloseoutFormView';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { mapTableDataToCloseoutForm } from './utils/formDataMapper';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Client } from './ClientSearch';

export interface FamilyMember {
  id: string;
  clientName: string;
  signingPerson: string;
  signingEmail: string;
  additionalEmails: string[];
  isT1: boolean;
  isS216: boolean;
  isS116: boolean;
  isPaperFiled: boolean;
  installmentsRequired: boolean;
  personalTaxPayment: string;
  installmentAttachment: {
    fileName: string;
    fileUrl: string;
    uploadedAt: string;
  } | null;
  // Add fields for Section 3 checkboxes
  isT1135?: boolean;
  isT2091?: boolean;
  isT1032?: boolean;
  // New fields for tax summary colors
  taxesPayableColor?: 'green' | 'red';
  amountOwingColor?: 'green' | 'red';
  // Add missing fields for mapping
  t1135ForeignProperty?: boolean;
  t1032PensionSplit?: boolean;
  otherNotes?: string;
  taxesPayable?: string;
  amountOwing?: string;
}

export interface CloseoutFormTableData {
  clientEmail: string;
  formType: 'personal' | 'corporate';
  filePath: string;
  partner: string;
  manager: string;
  years: string;
  jobNumber: string;
  invoiceAmount: string;
  billDetail: string;
  paymentRequired: boolean;
  wipRecovery: string;
  recoveryReason: string;
  familyMembers: FamilyMember[];
  
  // Filing Details for Personal Returns
  t2091PrincipalResidence: boolean;
  t1135ForeignProperty: boolean;
  t1032PensionSplit: boolean;
  hstDraftOrFinal: string;
  otherNotes: string;
  ontarioAnnualReturn: boolean;
  
  // T Slip specification
  tSlipType: string;
  
  // Additional Documentation
  otherDocuments: string;
  
  // Personal Tax Installments
  personalTaxInstallmentsRequired: boolean;
  hstInstallmentsRequired: boolean;
  
  // Outstanding Tax Balance
  outstandingTaxBalance: string;
  
  // T1 Summary fields
  priorPeriodsBalance: string;
  taxesPayable: string;
  installmentsDuringYear: string;
  installmentsAfterYear: string;
  amountOwing: string;
  
  // Due Dates
  taxPaymentDueDate: string;
  returnFilingDueDate: 'April 30' | 'June 15';
  
  // HST Summary fields
  hstPriorBalance: string;
  hstPayable: string;
  hstInstallmentsDuring: string;
  hstInstallmentsAfter: string;
  hstPaymentDue: string;
  hstDueDate: string;
  
  // Multi-year support
  yearlyAmounts: Array<{
    year: string;
    amountOwing: string;
    dueDate: string;
  }>;
}

interface CloseoutFormTableProps {
  initialData?: Partial<CloseoutFormTableData>;
  onSubmit: (data: CloseoutFormTableData) => void;
  onCancel: () => void;
  showButtons?: boolean;
  formType?: 'personal' | 'corporate';
  selectedClientEmail?: string;
  selectedClient?: Client;
  isNewClient?: boolean;
}

const CloseoutFormTable = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  showButtons = true,
  formType = 'personal',
  selectedClientEmail,
  selectedClient,
  isNewClient = false
}: CloseoutFormTableProps) => {
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail || selectedClientEmail || '');
  const [section2Email, setSection2Email] = useState(initialData?.familyMembers?.[0]?.signingEmail || selectedClientEmail || '');
  const [formData, setFormData] = useState<CloseoutFormTableData>({
    clientEmail: initialData?.clientEmail || '',
    formType: formType,
    // ONLY CHANGING VALUES - Using initialData or empty values
    filePath: initialData?.filePath || '',
    partner: initialData?.partner || '',
    manager: initialData?.manager || '',
    years: initialData?.years || '',
    jobNumber: initialData?.jobNumber || '',
    invoiceAmount: initialData?.invoiceAmount || '',
    billDetail: initialData?.billDetail || '',
    paymentRequired: initialData?.paymentRequired || false,
    wipRecovery: initialData?.wipRecovery || '',
    recoveryReason: initialData?.recoveryReason || '',
    familyMembers: initialData?.familyMembers || [
      {
        id: '1',
        clientName: '',
        signingPerson: '',
        signingEmail: '',
        additionalEmails: [],
        isT1: true,
        isS216: false,
        isS116: false,
        isPaperFiled: false,
        installmentsRequired: false,
        personalTaxPayment: '$0.00',
        installmentAttachment: null,
        isT1135: false,
        isT2091: false,
        isT1032: false
      }
    ],
    
    // Filing Details
    t2091PrincipalResidence: initialData?.t2091PrincipalResidence || false,
    t1135ForeignProperty: initialData?.t1135ForeignProperty || false,
    t1032PensionSplit: initialData?.t1032PensionSplit || false,
    hstDraftOrFinal: initialData?.hstDraftOrFinal || 'N/A',
    otherNotes: initialData?.otherNotes || '',
    ontarioAnnualReturn: initialData?.ontarioAnnualReturn || false,
    
    // T Slip specification
    tSlipType: initialData?.tSlipType || '',
    
    // Additional Documentation
    otherDocuments: initialData?.otherDocuments || '',
    
    // Personal Tax Installments
    personalTaxInstallmentsRequired: initialData?.personalTaxInstallmentsRequired || false,
    hstInstallmentsRequired: initialData?.hstInstallmentsRequired || false,
    
    // Outstanding Tax Balance
    outstandingTaxBalance: initialData?.outstandingTaxBalance || '$0.00',
    
    // T1 Summary fields
    priorPeriodsBalance: initialData?.priorPeriodsBalance || '0',
    taxesPayable: initialData?.taxesPayable || '0',
    installmentsDuringYear: initialData?.installmentsDuringYear || '0',
    installmentsAfterYear: initialData?.installmentsAfterYear || '0',
    amountOwing: initialData?.amountOwing || '0',
    
    // Due Dates
    taxPaymentDueDate: initialData?.taxPaymentDueDate || '',
    returnFilingDueDate: initialData?.returnFilingDueDate || 'April 30',
    
    // HST Summary fields
    hstPriorBalance: initialData?.hstPriorBalance || '0',
    hstPayable: initialData?.hstPayable || '0',
    hstInstallmentsDuring: initialData?.hstInstallmentsDuring || '0',
    hstInstallmentsAfter: initialData?.hstInstallmentsAfter || '0',
    hstPaymentDue: initialData?.hstPaymentDue || '0',
    hstDueDate: initialData?.hstDueDate || '',
    
    // Multi-year support
    yearlyAmounts: initialData?.yearlyAmounts || []
  });

  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuth();
  const { getPreviousYearForms } = useData();

  useEffect(() => {
    console.log('DEBUG: initialData.otherNotes in form table:', initialData?.otherNotes);
    console.log('DEBUG: formData.otherNotes in form table:', formData.otherNotes);
  }, [initialData, formData.otherNotes]);

  // Helper to check if a value is blank or default
  function isBlankOrDefault(val: string, def: string = '') {
    return !val || val.trim() === '' || val === def;
  }

  // Robust mapping: only set from selectedClientEmail if fields are blank or default
  useEffect(() => {
    if (selectedClientEmail) {
      setClientEmail(prev => (isBlankOrDefault(prev) ? selectedClientEmail : prev));
      setSection2Email(prev => (isBlankOrDefault(prev) ? selectedClientEmail : prev));
      setFormData(prev => ({
        ...prev,
        clientEmail: isBlankOrDefault(prev.clientEmail) ? selectedClientEmail : prev.clientEmail,
        familyMembers: prev.familyMembers.map((member, idx) =>
          idx === 0 ? { ...member, signingEmail: isBlankOrDefault(member.signingEmail) ? selectedClientEmail : member.signingEmail } : member
        )
      }));
    }
  }, [selectedClientEmail]);

  // 3. When clientEmail changes, update formData.clientEmail
  useEffect(() => {
    setFormData(prev => ({ ...prev, clientEmail }));
  }, [clientEmail]);

  // 4. When section2Email changes, update formData.familyMembers[0].signingEmail
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map((member, idx) =>
        idx === 0 ? { ...member, signingEmail: section2Email } : member
      )
    }));
  }, [section2Email]);

  // Add this useEffect after formData and updateFamilyMember are defined
  useEffect(() => {
    // Helper to parse currency or number strings
    function parseAmount(val: string | undefined): number {
      if (!val) return 0;
      // Remove currency symbols, commas, spaces
      return parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
    }
    setFormData(prev => {
      const updatedMembers = prev.familyMembers.map(member => {
        // Use member.taxesPayable if present, else fallback to prev.taxesPayable
        const priorPeriodsBalance = parseAmount(prev.priorPeriodsBalance);
        const taxesPayable = parseAmount(member.taxesPayable ?? prev.taxesPayable);
        const installmentsDuringYear = parseAmount(prev.installmentsDuringYear);
        const installmentsAfterYear = parseAmount(prev.installmentsAfterYear);
        const amountOwing = priorPeriodsBalance + taxesPayable - installmentsDuringYear - installmentsAfterYear;
        return {
          ...member,
          amountOwing: amountOwing === 0 ? '' : amountOwing.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })
        };
      });
      return { ...prev, familyMembers: updatedMembers };
    });
  }, [formData.familyMembers.map(m => m.taxesPayable).join(), formData.priorPeriodsBalance, formData.installmentsDuringYear, formData.installmentsAfterYear, formData.taxesPayable]);

  // Add this useEffect after the previous useEffect for amountOwing
  useEffect(() => {
    function parseAmount(val: string | undefined): number {
      if (!val) return 0;
      return parseFloat(val.replace(/[^\d.-]/g, '')) || 0;
    }
    setFormData(prev => {
      const hstPriorBalance = parseAmount(prev.hstPriorBalance);
      const hstPayable = parseAmount(prev.hstPayable);
      const hstInstallmentsDuring = parseAmount(prev.hstInstallmentsDuring);
      const hstInstallmentsAfter = parseAmount(prev.hstInstallmentsAfter);
      const hstPaymentDue = hstPriorBalance + hstPayable - hstInstallmentsDuring - hstInstallmentsAfter;
      return {
        ...prev,
        hstPaymentDue: hstPaymentDue === 0 ? '' : hstPaymentDue.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })
      };
    });
  }, [formData.hstPriorBalance, formData.hstPayable, formData.hstInstallmentsDuring, formData.hstInstallmentsAfter]);

  // Auto-set return filing due date based on HST Payable
  useEffect(() => {
    // Auto-set return filing due date based on HST Payable
    const hstPayableNum = parseFloat((formData.hstPayable || '0').toString().replace(/[^\d.\-]/g, ''));
    if (hstPayableNum > 0 && formData.returnFilingDueDate !== 'June 15') {
      setFormData(prev => ({ ...prev, returnFilingDueDate: 'June 15' }));
    } else if ((hstPayableNum === 0 || isNaN(hstPayableNum)) && formData.returnFilingDueDate !== 'April 30') {
      setFormData(prev => ({ ...prev, returnFilingDueDate: 'April 30' }));
    }
  }, [formData.hstPayable]);

  // Auto-sync HST Due Date with Return Filing Due Date
  useEffect(() => {
    setFormData(prev => ({ ...prev, hstDueDate: prev.returnFilingDueDate }));
  }, [formData.returnFilingDueDate]);

  // NEW: Auto-sync clientName with signingPerson for all family members
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => ({
        ...member,
        clientName: member.signingPerson || member.clientName
      }))
    }));
  }, [formData.familyMembers.map(m => m.signingPerson).join()]);

  // Handler for Section 2 PDF data extraction
  const handleSection2DataExtracted = (familyMemberIndex: number, extractedData: any) => {
    const updatedMembers = [...formData.familyMembers];
    const member = updatedMembers[familyMemberIndex];
    
    if (member) {
      // Update Section 2 - Client Details
      member.signingPerson = extractedData.signingPerson || member.signingPerson;
      member.signingEmail = extractedData.signingEmail || member.signingEmail;
      // Update Section 3 - Filing Details
      member.isT1135 = extractedData.isT1135;
      member.isT1032 = extractedData.isT1032;
      // T2091 will be handled later as mentioned
      // Also update the old field names for compatibility
      member.t1135ForeignProperty = extractedData.isT1135;
      member.t1032PensionSplit = extractedData.isT1032;
      // Update Other Notes field for deceased info
      member.otherNotes = extractedData.otherNotes || member.otherNotes;

      // Map only to taxesPayable, not amountOwing
      if (typeof extractedData.taxPayable48500 === 'number' && extractedData.taxPayable48500 !== null) {
        member.taxesPayable = extractedData.taxPayable48500.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
        member.taxesPayableColor = 'red';
      } else if (typeof extractedData.taxPayable48400 === 'number' && extractedData.taxPayable48400 !== null) {
        member.taxesPayable = extractedData.taxPayable48400.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });
        member.taxesPayableColor = 'green';
      }
      member.amountOwing = '';
      member.amountOwingColor = undefined;

      // Promote deceased note to top-level Other Notes if present
      setFormData(prev => ({
        ...prev,
        familyMembers: updatedMembers,
        otherNotes: extractedData.otherNotes && extractedData.otherNotes.includes('deceased')
          ? extractedData.otherNotes
          : prev.otherNotes
      }));
    }
  };

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      clientName: '',
      signingPerson: '',
      signingEmail: '',
      additionalEmails: [],
      isT1: true,
      isS216: false,
      isS116: false,
      isPaperFiled: false,
      installmentsRequired: false,
      personalTaxPayment: '$0.00',
      installmentAttachment: null,
      isT1135: false,
      isT2091: false,
      isT1032: false
    };
    const newId = (formData.familyMembers.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { ...newMember, id: newId }]
    }));
  };

  const removeFamilyMember = (id: string) => {
    if (formData.familyMembers.length > 1) {
      setFormData(prev => ({
        ...prev,
        familyMembers: prev.familyMembers.filter(member => member.id !== id)
      }));
    }
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: any) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => {
        if (member.id === id) {
          const updatedMember = { ...member, [field]: value };
          // If changing T1135, sync both fields
          if (field === 'isT1135' || field === 't1135ForeignProperty') {
            updatedMember.isT1135 = value;
            updatedMember.t1135ForeignProperty = value;
          }
          // If changing return type, reset others to false
          if (field === 'isT1' && value) {
            updatedMember.isS216 = false;
            updatedMember.isS116 = false;
          } else if (field === 'isS216' && value) {
            updatedMember.isT1 = false;
            updatedMember.isS116 = false;
          } else if (field === 'isS116' && value) {
            updatedMember.isT1 = false;
            updatedMember.isS216 = false;
          }
          
          if (field === 'installmentsRequired' && !value) {
            updatedMember.installmentAttachment = null;
          }
          
          return updatedMember;
        }
        return member;
      })
    }));
  };

  const updateFormField = (field: keyof Omit<CloseoutFormTableData, 'familyMembers'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log('DEBUG: CloseoutFormTable handleSubmit called with formData:', formData);
    
    // Validate required fields before submission
    const validationErrors: string[] = [];
    
    // 1. Validate Client Email (Top Controls)
    if (!clientEmail || clientEmail.trim() === '') {
      validationErrors.push('Client Email is required');
    }
    
    // 2. Validate File Path (Section 1: General Information)
    if (!formData.filePath || formData.filePath.trim() === '') {
      validationErrors.push('File Path is required');
    }
    
    // 3. Validate Section 2 Email (Section 2: Client Details)
    if (!section2Email || section2Email.trim() === '') {
      validationErrors.push('Email (Section 2) is required');
    }
    
    // 4. Validate ALL Family Members
    formData.familyMembers.forEach((member, index) => {
      if (!member.clientName?.trim()) {
        validationErrors.push(`Family Member ${index + 1}: Client Name is required`);
      }
      if (!member.signingPerson?.trim()) {
        validationErrors.push(`Family Member ${index + 1}: Signing Person is required`);
      }
      if (!member.signingEmail?.trim()) {
        validationErrors.push(`Family Member ${index + 1}: Email is required`);
      }
    });
    
    // If there are validation errors, show them and prevent submission
    if (validationErrors.length > 0) {
      const errorMessage = `Please fill in the following required fields:\n\n${validationErrors.join('\n')}`;
      alert(errorMessage);
      return; // Stop submission
    }
    
    // All validation passed - proceed with submission
    setShowPreview(false); // Close the preview modal first
    onSubmit(formData);
  };



  // Function to handle client selection or addition
  const handleClientSelected = (email: string) => {
    setClientEmail(email);
    setSection2Email(email);
  };

  // Function to handle viewing previous closeout form
  const handleViewPreviousForm = () => {
    if (!selectedClient) return;
    
    try {
      // Get previous forms for this client
      const previousForms = getPreviousYearForms(selectedClient.name);
      
      if (previousForms && previousForms.length > 0) {
        // Get the most recent form (first in the array)
        const lastForm = previousForms[0];
        
        // Open in new tab
        window.open(`/preview-form/${lastForm.id}`, '_blank');
      } else {
        alert('No previous closeout forms found for this client.');
      }
    } catch (error) {
      console.error('Error viewing previous form:', error);
      alert('Error viewing previous form. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header */}
      <div className="bg-blue-600 text-white p-3">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Personal Tax Closeout Form</h1>
          <div className="flex gap-2">
            {/* NEW: View Previous Closeout Form Button */}
            {selectedClient && !isNewClient && (
              <Button 
                onClick={handleViewPreviousForm}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 text-sm"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Previous Closeout Form
              </Button>
            )}
            <Button 
              onClick={addFamilyMember}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Family Member
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Top Controls */}
        <div className="bg-white rounded shadow-sm border p-3 mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="clientEmail" className="text-sm font-medium">
                Client Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clientEmail"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Enter client email"
                className="mt-1 h-8"
              />
            </div>
            <div>
              <Label htmlFor="returnType" className="text-sm font-medium">Return Type</Label>
              <Select value={formData.formType} onValueChange={(value: 'personal' | 'corporate') => updateFormField('formType', value)}>
                <SelectTrigger className="mt-1 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Filing Method</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center text-sm">
                  <input type="radio" name="filingMethod" value="electronic" defaultChecked className="mr-1" />
                  Electronic
                </label>
                <label className="flex items-center text-sm">
                  <input type="radio" name="filingMethod" value="paper" className="mr-1" />
                  Paper
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Family Member Tabs */}
        <div className="bg-white rounded shadow-sm border mb-4">
          <div className="border-b bg-gray-50">
            <div className="flex">
              {formData.familyMembers.map((member, index) => (
                <div
                  key={member.id}
                  className="px-4 py-2 border-r flex items-center gap-2 bg-blue-50 border-b-2 border-blue-600 text-blue-600"
                >
                  <span className="text-sm font-medium">{member.clientName || `Member ${index + 1}`}</span>
                  {index === 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Primary</span>
                  )}
                  {index > 0 && (
                    <button
                      onClick={() => removeFamilyMember(member.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content - Excel-like Layout */}
          <div className="p-4">
            {/* Section 1: General Information (Common for all) */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium mb-3">
                1. General Information
              </div>
              <div className="grid grid-cols-6 gap-3 text-sm">
                <div>
                  <Label className="text-xs font-medium text-gray-600">
                    File Path <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.filePath}
                    onChange={(e) => updateFormField('filePath', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Partner</Label>
                  <Input
                    value={formData.partner}
                    onChange={(e) => updateFormField('partner', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Manager</Label>
                  <Input
                    value={formData.manager}
                    onChange={(e) => updateFormField('manager', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Year(s)</Label>
                  <Input
                    value={formData.years}
                    onChange={(e) => updateFormField('years', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Job Number</Label>
                  <Input
                    value={formData.jobNumber}
                    onChange={(e) => updateFormField('jobNumber', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">Invoice Amount</Label>
                  <Input
                    value={formData.invoiceAmount}
                    onChange={(e) => updateFormField('invoiceAmount', e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm mt-3">
                <div className="col-span-2">
                  <Label className="text-xs font-medium text-gray-600">Final Bill Detail</Label>
                  <Textarea
                    value={formData.familyMembers[0]?.isT1 ? 'T1' : formData.familyMembers[0]?.isS216 ? 'S216' : formData.familyMembers[0]?.isS116 ? 'S116' : 'T1'}
                    onChange={(e) => updateFormField('billDetail', e.target.value)}
                    className="text-sm"
                    rows={2}
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-gray-600">WIP Recovery %</Label>
                  <Input
                    value={formData.wipRecovery}
                    onChange={(e) => updateFormField('wipRecovery', e.target.value)}
                    className="h-8 text-sm"
                  />
                  <label className="flex items-center mt-2">
                    <Checkbox
                      checked={formData.paymentRequired}
                      onCheckedChange={(checked) => updateFormField('paymentRequired', checked)}
                      className="mr-2"
                    />
                    <span className="text-xs">Payment Required Before Filing</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Section 2: Client Details & Tax Return Upload */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium mb-3">
                2. Client Details & Tax Return Upload
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 border text-xs font-medium text-gray-600 w-48">Field</th>
                      {formData.familyMembers.map((member, index) => (
                        <th key={member.id} className="text-left p-2 border text-xs font-medium text-gray-600 min-w-48">
                          {member.clientName || `Member ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Name of Person Signing</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={member.signingPerson}
                            onChange={(e) => updateFamilyMember(member.id, 'signingPerson', e.target.value)}
                            className="h-8 text-sm"
                            placeholder="Will be auto-filled from PDF"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">
                        Email <span className="text-red-500">*</span>
                      </td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={section2Email}
                            onChange={(e) => {
                              setSection2Email(e.target.value);
                              updateFamilyMember(formData.familyMembers[0].id, 'signingEmail', e.target.value);
                            }}
                            className="h-8 text-sm"
                            placeholder="Will be auto-filled from PDF"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Additional Emails</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <div className="space-y-1">
                            {member.additionalEmails.map((email, emailIndex) => (
                              <div key={emailIndex} className="flex gap-1">
                                <Input
                                  value={email}
                                  onChange={(e) => {
                                    const newEmails = [...member.additionalEmails];
                                    newEmails[emailIndex] = e.target.value;
                                    updateFamilyMember(member.id, 'additionalEmails', newEmails);
                                  }}
                                  className="h-7 text-xs"
                                  placeholder="Additional email"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newEmails = member.additionalEmails.filter((_, i) => i !== emailIndex);
                                    updateFamilyMember(member.id, 'additionalEmails', newEmails);
                                  }}
                                  className="h-7 w-7 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                updateFamilyMember(member.id, 'additionalEmails', [...member.additionalEmails, '']);
                              }}
                              className="h-7 text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Upload T1C1 PDF</td>
                      {formData.familyMembers.map((member, index) => (
                        <td key={member.id} className="p-2 border">
                          <FamilyMemberPDFUpload
                            familyMemberIndex={index}
                            familyMemberName={member.clientName || `Family Member ${index + 1}`}
                            onDataExtracted={handleSection2DataExtracted}
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3: Filing Details */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium mb-3">
                3. Filing Details
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 border text-xs font-medium text-gray-600 w-48">Field</th>
                      {formData.familyMembers.map((member, index) => (
                        <th key={member.id} className="text-left p-2 border text-xs font-medium text-gray-600 min-w-48">
                          {member.clientName || `Member ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Return Type</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Select 
                            value={member.isT1 ? 'T1' : member.isS216 ? 'S216' : member.isS116 ? 'S116' : 'T1'} 
                            onValueChange={(value) => {
                              updateFamilyMember(member.id, 'isT1', value === 'T1');
                              updateFamilyMember(member.id, 'isS216', value === 'S216');
                              updateFamilyMember(member.id, 'isS116', value === 'S116');
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="T1">T1</SelectItem>
                              <SelectItem value="S216">S216</SelectItem>
                              <SelectItem value="S116">S116</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">T1135 Foreign Property</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Checkbox
                            checked={member.isT1135 || false}
                            onCheckedChange={(checked) => updateFamilyMember(member.id, 'isT1135', checked)}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">T2091 Principal Residence</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Checkbox
                            checked={member.isT2091 || false}
                            onCheckedChange={(checked) => updateFamilyMember(member.id, 'isT2091', checked)}
                           // To be implemented later
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">T1032 Pension Split</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Checkbox
                            checked={member.isT1032 || false}
                            onCheckedChange={(checked) => updateFamilyMember(member.id, 'isT1032', checked)}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">HST Draft/Final</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Select value={formData.hstDraftOrFinal} onValueChange={(value) => updateFormField('hstDraftOrFinal', value)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="N/A">N/A</SelectItem>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Final">Final</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 4: Installments */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium mb-3">
                4. Installments
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 border text-xs font-medium text-gray-600 w-48">Field</th>
                      {formData.familyMembers.map((member, index) => (
                        <th key={member.id} className="text-left p-2 border text-xs font-medium text-gray-600 min-w-48">
                          {member.clientName || `Member ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Personal Tax Installments Required</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Checkbox
                            checked={member.installmentsRequired}
                            onCheckedChange={(checked) => updateFamilyMember(member.id, 'installmentsRequired', checked)}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">HST Installments Required</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Checkbox
                            checked={formData.hstInstallmentsRequired}
                            onCheckedChange={(checked) => updateFormField('hstInstallmentsRequired', checked)}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Upload Documents</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Button variant="outline" className="w-full h-8 text-xs mb-1">
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                          {member.installmentsRequired && (
                            <InstallmentAttachmentUpload
                              attachment={member.installmentAttachment}
                              onAttachmentChange={(attachment) => updateFamilyMember(member.id, 'installmentAttachment', attachment)}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: Documents */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium mb-3">
                5. Documents
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 border text-xs font-medium text-gray-600 w-48">Field</th>
                      {formData.familyMembers.map((member, index) => (
                        <th key={member.id} className="text-left p-2 border text-xs font-medium text-gray-600 min-w-48">
                          {member.clientName || `Member ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Other Documents</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Button variant="outline" className="w-full h-8 text-xs">
                            <Upload className="w-3 h-3 mr-1" />
                            Upload
                          </Button>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Other Notes</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Textarea
                            value={formData.otherNotes}
                            onChange={(e) => updateFormField('otherNotes', e.target.value)}
                            className="text-xs"
                            rows={2}
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 6: Personal Tax Summary */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium mb-3">
                6. Personal Tax Summary
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 border text-xs font-medium text-gray-600 w-48">Field</th>
                      {formData.familyMembers.map((member, index) => (
                        <th key={member.id} className="text-left p-2 border text-xs font-medium text-gray-600 min-w-48">
                          {member.clientName || `Member ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Prior Periods Balance</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.priorPeriodsBalance}
                            onChange={(e) => updateFormField('priorPeriodsBalance', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Taxes Payable</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={member.taxesPayable ?? ''}
                            onChange={(e) => updateFamilyMember(member.id, 'taxesPayable', e.target.value)}
                            className="h-8 text-sm"
                            style={{ color: member.taxesPayableColor === 'green' ? 'green' : 'red' }}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Installments During Year</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.installmentsDuringYear}
                            onChange={(e) => updateFormField('installmentsDuringYear', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Installments After Year</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.installmentsAfterYear}
                            onChange={(e) => updateFormField('installmentsAfterYear', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Amount Owing</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={member.amountOwing ?? ''}
                            onChange={(e) => updateFamilyMember(member.id, 'amountOwing', e.target.value)}
                            className="h-8 text-sm"
                            style={{ color: 'black' }}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Tax Payment Due Date</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.taxPaymentDueDate}
                            onChange={(e) => updateFormField('taxPaymentDueDate', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Return Filing Due Date</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Select value={formData.returnFilingDueDate} onValueChange={(value: 'April 30' | 'June 15') => updateFormField('returnFilingDueDate', value)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="April 30">April 30</SelectItem>
                              <SelectItem value="June 15">June 15</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 7: HST Summary */}
            <div className="mb-6">
              <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium mb-3">
                7. HST Summary
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2 border text-xs font-medium text-gray-600 w-48">Field</th>
                      {formData.familyMembers.map((member, index) => (
                        <th key={member.id} className="text-left p-2 border text-xs font-medium text-gray-600 min-w-48">
                          {member.clientName || `Member ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 border font-medium text-xs">HST Prior Balance</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.hstPriorBalance}
                            onChange={(e) => updateFormField('hstPriorBalance', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">HST Payable</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.hstPayable}
                            onChange={(e) => updateFormField('hstPayable', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">HST Installments During</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.hstInstallmentsDuring}
                            onChange={(e) => updateFormField('hstInstallmentsDuring', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">HST Installments After</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.hstInstallmentsAfter}
                            onChange={(e) => updateFormField('hstInstallmentsAfter', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">HST Payment Due</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.hstPaymentDue ?? ''}
                            onChange={(e) => updateFormField('hstPaymentDue', e.target.value)}
                            className="h-8 text-sm"
                            style={{ color: 'black' }}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">HST Due Date</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={formData.hstDueDate}
                            onChange={(e) => updateFormField('hstDueDate', e.target.value)}
                            className="h-8 text-sm"
                          />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        

        {/* Bottom Action Buttons */}
        {showButtons && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowPreview(true)}>Preview Form</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel}>Save Draft</Button>
              <Button onClick={() => setShowPreview(true)} className="bg-green-600 hover:bg-green-700">
                Submit Form
              </Button>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Preview Closeout Form</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>Close</Button>
                <Button 
                  onClick={handleSubmit} 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  Submit Form
                </Button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[70vh]">
              {user && (
                <CloseoutFormView form={{
                  id: 'preview',
                  clientName: formData.familyMembers[0]?.clientName || '',
                  filePath: formData.filePath,
                  signingPerson: formData.familyMembers[0]?.signingPerson || '',
                  signingEmail: formData.familyMembers[0]?.signingEmail || '',
                  additionalEmails: formData.familyMembers[0]?.additionalEmails || [],
                  partner: formData.partner,
                  manager: formData.manager,
                  years: formData.years,
                  jobNumber: formData.jobNumber,
                  invoiceAmount: formData.invoiceAmount,
                  invoiceDescription: formData.billDetail,
                  billDetail: formData.billDetail,
                  paymentRequired: formData.paymentRequired,
                  wipRecovery: formData.wipRecovery,
                  recoveryReason: formData.recoveryReason,
                  isT1: formData.familyMembers[0]?.isT1 || true,
                  isS216: formData.familyMembers[0]?.isS216 || false,
                  isS116: formData.familyMembers[0]?.isS116 || false,
                  isPaperFiled: false,
                  installmentsRequired: formData.familyMembers[0]?.installmentsRequired || false,
                  t106: false,
                  t1134: false,
                  ontarioAnnualReturn: formData.ontarioAnnualReturn,
                  tSlips: false,
                  quebecReturn: false,
                  albertaReturn: false,
                  t2091PrincipalResidence: formData.t2091PrincipalResidence,
                  t1135ForeignProperty: formData.t1135ForeignProperty,
                  t1032PensionSplit: formData.t1032PensionSplit,
                  hstDraftOrFinal: formData.hstDraftOrFinal,
                  otherNotes: formData.otherNotes,
                  otherDocuments: formData.otherDocuments,
                  corporateInstallmentsRequired: false,
                  fedScheduleAttached: false,
                  hstInstallmentRequired: formData.hstInstallmentsRequired,
                  hstTabCompleted: false,
                  priorPeriodsBalance: formData.priorPeriodsBalance,
                  taxesPayable: formData.taxesPayable,
                  installmentsDuringYear: formData.installmentsDuringYear,
                  installmentsAfterYear: formData.installmentsAfterYear,
                  amountOwing: formData.amountOwing,
                  dueDate: formData.taxPaymentDueDate,
                  hstPriorBalance: formData.hstPriorBalance,
                  hstPayable: formData.hstPayable,
                  hstInstallmentsDuring: formData.hstInstallmentsDuring,
                  hstInstallmentsAfter: formData.hstInstallmentsAfter,
                  hstPaymentDue: formData.hstPaymentDue,
                  hstDueDate: formData.hstDueDate,
                  installmentAttachment: formData.familyMembers[0]?.installmentAttachment || null,
                  familyMembers: formData.familyMembers,
                  status: 'pending',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  comments: [],
                  history: [],
                  createdBy: {
                    id: user.id,
                    name: user.name,
                    role: user.role
                  },
                  assignedTo: null
                }} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CloseoutFormTable;