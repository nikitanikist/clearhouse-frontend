
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Save } from 'lucide-react';
import InstallmentAttachmentUpload from './InstallmentAttachmentUpload';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  // New fields for missing sections
  t2091PrincipalResidence: boolean;
  t1135ForeignProperty: boolean;
  t1032PensionSplit: boolean;
  hstDraftOrFinal: string;
  otherNotes: string;
  // T1 Summary fields
  priorPeriodsBalance: string;
  taxesPayable: string;
  installmentsDuringYear: string;
  installmentsAfterYear: string;
  amountOwing: string;
  dueDate: string;
  // HST Summary fields
  hstPriorBalance: string;
  hstPayable: string;
  hstInstallmentsDuring: string;
  hstInstallmentsAfter: string;
  hstPaymentDue: string;
  hstDueDate: string;
}

interface CloseoutFormTableProps {
  initialData?: Partial<CloseoutFormTableData>;
  onSubmit: (data: CloseoutFormTableData) => void;
  onCancel: () => void;
}

const CloseoutFormTable = ({ initialData, onSubmit, onCancel }: CloseoutFormTableProps) => {
  const [formData, setFormData] = useState<CloseoutFormTableData>({
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
    // Initialize new fields with defaults or from initialData
    t2091PrincipalResidence: initialData?.t2091PrincipalResidence || false,
    t1135ForeignProperty: initialData?.t1135ForeignProperty || false,
    t1032PensionSplit: initialData?.t1032PensionSplit || false,
    hstDraftOrFinal: initialData?.hstDraftOrFinal || 'N/A',
    otherNotes: initialData?.otherNotes || '',
    // T1 Summary fields
    priorPeriodsBalance: initialData?.priorPeriodsBalance || '0',
    taxesPayable: initialData?.taxesPayable || '0',
    installmentsDuringYear: initialData?.installmentsDuringYear || '0',
    installmentsAfterYear: initialData?.installmentsAfterYear || '0',
    amountOwing: initialData?.amountOwing || '0',
    dueDate: initialData?.dueDate || '',
    // HST Summary fields
    hstPriorBalance: initialData?.hstPriorBalance || '0',
    hstPayable: initialData?.hstPayable || '0',
    hstInstallmentsDuring: initialData?.hstInstallmentsDuring || '0',
    hstInstallmentsAfter: initialData?.hstInstallmentsAfter || '0',
    hstPaymentDue: initialData?.hstPaymentDue || '0',
    hstDueDate: initialData?.hstDueDate || ''
  });

  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Date.now().toString(),
      clientName: '',
      signingPerson: '',
      signingEmail: '',
      additionalEmails: [],
      isT1: false,
      isS216: false,
      isS116: false,
      isPaperFiled: false,
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
    }
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: any) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member => {
        if (member.id === id) {
          const updatedMember = { ...member, [field]: value };
          
          // If installments checkbox is unchecked, clear the attachment
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

  const addEmailToMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member =>
        member.id === memberId 
          ? { ...member, additionalEmails: [...member.additionalEmails, ''] }
          : member
      )
    }));
  };

  const updateMemberEmail = (memberId: string, emailIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member =>
        member.id === memberId 
          ? { 
              ...member, 
              additionalEmails: member.additionalEmails.map((email, idx) => 
                idx === emailIndex ? value : email
              )
            }
          : member
      )
    }));
  };

  const removeMemberEmail = (memberId: string, emailIndex: number) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(member =>
        member.id === memberId 
          ? { 
              ...member, 
              additionalEmails: member.additionalEmails.filter((_, idx) => idx !== emailIndex)
            }
          : member
      )
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Closeout Form</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            <Save className="mr-2 h-4 w-4" />
            Submit Closeout Form
          </Button>
        </div>
      </div>

      {/* General Information Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">General Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="filePath">File Path</Label>
            <Input
              id="filePath"
              value={formData.filePath}
              onChange={(e) => updateFormField('filePath', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="partner">Partner</Label>
            <Input
              id="partner"
              value={formData.partner}
              onChange={(e) => updateFormField('partner', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="manager">Manager</Label>
            <Input
              id="manager"
              value={formData.manager}
              onChange={(e) => updateFormField('manager', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="years">Year(s)</Label>
            <Input
              id="years"
              value={formData.years}
              onChange={(e) => updateFormField('years', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobNumber">Job #</Label>
            <Input
              id="jobNumber"
              value={formData.jobNumber}
              onChange={(e) => updateFormField('jobNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceAmount">Invoice Amount</Label>
            <Input
              id="invoiceAmount"
              value={formData.invoiceAmount}
              onChange={(e) => updateFormField('invoiceAmount', e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="billDetail">Final Bill Detail</Label>
            <Textarea
              id="billDetail"
              value={formData.billDetail}
              onChange={(e) => updateFormField('billDetail', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wipRecovery">WIP Recovery %</Label>
            <Input
              id="wipRecovery"
              value={formData.wipRecovery}
              onChange={(e) => updateFormField('wipRecovery', e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="recoveryReason">Reason for Recovery below 100%</Label>
            <Input
              id="recoveryReason"
              value={formData.recoveryReason}
              onChange={(e) => updateFormField('recoveryReason', e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="paymentRequired"
              checked={formData.paymentRequired}
              onCheckedChange={(checked) => updateFormField('paymentRequired', checked)}
            />
            <Label htmlFor="paymentRequired">Payment required before filing?</Label>
          </div>
        </div>
      </div>

      {/* Tax Filing Information Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tax Filing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 p-2 bg-yellow-100 rounded">
            <Checkbox
              id="t2091PrincipalResidence"
              checked={formData.t2091PrincipalResidence}
              onCheckedChange={(checked) => updateFormField('t2091PrincipalResidence', checked)}
            />
            <Label htmlFor="t2091PrincipalResidence">T2091 Principal Residence</Label>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-yellow-100 rounded">
            <Checkbox
              id="t1135ForeignProperty"
              checked={formData.t1135ForeignProperty}
              onCheckedChange={(checked) => updateFormField('t1135ForeignProperty', checked)}
            />
            <Label htmlFor="t1135ForeignProperty">T1135 Foreign Property</Label>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-yellow-100 rounded">
            <Checkbox
              id="t1032PensionSplit"
              checked={formData.t1032PensionSplit}
              onCheckedChange={(checked) => updateFormField('t1032PensionSplit', checked)}
            />
            <Label htmlFor="t1032PensionSplit">T1032 Pension Split</Label>
          </div>
          <div className="space-y-2 p-2 bg-yellow-100 rounded">
            <Label htmlFor="hstDraftOrFinal">HST Draft/Final</Label>
            <Select value={formData.hstDraftOrFinal} onValueChange={(value) => updateFormField('hstDraftOrFinal', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="N/A">N/A</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="otherNotes">Other Notes</Label>
            <Textarea
              id="otherNotes"
              value={formData.otherNotes}
              onChange={(e) => updateFormField('otherNotes', e.target.value)}
              placeholder="Additional notes or comments"
            />
          </div>
        </div>
      </div>

      {/* T1 Summary Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">T1 Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="priorPeriodsBalance">Prior Periods Balance</Label>
            <Input
              id="priorPeriodsBalance"
              value={formData.priorPeriodsBalance}
              onChange={(e) => updateFormField('priorPeriodsBalance', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxesPayable">Taxes Payable</Label>
            <Input
              id="taxesPayable"
              value={formData.taxesPayable}
              onChange={(e) => updateFormField('taxesPayable', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="installmentsDuringYear">Installments During Year</Label>
            <Input
              id="installmentsDuringYear"
              value={formData.installmentsDuringYear}
              onChange={(e) => updateFormField('installmentsDuringYear', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="installmentsAfterYear">Installments After Year</Label>
            <Input
              id="installmentsAfterYear"
              value={formData.installmentsAfterYear}
              onChange={(e) => updateFormField('installmentsAfterYear', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amountOwing">Amount Owing</Label>
            <Input
              id="amountOwing"
              value={formData.amountOwing}
              onChange={(e) => updateFormField('amountOwing', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => updateFormField('dueDate', e.target.value)}
              placeholder="April 30, 2024"
            />
          </div>
        </div>
      </div>

      {/* HST Summary Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">HST Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
          <div className="space-y-2">
            <Label htmlFor="hstPriorBalance">HST Prior Balance</Label>
            <Input
              id="hstPriorBalance"
              value={formData.hstPriorBalance}
              onChange={(e) => updateFormField('hstPriorBalance', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hstPayable">HST Payable</Label>
            <Input
              id="hstPayable"
              value={formData.hstPayable}
              onChange={(e) => updateFormField('hstPayable', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hstInstallmentsDuring">HST Installments During</Label>
            <Input
              id="hstInstallmentsDuring"
              value={formData.hstInstallmentsDuring}
              onChange={(e) => updateFormField('hstInstallmentsDuring', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hstInstallmentsAfter">HST Installments After</Label>
            <Input
              id="hstInstallmentsAfter"
              value={formData.hstInstallmentsAfter}
              onChange={(e) => updateFormField('hstInstallmentsAfter', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hstPaymentDue">HST Payment Due</Label>
            <Input
              id="hstPaymentDue"
              value={formData.hstPaymentDue}
              onChange={(e) => updateFormField('hstPaymentDue', e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hstDueDate">HST Due Date</Label>
            <Input
              id="hstDueDate"
              value={formData.hstDueDate}
              onChange={(e) => updateFormField('hstDueDate', e.target.value)}
              placeholder="June 15, 2024"
            />
          </div>
        </div>
      </div>

      {/* Family Members Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Client Information</h3>
          <Button onClick={addFamilyMember} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Family Member
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Client Name</TableHead>
                <TableHead className="w-48">Person Signing</TableHead>
                <TableHead className="w-48">Email</TableHead>
                <TableHead className="w-48">Additional Emails</TableHead>
                <TableHead className="w-32">T1</TableHead>
                <TableHead className="w-32">S216</TableHead>
                <TableHead className="w-32">S116</TableHead>
                <TableHead className="w-32">Paper Filed</TableHead>
                <TableHead className="w-32">Installments</TableHead>
                <TableHead className="w-32">Personal Tax Payment</TableHead>
                <TableHead className="w-48">Installment Attachment</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.familyMembers.map((member, index) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Input
                      value={member.clientName}
                      onChange={(e) => updateFamilyMember(member.id, 'clientName', e.target.value)}
                      placeholder={`${index + 1}ClientName`}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={member.signingPerson}
                      onChange={(e) => updateFamilyMember(member.id, 'signingPerson', e.target.value)}
                      placeholder="Person signing"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={member.signingEmail}
                      onChange={(e) => updateFamilyMember(member.id, 'signingEmail', e.target.value)}
                      placeholder="Email address"
                      type="email"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {member.additionalEmails.map((email, emailIndex) => (
                        <div key={emailIndex} className="flex gap-1">
                          <Input
                            value={email}
                            onChange={(e) => updateMemberEmail(member.id, emailIndex, e.target.value)}
                            placeholder="Additional email"
                            type="email"
                            className="text-xs"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMemberEmail(member.id, emailIndex)}
                            className="text-red-600 hover:text-red-700 px-1"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addEmailToMember(member.id)}
                        className="text-blue-600 hover:text-blue-700 px-1"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={member.isT1}
                        onCheckedChange={(checked) => updateFamilyMember(member.id, 'isT1', checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={member.isS216}
                        onCheckedChange={(checked) => updateFamilyMember(member.id, 'isS216', checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={member.isS116}
                        onCheckedChange={(checked) => updateFamilyMember(member.id, 'isS116', checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={member.isPaperFiled}
                        onCheckedChange={(checked) => updateFamilyMember(member.id, 'isPaperFiled', checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      <Checkbox
                        checked={member.installmentsRequired}
                        onCheckedChange={(checked) => updateFamilyMember(member.id, 'installmentsRequired', checked)}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={member.personalTaxPayment}
                      onChange={(e) => updateFamilyMember(member.id, 'personalTaxPayment', e.target.value)}
                      placeholder="$0.00"
                    />
                  </TableCell>
                  <TableCell>
                    {member.installmentsRequired && (
                      <div className="w-48">
                        <InstallmentAttachmentUpload
                          attachment={member.installmentAttachment}
                          onAttachmentChange={(attachment) => updateFamilyMember(member.id, 'installmentAttachment', attachment)}
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {formData.familyMembers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFamilyMember(member.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default CloseoutFormTable;
