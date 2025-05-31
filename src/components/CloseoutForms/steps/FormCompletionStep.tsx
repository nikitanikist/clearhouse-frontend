
import React from 'react';
import CloseoutFormTable, { CloseoutFormTableData } from '../CloseoutFormTable';
import PreviousYearForms from '../PreviousYearForms';
import { Client } from '../ClientSearch';
import { CloseoutForm } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';

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
    <div className="space-y-6">
      <div className="flex gap-6 max-h-[60vh] overflow-hidden">
        {/* Left side - Form creation */}
        <div className="flex-1 overflow-y-auto pr-2">
          <CloseoutFormTable
            initialData={extractedData}
            onSubmit={onSubmit}
            onCancel={onCancel}
            showButtons={false}
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

      {/* Bottom action buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => {
          // Get the form data from CloseoutFormTable and submit
          const formElement = document.querySelector('form');
          if (formElement) {
            const formData = new FormData(formElement);
            // This is a simplified approach - in reality, you'd need to properly extract the form data
            // For now, we'll trigger the form's submit handler
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            formElement.dispatchEvent(submitEvent);
          }
        }}>
          Submit Closeout Form
        </Button>
      </div>
    </div>
  );
};

export default FormCompletionStep;
