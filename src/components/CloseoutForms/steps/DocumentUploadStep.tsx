
import React from 'react';
import MultiPDFUpload from '../MultiPDFUpload';
import { CloseoutFormTableData } from '../CloseoutFormTable';
import { Client } from '../ClientSearch';

interface DocumentUploadStepProps {
  selectedClient: Client | { email: string; name?: string };
  onDataExtracted: (data: Partial<CloseoutFormTableData>) => void;
}

const DocumentUploadStep = ({ selectedClient, onDataExtracted }: DocumentUploadStepProps) => {
  return (
    <div className="py-4">
      <MultiPDFUpload 
        client={selectedClient}
        onDataExtracted={onDataExtracted}
      />
    </div>
  );
};

export default DocumentUploadStep;
