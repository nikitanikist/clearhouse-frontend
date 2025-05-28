
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Minus, Save } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
        personalTaxPayment: '$1,250.00'
      }
    ]
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
      personalTaxPayment: '$0.00'
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
      familyMembers: prev.familyMembers.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      )
    }));
  };

  const updateFormField = (field: keyof Omit<CloseoutFormTableData, 'familyMembers'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
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

      {/* Common Information Section */}
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
                <TableHead className="w-32">T1</TableHead>
                <TableHead className="w-32">S216</TableHead>
                <TableHead className="w-32">S116</TableHead>
                <TableHead className="w-32">Paper Filed</TableHead>
                <TableHead className="w-32">Installments</TableHead>
                <TableHead className="w-32">Personal Tax Payment</TableHead>
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
