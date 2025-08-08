import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import CloseoutFormView from '@/components/CloseoutForms/CloseoutFormView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import { DataProvider } from '@/contexts/DataContext';

const CloseoutFormPreviewPageContent = () => {
  const { formId } = useParams<{ formId: string }>();
  const { forms } = useData();
  const { user, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Debug logging
  console.log('CloseoutFormPreviewPage - Component rendered');
  console.log('CloseoutFormPreviewPage - formId:', formId);
  console.log('CloseoutFormPreviewPage - forms length:', forms.length);
  console.log('CloseoutFormPreviewPage - user:', user);
  console.log('CloseoutFormPreviewPage - authLoading:', authLoading);
  console.log('CloseoutFormPreviewPage - isLoading:', isLoading);
  console.log('CloseoutFormPreviewPage - notFound:', notFound);
  console.log('CloseoutFormPreviewPage - form:', form);

  useEffect(() => {
    console.log('CloseoutFormPreviewPage useEffect - formId:', formId);
    console.log('CloseoutFormPreviewPage useEffect - forms:', forms);
    
    if (formId && forms.length > 0) {
      const foundForm = forms.find(f => f.id === formId);
      console.log('CloseoutFormPreviewPage useEffect - foundForm:', foundForm);
      if (foundForm) {
        setForm(foundForm);
        setIsLoading(false);
      } else {
        console.log('CloseoutFormPreviewPage useEffect - Form not found in forms array');
        setNotFound(true);
        setIsLoading(false);
      }
    } else if (formId && forms.length === 0) {
      // Don't set notFound immediately - wait for forms to load
      console.log('CloseoutFormPreviewPage useEffect - No forms loaded yet, waiting...');
      // Only set notFound if we've been waiting for more than 5 seconds
      const timeout = setTimeout(() => {
        if (forms.length === 0) {
          console.log('CloseoutFormPreviewPage useEffect - Forms still not loaded after timeout');
          setNotFound(true);
          setIsLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [formId, forms]);

  // Reset loading state when forms are loaded
  useEffect(() => {
    if (forms.length > 0 && isLoading) {
      console.log('CloseoutFormPreviewPage - Forms loaded, checking for form...');
      if (formId) {
        const foundForm = forms.find(f => f.id === formId);
        if (foundForm) {
          setForm(foundForm);
          setIsLoading(false);
        } else {
          setNotFound(true);
          setIsLoading(false);
        }
      }
    }
  }, [forms, formId, isLoading]);

  // Check auth loading first to prevent premature redirects
  if (authLoading) {
    console.log('CloseoutFormPreviewPage - Auth loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-blue-600 flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              Loading Authentication...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please wait while we verify your authentication.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Only check user after auth loading is complete
  if (!user) {
    console.log('CloseoutFormPreviewPage - No user, redirecting to /');
    return <Navigate to="/" />;
  }

  if (isLoading) {
    console.log('CloseoutFormPreviewPage - Loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-blue-600 flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              Loading Form...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Please wait while we load the form data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notFound || !form) {
    console.log('CloseoutFormPreviewPage - Form not found or not loaded');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              Form Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              The requested form could not be found or you don't have permission to view it.
            </p>
            <Button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('CloseoutFormPreviewPage - Rendering form:', form);
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <Button 
          onClick={() => window.history.back()}
          variant="outline"
          className="flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h1 className="text-xl font-semibold text-blue-800 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Form Preview - {form.clientName}
          </h1>
          <p className="text-blue-600 text-sm mt-1">
            This is a read-only preview of the closeout form. No changes can be made in this view.
          </p>
        </div>
      </div>
      
      <CloseoutFormView form={form} />
    </div>
  );
};

const CloseoutFormPreviewPage = () => {
  return (
    <DataProvider>
      <CloseoutFormPreviewPageContent />
    </DataProvider>
  );
};

export default CloseoutFormPreviewPage; 