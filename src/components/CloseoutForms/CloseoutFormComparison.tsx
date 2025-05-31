
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
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
    // Mobile layout - stacked vertically with clear sections
    return (
      <div className="h-full flex flex-col gap-6 p-4 bg-gray-50">
        {/* Header with actions */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Form Comparison</h1>
          </div>
        </div>

        {/* Current form - editable */}
        <div className="flex-1 min-h-0">
          <Card className="h-full flex flex-col shadow-sm">
            <CardHeader className="pb-4 bg-blue-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>📝 Current Form - {extractedData.years || 'Edit Mode'}</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Editing
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">Make your changes below and resubmit when ready</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-4">
              <ScrollArea className="h-full">
                <CloseoutFormTable
                  initialData={extractedData}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                  showButtons={true}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Separator */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="text-sm text-gray-500 font-medium">REFERENCE</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Previous year data (read-only) */}
        <div className="flex-1 min-h-0">
          <Card className="h-full flex flex-col shadow-sm">
            <CardHeader className="pb-4 bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>📋 Previous Year - {previousForm.years}</span>
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                  Reference Only
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600">Use this as reference for your current form</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-4">
              <ScrollArea className="h-full">
                <CloseoutFormView form={previousForm} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop layout - side by side with improved spacing
  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-gray-50">
      {/* Header with clear actions */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Form Comparison & Amendment</h1>
            <p className="text-sm text-gray-600 mt-1">Compare with previous year and make necessary changes</p>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left side - Current form (editable) */}
        <div className="flex-1 min-w-0">
          <Card className="h-full flex flex-col shadow-sm">
            <CardHeader className="pb-4 bg-blue-50 border-b">
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center gap-2">
                  📝 Current Form - {extractedData.years || 'Edit Mode'}
                </span>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Editing
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">Make your changes below and click "Resubmit Form" when ready</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-6">
              <ScrollArea className="h-full pr-4">
                <CloseoutFormTable
                  initialData={extractedData}
                  onSubmit={onSubmit}
                  onCancel={onCancel}
                  showButtons={true}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Vertical separator with label */}
        <div className="flex flex-col items-center justify-center w-12">
          <div className="h-full w-px bg-gray-300"></div>
          <div className="absolute bg-gray-50 px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-gray-500">VS</span>
          </div>
        </div>

        {/* Right side - Previous year data (read-only) */}
        <div className="flex-1 min-w-0">
          <Card className="h-full flex flex-col shadow-sm">
            <CardHeader className="pb-4 bg-gray-50 border-b">
              <CardTitle className="flex items-center justify-between text-xl">
                <span className="flex items-center gap-2">
                  📋 Previous Year - {previousForm.years}
                </span>
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">
                  Reference Only
                </Badge>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">Use this as reference while editing your current form</p>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-6">
              <ScrollArea className="h-full pr-4">
                <CloseoutFormView form={previousForm} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CloseoutFormComparison;
