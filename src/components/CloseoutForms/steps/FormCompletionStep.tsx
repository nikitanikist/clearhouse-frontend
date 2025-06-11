
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
  formType?: 'personal' | 'corporate';
}

const FormCompletionStep = ({ 
  extractedData, 
  selectedClient, 
  isNewClient, 
  previousForms, 
  onSubmit, 
  onCancel,
  formType = 'personal'
}: FormCompletionStepProps) => {
  const hasPreviousYearData = !isNewClient && previousForms.length > 0;
  const mostRecentPreviousForm = hasPreviousYearData ? 
    previousForms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] : 
    null;

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

  const formTypeDisplay = formType === 'personal' ? 'Personal Tax' : 'Corporate';

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create New {formTypeDisplay} Closeout Form</h1>
        <p className="text-sm text-gray-600">
          {isNewClient ? 'New client - no previous forms available' : 'Complete the form details below'}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-gray-600">Client:</span>
          <span className="font-medium text-gray-900">
            {selectedClient && 'name' in selectedClient ? selectedClient.name : selectedClient?.email}
          </span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">{selectedClient?.email}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-600">Type: {formTypeDisplay}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <CloseoutFormTable
          initialData={extractedData}
          onSubmit={onSubmit}
          onCancel={onCancel}
          showButtons={true}
          formType={formType}
        />
      </div>

      {!isNewClient && selectedClient && 'name' in selectedClient && previousForms.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Previous Forms Reference</h3>
          <div className="max-h-60 overflow-y-auto">
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
