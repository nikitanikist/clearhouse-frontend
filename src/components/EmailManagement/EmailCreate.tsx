
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
import { Textarea } from '@/components/ui/textarea';
import { Upload, File, SendHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface EmailCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmailCreate = ({
  open,
  onOpenChange,
}: EmailCreateProps) => {
  const { user } = useAuth();
  const { forms, createEmail } = useData();
  
  // Filter for active forms only
  const activeForms = forms.filter(form => form.status === 'active');
  
  const [selectedForm, setSelectedForm] = useState<CloseoutForm | null>(null);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [includeForm183, setIncludeForm183] = useState(false);
  const [includeInvoice, setIncludeInvoice] = useState(false);
  const [includeInstallments, setIncludeInstallments] = useState(false);
  const [taxAmount, setTaxAmount] = useState('');
  const [amountType, setAmountType] = useState<'owing' | 'refund'>('owing');
  
  // Tax Summary Generator
  const generateTaxSummary = () => {
    if (!selectedForm) return '';
    
    const formattedAmount = taxAmount ? `$${taxAmount} CAD` : '[amount]';
    
    let summary = `Tax Summary:\n`;
    summary += `- Tax ${amountType === 'owing' ? 'owing' : 'refund'}: ${formattedAmount}\n`;
    
    if (includeInstallments) {
      summary += `- Installment payments will be required for next year\n`;
    }
    
    if (selectedForm.isPaperFiled) {
      summary += `- Paper filing required\n`;
    }
    
    return summary;
  };
  
  // Email Template Generator
  const generateEmailContent = () => {
    if (!selectedForm) return '';
    
    let template = `Dear ${selectedForm.signingPerson},

I hope this email finds you well. Your ${selectedForm.years} tax return has been prepared and is ready for your review and signature.

${generateTaxSummary()}
${includeForm183 || includeInvoice ? '\nPlease find attached:\n' : ''}${includeForm183 ? `1. Form T183 (Electronic Filing Authorization)\n` : ''}${includeInvoice ? `${includeForm183 ? '2' : '1'}. Invoice #${selectedForm.jobNumber}\n` : ''}

To proceed with filing, please:
1. Review the attached documents
2. Sign Form T183 electronically
3. Return the signed form to us by email

Should you have any questions, please don't hesitate to contact me.

Best regards,
${user?.name}
Senior Tax Advisor
ClearHouse Tax Consultancy`;

    return template;
  };
  
  // Auto-populate fields when a form is selected
  const handleFormSelect = (formId: string) => {
    const selected = forms.find(form => form.id === formId);
    if (selected) {
      setSelectedForm(selected);
      setSubject(`Your ${selected.years} Tax Return is Ready`);
      setIncludeInstallments(selected.installmentsRequired);
      
      // Generate content on form selection
      const generatedContent = generateEmailContent();
      setContent(generatedContent);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    
    // Simulate file upload delay
    setTimeout(() => {
      const fileNames = Array.from(e.target.files || []).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
      setUploading(false);
    }, 1000);
  };
  
  const handleCreateEmail = () => {
    if (!selectedForm || !user) return;
    
    const attachments = [];
    if (includeForm183) {
      attachments.push({
        name: `Form_T183_${selectedForm.clientName.replace(/\s+/g, '_')}.pdf`,
        url: '#',
      });
    }
    
    if (includeInvoice) {
      attachments.push({
        name: `Invoice_${selectedForm.jobNumber}.pdf`,
        url: '#',
      });
    }
    
    // Add custom uploaded files
    uploadedFiles.forEach(fileName => {
      attachments.push({
        name: fileName,
        url: '#',
      });
    });
    
    const now = new Date().toISOString();
    
    const newThread = {
      clientName: selectedForm.clientName,
      clientEmail: selectedForm.signingEmail,
      subject,
      linkedFormId: selectedForm.id,
      status: 'pending' as const,
      lastContactDate: now, // Added the missing property
      assignedTo: {
        id: user.id,
        name: user.name,
      },
      messages: [
        {
          id: `message-${Date.now()}`,
          from: user.email,
          to: [selectedForm.signingEmail],
          subject,
          content,
          attachments,
          sentAt: now,
        },
      ],
    };
    
    createEmail(newThread);
    
    // Reset form
    setSelectedForm(null);
    setSubject('');
    setContent('');
    setUploadedFiles([]);
    setIncludeForm183(false);
    setIncludeInvoice(false);
    setIncludeInstallments(false);
    setTaxAmount('');
    setAmountType('owing');
    
    onOpenChange(false);
  };
  
  const handleClose = () => {
    setSelectedForm(null);
    setSubject('');
    setContent('');
    setUploadedFiles([]);
    setIncludeForm183(false);
    setIncludeInvoice(false);
    setIncludeInstallments(false);
    setTaxAmount('');
    setAmountType('owing');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Connect with Client</DialogTitle>
          <DialogDescription>
            Compose a new email to send to a client based on their active closeout form
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-y-auto py-4">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientForm">Select Client Form</Label>
                <Select onValueChange={handleFormSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client form" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeForms.length > 0 ? (
                      activeForms.map(form => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.clientName} - {form.jobNumber}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No active forms available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedForm && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Email Subject</Label>
                    <Input
                      id="subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tax Summary</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <Select value={amountType} onValueChange={(value: 'owing' | 'refund') => {
                          setAmountType(value);
                          // Update the content when the amount type changes
                          setContent(generateEmailContent());
                        }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owing">Tax Owing</SelectItem>
                            <SelectItem value="refund">Tax Refund</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                          <Input
                            type="text"
                            value={taxAmount}
                            onChange={(e) => {
                              setTaxAmount(e.target.value);
                              // Update the content when the tax amount changes
                              setContent(generateEmailContent());
                            }}
                            placeholder="Enter amount"
                            className="pl-7"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeInstallments"
                        checked={includeInstallments}
                        onCheckedChange={(checked) => {
                          setIncludeInstallments(!!checked);
                          // Update the content when the include installments option changes
                          setContent(generateEmailContent());
                        }}
                      />
                      <Label htmlFor="includeInstallments">Include installment schedule</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeForm183"
                          checked={includeForm183}
                          onCheckedChange={(checked) => {
                            setIncludeForm183(!!checked);
                            // Update the content when the include form option changes
                            setContent(generateEmailContent());
                          }}
                        />
                        <Label htmlFor="includeForm183">Include Form 183 + EL</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="includeInvoice"
                          checked={includeInvoice}
                          onCheckedChange={(checked) => {
                            setIncludeInvoice(!!checked);
                            // Update the content when the include invoice option changes
                            setContent(generateEmailContent());
                          }}
                        />
                        <Label htmlFor="includeInvoice">Include Invoice</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="uploadFiles">Upload Additional Files</Label>
                    <Label 
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-6 h-6 mb-2 text-primary animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-sm text-gray-500">Uploading...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Upload className="w-6 h-6 mb-2 text-gray-500" />
                          <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
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
                    
                    {uploadedFiles.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 bg-secondary py-1 px-2 rounded-md text-xs">
                            <File className="h-3 w-3" />
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailPreview">Email Preview</Label>
              <div className="border border-border rounded-md p-4 bg-card min-h-[400px] overflow-y-auto">
                {selectedForm ? (
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="font-medium">To:</span> {selectedForm.signingPerson} &lt;{selectedForm.signingEmail}&gt;
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span> {subject}
                    </div>
                    <div>
                      <span className="font-medium">Attachments:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {includeForm183 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs">
                            <File className="h-3 w-3" />
                            <span>Form_T183_{selectedForm.clientName.replace(/\s+/g, '_')}.pdf</span>
                          </div>
                        )}
                        {includeInvoice && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs">
                            <File className="h-3 w-3" />
                            <span>Invoice_{selectedForm.jobNumber}.pdf</span>
                          </div>
                        )}
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-md text-xs">
                            <File className="h-3 w-3" />
                            <span>{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Message:</span>
                      <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="mt-1 min-h-[200px] font-mono text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a client form to preview email</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateEmail} 
            disabled={!selectedForm || !subject || !content}
            className="gap-2"
          >
            <SendHorizontal className="h-4 w-4" />
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCreate;
