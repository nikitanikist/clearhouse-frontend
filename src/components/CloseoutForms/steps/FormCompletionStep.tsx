
import React from 'react';
import CloseoutFormTable, { CloseoutFormTableData } from '../CloseoutFormTable';
import PreviousYearForms from '../PreviousYearForms';
import CloseoutFormComparison from '../CloseoutFormComparison';
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
  // Check if we have previous year data for comparison
  const hasPreviousYearData = !isNewClient && previousForms.length > 0;
  const mostRecentPreviousForm = hasPreviousYearData ? 
    previousForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : 
    null;

  // If we have previous year data, show the comparison view
  if (hasPreviousYearData && mostRecentPreviousForm) {
    return (
      <CloseoutFormComparison
        extractedData={extractedData}
        previousForm={mostRecentPreviousForm}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }

  // Original view for new clients or when no previous data exists
  return (
    <div className="space-y-6">
      <div className="flex gap-6 max-h-[60vh] overflow-hidden">
        {/* Left side - Form creation */}
        <div className="flex-1 overflow-y-auto pr-2">
          <CloseoutFormTable
            initialData={extractedData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            showButtons={true}
          />
        </div>

        {/* Right side - Previous year forms (only for existing clients) */}
        {!isNewClient && selectedClient && 'name' in selectedClient && (
          <div className="w-80 border-l pl-6">
            <div className="sticky top-0 max-h-[60vh] overflow-y-auto">
              <PreviousYearForms 
                client={selectedClient as Client} 
                previousForms={previousForms} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormCompletionStep;
