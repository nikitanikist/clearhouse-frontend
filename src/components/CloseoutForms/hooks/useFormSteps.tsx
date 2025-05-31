
import { useState } from 'react';
import { Client } from '../ClientSearch';
import { CloseoutFormTableData } from '../CloseoutFormTable';

export const useFormSteps = () => {
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | { email: string; name?: string } | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<CloseoutFormTableData> | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setIsNewClient(false);
    setStep(2);
  };

  const handleNewClient = (email: string) => {
    setSelectedClient({ email, name: 'New Client' });
    setIsNewClient(true);
    setStep(2);
  };

  const handleDataExtracted = (data: Partial<CloseoutFormTableData>) => {
    setExtractedData(data);
    setStep(3);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedClient(null);
    setExtractedData(null);
    setIsNewClient(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Find Client';
      case 2: return 'Upload Documents';
      case 3: return 'Create Closeout Form';
      default: return 'Create Closeout Form';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Enter client email to search for existing clients or add new ones';
      case 2: return `Upload PDF documents for ${selectedClient?.name || selectedClient?.email}`;
      case 3: return 'Review and complete the closeout form details';
      default: return '';
    }
  };

  return {
    step,
    setStep,
    selectedClient,
    extractedData,
    isNewClient,
    handleClientSelect,
    handleNewClient,
    handleDataExtracted,
    resetForm,
    getStepTitle,
    getStepDescription,
  };
};
