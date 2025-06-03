
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft } from 'lucide-react';
import CloseoutFormsList from '@/components/CloseoutForms/CloseoutFormsList';
import CloseoutFormView from '@/components/CloseoutForms/CloseoutFormView';
import CloseoutFormAdminView from '@/components/CloseoutForms/CloseoutFormAdminView';

const CloseoutFormsPage = () => {
  const { user } = useAuth();
  const { forms } = useData();
  const navigate = useNavigate();
  const { status } = useParams<{ status: string }>();
  const [selectedForm, setSelectedForm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Reset selected form when the status route changes
    setSelectedForm(null);
  }, [status]);

  const getTitle = () => {
    switch (status) {
      case 'pending':
        return 'Pending Closeout Forms';
      case 'active':
        return 'Active Closeout Forms';
      case 'completed':
        return 'Completed Closeout Forms';
      case 'rejected':
        return 'Amendment Required Forms';
      default:
        return 'Closeout Forms';
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'pending':
        return 'List of closeout forms awaiting review.';
      case 'active':
        return 'List of closeout forms currently being processed.';
      case 'completed':
        return 'List of successfully completed closeout forms.';
      case 'rejected':
        return 'List of closeout forms that require amendments.';
      default:
        return 'Overview of all closeout forms.';
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesStatus = !status || form.status === status;
    const matchesSearch =
      user?.role !== 'preparer' ||
      form.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.signingEmail.toLowerCase().includes(searchTerm.toLowerCase());

    if (user?.role === 'admin' && status !== 'pending') {
      return matchesStatus && matchesSearch && form.assignedTo?.id === user.id;
    }

    if (user?.role === 'preparer') {
      return matchesStatus && matchesSearch && form.createdBy?.id === user.id;
    }

    return matchesStatus && matchesSearch;
  });

  const renderFormView = () => {
    if (!selectedForm) return null;

    // Use admin view for admin/superadmin, regular view for preparers
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      return <CloseoutFormAdminView form={selectedForm} />;
    } else {
      return <CloseoutFormView form={selectedForm} />;
    }
  };

  const handleBackToList = () => {
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      {!selectedForm ? (
        <>
          {/* Form list header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {getTitle()}
              </h1>
              <p className="text-gray-600">{getDescription()}</p>
            </div>
          </div>

          {/* Search box for preparers only */}
          {user?.role === 'preparer' && (
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by client email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <CloseoutFormsList 
            status={status as 'pending' | 'active' | 'completed' | 'rejected'}
            onBack={handleBackToList}
          />
        </>
      ) : (
        <div className="space-y-4">
          <Button
            variant="outline"
            onClick={() => setSelectedForm(null)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          {renderFormView()}
        </div>
      )}
    </div>
  );
};

export default CloseoutFormsPage;
