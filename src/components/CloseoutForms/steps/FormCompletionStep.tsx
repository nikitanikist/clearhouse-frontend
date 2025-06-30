import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X, Upload, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CloseoutFormTableData, FamilyMember } from '../CloseoutFormTable';
import { Client } from '../ClientSearch';
import { CloseoutForm } from '@/contexts/DataContext';

interface FormCompletionStepProps {
  extractedData: Partial<CloseoutFormTableData>;
  selectedClient: Client | { email: string; name?: string };
  isNewClient: boolean;
  previousForms: CloseoutForm[];
  onSubmit: (formData: CloseoutFormTableData) => void;
  onCancel: () => void;
  formType?: 'personal' | 'corporate';
}

const FormCompletionStep = ({ 
  extractedData, 
  selectedClient, 
  isNewClient, 
  previousForms, 
  onSubmit, 
  onCancel,
  formType = 'personal'
}: FormCompletionStepProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [filingMethod, setFilingMethod] = useState('efile');
  const [formData, setFormData] = useState<CloseoutFormTableData>({
    formType: formType,
    filePath: extractedData?.filePath || '\\\\Clearhouse\\Clients\\ClientName_2024\\T1',
    partner: extractedData?.partner || 'Priya S.',
    manager: extractedData?.manager || 'Deepak Jain',
    years: extractedData?.years || '2024',
    jobNumber: extractedData?.jobNumber || '10254-T1',
    invoiceAmount: extractedData?.invoiceAmount || '$348 CAD',
    billDetail: extractedData?.billDetail || 'Personal T1 + Foreign Income + Donation Sched.',
    paymentRequired: extractedData?.paymentRequired || false,
    wipRecovery: extractedData?.wipRecovery || '100%',
    recoveryReason: extractedData?.recoveryReason || '',
    familyMembers: extractedData?.familyMembers || [
      {
        id: '1',
        clientName: selectedClient && 'name' in selectedClient ? selectedClient.name || '' : '',
        signingPerson: selectedClient && 'name' in selectedClient ? selectedClient.name || '' : '',
        signingEmail: selectedClient?.email || '',
        additionalEmails: [],
        isT1: true,
        isS216: false,
        isS116: false,
        isPaperFiled: false,
        installmentsRequired: false,
        personalTaxPayment: '$0.00',
        installmentAttachment: null
      }
    ],
    t2091PrincipalResidence: extractedData?.t2091PrincipalResidence || false,
    t1135ForeignProperty: extractedData?.t1135ForeignProperty || false,
    t1032PensionSplit: extractedData?.t1032PensionSplit || false,
    hstDraftOrFinal: extractedData?.hstDraftOrFinal || 'Final',
    otherNotes: extractedData?.otherNotes || '',
    ontarioAnnualReturn: extractedData?.ontarioAnnualReturn || false,
    tSlipType: extractedData?.tSlipType || '',
    otherDocuments: extractedData?.otherDocuments || '',
    personalTaxInstallmentsRequired: extractedData?.personalTaxInstallmentsRequired || false,
    hstInstallmentsRequired: extractedData?.hstInstallmentsRequired || false,
    outstandingTaxBalance: extractedData?.outstandingTaxBalance || '$0.00',
    priorPeriodsBalance: extractedData?.priorPeriodsBalance || '0',
    taxesPayable: extractedData?.taxesPayable || '0',
    installmentsDuringYear: extractedData?.installmentsDuringYear || '0',
    installmentsAfterYear: extractedData?.installmentsAfterYear || '0',
    amountOwing: extractedData?.amountOwing || '0',
    taxPaymentDueDate: extractedData?.taxPaymentDueDate || '',
    returnFilingDueDate: extractedData?.returnFilingDueDate || 'April 30',
    hstPriorBalance: extractedData?.hstPriorBalance || '0',
    hstPayable: extractedData?.hstPayable || '0',
    hstInstallmentsDuring: extractedData?.hstInstallmentsDuring || '0',
    hstInstallmentsAfter: extractedData?.hstInstallmentsAfter || '0',
    hstPaymentDue: extractedData?.hstPaymentDue || '0',
    hstDueDate: extractedData?.hstDueDate || '',
    yearlyAmounts: extractedData?.yearlyAmounts || []
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
      isPaperFiled: filingMethod === 'paper',
      installmentsRequired: false,
      personalTaxPayment: '$0.00',
      installmentAttachment: null
    };
    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMember]
    }));
  };

  const removeFamilyMember = (id: string) => {
    if (formData.familyMembers.length > 1) {
      setFormData(prev => ({
        ...prev,
        familyMembers: prev.familyMembers.filter(member => member.id !== id)
      }));
      if (activeTab >= formData.familyMembers.length - 1) {
        setActiveTab(0);
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

  const getReturnType = (member: FamilyMember) => {
    if (member.isT1) return 'T1 - Personal Tax Return';
    if (member.isS216) return 'S216 - Non-Resident Tax Return';
    if (member.isS116) return 'S116 - Emigration Tax Return';
    return 'T1 - Personal Tax Return';
  };

  const FormSection = ({ title, children, bgColor = 'bg-blue-600' }: { title: string; children: React.ReactNode; bgColor?: string }) => (
    <div className="mb-6">
      <div className={`${bgColor} text-white px-4 py-2 rounded-t-lg`}>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="border border-t-0 rounded-b-lg p-4 bg-white">
        {children}
      </div>
    </div>
  );

  const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="grid grid-cols-12 gap-4 items-center py-2 border-b border-gray-100 last:border-b-0">
      <div className="col-span-3 text-right">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      </div>
      <div className="col-span-9">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${formData.familyMembers.length}, 1fr)` }}>
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-lg flex justify-between items-center">
        <h1 className="text-2xl font-bold">Personal Tax Closeout Form</h1>
        <Button onClick={addFamilyMember} className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Family Member
        </Button>
      </div>

      {/* Top Form Controls */}
      <div className="bg-white p-4 rounded-lg border grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Client Email</Label>
          <Input value={selectedClient?.email || ''} disabled className="bg-gray-50" />
        </div>
        <div className="space-y-2">
          <Label>Return Type</Label>
          <Select value="T1" disabled>
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="T1 - Personal Tax Return" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="T1">T1 - Personal Tax Return</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Filing Method</Label>
          <RadioGroup value={filingMethod} onValueChange={setFilingMethod} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="efile" id="efile" />
              <Label htmlFor="efile">E-file</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paper" id="paper" />
              <Label htmlFor="paper">Paper file</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Family Member Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 p-2">
            {formData.familyMembers.map((member, index) => (
              <button
                key={member.id}
                onClick={() => setActiveTab(index)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium flex items-center space-x-2 ${
                  activeTab === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{member.clientName || `Member ${index + 1}`}</span>
                {index === 0 && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Primary
                  </span>
                )}
                {index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFamilyMember(member.id);
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* General Information */}
          <FormSection title="1. General Information">
            <FieldRow label="File Path">
              {formData.familyMembers.map((member, index) => (
                <Input
                  key={member.id}
                  value={formData.filePath}
                  onChange={(e) => updateFormField('filePath', e.target.value)}
                  disabled={index > 0}
                  className={index > 0 ? 'bg-gray-50' : ''}
                />
              ))}
            </FieldRow>
            <FieldRow label="Partner">
              {formData.familyMembers.map((member, index) => (
                <Input
                  key={member.id}
                  value={formData.partner}
                  onChange={(e) => updateFormField('partner', e.target.value)}
                  disabled={index > 0}
                  className={index > 0 ? 'bg-gray-50' : ''}
                />
              ))}
            </FieldRow>
            <FieldRow label="Manager">
              {formData.familyMembers.map((member, index) => (
                <Input
                  key={member.id}
                  value={formData.manager}
                  onChange={(e) => updateFormField('manager', e.target.value)}
                  disabled={index > 0}
                  className={index > 0 ? 'bg-gray-50' : ''}
                />
              ))}
            </FieldRow>
            <FieldRow label="Year(s)">
              {formData.familyMembers.map((member, index) => (
                <Input
                  key={member.id}
                  value={formData.years}
                  onChange={(e) => updateFormField('years', e.target.value)}
                  disabled={index > 0}
                  className={index > 0 ? 'bg-gray-50' : ''}
                />
              ))}
            </FieldRow>
            <FieldRow label="Job #">
              {formData.familyMembers.map((member, index) => (
                <Input
                  key={member.id}
                  value={formData.jobNumber}
                  onChange={(e) => updateFormField('jobNumber', e.target.value)}
                  disabled={index > 0}
                  className={index > 0 ? 'bg-gray-50' : ''}
                />
              ))}
            </FieldRow>
            <FieldRow label="Invoice Amount">
              {formData.familyMembers.map((member, index) => (
                <Input
                  key={member.id}
                  value={formData.invoiceAmount}
                  onChange={(e) => updateFormField('invoiceAmount', e.target.value)}
                  disabled={index > 0}
                  className={index > 0 ? 'bg-gray-50' : ''}
                />
              ))}
            </FieldRow>
            <FieldRow label="Payment Required?">
              {formData.familyMembers.map((member, index) => (
                <div key={member.id} className="flex items-center">
                  <Checkbox
                    checked={formData.paymentRequired}
                    onCheckedChange={(checked) => updateFormField('paymentRequired', checked)}
                    disabled={index > 0}
                  />
                </div>
              ))}
            </FieldRow>
          </FormSection>

          {/* Client Details & Tax Return Upload */}
          <FormSection title="2. Client Details & Tax Return Upload">
            <FieldRow label="Name of Person">
              {formData.familyMembers.map((member) => (
                <Input
                  key={member.id}
                  value={member.clientName}
                  onChange={(e) => updateFamilyMember(member.id, 'clientName', e.target.value)}
                  placeholder="Enter name"
                />
              ))}
            </FieldRow>
            <FieldRow label="Email of Person">
              {formData.familyMembers.map((member) => (
                <Input
                  key={member.id}
                  value={member.signingEmail}
                  onChange={(e) => updateFamilyMember(member.id, 'signingEmail', e.target.value)}
                  placeholder="Enter email"
                  type="email"
                />
              ))}
            </FieldRow>
            <FieldRow label="Upload PDF">
              {formData.familyMembers.map((member) => (
                <div key={member.id} className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload PDF
                  </Button>
                  <p className="text-xs text-gray-500">Auto-populates form fields</p>
                </div>
              ))}
            </FieldRow>
          </FormSection>

          {/* Filing Details */}
          <FormSection title="3. Filing Details">
            <FieldRow label="Return Type">
              {formData.familyMembers.map((member) => (
                <Select
                  key={member.id}
                  value={member.isT1 ? 'T1' : member.isS216 ? 'S216' : 'S116'}
                  onValueChange={(value) => {
                    updateFamilyMember(member.id, 'isT1', value === 'T1');
                    updateFamilyMember(member.id, 'isS216', value === 'S216');
                    updateFamilyMember(member.id, 'isS116', value === 'S116');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T1">T1</SelectItem>
                    <SelectItem value="S216">S216</SelectItem>
                    <SelectItem value="S116">S116</SelectItem>
                  </SelectContent>
                </Select>
              ))}
            </FieldRow>
            <FieldRow label="T1135 Foreign Prop">
              {formData.familyMembers.map((member) => (
                <div key={member.id} className="flex items-center">
                  <Checkbox
                    checked={formData.t1135ForeignProperty}
                    onCheckedChange={(checked) => updateFormField('t1135ForeignProperty', checked)}
                  />
                </div>
              ))}
            </FieldRow>
            <FieldRow label="T2091 Principal Res">
              {formData.familyMembers.map((member) => (
                <div key={member.id} className="flex items-center">
                  <Checkbox
                    checked={formData.t2091PrincipalResidence}
                    onCheckedChange={(checked) => updateFormField('t2091PrincipalResidence', checked)}
                  />
                </div>
              ))}
            </FieldRow>
            <FieldRow label="HST Draft/Final">
              {formData.familyMembers.map((member) => (
                <Select
                  key={member.id}
                  value={formData.hstDraftOrFinal}
                  onValueChange={(value) => updateFormField('hstDraftOrFinal', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Final">Final</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="N/A">N/A</SelectItem>
                  </SelectContent>
                </Select>
              ))}
            </FieldRow>
          </FormSection>

          {/* Personal Tax Summary */}
          <FormSection title="6. Personal Tax Summary">
            <FieldRow label="Prior Balance">
              {formData.familyMembers.map((member) => (
                <Input
                  key={member.id}
                  value={formData.priorPeriodsBalance}
                  onChange={(e) => updateFormField('priorPeriodsBalance', e.target.value)}
                  placeholder="$0.00"
                />
              ))}
            </FieldRow>
            <FieldRow label="Taxes Payable">
              {formData.familyMembers.map((member) => (
                <Input
                  key={member.id}
                  value={formData.taxesPayable}
                  onChange={(e) => updateFormField('taxesPayable', e.target.value)}
                  placeholder="$0.00"
                />
              ))}
            </FieldRow>
            <FieldRow label="Amount Owing">
              {formData.familyMembers.map((member) => (
                <Input
                  key={member.id}
                  value={formData.amountOwing}
                  onChange={(e) => updateFormField('amountOwing', e.target.value)}
                  placeholder="$0.00"
                />
              ))}
            </FieldRow>
          </FormSection>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between">
        <Button variant="outline" className="flex items-center">
          <Eye className="mr-2 h-4 w-4" />
          Preview Form
        </Button>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={onCancel}>
            Save Draft
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            Submit Form
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormCompletionStep;
