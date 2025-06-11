
import { useState } from 'react';
import { Client } from '../ClientSearch';
import { CloseoutFormTableData } from '../CloseoutFormTable';

export const useFormSteps = () => {
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<CloseoutFormTableData> | null>(null);
  const [isNewClient, setIsNewClient] = useState(false);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setIsNewClient(false);
    setStep(3);
  };

  const handleNewClient = (email: string) => {
    setSelectedClient({ email, name: undefined });
    setIsNewClient(true);
    setStep(3);
  };

  const handleDataExtracted = (data: Partial<CloseoutFormTableData>) => {
    setExtractedData(data);
    setStep(4);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedClient(null);
    setExtractedData(null);
    setIsNewClient(false);
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Create Closeout Form';
      case 2:
        return 'Select Client';
      case 3:
        return 'Upload Documents';
      case 4:
        return 'Complete Form';
      default:
        return 'Create Closeout Form';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Choose the type of closeout form to create.';
      case 2:
        return 'Search for an existing client or create a new one.';
      case 3:
        return 'Upload tax documents to extract form data.';
      case 4:
        return 'Review and complete the closeout form details.';
      default:
        return 'Fill out the closeout form information.';
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
