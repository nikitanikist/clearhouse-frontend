import React, { useState, useCallback } from 'react';
import { Upload, FileText, Check, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Client } from '../ClientSearch';
import { CloseoutFormTableData } from '../CloseoutFormTable';
import { toast } from 'sonner';
import api from '@/services/api';

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
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setUploadedFile(file);
      setIsComplete(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setIsComplete(false);
  };

  const handleGenerateForm = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Call the extraction API using the api instance (which handles 401 errors)
      const response = await api.post('/extract-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      const extractedData = result.data || {};
      console.log('DEBUG: extractedData from backend:', extractedData); // Debug log
      console.log('DEBUG: extractedData.notes =', extractedData.notes); // Direct debug log

      // Map the extracted data to form fields
      // IMPORTANT: Only changing the VALUES - keeping all fields same
      const mappedData: Partial<CloseoutFormTableData> = {
        formType: 'personal',
        filePath: '', // Empty for manual entry
        partner: extractedData.partner || '',
        manager: extractedData.manager || '',
        years: extractedData.years || '',
        jobNumber: extractedData.jobNumber || '', // Just number without -T1
        invoiceAmount: extractedData.invoiceAmount || '',
        billDetail: '', // Empty instead of "Personal T1 Tax Return"
        paymentRequired: false,
        wipRecovery: extractedData.wipRecovery || '100%',
        recoveryReason: '',
        // Section 2 - Empty for manual entry/separate upload
        familyMembers: [
          {
            id: '1',
            clientName: '', // Empty
            signingPerson: extractedData.name || '',
            signingEmail: extractedData.email || '',
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
        // Filing Details
        t2091PrincipalResidence: extractedData.t2091PrincipalResidence || false,
        t1135ForeignProperty: extractedData.t1135ForeignProperty || false,
        t1032PensionSplit: extractedData.t1032PensionSplit || false,
        hstDraftOrFinal: extractedData.hstDraftOrFinal || 'Final',
        // Set otherNotes at the top level for the main form
        otherNotes: (typeof extractedData.notes === 'string' && extractedData.notes.length > 0) ? extractedData.notes : (extractedData.otherNotes || ''),
        ontarioAnnualReturn: extractedData.ontarioAnnualReturn || false,
        // Additional fields
        tSlipType: extractedData.tSlipType || '',
        otherDocuments: extractedData.otherDocuments || '',
        personalTaxInstallmentsRequired: extractedData.personalTaxInstallmentsRequired || false,
        hstInstallmentsRequired: extractedData.hstInstallmentsRequired || false,
        outstandingTaxBalance: extractedData.outstandingTaxBalance || '0',
        // T1 Summary fields
        priorPeriodsBalance: extractedData.priorPeriodsBalance || '0',
        taxesPayable: extractedData.taxesPayable || '0',
        installmentsDuringYear: extractedData.installmentsDuringYear || '0',
        installmentsAfterYear: extractedData.installmentsAfterYear || '0',
        amountOwing: extractedData.amountOwing || '0',
        taxPaymentDueDate: extractedData.taxPaymentDueDate || 'April 30, 2025',
        returnFilingDueDate: 'April 30' as 'April 30' | 'June 15',
        // HST Summary fields
        hstPriorBalance: extractedData.hstPriorBalance || '0',
        hstPayable: extractedData.hstPayable || '0',
        hstInstallmentsDuring: extractedData.hstInstallmentsDuring || '0',
        hstInstallmentsAfter: extractedData.hstInstallmentsAfter || '0',
        hstPaymentDue: extractedData.hstPaymentDue || '0',
        hstDueDate: extractedData.hstDueDate || 'N/A',
        yearlyAmounts: extractedData.yearlyAmounts || []
      };
      console.log('DEBUG: mappedData to be sent to onDataExtracted:', mappedData); // Debug log
      setIsComplete(true);
      onDataExtracted(mappedData);
      
      toast.success('PDF data extracted successfully!');
    } catch (error) {
      console.error('PDF extraction error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to extract PDF data');
    } finally {
      setIsProcessing(false);
    }
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
              disabled={isProcessing}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-600 mb-2">
                Click to upload PDF files
              </p>
              <p className="text-sm text-gray-500">
                Support for PDF files. Maximum 10MB per file.
              </p>
            </label>
          </div>

          {/* Uploaded File Display */}
          {uploadedFile && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-10 w-10 text-blue-500" />
                  <div>
                    <p className="font-medium text-sm">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isComplete && (
                    <Check className="h-5 w-5 text-green-500" />
                  )}
                  {!isProcessing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          {uploadedFile && !isComplete && (
            <Button 
              onClick={handleGenerateForm}
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Documents...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Form from PDF
                </>
              )}
            </Button>
          )}

          {/* Success Message */}
          {isComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <Check className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">
                Data extracted successfully!
              </p>
              <p className="text-xs text-green-600 mt-1">
                You can now proceed to review and edit the form
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="text-sm text-gray-600 space-y-2">
        <p className="font-medium">Note:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Upload CCH iFirm PDF documents for best results</li>
          <li>The system will extract job details, partner, manager, and invoice information</li>
          <li>Year will be extracted from the "Period Ended" field</li>
          <li>File path must be entered manually after extraction</li>
          <li>You can edit all extracted information before saving</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentUploadStep;