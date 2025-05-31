
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CloseoutForm } from '@/contexts/DataContext';
import { useIsMobile } from '@/hooks/use-mobile';
import CloseoutFormTable, { CloseoutFormTableData } from './CloseoutFormTable';
import CloseoutFormView from './CloseoutFormView';
import { ArrowLeft, Save } from 'lucide-react';

interface CloseoutFormComparisonProps {
  extractedData: Partial<CloseoutFormTableData>;
  previousForm: CloseoutForm;
  onSubmit: (formData: CloseoutFormTableData) => void;
  onCancel: () => void;
}

const CloseoutFormComparison = ({ 
  extractedData, 
  previousForm, 
  onSubmit, 
  onCancel 
}: CloseoutFormComparisonProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    // Mobile layout - stacked vertically with scrolling
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b p-4 flex-shrink-0">
          <h1 className="text-xl font-semibold">Form Comparison</h1>
          <p className="text-sm text-gray-600 mt-1">Compare and edit your form using the reference data</p>
        </div>

        {/* Content - Full height with proper spacing */}
        <div className="flex-1 p-4 space-y-4 pb-20 overflow-y-auto">
          {/* Current form - editable */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 bg-blue-50">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>📝 Current Form</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Editing
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CloseoutFormTable
                initialData={extractedData}
                onSubmit={onSubmit}
                onCancel={onCancel}
                showButtons={false}
              />
            </CardContent>
          </Card>

          {/* Previous form (reference) */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4 bg-gray-50">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>📋 Reference Form</span>
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                  Reference
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <CloseoutFormView form={previousForm} />
            </CardContent>
          </Card>
        </div>

        {/* Fixed bottom buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3 z-10">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={() => onSubmit(extractedData as CloseoutFormTableData)} className="flex-1 bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Submit Form
          </Button>
        </div>
      </div>
    );
  }

  // Desktop layout - side by side with scrollable content areas
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6 flex-shrink-0">
        <h1 className="text-2xl font-semibold text-gray-900">Form Comparison</h1>
        <p className="text-sm text-gray-600 mt-1">Compare and edit your form using the reference data</p>
      </div>

      {/* Main content area - two columns with scrollable content */}
      <div className="flex-1 flex min-h-0 p-6 gap-6">
        {/* Left side - Current form (editable) */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col shadow-sm h-full">
            <CardHeader className="pb-4 bg-blue-50 border-b flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center gap-2">
                  📝 Current Form
                </span>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Editing
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <CloseoutFormTable
                    initialData={extractedData}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    showButtons={false}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Reference form */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col shadow-sm h-full">
            <CardHeader className="pb-4 bg-gray-50 border-b flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center gap-2">
                  📋 Reference Form
                </span>
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                  Reference
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6">
                  <CloseoutFormView form={previousForm} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom action buttons */}
      <div className="bg-white border-t p-6 flex justify-between items-center flex-shrink-0">
        <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={() => onSubmit(extractedData as CloseoutFormTableData)} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
          <Save className="h-4 w-4" />
          Submit Form
        </Button>
      </div>
    </div>
  );
};

export default CloseoutFormComparison;
