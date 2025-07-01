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
    filePath: initialData?.filePath || '',
    partner: initialData?.partner || '',
    manager: initialData?.manager || '',
    years: initialData?.years || '',
    jobNumber: initialData?.jobNumber || '',
    invoiceAmount: initialData?.invoiceAmount || '',
    billDetail: initialData?.billDetail || '',
    wipRecovery: initialData?.wipRecovery || '',
    paymentRequired: initialData?.paymentRequired || false,
  });

  // Family members data
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(
    initialData?.familyMembers || [
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
        otherNotes: ''
      }
    ]
  );

  const [activeTab, setActiveTab] = useState('0');

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
      otherNotes: ''
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
          General Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-medium">File Path</Label>
            <Input
              value={generalInfo.filePath}
              onChange={(e) => setGeneralInfo(prev => ({ ...prev, filePath: e.target.value }))}
              className="h-8"
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
          <h3 className="text-lg font-medium text-primary">Family Members</h3>
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
              {/* Client Details Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  Client Details & Tax Return Upload
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Name of Person Signing</Label>
                    <Input
                      value={member.signingPerson}
                      onChange={(e) => updateFamilyMember(index, 'signingPerson', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Email</Label>
                    <Input
                      value={member.signingEmail}
                      onChange={(e) => updateFamilyMember(index, 'signingEmail', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Client Name</Label>
                    <Input
                      value={member.clientName}
                      onChange={(e) => updateFamilyMember(index, 'clientName', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Upload Tax Return</Label>
                    <div className="space-y-1">
                      <Button variant="outline" size="sm" className="h-8 w-full">Upload</Button>
                      <p className="text-xs text-muted-foreground">Auto-populates tax details below</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filing Details Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  Filing Details
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
                      checked={member.t1135ForeignProperty}
                      onCheckedChange={(checked) => updateFamilyMember(index, 't1135ForeignProperty', !!checked)}
                    />
                    <Label className="text-xs font-medium">T1135</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={member.t2091PrincipalResidence}
                      onCheckedChange={(checked) => updateFamilyMember(index, 't2091PrincipalResidence', !!checked)}
                    />
                    <Label className="text-xs font-medium">T2091</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={member.t1032PensionSplit}
                      onCheckedChange={(checked) => updateFamilyMember(index, 't1032PensionSplit', !!checked)}
                    />
                    <Label className="text-xs font-medium">T1032</Label>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST</Label>
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
                  Installments
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={member.personalTaxInstallmentsRequired}
                      onCheckedChange={(checked) => updateFamilyMember(index, 'personalTaxInstallmentsRequired', !!checked)}
                    />
                    <Label className="text-xs font-medium">Personal Tax Installments Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={member.hstInstallmentsRequired}
                      onCheckedChange={(checked) => updateFamilyMember(index, 'hstInstallmentsRequired', !!checked)}
                    />
                    <Label className="text-xs font-medium">HST Installments Required</Label>
                  </div>
                  <div className="space-y-1">
                    <Button variant="outline" size="sm" className="h-8 w-full">Upload Documents</Button>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Other Documents</Label>
                    <Button variant="outline" size="sm" className="h-8 w-full">Upload</Button>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Other Notes</Label>
                    <Textarea
                      value={member.otherNotes}
                      onChange={(e) => updateFamilyMember(index, 'otherNotes', e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              {/* Personal Tax Summary Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  Personal Tax Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Prior Periods Balance</Label>
                    <Input
                      value={member.priorPeriodsBalance}
                      onChange={(e) => updateFamilyMember(index, 'priorPeriodsBalance', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Taxes Payable</Label>
                    <Input
                      value={member.taxesPayable}
                      onChange={(e) => updateFamilyMember(index, 'taxesPayable', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Installments During Year</Label>
                    <Input
                      value={member.installmentsDuringYear}
                      onChange={(e) => updateFamilyMember(index, 'installmentsDuringYear', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Installments After Year</Label>
                    <Input
                      value={member.installmentsAfterYear}
                      onChange={(e) => updateFamilyMember(index, 'installmentsAfterYear', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Amount Owing</Label>
                    <Input
                      value={member.amountOwing}
                      onChange={(e) => updateFamilyMember(index, 'amountOwing', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Tax Payment Due Date</Label>
                    <Input
                      value={member.taxPaymentDueDate}
                      onChange={(e) => updateFamilyMember(index, 'taxPaymentDueDate', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Return Filing Due Date</Label>
                    <Select
                      value={member.returnFilingDueDate}
                      onValueChange={(value) => updateFamilyMember(index, 'returnFilingDueDate', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="April 30">April 30</SelectItem>
                        <SelectItem value="June 15">June 15</SelectItem>
                        <SelectItem value="December 31">December 31</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* HST Summary Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-primary border-b border-border pb-1">
                  HST Summary
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Prior Balance</Label>
                    <Input
                      value={member.hstPriorBalance}
                      onChange={(e) => updateFamilyMember(index, 'hstPriorBalance', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Payable</Label>
                    <Input
                      value={member.hstPayable}
                      onChange={(e) => updateFamilyMember(index, 'hstPayable', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Installments During</Label>
                    <Input
                      value={member.hstInstallmentsDuring}
                      onChange={(e) => updateFamilyMember(index, 'hstInstallmentsDuring', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Installments After</Label>
                    <Input
                      value={member.hstInstallmentsAfter}
                      onChange={(e) => updateFamilyMember(index, 'hstInstallmentsAfter', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Payment Due</Label>
                    <Input
                      value={member.hstPaymentDue}
                      onChange={(e) => updateFamilyMember(index, 'hstPaymentDue', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">HST Due Date</Label>
                    <Input
                      value={member.hstDueDate}
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