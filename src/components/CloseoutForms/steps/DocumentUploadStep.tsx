
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, X, Plus } from 'lucide-react';
import { CloseoutFormTableData, FamilyMember } from '../CloseoutFormTable';

interface DocumentUploadStepProps {
  onDataExtracted: (data: Partial<CloseoutFormTableData>) => void;
  onNext: () => void;
  onBack: () => void;
  selectedClient: { email: string; name?: string };
  formType: 'personal' | 'corporate';
}

const DocumentUploadStep = ({ 
  onDataExtracted, 
  onNext, 
  onBack, 
  selectedClient,
  formType 
}: DocumentUploadStepProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    {
      id: '1',
      clientName: selectedClient.name || 'Primary Member',
      signingPerson: selectedClient.name || '',
      signingEmail: selectedClient.email,
      additionalEmails: [],
      isT1: true,
      isS216: false,
      isS116: false,
      isPaperFiled: false,
      installmentsRequired: false,
      personalTaxPayment: '$0.00',
      installmentAttachment: null
    }
  ]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
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
      installmentAttachment: null
    };
    setFamilyMembers(prev => [...prev, newMember]);
  };

  const removeFamilyMember = (id: string) => {
    if (familyMembers.length > 1) {
      setFamilyMembers(prev => prev.filter(member => member.id !== id));
    }
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMember, value: any) => {
    setFamilyMembers(prev => prev.map(member => {
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
    }));
  };

  const processDocuments = async () => {
    setIsProcessing(true);
    
    // Simulate PDF processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract mock data
    const extractedData: Partial<CloseoutFormTableData> = {
      formType: formType,
      filePath: '\\\\Clearhouse\\Clients\\ClientName_2024\\T1',
      partner: 'Priya S.',
      manager: 'Deepak Jain',
      years: '2024',
      jobNumber: '10254-T1',
      invoiceAmount: '$348 CAD',
      billDetail: 'Personal T1 + Foreign Income + Donation Sched.',
      familyMembers: familyMembers
    };
    
    onDataExtracted(extractedData);
    setIsProcessing(false);
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Upload {formType === 'personal' ? 'Personal Tax' : 'Corporate'} Documents
        </h2>
        <p className="text-gray-600">
          Upload PDF documents to auto-populate the closeout form
        </p>
      </div>

      {/* File Upload Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="mb-4">
          <Label className="text-lg font-medium">Tax Return Documents</Label>
          <p className="text-sm text-gray-600 mt-1">
            Upload PDF files containing tax return information
          </p>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-600">
              PDF files up to 10MB each
            </p>
          </div>
          <Input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <Label
            htmlFor="file-upload"
            className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            Select Files
          </Label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6 space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Uploaded Files ({uploadedFiles.length})
            </Label>
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Family Members Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <Label className="text-lg font-medium">Family Members</Label>
            <p className="text-sm text-gray-600 mt-1">
              Add family members who will be included in this tax return
            </p>
          </div>
          <Button onClick={addFamilyMember} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>

        <div className="space-y-4">
          {familyMembers.map((member, index) => (
            <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {index === 0 ? 'Primary Member' : `Family Member ${index + 1}`}
                  </span>
                  {index === 0 && (
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      Primary
                    </span>
                  )}
                </div>
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFamilyMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${member.id}`}>Name</Label>
                  <Input
                    id={`name-${member.id}`}
                    value={member.clientName}
                    onChange={(e) => updateFamilyMember(member.id, 'clientName', e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email-${member.id}`}>Email</Label>
                  <Input
                    id={`email-${member.id}`}
                    value={member.signingEmail}
                    onChange={(e) => updateFamilyMember(member.id, 'signingEmail', e.target.value)}
                    placeholder="Enter email"
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`signing-${member.id}`}>Signing Person</Label>
                  <Input
                    id={`signing-${member.id}`}
                    value={member.signingPerson}
                    onChange={(e) => updateFamilyMember(member.id, 'signingPerson', e.target.value)}
                    placeholder="Person who will sign"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={processDocuments}
          disabled={uploadedFiles.length === 0 || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Process Documents & Continue'}
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploadStep;
