
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, File, CheckCircle, RefreshCw, Database } from 'lucide-react';
import { Client } from './ClientSearch';

interface UploadedFile {
  name: string;
  status: 'uploading' | 'uploaded' | 'processed';
  size: string;
}

interface MultiPDFUploadProps {
  client: Client | { email: string; name?: string };
  onDataExtracted: (extractedData: any) => void;
}

const MultiPDFUpload = ({ client, onDataExtracted }: MultiPDFUploadProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const files = Array.from(e.target.files);
    
    // Simulate file upload
    files.forEach((file, index) => {
      const uploadedFile: UploadedFile = {
        name: file.name,
        status: 'uploading',
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
      };
      
      setUploadedFiles(prev => [...prev, uploadedFile]);
      
      // Simulate upload completion
      setTimeout(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.name === file.name ? { ...f, status: 'uploaded' } : f
          )
        );
      }, 1000 + index * 500);
    });
  };

  const handleDataExtraction = () => {
    setIsExtracting(true);
    
    // Simulate data extraction process
    setTimeout(() => {
      // Mark files as processed
      setUploadedFiles(prev => 
        prev.map(f => ({ ...f, status: 'processed' }))
      );
      
      // Generate realistic extracted data based on client
      const extractedData = {
        filePath: `\\\\Clearhouse\\Clients\\${client.name?.replace(' ', '_') || 'NewClient'}_2024\\T1`,
        partner: 'Priya S.',
        manager: 'Deepak Jain',
        years: '2024',
        jobNumber: `${Math.floor(Math.random() * 10000)}-T1`,
        invoiceAmount: `$${Math.floor(Math.random() * 500 + 300)} CAD`,
        billDetail: 'Personal T1 + Additional Schedules',
        paymentRequired: Math.random() > 0.5,
        wipRecovery: '100%',
        recoveryReason: '',
        familyMembers: [
          {
            id: '1',
            clientName: client.name || 'New Client',
            signingPerson: client.name || 'New Client',
            signingEmail: client.email,
            additionalEmails: [],
            isT1: true,
            isS216: false,
            isS116: false,
            isPaperFiled: false,
            installmentsRequired: Math.random() > 0.5,
            personalTaxPayment: `$${Math.floor(Math.random() * 2000 + 500)}.00`
          }
        ]
      };
      
      setIsExtracting(false);
      setExtractionComplete(true);
      onDataExtracted(extractedData);
    }, 3000);
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processed':
        return <Database className="h-4 w-4 text-purple-500" />;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'uploaded':
        return 'Uploaded';
      case 'processed':
        return 'Data Extracted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-medium text-lg mb-2">Upload Documents</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Creating closeout form for: <span className="font-medium">{client.name || 'New Client'}</span> ({client.email})
        </p>
      </div>

      {/* File Upload Area */}
      {!extractionComplete && (
        <div className="w-full">
          <Label 
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-1 text-sm text-gray-500">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">Multiple PDF files supported</p>
            </div>
            <input 
              id="file-upload" 
              type="file" 
              className="hidden" 
              multiple
              accept=".pdf"
              onChange={handleFileUpload}
            />
          </Label>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <File className="h-5 w-5 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(file.status)}
                  <span className="text-xs text-muted-foreground">{getStatusText(file.status)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Extraction Button */}
      {uploadedFiles.length > 0 && uploadedFiles.every(f => f.status === 'uploaded') && !extractionComplete && (
        <div className="flex justify-center">
          <Button 
            onClick={handleDataExtraction}
            disabled={isExtracting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Extracting Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Fetch Data & Generate Closeout
              </>
            )}
          </Button>
        </div>
      )}

      {/* Extraction Complete */}
      {extractionComplete && (
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-800 font-medium">Data extraction completed successfully!</p>
          <p className="text-sm text-green-600">Closeout form has been generated with the extracted data.</p>
        </div>
      )}
    </div>
  );
};

export default MultiPDFUpload;
