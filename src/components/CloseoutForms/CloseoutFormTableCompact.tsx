import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { CloseoutFormTableData } from './CloseoutFormTable';
import FamilyMemberPDFUpload from './FamilyMemberPDFUpload';

interface FamilyMember {
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
  installmentAttachment?: { fileName: string; fileUrl: string; uploadedAt: string; } | string;
  priorPeriodsBalance?: string;
  taxesPayable?: string;
  installmentsDuringYear?: string;
  installmentsAfterYear?: string;
  amountOwing?: string;
  taxPaymentDueDate?: string;
  returnFilingDueDate?: string;
  hstPriorBalance?: string;
  hstPayable?: string;
  hstInstallmentsDuring?: string;
  hstInstallmentsAfter?: string;
  hstPaymentDue?: string;
  hstDueDate?: string;
  t2091PrincipalResidence?: boolean;
  t1135ForeignProperty?: boolean;
  t1032PensionSplit?: boolean;
  hstDraftOrFinal?: string;
  personalTaxInstallmentsRequired?: boolean;
  hstInstallmentsRequired?: boolean;
  otherDocuments?: string;
  otherNotes?: string;
  // Add fields for PDF extracted values
  isT1135?: boolean;
  isT2091?: boolean;
  isT1032?: boolean;
}

interface CloseoutFormTableCompactProps {
  initialData?: Partial<CloseoutFormTableData>;
  onSubmit: (data: CloseoutFormTableData) => void;
  onCancel: () => void;
  showButtons?: boolean;
  formType?: 'personal' | 'corporate';
}

const CloseoutFormTableCompact = ({
  initialData,
  onSubmit,
  onCancel,
  showButtons = true,
  formType = 'personal'
}: CloseoutFormTableCompactProps) => {
  // General Information (applies to all family members)
  const [generalInfo, setGeneralInfo] = useState({
    filePath: initialData?.filePath || '', // Should be empty for manual entry
    partner: initialData?.partner || '',
    manager: initialData?.manager || '',
    years: initialData?.years || '',
    jobNumber: initialData?.jobNumber || '', // Should be just number without -T1
    invoiceAmount: initialData?.invoiceAmount || '',
    billDetail: initialData?.billDetail || '', // Should be empty, not pre-filled
    wipRecovery: initialData?.wipRecovery || '',
    paymentRequired: initialData?.paymentRequired || false,
  });

  // Family members data
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
    initialData?.familyMembers || [
      {
        id: '1',
        clientName: '', // Empty for manual entry
        signingPerson: '', // Empty - NOT "Job Type"
        signingEmail: '', // Empty for manual entry
        additionalEmails: [],
        isT1: true,
        isS216: false,
        isS116: false,
        isPaperFiled: false,
        installmentsRequired: false,
        personalTaxPayment: '$0.00',
        priorPeriodsBalance: '$0.00',
        taxesPayable: '$0.00',
        installmentsDuringYear: '$0.00',
        installmentsAfterYear: '$0.00',
        amountOwing: '$0.00',
        taxPaymentDueDate: '',
        returnFilingDueDate: 'April 30',
        hstPriorBalance: '$0.00',
        hstPayable: '$0.00',
        hstInstallmentsDuring: '$0.00',
        hstInstallmentsAfter: '$0.00',
        hstPaymentDue: '$0.00',
        hstDueDate: '',
        t2091PrincipalResidence: false,
        t1135ForeignProperty: false,
        t1032PensionSplit: false,
        hstDraftOrFinal: 'Draft',
        personalTaxInstallmentsRequired: false,
        hstInstallmentsRequired: false,
        otherDocuments: '',
        otherNotes: '',
        // Initialize checkbox fields
        isT1135: false,
        isT2091: false,
        isT1032: false
      }
    ]
  );

  const [activeTab, setActiveTab] = useState('0');

  // Handler for Section 2 PDF data extraction
  const handleSection2DataExtracted = (familyMemberIndex: number, extractedData: any) => {
    const updatedMembers = [...familyMembers];
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
      setFamilyMembers(updatedMembers);
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
      priorPeriodsBalance: '$0.00',
      taxesPayable: '$0.00',
      installmentsDuringYear: '$0.00',
      installmentsAfterYear: '$0.00',
      amountOwing: '$0.00',
      taxPaymentDueDate: '',
      returnFilingDueDate: 'April 30',
      hstPriorBalance: '$0.00',
      hstPayable: '$0.00',
      hstInstallmentsDuring: '$0.00',
      hstInstallmentsAfter: '$0.00',
      hstPaymentDue: '$0.00',
      hstDueDate: '',
      t2091PrincipalResidence: false,
      t1135ForeignProperty: false,
      t1032PensionSplit: false,
      hstDraftOrFinal: 'Draft',
      personalTaxInstallmentsRequired: false,
      hstInstallmentsRequired: false,
      otherDocuments: '',
      otherNotes: '',
      isT1135: false,
      isT2091: false,
      isT1032: false
    };
    setFamilyMembers([...familyMembers, newMember]);
    setActiveTab((familyMembers.length).toString());
  };

  const removeFamilyMember = (index: number) => {
    if (familyMembers.length > 1) {
      const newMembers = familyMembers.filter((_, i) => i !== index);
      setFamilyMembers(newMembers);
      if (parseInt(activeTab) >= newMembers.length) {
        setActiveTab((newMembers.length - 1).toString());
      }
    }
  };

  const updateFamilyMember = (index: number, field: keyof FamilyMember, value: any) => {
    const newMembers = [...familyMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    
    // Keep the fields synchronized
    if (field === 'isT1135') {
      newMembers[index].t1135ForeignProperty = value;
    } else if (field === 't1135ForeignProperty') {
      newMembers[index].isT1135 = value;
    } else if (field === 'isT1032') {
      newMembers[index].t1032PensionSplit = value;
    } else if (field === 't1032PensionSplit') {
      newMembers[index].isT1032 = value;
    }
    
    setFamilyMembers(newMembers);
  };

  const handleSubmit = () => {
    const formData = {
      ...generalInfo,
      familyMembers,
      formType,
      recoveryReason: '',
      t2091PrincipalResidence: false,
      t1135ForeignProperty: false,
      t1032PensionSplit: false,
      hstDraftOrFinal: 'Draft',
      otherNotes: '',
      ontarioAnnualReturn: false,
      tSlipType: '',
      otherDocuments: '',
      personalTaxInstallmentsRequired: false,
      hstInstallmentsRequired: false,
      outstandingTaxBalance: '$0.00'
    } as CloseoutFormTableData;
    onSubmit(formData);
  };

  const currentMember = familyMembers[parseInt(activeTab)];

  return (
    <div className="w-full space-y-4">
      {/* General Information Section */}
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-3 text-primary border-b border-border pb-2">
          1. General Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">File Path</Label>
            <Input
              value={generalInfo.filePath}
              onChange={(e) => setGeneralInfo(prev => ({ ...prev, filePath: e.target.value }))}
              className="h-8"
              placeholder="Enter file path manually"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Partner</Label>
            <Input
              value={generalInfo.partner}
              onChange={(e) => setGeneralInfo(prev => ({ ...prev, partner: e.target.value }))}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Manager</Label>
            <Input
              value={generalInfo.manager}
              onChange={(e) => setGeneralInfo(prev => ({ ...prev, manager: e.target.value }))}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Year</Label>
            <Input
              value={generalInfo.years}
              onChange={(e) => setGeneralInfo(prev => ({ ...prev, years: e.target.value }))}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Job#</Label>
            <Input
              value={generalInfo.jobNumber}
              onChange={(e) => setGeneralInfo(prev => ({ ...prev, jobNumber: e.target.value }))}
              className="h-8"
              placeholder="e.g. 10254"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Invoice Amount</Label>
            <Input
              value={generalInfo.invoiceAmount}
              onChange={(e) => setGeneralInfo(prev => ({ ...prev, invoiceAmount: e.target.value }))}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Final Bill Detail</Label>
            <Input
              value={generalInfo.billDetail}
              onChange={(e) => setGeneralInfo(prev => ({ ...prev, billDetail: e.target.value }))}
              className="h-8"
              placeholder="Enter bill details"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium">WIP Recovery %</Label>
            <Input
              value={generalInfo.wipRecovery}
              onChange={(e) => setGeneralInfo(prev => ({ ...prev, wipRecovery: e.target.value }))}
              className="h-8"
            />
          </div>
          <div className="flex items-center space-x-2 pt-5">
            <Checkbox
              checked={generalInfo.paymentRequired}
              onCheckedChange={(checked) => setGeneralInfo(prev => ({ ...prev, paymentRequired: !!checked }))}
            />
            <Label className="text-xs font-medium">Payment Required</Label>
          </div>
        </div>
      </Card>

      {/* Family Members Tabs */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-primary">2. Client Details & Tax Return Upload</h3>
          <Button
            size="sm"
            variant="outline"
            onClick={addFamilyMember}
            className="h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Member
          </Button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3">
          <p className="text-xs text-amber-800">
            <strong>Note:</strong> Upload individual tax returns for each family member to auto-populate their details
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {familyMembers.map((member, index) => (
              <TabsTrigger 
                key={member.id} 
                value={index.toString()}
                className="relative pr-8"
              >
                {member.clientName || `Member ${index + 1}`}
                {familyMembers.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFamilyMember(index);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-2 w-2" />
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {familyMembers.map((member, index) => (
            <TabsContent key={member.id} value={index.toString()} className="space-y-4">
              {/* PDF Upload Section - NEW */}
              <div className="mb-4">
                <FamilyMemberPDFUpload
                  familyMemberIndex={index}
                  familyMemberName={member.clientName || `Family Member ${index + 1}`}
                  onDataExtracted={handleSection2DataExtracted}
                />
              </div>

              {/* Client Details Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  Client Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Name of Person Signing</Label>
                    <Input
                      value={member.signingPerson}
                      onChange={(e) => updateFamilyMember(index, 'signingPerson', e.target.value)}
                      className="h-8"
                      placeholder="Will be auto-filled from PDF"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Email</Label>
                    <Input
                      value={member.signingEmail}
                      onChange={(e) => updateFamilyMember(index, 'signingEmail', e.target.value)}
                      className="h-8"
                      placeholder="Will be auto-filled from PDF"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Client Name</Label>
                    <Input
                      value={member.clientName}
                      onChange={(e) => updateFamilyMember(index, 'clientName', e.target.value)}
                      className="h-8"
                      placeholder="Enter client name"
                    />
                  </div>
                </div>
              </div>

              {/* Filing Details Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  3. Filing Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Return Type</Label>
                    <div className="flex gap-2">
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          checked={member.isT1}
                          onCheckedChange={(checked) => updateFamilyMember(index, 'isT1', !!checked)}
                        />
                        <Label className="text-xs">T1</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          checked={member.isS216}
                          onCheckedChange={(checked) => updateFamilyMember(index, 'isS216', !!checked)}
                        />
                        <Label className="text-xs">S216</Label>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Checkbox
                          checked={member.isS116}
                          onCheckedChange={(checked) => updateFamilyMember(index, 'isS116', !!checked)}
                        />
                        <Label className="text-xs">S116</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={member.isT1135 || false}
                      onCheckedChange={(checked) => updateFamilyMember(index, 'isT1135', !!checked)}
                    />
                    <Label className="text-xs font-medium">T1135 Foreign Property</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={member.isT2091 || false}
                      onCheckedChange={(checked) => updateFamilyMember(index, 'isT2091', !!checked)}
                      disabled // To be implemented later
                    />
                    <Label className="text-xs font-medium text-gray-400">T2091 Principal Residence</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={member.isT1032 || false}
                      onCheckedChange={(checked) => updateFamilyMember(index, 'isT1032', !!checked)}
                    />
                    <Label className="text-xs font-medium">T1032 Pension Split</Label>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Draft/Final</Label>
                    <Select
                      value={member.hstDraftOrFinal}
                      onValueChange={(value) => updateFamilyMember(index, 'hstDraftOrFinal', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Installments Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  4. Installments
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={member.personalTaxInstallmentsRequired || false}
                      onCheckedChange={(checked) => updateFamilyMember(index, 'personalTaxInstallmentsRequired', !!checked)}
                    />
                    <Label className="text-xs font-medium">Personal Tax Installments Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={member.hstInstallmentsRequired || false}
                      onCheckedChange={(checked) => updateFamilyMember(index, 'hstInstallmentsRequired', !!checked)}
                    />
                    <Label className="text-xs font-medium">HST Installments Required</Label>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  5. Documents
                </h4>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Other Notes</Label>
                    <Textarea
                      value={member.otherNotes || ''}
                      onChange={(e) => updateFamilyMember(index, 'otherNotes', e.target.value)}
                      className="text-xs"
                      rows={2}
                      placeholder="Enter any additional notes"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Tax Summary Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  6. Personal Tax Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Prior Periods Balance</Label>
                    <Input
                      value={member.priorPeriodsBalance || ''}
                      onChange={(e) => updateFamilyMember(index, 'priorPeriodsBalance', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Taxes Payable</Label>
                    <Input
                      value={member.taxesPayable || ''}
                      onChange={(e) => updateFamilyMember(index, 'taxesPayable', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Amount Owing</Label>
                    <Input
                      value={member.amountOwing || ''}
                      onChange={(e) => updateFamilyMember(index, 'amountOwing', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Tax Payment Due Date</Label>
                    <Input
                      value={member.taxPaymentDueDate || ''}
                      onChange={(e) => updateFamilyMember(index, 'taxPaymentDueDate', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Return Filing Due Date</Label>
                    <Select
                      value={member.returnFilingDueDate || 'April 30'}
                      onValueChange={(value) => updateFamilyMember(index, 'returnFilingDueDate', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="April 30">April 30</SelectItem>
                        <SelectItem value="June 15">June 15</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* HST Summary Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  7. HST Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Prior Balance</Label>
                    <Input
                      value={member.hstPriorBalance || ''}
                      onChange={(e) => updateFamilyMember(index, 'hstPriorBalance', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Payable</Label>
                    <Input
                      value={member.hstPayable || ''}
                      onChange={(e) => updateFamilyMember(index, 'hstPayable', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Payment Due</Label>
                    <Input
                      value={member.hstPaymentDue || ''}
                      onChange={(e) => updateFamilyMember(index, 'hstPaymentDue', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Due Date</Label>
                    <Input
                      value={member.hstDueDate || ''}
                      onChange={(e) => updateFamilyMember(index, 'hstDueDate', e.target.value)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Action Buttons */}
      {showButtons && (
        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit Form
          </Button>
        </div>
      )}
    </div>
  );
};

export default CloseoutFormTableCompact;