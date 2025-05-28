import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import CloseoutFormCreate from '@/components/CloseoutForms/CloseoutFormCreate';

const DashboardCards = () => {
  const { forms } = useData();
  const { user } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);

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
      {/* Create New Form Button - positioned above cards */}
      {user?.role === 'preparer' && (
        <div className="flex justify-end">
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Closeout Form
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Closeouts Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300 shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Pending Closeouts</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">{pendingCount}</div>
            <p className="text-sm text-blue-600 font-medium">Click to view details</p>
          </CardContent>
        </Card>

        {/* Amendment Forms Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 transition-colors duration-300 shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Amendment Forms</h3>
            <div className="text-4xl font-bold text-orange-600 mb-2">{amendmentCount}</div>
            <p className="text-sm text-orange-600 font-medium">Click to view details</p>
          </CardContent>
        </Card>

        {/* Completed Closeouts Card */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center group-hover:bg-green-600 transition-colors duration-300 shadow-lg">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Completed Closeouts</h3>
            <div className="text-4xl font-bold text-green-600 mb-2">{completedCount}</div>
            <p className="text-sm text-green-600 font-medium">Click to view details</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Form Dialog */}
      <CloseoutFormCreate 
        open={showCreateForm} 
        onOpenChange={setShowCreateForm} 
      />
    </div>
  );
};

export default DashboardCards;
