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
        clientName: 'Amit Kumar',
        signingPerson: 'Amit Kumar',
        signingEmail: 'amit.kumar@email.com',
        additionalEmails: [],
        isT1: true,
        isS216: false,
        isS116: false,
        isPaperFiled: false,
        installmentsRequired: true,
        personalTaxPayment: '$1,250.00',
        installmentAttachment: null
      },
      {
        id: '2',
        clientName: 'Rohit Kumar',
        signingPerson: 'Rohit Kumar',
        signingEmail: 'rohit.kumar@email.com',
        additionalEmails: [],
        isT1: true,
        isS216: false,
        isS116: false,
        isPaperFiled: false,
        installmentsRequired: false,
        personalTaxPayment: '$800.00',
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header */}
      <div className="bg-blue-600 text-white p-3">
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-semibold">Personal Tax Closeout Form</h1>
          <Button 
            onClick={addFamilyMember}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 text-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Family Member
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Top Controls */}
        <div className="bg-white rounded shadow-sm border p-3 mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="clientEmail" className="text-sm font-medium">Client Email</Label>
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
                  <Label className="text-xs font-medium text-gray-600">File Path</Label>
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
                    value={formData.billDetail}
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
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">Email</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Input
                            value={member.signingEmail}
                            onChange={(e) => updateFamilyMember(member.id, 'signingEmail', e.target.value)}
                            className="h-8 text-sm"
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
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Button variant="outline" className="w-full h-8 text-xs">
                            <Upload className="w-3 h-3 mr-1" />
                            Upload PDF
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">Auto-populates tax details below</p>
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
                      <td className="p-2 border font-medium text-xs">T1135</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Checkbox
                            checked={formData.t1135ForeignProperty}
                            onCheckedChange={(checked) => updateFormField('t1135ForeignProperty', checked)}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">T2091</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Checkbox
                            checked={formData.t2091PrincipalResidence}
                            onCheckedChange={(checked) => updateFormField('t2091PrincipalResidence', checked)}
                          />
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-2 border font-medium text-xs">T1032</td>
                      {formData.familyMembers.map((member) => (
                        <td key={member.id} className="p-2 border">
                          <Checkbox
                            checked={formData.t1032PensionSplit}
                            onCheckedChange={(checked) => updateFormField('t1032PensionSplit', checked)}
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
                            value={formData.taxesPayable}
                            onChange={(e) => updateFormField('taxesPayable', e.target.value)}
                            className="h-8 text-sm"
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
                            value={formData.amountOwing}
                            onChange={(e) => updateFormField('amountOwing', e.target.value)}
                            className="h-8 text-sm"
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
                            value={formData.hstPaymentDue}
                            onChange={(e) => updateFormField('hstPaymentDue', e.target.value)}
                            className="h-8 text-sm"
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