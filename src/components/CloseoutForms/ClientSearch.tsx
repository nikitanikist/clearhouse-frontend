
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, User } from 'lucide-react';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  lastYearForm?: string;
}

interface ClientSearchProps {
  onClientSelect: (client: Client) => void;
}

// Mock client database
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

const ClientSearch = ({ onClientSelect }: ClientSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const results = mockClients.filter(client =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clientSearch">Search Client</Label>
        <div className="flex gap-2">
          <Input
            id="clientSearch"
            placeholder="Enter client name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {hasSearched && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            {searchResults.length > 0 
              ? `Found ${searchResults.length} client(s)` 
              : 'No clients found'
            }
          </h4>
          
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((client) => (
                <Card 
                  key={client.id} 
                  className="cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => onClientSelect(client)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium truncate">{client.name}</h5>
                        <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                        {client.phone && (
                          <p className="text-xs text-muted-foreground">{client.phone}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <Button variant="outline" size="sm">
                          Select
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearch;
