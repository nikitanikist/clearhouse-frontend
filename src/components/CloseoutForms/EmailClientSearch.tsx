
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, User, UserPlus } from 'lucide-react';
import { Client } from './ClientSearch';

interface EmailClientSearchProps {
  onClientSelect: (client: Client) => void;
  onNewClient: (email: string) => void;
}

// Mock client database - expanded with more emails
const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@gmail.com',
    phone: '+1 (555) 123-4567',
    lastYearForm: 'form-1'
  },
  {
    id: 'client-2',
    name: 'Anita Patel',
    email: 'anita.patel@outlook.com',
    phone: '+1 (555) 234-5678',
    lastYearForm: 'form-2'
  },
  {
    id: 'client-3',
    name: 'Michael Johnson',
    email: 'mjohnson@company.ca',
    phone: '+1 (555) 345-6789',
    lastYearForm: 'form-3'
  },
  {
    id: 'client-4',
    name: 'Sarah Williams',
    email: 'swilliams@mail.com',
    phone: '+1 (555) 456-7890',
    lastYearForm: 'form-4'
  },
  {
    id: 'client-5',
    name: 'David Chen',
    email: 'david.chen@email.com',
    phone: '+1 (555) 567-8901'
  },
  {
    id: 'client-6',
    name: 'Lisa Rodriguez',
    email: 'lisa.rodriguez@gmail.com',
    phone: '+1 (555) 678-9012'
  }
];

const EmailClientSearch = ({ onClientSelect, onNewClient }: EmailClientSearchProps) => {
  const [email, setEmail] = useState('');
  const [searchResult, setSearchResult] = useState<Client | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!email.trim()) return;
    
    const client = mockClients.find(c => 
      c.email.toLowerCase() === email.toLowerCase()
    );
    
    setSearchResult(client || null);
    setHasSearched(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectClient = () => {
    if (searchResult) {
      onClientSelect(searchResult);
    }
  };

  const handleNewClient = () => {
    onNewClient(email);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="emailSearch">Client Email Address</Label>
        <div className="flex gap-2">
          <Input
            id="emailSearch"
            type="email"
            placeholder="Enter client's email address..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-3">
          {searchResult ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-green-600">
                Existing Client Found
              </h4>
              
              <Card className="cursor-pointer hover:bg-secondary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium">{searchResult.name}</h5>
                      <p className="text-sm text-muted-foreground">{searchResult.email}</p>
                      {searchResult.phone && (
                        <p className="text-xs text-muted-foreground">{searchResult.phone}</p>
                      )}
                      {searchResult.lastYearForm && (
                        <p className="text-xs text-blue-600">Has previous year forms</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <Button onClick={handleSelectClient} className="bg-green-600 hover:bg-green-700">
                        Select Client
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-orange-600">
                Client Not Found
              </h4>
              
              <Card className="border-dashed border-2 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <UserPlus className="h-10 w-10 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium">New Client</h5>
                      <p className="text-sm text-muted-foreground">{email}</p>
                      <p className="text-xs text-muted-foreground">This email is not in our database</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button onClick={handleNewClient} variant="outline" className="border-orange-500 text-orange-600 hover:bg-orange-50">
                        Add New Client
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailClientSearch;
