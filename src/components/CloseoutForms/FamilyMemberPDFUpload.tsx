import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Check, Loader2, AlertCircle } from 'lucide-react';

interface FamilyMemberPDFUploadProps {
  familyMemberIndex: number;
  familyMemberName: string;
  onDataExtracted: (index: number, data: any) => void;
}

const FamilyMemberPDFUpload = ({ 
  familyMemberIndex, 
  familyMemberName, 
  onDataExtracted 
}: FamilyMemberPDFUploadProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        setIsComplete(false);
        setExtractedData(null);
      } else {
        setError("Invalid file type. Please upload a PDF file.");
      }
    }
  };

  const handleExtractData = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('pdf', uploadedFile);
      formData.append('familyMemberIndex', familyMemberIndex.toString());

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/api/extract-section2-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Do NOT set 'Content-Type' when using FormData with fetch
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setExtractedData(result.data);
        setIsComplete(true);
        console.log('DEBUG: result.data from backend:', result.data); // Debug log
        // Pass the extracted data to parent component with correct field names
        onDataExtracted(familyMemberIndex, {
          signingPerson: result.data.name || '',
          signingEmail: result.data.email || '',
          isT1135: result.data.t1135 || false,
          isT1032: result.data.t1032 || false,
          isT1: result.data.returnType === 'T1',
          isS216: result.data.returnType === 'S216',
          isS116: false, // S116 not auto-detected yet
          isDeceased: result.data.isDeceased || false,
          otherNotes: result.data.notes || '',
          taxPayable48400: typeof result.data.taxPayable48400 === 'number' ? result.data.taxPayable48400 : null,
          taxPayable48500: typeof result.data.taxPayable48500 === 'number' ? result.data.taxPayable48500 : null
        });
      } else {
        throw new Error(result.message || 'Extraction failed');
      }
    } catch (error) {
      console.error('Error extracting PDF data:', error);
      setError("Failed to extract data from PDF. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">
              Upload T1/C1 PDF for {familyMemberName}
            </Label>
            {isComplete && <Check className="h-5 w-5 text-green-600" />}
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!uploadedFile ? (
            <label className="cursor-pointer block">
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Click to upload individual tax return PDF
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF should contain identification and tax details
                </p>
              </div>
            </label>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-blue-900">{uploadedFile.name}</p>
                    <p className="text-xs text-blue-700">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>

              {!isComplete && (
                <Button 
                  onClick={handleExtractData} 
                  disabled={isProcessing}
                  className="w-full"
                  size="sm"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting Data...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Extract Data from PDF
                    </>
                  )}
                </Button>
              )}

              {extractedData && (
                <div>
                  <Alert className="mb-3 border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Data extracted successfully from PDF
                    </AlertDescription>
                  </Alert>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Extracted Data:</h4>
                    <div className="space-y-1 text-xs">
                      <p><span className="font-medium">Name:</span> {extractedData.name || 'Not found'}</p>
                      <p><span className="font-medium">Email:</span> {extractedData.email || 'Not found'}</p>
                      <p><span className="font-medium">Return Type:</span> {extractedData.returnType || 'T1'} 
                        {extractedData.isDeceased && ' (Deceased)'}
                      </p>
                      <p><span className="font-medium">T1135 (Foreign Property):</span> {extractedData.t1135 ? 'Yes' : 'No'}</p>
                      <p><span className="font-medium">T1032 (Pension Split):</span> {extractedData.t1032 ? 'Yes' : 'No'}</p>
                      {typeof extractedData.taxPayable48400 === 'number' && extractedData.taxPayable48400 !== null && (
                        <p>
                          <span className="font-medium">Tax Payable (Refund 48400):</span> 
                          <span className="font-bold" style={{ color: 'green' }}>
                            {extractedData.taxPayable48400.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}
                          </span>
                        </p>
                      )}
                      {typeof extractedData.taxPayable48500 === 'number' && extractedData.taxPayable48500 !== null && (
                        <p>
                          <span className="font-medium">Tax Payable (Owing 48500):</span> 
                          <span className="font-bold" style={{ color: 'red' }}>
                            {extractedData.taxPayable48500.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' })}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {uploadedFile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setUploadedFile(null);
                setIsComplete(false);
                setExtractedData(null);
                setError(null);
              }}
              className="w-full"
            >
              Remove and Upload Different PDF
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyMemberPDFUpload;