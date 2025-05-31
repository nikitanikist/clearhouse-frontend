
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
    <div className="h-full flex flex-col gap-6 p-6 bg-gray-50">
      {/* Header for new client form */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h1 className="text-2xl font-semibold text-gray-900">Create New Closeout Form</h1>
        <p className="text-sm text-gray-600 mt-1">
          {isNewClient ? 'New client - no previous forms available' : 'Complete the form details below'}
        </p>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left side - Form creation */}
        <div className="flex-1 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <CloseoutFormTable
              initialData={extractedData}
              onSubmit={onSubmit}
              onCancel={onCancel}
              showButtons={true}
            />
          </div>
        </div>

        {/* Right side - Previous year forms (only for existing clients) */}
        {!isNewClient && selectedClient && 'name' in selectedClient && (
          <div className="w-80">
            <div className="bg-white rounded-lg shadow-sm p-6 h-full overflow-y-auto">
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
