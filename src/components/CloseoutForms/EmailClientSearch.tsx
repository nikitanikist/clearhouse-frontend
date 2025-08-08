
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, User, UserPlus, Loader2, Calendar } from 'lucide-react';
import { Client } from './ClientSearch';
import { searchClients, createClient, getLastCloseoutDate } from '@/services/api';

interface EmailClientSearchProps {
  onClientSelect: (client: Client) => void;
  onNewClient: (email: string) => void;
}

// Removed mock data - now using real database data

const EmailClientSearch = ({ onClientSelect, onNewClient }: EmailClientSearchProps) => {
  const [email, setEmail] = useState('');
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCloseoutDates, setLastCloseoutDates] = useState<{[key: string]: string | null}>({});
  const [loadingCloseoutDates, setLoadingCloseoutDates] = useState(false);

  const fetchLastCloseoutDates = async (clients: Client[]) => {
    setLoadingCloseoutDates(true);
    const dates: {[key: string]: string | null} = {};
    
    try {
      for (const client of clients) {
        try {
          const lastDate = await getLastCloseoutDate(client.id);
          dates[client.id] = lastDate;
        } catch (err) {
          console.error(`Error fetching last closeout date for client ${client.id}:`, err);
          dates[client.id] = null;
        }
      }
      setLastCloseoutDates(dates);
    } catch (err) {
      console.error('Error fetching last closeout dates:', err);
    } finally {
      setLoadingCloseoutDates(false);
    }
  };

  const handleSearch = async () => {
    if (!email.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const clients = await searchClients(email);
      setSearchResults(clients);
      setHasSearched(true);
      
      // Fetch last closeout dates for found clients
      if (clients.length > 0) {
        await fetchLastCloseoutDates(clients);
      }
    } catch (err) {
      console.error('Error searching clients:', err);
      setError('Failed to search clients. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectClient = (client: Client) => {
    onClientSelect(client);
  };

  const handleNewClient = () => {
    onNewClient(email);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
          <Button onClick={handleSearch} variant="outline" disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Search for existing clients in the database
        </p>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      {hasSearched && (
        <div className="space-y-3">
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-green-600">
                {searchResults.length === 1 ? 'Existing Client Found' : `${searchResults.length} Existing Clients Found`}
              </h4>
              
              {searchResults.map((client) => (
                <Card key={client.id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Client Info */}
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <User className="h-10 w-10 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-green-900">{client.name}</h5>
                          <p className="text-sm text-green-700">{client.email}</p>
                          {client.phone && (
                            <p className="text-xs text-green-600">{client.phone}</p>
                          )}
                          <p className="text-xs text-blue-600 font-medium">✓ Client exists in database</p>
                        </div>
                      </div>
                      
                      {/* Last Closeout Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-green-200">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {loadingCloseoutDates ? (
                            <span>Loading last closeout date...</span>
                          ) : lastCloseoutDates[client.id] ? (
                            <span>Last closeout was created at {formatDate(lastCloseoutDates[client.id]!)}</span>
                          ) : (
                            <span>No previous closeouts found</span>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleSelectClient(client)} 
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Create New Closeout
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
