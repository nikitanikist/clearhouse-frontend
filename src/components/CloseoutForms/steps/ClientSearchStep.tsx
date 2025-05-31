
import React from 'react';
import EmailClientSearch from '../EmailClientSearch';
import { Client } from '../ClientSearch';

interface ClientSearchStepProps {
  onClientSelect: (client: Client) => void;
  onNewClient: (email: string) => void;
}

const ClientSearchStep = ({ onClientSelect, onNewClient }: ClientSearchStepProps) => {
  return (
    <div className="py-4">
      <EmailClientSearch 
        onClientSelect={onClientSelect}
        onNewClient={onNewClient}
      />
    </div>
  );
};

export default ClientSearchStep;
