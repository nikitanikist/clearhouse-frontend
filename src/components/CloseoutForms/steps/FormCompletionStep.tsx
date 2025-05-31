
import React from 'react';
import CloseoutFormTable, { CloseoutFormTableData } from '../CloseoutFormTable';
import PreviousYearForms from '../PreviousYearForms';
import { Client } from '../ClientSearch';
import { CloseoutForm } from '@/contexts/DataContext';

interface FormCompletionStepProps {
  extractedData: Partial<CloseoutFormTableData>;
  selectedClient: Client | { email: string; name?: string };
  isNewClient: boolean;
  previousForms: CloseoutForm[];
  onSubmit: (formData: CloseoutFormTableData) => void;
  onCancel: () => void;
}

const FormCompletionStep = ({ 
  extractedData, 
  selectedClient, 
  isNewClient, 
  previousForms, 
  onSubmit, 
  onCancel 
}: FormCompletionStepProps) => {
  return (
    <div className="flex gap-6 max-h-[70vh] overflow-hidden">
      {/* Left side - Form creation */}
      <div className="flex-1 overflow-y-auto pr-2">
        <CloseoutFormTable
          initialData={extractedData}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      </div>

      {/* Right side - Previous year forms (only for existing clients) */}
      {!isNewClient && selectedClient && 'name' in selectedClient && (
        <div className="w-80 border-l pl-6">
          <div className="sticky top-0 max-h-[70vh] overflow-y-auto">
            <PreviousYearForms 
              client={selectedClient as Client} 
              previousForms={previousForms} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FormCompletionStep;
