
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Wrench, Check, Plus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

const DashboardCards = () => {
  const { forms } = useData();
  const { user } = useAuth();

  // Filter forms based on user role
  const getFilteredForms = (formsList: typeof forms) => {
    if (user?.role === 'superadmin') {
      return formsList;
    } else if (user?.role === 'admin') {
      return formsList.filter(form => form.assignedTo && form.assignedTo.id === user.id);
    } else {
      return formsList.filter(form => form.createdBy.id === user.id);
    }
  };

  const pendingCount = getFilteredForms(forms.filter(form => form.status === 'pending')).length;
  const amendmentCount = getFilteredForms(forms.filter(form => form.status === 'rejected')).length;
  const completedCount = getFilteredForms(forms.filter(form => form.status === 'completed')).length;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Closeouts Card */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Pending Closeouts</h3>
            <div className="text-3xl font-bold text-blue-600">{pendingCount}</div>
          </CardContent>
        </Card>

        {/* Amendment Forms Card */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Amendment Forms</h3>
            <div className="text-3xl font-bold text-blue-600">{amendmentCount}</div>
          </CardContent>
        </Card>

        {/* Completed Closeouts Card */}
        <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Completed Closeouts</h3>
            <div className="text-3xl font-bold text-blue-600">{completedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Form Button */}
      {user?.role === 'preparer' && (
        <div className="flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full">
            <Plus className="mr-2 h-5 w-5" />
            Create New Closeout Form
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardCards;
