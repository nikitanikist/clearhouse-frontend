
import React, { useState } from 'react';
import { Upload, FileText, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '../ClientSearch';
import { CloseoutFormTableData } from '../CloseoutFormTable';

interface DocumentUploadStepProps {
  selectedClient: Client | { email: string; name?: string };
  onDataExtracted: (data: Partial<CloseoutFormTableData>) => void;
}

const DocumentUploadStep = ({ selectedClient, onDataExtracted }: DocumentUploadStepProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleGenerateForm = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate realistic demo data for Rohit Sharma's 2024 tax year
    const isRohitSharma = selectedClient && 
      ('name' in selectedClient ? selectedClient.name === 'Rohit Sharma' : false) ||
      ('email' in selectedClient && selectedClient.email === 'rohit@gmail.com');

    let extractedData: Partial<CloseoutFormTableData>;

    if (isRohitSharma) {
      // Demo data for Rohit Sharma - 2024 tax year with some changes from 2023
      extractedData = {
        filePath: '\\\\Clearhouse\\Clients\\Rohit_2024\\T1',
        partner: 'Priya S.',
        manager: 'Deepak Jain',
        years: '2024',
        jobNumber: '10354-T1',
        invoiceAmount: '$375 CAD', // Increased from previous year
        billDetail: 'Personal T1 + Foreign Income + Capital Gains + Donation Sched.',
        paymentRequired: true,
        wipRecovery: '100%',
        recoveryReason: 'N/A',
        t2091PrincipalResidence: true, // Changed from false
        t1135ForeignProperty: true,
        t1032PensionSplit: false,
        hstDraftOrFinal: 'Final',
        otherNotes: 'Client sold investment property during year - capital gains reported',
        // T1 Summary - Updated values for 2024
        priorPeriodsBalance: '0',
        taxesPayable: '4,250.00', // Higher than 2023 due to capital gains
        installmentsDuringYear: '2,500.00',
        installmentsAfterYear: '500.00',
        amountOwing: '2,250.00',
        taxPaymentDueDate: 'April 30, 2025',
        // HST Summary - New HST obligations
        hstPriorBalance: '0',
        hstPayable: '750.00',
        hstInstallmentsDuring: '250.00',
        hstInstallmentsAfter: '0',
        hstPaymentDue: '500.00',
        hstDueDate: 'June 15, 2025',
        familyMembers: [{
          id: '1',
          clientName: 'Rohit Sharma',
          signingPerson: 'Rohit Sharma',
          signingEmail: 'rohit@gmail.com',
          additionalEmails: ['accountant@sharma.com'],
          returnType: 'T1',
          isEfiled: true,
          installmentsRequired: true,
          personalTaxPayment: '$2,500.00',
          installmentAttachment: null
        }]
      };
    } else {
      // Default demo data for other clients
      extractedData = {
        filePath: '\\\\Clearhouse\\Clients\\Demo_2024\\T1',
        partner: 'Priya S.',
        manager: 'Deepak Jain',
        years: '2024',
        jobNumber: '10999-T1',
        invoiceAmount: '$295 CAD',
        billDetail: 'Personal T1 + Employment Income',
        paymentRequired: false,
        wipRecovery: '100%',
        recoveryReason: '',
        t2091PrincipalResidence: false,
        t1135ForeignProperty: false,
        t1032PensionSplit: false,
        hstDraftOrFinal: 'Final',
        otherNotes: 'Standard return',
        priorPeriodsBalance: '0',
        taxesPayable: '-850.00',
        installmentsDuringYear: '0',
        installmentsAfterYear: '0',
        amountOwing: '-850.00',
        taxPaymentDueDate: 'April 30, 2025',
        hstPriorBalance: '0',
        hstPayable: '0',
        hstInstallmentsDuring: '0',
        hstInstallmentsAfter: '0',
        hstPaymentDue: '0',
        hstDueDate: 'June 15, 2025',
        familyMembers: [{
          id: '1',
          clientName: selectedClient && 'name' in selectedClient ? selectedClient.name : 'Demo Client',
          signingPerson: selectedClient && 'name' in selectedClient ? selectedClient.name : 'Demo Client',
          signingEmail: selectedClient && 'email' in selectedClient ? selectedClient.email : 'demo@example.com',
          additionalEmails: [],
          returnType: 'T1',
          isEfiled: true,
          installmentsRequired: false,
          personalTaxPayment: '$0.00',
          installmentAttachment: null
        }]
      };
    }

    setIsProcessing(false);
    setIsComplete(true);
    
    // Pass extracted data to parent
    onDataExtracted(extractedData);
  };

  const clientName = selectedClient && 'name' in selectedClient ? selectedClient.name : 
                    selectedClient && 'email' in selectedClient ? selectedClient.email : 'Selected client';

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium">Upload Tax Documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload PDF documents for {clientName} to extract form data automatically
        </p>
      </div>

      {/* File Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Upload
          </CardTitle>
          <CardDescription>
            Select PDF files containing tax information to extract data automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              multiple
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Click to upload PDF files
              </p>
              <p className="text-sm text-gray-500">
                Support for multiple PDF files. Maximum 10MB per file.
              </p>
            </label>
          </div>

          {uploadedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">{uploadedFile.name}</p>
                  <p className="text-sm text-blue-700">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {isComplete && <Check className="h-6 w-6 text-green-600" />}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Form Button */}
      {uploadedFile && !isComplete && (
        <div className="text-center">
          <Button 
            onClick={handleGenerateForm} 
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing Documents...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generate Form from PDF
              </>
            )}
          </Button>
          {isProcessing && (
            <p className="text-sm text-muted-foreground mt-2">
              Extracting data from uploaded documents...
            </p>
          )}
        </div>
      )}

      {/* Success Message */}
      {isComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Check className="h-12 w-12 text-green-600 mx-auto" />
              <h4 className="font-medium text-green-900">Data Extraction Complete!</h4>
              <p className="text-sm text-green-700">
                Form data has been successfully extracted from the uploaded documents.
                You can now review and edit the form details.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentUploadStep;
