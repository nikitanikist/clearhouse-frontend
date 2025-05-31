
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CloseoutForm } from '@/contexts/DataContext';
import { useIsMobile } from '@/hooks/use-mobile';
import CloseoutFormTable, { CloseoutFormTableData } from './CloseoutFormTable';
import CloseoutFormView from './CloseoutFormView';

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
    // Mobile layout - stacked vertically
    return (
      <div className="h-full flex flex-col gap-4 overflow-hidden">
        {/* Current form - editable */}
        <div className="flex-1 min-h-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Current Form - {extractedData.years || 'Edit Mode'}</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Editing
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-2">
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
        <Separator className="flex-shrink-0" />

        {/* Previous year data (read-only) */}
        <div className="flex-1 min-h-0">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center justify-between text-lg">
                <span>Previous Year - {previousForm.years}</span>
                <Badge variant="outline" className="bg-gray-50 text-gray-700">
                  Reference
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-2">
              <ScrollArea className="h-full">
                <CloseoutFormView form={previousForm} />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop layout - side by side
  return (
    <div className="h-full flex gap-6 overflow-hidden">
      {/* Left side - Current form (editable) */}
      <div className="flex-1 min-w-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Current Form - {extractedData.years || 'Edit Mode'}</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Editing
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
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

      {/* Vertical separator */}
      <Separator orientation="vertical" className="h-full flex-shrink-0" />

      {/* Right side - Previous year data (read-only) */}
      <div className="flex-1 min-w-0">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Previous Year - {previousForm.years}</span>
              <Badge variant="outline" className="bg-gray-50 text-gray-700">
                Reference
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <CloseoutFormView form={previousForm} />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CloseoutFormComparison;
