import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData, CloseoutForm } from '@/contexts/DataContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Upload, File, CheckCircle } from 'lucide-react';
import ClientSearch, { Client } from './ClientSearch';
import PreviousYearForms from './PreviousYearForms';

interface CloseoutFormCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CloseoutFormCreate = ({
  open,
  onOpenChange,
}: CloseoutFormCreateProps) => {
  const { user } = useAuth();
  const { createForm, forms } = useData();
  
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CloseoutForm>>({
    clientName: '',
    filePath: '',
    signingPerson: '',
    signingEmail: '',
    additionalEmails: [],
    partner: '',
    manager: '',
    years: '',
    jobNumber: '',
    invoiceAmount: '',
    billDetail: '',
    paymentRequired: false,
    wipRecovery: '',
    recoveryReason: '',
    isT1: false,
    isS216: false,
    isS116: false,
    isPaperFiled: false,
    installmentsRequired: false,
    status: 'pending',
    assignedTo: null,
  });
  
  // Mock admin users for assignment
  const adminUsers = [
    { id: 'admin-1', name: 'Jordan Lee', role: 'admin' },
    { id: 'admin-2', name: 'Alex Johnson', role: 'admin' },
    { id: 'admin-3', name: 'Sam Taylor', role: 'admin' },
  ];

  const [assignTo, setAssignTo] = useState<string>('');

  // Get previous year forms for selected client
  const getPreviousYearForms = () => {
    if (!selectedClient) return [];
    return forms.filter(form => 
      form.clientName === selectedClient.name && 
      form.signingEmail === selectedClient.email
    );
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    // Pre-fill some form data based on selected client
    setFormData(prev => ({
      ...prev,
      clientName: client.name,
      signingPerson: client.name,
      signingEmail: client.email,
    }));
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdditionalEmailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emails = e.target.value.split(',').map(email => email.trim());
    setFormData(prev => ({ ...prev, additionalEmails: emails }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    
    // Simulate file upload delay
    setTimeout(() => {
      const fileNames = Array.from(e.target.files || []).map(file => file.name);
      setUploadedFiles(fileNames);
      
      // Simulate form data extraction based on selected client
      if (fileNames.length > 0 && selectedClient) {
        setFormData(prev => ({
          ...prev,
          filePath: `\\\\Clearhouse\\Clients\\${selectedClient.name.replace(' ', '_')}_2024\\T1`,
          partner: 'Priya S.',
          manager: 'Deepak Jain',
          years: '2024',
          jobNumber: `${Math.floor(Math.random() * 10000)}-T1`,
          invoiceAmount: `$${Math.floor(Math.random() * 500 + 300)} CAD`,
          billDetail: 'Personal T1 + Additional Schedules',
          paymentRequired: Math.random() > 0.5,
          wipRecovery: '100%',
          isT1: true,
          isS216: false,
          isS116: false,
          isPaperFiled: false,
          installmentsRequired: Math.random() > 0.5,
        }));
      }
      
      setUploading(false);
      setStep(3);
    }, 1500);
  };

  const handleSubmit = () => {
    if (!user) return;
    
    const createdByInfo = {
      id: user.id,
      name: user.name,
      role: user.role,
    };
    
    let assigneeInfo = null;
    if (assignTo) {
      const selectedAdmin = adminUsers.find(admin => admin.id === assignTo);
      if (selectedAdmin) {
        assigneeInfo = {
          id: selectedAdmin.id,
          name: selectedAdmin.name,
          role: selectedAdmin.role,
        };
      }
    }
    
    createForm({
      ...formData as Omit<CloseoutForm, 'id' | 'createdAt' | 'updatedAt' | 'comments' | 'history'>,
      createdBy: createdByInfo,
      assignedTo: assigneeInfo,
    });
    
    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      filePath: '',
      signingPerson: '',
      signingEmail: '',
      additionalEmails: [],
      partner: '',
      manager: '',
      years: '',
      jobNumber: '',
      invoiceAmount: '',
      billDetail: '',
      paymentRequired: false,
      wipRecovery: '',
      recoveryReason: '',
      isT1: false,
      isS216: false,
      isS116: false,
      isPaperFiled: false,
      installmentsRequired: false,
      status: 'pending',
      assignedTo: null,
    });
    setStep(1);
    setSelectedClient(null);
    setUploadedFiles([]);
    setAssignTo('');
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Select Client';
      case 2: return 'Upload Documents';
      case 3: return 'Create Closeout Form';
      default: return 'Create Closeout Form';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Search and select a client to create a closeout form for';
      case 2: return `Upload documents for ${selectedClient?.name}`;
      case 3: return 'Review and complete the closeout form details';
      default: return '';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={step === 3 ? "sm:max-w-6xl" : "sm:max-w-2xl"}>
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
          <DialogDescription>
            {getStepDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 && (
          <div className="py-4">
            <ClientSearch onClientSelect={handleClientSelect} />
          </div>
        )}

        {step === 2 && selectedClient && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="mb-4 text-center">
              <h3 className="font-medium">Creating closeout form for:</h3>
              <p className="text-sm text-muted-foreground">{selectedClient.name} ({selectedClient.email})</p>
            </div>
            
            <div className="w-full max-w-sm">
              <Label 
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mb-1 text-sm text-gray-500">Processing files...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-1 text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, Excel or Word files</p>
                  </div>
                )}
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </Label>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="flex gap-6">
            {/* Left side - Form creation */}
            <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2">
              <div className="space-y-1 mb-4">
                <h3 className="text-sm font-medium">Uploaded Files</h3>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-secondary py-1 px-2 rounded-md text-xs">
                      <File className="h-3 w-3" />
                      <span>{file}</span>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium mb-4">Client Information</h3>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="filePath">File Path</Label>
                      <Input
                        id="filePath"
                        name="filePath"
                        value={formData.filePath}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signingPerson">Name of Person Signing</Label>
                      <Input
                        id="signingPerson"
                        name="signingPerson"
                        value={formData.signingPerson}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signingEmail">Email of Person Signing</Label>
                      <Input
                        id="signingEmail"
                        name="signingEmail"
                        value={formData.signingEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="additionalEmails">Additional Emails (comma-separated)</Label>
                      <Input
                        id="additionalEmails"
                        name="additionalEmails"
                        value={formData.additionalEmails?.join(', ')}
                        onChange={handleAdditionalEmailsChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Return Information</h3>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="partner">Partner</Label>
                      <Input
                        id="partner"
                        name="partner"
                        value={formData.partner}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="manager">Manager</Label>
                      <Input
                        id="manager"
                        name="manager"
                        value={formData.manager}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="years">Year(s)</Label>
                      <Input
                        id="years"
                        name="years"
                        value={formData.years}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jobNumber">Job #</Label>
                      <Input
                        id="jobNumber"
                        name="jobNumber"
                        value={formData.jobNumber}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="invoiceAmount">Invoice Amount</Label>
                      <Input
                        id="invoiceAmount"
                        name="invoiceAmount"
                        value={formData.invoiceAmount}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Billing Details</h3>
                  
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billDetail">Final Bill Detail</Label>
                      <Textarea
                        id="billDetail"
                        name="billDetail"
                        value={formData.billDetail}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="paymentRequired"
                        checked={formData.paymentRequired}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('paymentRequired', checked as boolean)
                        }
                      />
                      <Label htmlFor="paymentRequired">Payment required before filing?</Label>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="wipRecovery">WIP Recovery %</Label>
                      <Input
                        id="wipRecovery"
                        name="wipRecovery"
                        value={formData.wipRecovery}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="recoveryReason">Reason for Recovery below 100%</Label>
                      <Input
                        id="recoveryReason"
                        name="recoveryReason"
                        value={formData.recoveryReason}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-4">Filing Information</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isT1"
                        checked={formData.isT1}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('isT1', checked as boolean)
                        }
                      />
                      <Label htmlFor="isT1">T1</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isS216"
                        checked={formData.isS216}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('isS216', checked as boolean)
                        }
                      />
                      <Label htmlFor="isS216">S216</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isS116"
                        checked={formData.isS116}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('isS116', checked as boolean)
                        }
                      />
                      <Label htmlFor="isS116">S116</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isPaperFiled"
                        checked={formData.isPaperFiled}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('isPaperFiled', checked as boolean)
                        }
                      />
                      <Label htmlFor="isPaperFiled">To be paper filed - CRA copy to be signed</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="installmentsRequired"
                        checked={formData.installmentsRequired}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('installmentsRequired', checked as boolean)
                        }
                      />
                      <Label htmlFor="installmentsRequired">Are installments required?</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Section */}
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-4">Assign Closeout Form</h3>
                <div className="space-y-2">
                  <Label htmlFor="assignTo">Assign to Admin Team Member</Label>
                  <Select value={assignTo} onValueChange={value => setAssignTo(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {adminUsers.map(admin => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assign this form to an admin team member for review
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Previous year forms */}
            <div className="w-80 border-l pl-6">
              <div className="sticky top-0 max-h-[60vh] overflow-y-auto">
                <PreviousYearForms 
                  client={selectedClient!} 
                  previousForms={getPreviousYearForms()} 
                />
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {step === 1 ? (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          ) : step === 2 ? (
            <>
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleSubmit}>Create Form</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloseoutFormCreate;
