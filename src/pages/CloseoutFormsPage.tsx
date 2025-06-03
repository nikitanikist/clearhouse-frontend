
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

  // Ensure status has a default value if undefined
  const formStatus = status || 'pending';

  useEffect(() => {
    // Reset selected form when the status route changes
    setSelectedForm(null);
  }, [status]);

  console.log('CloseoutFormsPage - Forms:', forms);
  console.log('CloseoutFormsPage - Status:', formStatus);
  console.log('CloseoutFormsPage - Raw status param:', status);
  console.log('CloseoutFormsPage - User role:', user?.role);
  console.log('CloseoutFormsPage - Selected form:', selectedForm);

  const getTitle = () => {
    switch (formStatus) {
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
    switch (formStatus) {
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

  const handleFormSelect = (form: any) => {
    console.log('CloseoutFormsPage - Form selected:', form);
    setSelectedForm(form);
  };

  const renderFormView = () => {
    if (!selectedForm) return null;

    console.log('CloseoutFormsPage - Rendering form view for user role:', user?.role);
    console.log('CloseoutFormsPage - Selected form data:', selectedForm);

    // Use admin view for admin/superadmin, regular view for preparers
    if (user?.role === 'admin' || user?.role === 'superadmin') {
      console.log('CloseoutFormsPage - Using CloseoutFormAdminView');
      return <CloseoutFormAdminView form={selectedForm} />;
    } else {
      console.log('CloseoutFormsPage - Using CloseoutFormView');
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
            status={formStatus as 'pending' | 'active' | 'completed' | 'rejected'}
            onBack={handleBackToList}
            onFormSelect={handleFormSelect}
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
