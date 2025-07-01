import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Upload } from 'lucide-react';
import InstallmentAttachmentUpload from './InstallmentAttachmentUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}

export interface CloseoutFormTableData {
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
}

const CloseoutFormTable = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  showButtons = true,
  formType = 'personal' 
}: CloseoutFormTableProps) => {
  const [selectedMemberTab, setSelectedMemberTab] = useState<string>('1');
  const [clientEmail, setClientEmail] = useState('');
  const [formData, setFormData] = useState<CloseoutFormTableData>({
    formType: formType,
    filePath: initialData?.filePath || '\\\\Clearhouse\\Clients\\ClientName_2024\\T1',
    partner: initialData?.partner || 'Priya S.',
    manager: initialData?.manager || 'Deepak Jain',
    years: initialData?.years || '2024',
    jobNumber: initialData?.jobNumber || '10254-T1',
    invoiceAmount: initialData?.invoiceAmount || '$348 CAD',
    billDetail: initialData?.billDetail || 'Personal T1 + Foreign Income + Donation Sched.',
    paymentRequired: initialData?.paymentRequired || false,
    wipRecovery: initialData?.wipRecovery || '100%',
    recoveryReason: initialData?.recoveryReason || '',
    familyMembers: initialData?.familyMembers || [
      {
        id: '1',
        clientName: 'John Smith',
        signingPerson: 'John Smith',
        signingEmail: 'john.smith@email.com',
        additionalEmails: [],
        isT1: true,
        isS216: false,
        isS116: false,
        isPaperFiled: false,
        installmentsRequired: true,
        personalTaxPayment: '$1,250.00',
        installmentAttachment: null
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
      installmentAttachment: null
    };
    const newId = (formData.familyMembers.length + 1).toString();
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { ...newMember, id: newId }]
    }));
    setSelectedMemberTab(newId);
  };

  const removeFamilyMember = (id: string) => {
    if (formData.familyMembers.length > 1) {
      setFormData(prev => ({
        ...prev,
        familyMembers: prev.familyMembers.filter(member => member.id !== id)
      }));
      // Switch to first member if current selected is removed
      if (selectedMemberTab === id) {
        setSelectedMemberTab('1');
      }
    }
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: any) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => {
        if (member.id === id) {
          const updatedMember = { ...member, [field]: value };
          
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
    onSubmit(formData);
  };

  const currentMember = formData.familyMembers.find(m => m.id === selectedMemberTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Personal Tax Closeout Form</h1>
          <Button 
            onClick={addFamilyMember}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Family Member
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Top Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="clientEmail" className="text-sm font-medium">Client Email</Label>
              <Input
                id="clientEmail"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Enter client email"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="returnType" className="text-sm font-medium">Return Type</Label>
              <Select value={formData.formType} onValueChange={(value: 'personal' | 'corporate') => updateFormField('formType', value)}>
                <SelectTrigger className="mt-1">
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
                <label className="flex items-center">
                  <input type="radio" name="filingMethod" value="electronic" defaultChecked className="mr-2" />
                  Electronic
                </label>
                <label className="flex items-center">
                  <input type="radio" name="filingMethod" value="paper" className="mr-2" />
                  Paper
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Family Member Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <div className="flex">
              {formData.familyMembers.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedMemberTab(member.id)}
                  className={`px-4 py-3 border-r flex items-center gap-2 ${
                    selectedMemberTab === member.id 
                      ? 'bg-blue-50 border-b-2 border-blue-600 text-blue-600' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span>Member {index + 1}</span>
                  {index === 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Primary</span>
                  )}
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFamilyMember(member.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content - 2 Column Layout */}
          {currentMember && (
            <div className="p-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Left Column - Field Labels */}
                <div className="col-span-4 space-y-8">
                  {/* Section 1: Client Information */}
                  <div>
                    <h3 className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium mb-4">
                      1. Client Information
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>Client Name</div>
                      <div>Person for Signing</div>
                      <div>Email for Signing</div>
                      <div>Additional Emails for Package</div>
                      <div>Return Type</div>
                      <div>Paper Filed</div>
                      <div>Tax Installments Required</div>
                      <div>Personal Tax Payment</div>
                      <div>Upload Documents</div>
                    </div>
                  </div>

                  {/* Section 2: General Information */}
                  <div>
                    <h3 className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium mb-4">
                      2. General Information
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>File Path</div>
                      <div>Partner</div>
                      <div>Manager</div>
                      <div>Year(s)</div>
                      <div>Job Number</div>
                      <div>Invoice Amount</div>
                      <div>Bill Detail</div>
                      <div>Payment Required Before Filing</div>
                      <div>WIP Recovery %</div>
                    </div>
                  </div>

                  {/* Section 3: Filing Details */}
                  <div>
                    <h3 className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium mb-4">
                      3. Filing Details
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>T2091 Principal Residence</div>
                      <div>T1135 Foreign Property</div>
                      <div>T1032 Pension Split</div>
                      <div>HST Draft/Final</div>
                      <div>Other Notes</div>
                    </div>
                  </div>

                  {/* Section 4: T1 Summary */}
                  <div>
                    <h3 className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium mb-4">
                      4. T1 Summary
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>Prior Periods Balance</div>
                      <div>Taxes Payable</div>
                      <div>Installments During Year</div>
                      <div>Installments After Year</div>
                      <div>Amount Owing</div>
                      <div>Tax Payment Due Date</div>
                    </div>
                  </div>

                  {/* Section 5: HST Summary */}
                  <div>
                    <h3 className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium mb-4">
                      5. HST Summary
                    </h3>
                    <div className="space-y-4 text-sm">
                      <div>HST Prior Balance</div>
                      <div>HST Payable</div>
                      <div>HST Installments During</div>
                      <div>HST Installments After</div>
                      <div>HST Payment Due</div>
                      <div>HST Due Date</div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Form Fields */}
                <div className="col-span-8 space-y-8">
                  {/* Section 1: Client Information */}
                  <div>
                    <div className="h-10 mb-4"></div> {/* Spacer to align with section header */}
                    <div className="space-y-4">
                      <Input
                        value={currentMember.clientName}
                        onChange={(e) => updateFamilyMember(currentMember.id, 'clientName', e.target.value)}
                        placeholder="Enter client name"
                      />
                      <Input
                        value={currentMember.signingPerson}
                        onChange={(e) => updateFamilyMember(currentMember.id, 'signingPerson', e.target.value)}
                        placeholder="Enter signing person"
                      />
                      <Input
                        value={currentMember.signingEmail}
                        onChange={(e) => updateFamilyMember(currentMember.id, 'signingEmail', e.target.value)}
                        placeholder="Enter email for signing"
                      />
                      <div className="space-y-2">
                        {currentMember.additionalEmails.map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={email}
                              onChange={(e) => {
                                const newEmails = [...currentMember.additionalEmails];
                                newEmails[index] = e.target.value;
                                updateFamilyMember(currentMember.id, 'additionalEmails', newEmails);
                              }}
                              placeholder="Additional email"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newEmails = currentMember.additionalEmails.filter((_, i) => i !== index);
                                updateFamilyMember(currentMember.id, 'additionalEmails', newEmails);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            updateFamilyMember(currentMember.id, 'additionalEmails', [...currentMember.additionalEmails, '']);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Email
                        </Button>
                      </div>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <Checkbox
                            checked={currentMember.isT1}
                            onCheckedChange={(checked) => updateFamilyMember(currentMember.id, 'isT1', checked)}
                          />
                          <span className="ml-2">T1</span>
                        </label>
                        <label className="flex items-center">
                          <Checkbox
                            checked={currentMember.isS216}
                            onCheckedChange={(checked) => updateFamilyMember(currentMember.id, 'isS216', checked)}
                          />
                          <span className="ml-2">S216</span>
                        </label>
                        <label className="flex items-center">
                          <Checkbox
                            checked={currentMember.isS116}
                            onCheckedChange={(checked) => updateFamilyMember(currentMember.id, 'isS116', checked)}
                          />
                          <span className="ml-2">S116</span>
                        </label>
                      </div>
                      <label className="flex items-center">
                        <Checkbox
                          checked={currentMember.isPaperFiled}
                          onCheckedChange={(checked) => updateFamilyMember(currentMember.id, 'isPaperFiled', checked)}
                        />
                        <span className="ml-2">Paper Filed</span>
                      </label>
                      <label className="flex items-center">
                        <Checkbox
                          checked={currentMember.installmentsRequired}
                          onCheckedChange={(checked) => updateFamilyMember(currentMember.id, 'installmentsRequired', checked)}
                        />
                        <span className="ml-2">Tax Installments Required</span>
                      </label>
                      <Input
                        value={currentMember.personalTaxPayment}
                        onChange={(e) => updateFamilyMember(currentMember.id, 'personalTaxPayment', e.target.value)}
                        placeholder="$0.00"
                      />
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload T1C1 PDF
                        </Button>
                        <p className="text-xs text-gray-600">Auto-populates tax details below</p>
                        {currentMember.installmentsRequired && (
                          <InstallmentAttachmentUpload
                            attachment={currentMember.installmentAttachment}
                            onAttachmentChange={(attachment) => updateFamilyMember(currentMember.id, 'installmentAttachment', attachment)}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Section 2: General Information */}
                  <div>
                    <div className="h-10 mb-4"></div> {/* Spacer to align with section header */}
                    <div className="space-y-4">
                      <Input
                        value={formData.filePath}
                        onChange={(e) => updateFormField('filePath', e.target.value)}
                        placeholder="File path"
                      />
                      <Input
                        value={formData.partner}
                        onChange={(e) => updateFormField('partner', e.target.value)}
                        placeholder="Partner"
                      />
                      <Input
                        value={formData.manager}
                        onChange={(e) => updateFormField('manager', e.target.value)}
                        placeholder="Manager"
                      />
                      <Input
                        value={formData.years}
                        onChange={(e) => updateFormField('years', e.target.value)}
                        placeholder="Year(s)"
                      />
                      <Input
                        value={formData.jobNumber}
                        onChange={(e) => updateFormField('jobNumber', e.target.value)}
                        placeholder="Job number"
                      />
                      <Input
                        value={formData.invoiceAmount}
                        onChange={(e) => updateFormField('invoiceAmount', e.target.value)}
                        placeholder="Invoice amount"
                      />
                      <Textarea
                        value={formData.billDetail}
                        onChange={(e) => updateFormField('billDetail', e.target.value)}
                        placeholder="Bill detail"
                        rows={3}
                      />
                      <label className="flex items-center">
                        <Checkbox
                          checked={formData.paymentRequired}
                          onCheckedChange={(checked) => updateFormField('paymentRequired', checked)}
                        />
                        <span className="ml-2">Payment Required Before Filing</span>
                      </label>
                      <Input
                        value={formData.wipRecovery}
                        onChange={(e) => updateFormField('wipRecovery', e.target.value)}
                        placeholder="WIP Recovery %"
                      />
                    </div>
                  </div>

                  {/* Section 3: Filing Details */}
                  <div>
                    <div className="h-10 mb-4"></div> {/* Spacer to align with section header */}
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <Checkbox
                          checked={formData.t2091PrincipalResidence}
                          onCheckedChange={(checked) => updateFormField('t2091PrincipalResidence', checked)}
                        />
                        <span className="ml-2">T2091 Principal Residence</span>
                      </label>
                      <label className="flex items-center">
                        <Checkbox
                          checked={formData.t1135ForeignProperty}
                          onCheckedChange={(checked) => updateFormField('t1135ForeignProperty', checked)}
                        />
                        <span className="ml-2">T1135 Foreign Property</span>
                      </label>
                      <label className="flex items-center">
                        <Checkbox
                          checked={formData.t1032PensionSplit}
                          onCheckedChange={(checked) => updateFormField('t1032PensionSplit', checked)}
                        />
                        <span className="ml-2">T1032 Pension Split</span>
                      </label>
                      <Select value={formData.hstDraftOrFinal} onValueChange={(value) => updateFormField('hstDraftOrFinal', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="HST Draft/Final" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Final">Final</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea
                        value={formData.otherNotes}
                        onChange={(e) => updateFormField('otherNotes', e.target.value)}
                        placeholder="Other notes"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Section 4: T1 Summary */}
                  <div>
                    <div className="h-10 mb-4"></div> {/* Spacer to align with section header */}
                    <div className="space-y-4">
                      <Input
                        value={formData.priorPeriodsBalance}
                        onChange={(e) => updateFormField('priorPeriodsBalance', e.target.value)}
                        placeholder="Prior periods balance"
                      />
                      <Input
                        value={formData.taxesPayable}
                        onChange={(e) => updateFormField('taxesPayable', e.target.value)}
                        placeholder="Taxes payable"
                      />
                      <Input
                        value={formData.installmentsDuringYear}
                        onChange={(e) => updateFormField('installmentsDuringYear', e.target.value)}
                        placeholder="Installments during year"
                      />
                      <Input
                        value={formData.installmentsAfterYear}
                        onChange={(e) => updateFormField('installmentsAfterYear', e.target.value)}
                        placeholder="Installments after year"
                      />
                      <Input
                        value={formData.amountOwing}
                        onChange={(e) => updateFormField('amountOwing', e.target.value)}
                        placeholder="Amount owing"
                      />
                      <Input
                        value={formData.taxPaymentDueDate}
                        onChange={(e) => updateFormField('taxPaymentDueDate', e.target.value)}
                        placeholder="Tax payment due date"
                      />
                    </div>
                  </div>

                  {/* Section 5: HST Summary */}
                  <div>
                    <div className="h-10 mb-4"></div> {/* Spacer to align with section header */}
                    <div className="space-y-4">
                      <Input
                        value={formData.hstPriorBalance}
                        onChange={(e) => updateFormField('hstPriorBalance', e.target.value)}
                        placeholder="HST prior balance"
                      />
                      <Input
                        value={formData.hstPayable}
                        onChange={(e) => updateFormField('hstPayable', e.target.value)}
                        placeholder="HST payable"
                      />
                      <Input
                        value={formData.hstInstallmentsDuring}
                        onChange={(e) => updateFormField('hstInstallmentsDuring', e.target.value)}
                        placeholder="HST installments during"
                      />
                      <Input
                        value={formData.hstInstallmentsAfter}
                        onChange={(e) => updateFormField('hstInstallmentsAfter', e.target.value)}
                        placeholder="HST installments after"
                      />
                      <Input
                        value={formData.hstPaymentDue}
                        onChange={(e) => updateFormField('hstPaymentDue', e.target.value)}
                        placeholder="HST payment due"
                      />
                      <Input
                        value={formData.hstDueDate}
                        onChange={(e) => updateFormField('hstDueDate', e.target.value)}
                        placeholder="HST due date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Buttons */}
        {showButtons && (
          <div className="flex justify-between">
            <Button variant="outline">Preview Form</Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onCancel}>Save Draft</Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                Submit Form
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloseoutFormTable;