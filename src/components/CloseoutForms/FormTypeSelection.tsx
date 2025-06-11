
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Building } from 'lucide-react';

interface FormTypeSelectionProps {
  onTypeSelect: (type: 'personal' | 'corporate') => void;
}

const FormTypeSelection = ({ onTypeSelect }: FormTypeSelectionProps) => {
  return (
    <div className="space-y-6 p-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Select Closeout Form Type</h2>
        <p className="text-gray-600">Choose the type of closeout form you want to create</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onTypeSelect('personal')}>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Personal Return</CardTitle>
            <CardDescription>
              T1, S216, and S116 personal tax returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => onTypeSelect('personal')}>
              Create Personal Return
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow opacity-50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Building className="h-6 w-6 text-gray-400" />
            </div>
            <CardTitle className="text-gray-400">Corporate Return</CardTitle>
            <CardDescription className="text-gray-400">
              Coming soon - T2 corporate tax returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormTypeSelection;
