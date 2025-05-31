
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Download, Check, X } from 'lucide-react';
import { CloseoutForm } from '@/contexts/DataContext';

interface CloseoutFormViewProps {
  form: CloseoutForm;
}

const CloseoutFormView = ({ form }: CloseoutFormViewProps) => {
  return (
    <div className="space-y-6">
      {/* General Information */}
      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="font-medium text-sm text-gray-600">Client Name</label>
            <p className="text-sm">{form.clientName}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">File Path</label>
            <p className="text-sm font-mono">{form.filePath}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Partner</label>
            <p className="text-sm">{form.partner}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Manager</label>
            <p className="text-sm">{form.manager}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Year(s)</label>
            <p className="text-sm">{form.years}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Job Number</label>
            <p className="text-sm">{form.jobNumber}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Invoice Amount</label>
            <p className="text-sm">{form.invoiceAmount}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">WIP Recovery</label>
            <p className="text-sm">{form.wipRecovery}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Payment Required</label>
            <Badge variant={form.paymentRequired ? "destructive" : "secondary"}>
              {form.paymentRequired ? "Yes" : "No"}
            </Badge>
          </div>
          <div className="md:col-span-2">
            <label className="font-medium text-sm text-gray-600">Bill Detail</label>
            <p className="text-sm">{form.billDetail}</p>
          </div>
          {form.recoveryReason && (
            <div className="md:col-span-2">
              <label className="font-medium text-sm text-gray-600">Recovery Reason</label>
              <p className="text-sm">{form.recoveryReason}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Filing Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Filing Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
            {form.t2091PrincipalResidence ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">T2091 Principal Residence</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
            {form.t1135ForeignProperty ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">T1135 Foreign Property</span>
          </div>
          <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded">
            {form.t1032PensionSplit ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
            <span className="text-sm">T1032 Pension Split</span>
          </div>
          <div className="p-2 bg-yellow-50 rounded">
            <label className="font-medium text-sm text-gray-600">HST Draft/Final</label>
            <p className="text-sm">{form.hstDraftOrFinal}</p>
          </div>
          {form.otherNotes && (
            <div className="md:col-span-4">
              <label className="font-medium text-sm text-gray-600">Other Notes</label>
              <p className="text-sm">{form.otherNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* T1 Summary */}
      <Card>
        <CardHeader>
          <CardTitle>T1 Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="font-medium text-sm text-gray-600">Prior Periods Balance</label>
            <p className="text-sm">${form.priorPeriodsBalance}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Taxes Payable</label>
            <p className="text-sm">${form.taxesPayable}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Installments During Year</label>
            <p className="text-sm">${form.installmentsDuringYear}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Installments After Year</label>
            <p className="text-sm">${form.installmentsAfterYear}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Amount Owing</label>
            <p className="text-sm">${form.amountOwing}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">Due Date</label>
            <p className="text-sm">{form.dueDate}</p>
          </div>
        </CardContent>
      </Card>

      {/* HST Summary */}
      <Card>
        <CardHeader>
          <CardTitle>HST Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="font-medium text-sm text-gray-600">HST Prior Balance</label>
            <p className="text-sm">${form.hstPriorBalance}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">HST Payable</label>
            <p className="text-sm">${form.hstPayable}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">HST Installments During</label>
            <p className="text-sm">${form.hstInstallmentsDuring}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">HST Installments After</label>
            <p className="text-sm">${form.hstInstallmentsAfter}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">HST Payment Due</label>
            <p className="text-sm">${form.hstPaymentDue}</p>
          </div>
          <div>
            <label className="font-medium text-sm text-gray-600">HST Due Date</label>
            <p className="text-sm">{form.hstDueDate}</p>
          </div>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card>
        <CardHeader>
          <CardTitle>Family Members & Installment Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          {form.familyMembers && form.familyMembers.length > 0 ? (
            <div className="space-y-4">
              {form.familyMembers.map((member, index) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="font-medium text-sm text-gray-600">Client Name</label>
                      <p className="text-sm">{member.clientName}</p>
                    </div>
                    <div>
                      <label className="font-medium text-sm text-gray-600">Signing Person</label>
                      <p className="text-sm">{member.signingPerson}</p>
                    </div>
                    <div>
                      <label className="font-medium text-sm text-gray-600">Email</label>
                      <p className="text-sm">{member.signingEmail}</p>
                    </div>
                    <div>
                      <label className="font-medium text-sm text-gray-600">Personal Tax Payment</label>
                      <p className="text-sm">{member.personalTaxPayment}</p>
                    </div>
                  </div>
                  
                  {member.additionalEmails.length > 0 && (
                    <div className="mb-4">
                      <label className="font-medium text-sm text-gray-600">Additional Emails</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {member.additionalEmails.map((email, emailIndex) => (
                          <Badge key={emailIndex} variant="outline">{email}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      {member.isT1 ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">T1</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.isS216 ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">S216</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.isS116 ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">S116</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.isPaperFiled ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Paper Filed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {member.installmentsRequired ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                      <span className="text-sm">Installments Required</span>
                    </div>
                  </div>

                  {member.installmentsRequired && member.installmentAttachment && (
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <label className="font-medium text-sm text-gray-600 mb-2 block">Installment Attachment</label>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">{member.installmentAttachment.fileName}</span>
                        <Badge variant="outline" className="text-xs">
                          Uploaded {new Date(member.installmentAttachment.uploadedAt).toLocaleDateString()}
                        </Badge>
                        <Download className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
                      </div>
                    </div>
                  )}

                  {index < form.familyMembers!.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          ) : (
            // Fallback to legacy single member display
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="font-medium text-sm text-gray-600">Signing Person</label>
                <p className="text-sm">{form.signingPerson}</p>
              </div>
              <div>
                <label className="font-medium text-sm text-gray-600">Signing Email</label>
                <p className="text-sm">{form.signingEmail}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 col-span-full">
                <div className="flex items-center space-x-2">
                  {form.isT1 ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                  <span className="text-sm">T1</span>
                </div>
                <div className="flex items-center space-x-2">
                  {form.isS216 ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                  <span className="text-sm">S216</span>
                </div>
                <div className="flex items-center space-x-2">
                  {form.isS116 ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                  <span className="text-sm">S116</span>
                </div>
                <div className="flex items-center space-x-2">
                  {form.isPaperFiled ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                  <span className="text-sm">Paper Filed</span>
                </div>
              </div>
              
              {form.installmentAttachment && (
                <div className="col-span-full bg-purple-50 p-3 rounded-lg">
                  <label className="font-medium text-sm text-gray-600 mb-2 block">Installment Attachment</label>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">{form.installmentAttachment.fileName}</span>
                    <Badge variant="outline" className="text-xs">
                      Uploaded {new Date(form.installmentAttachment.uploadedAt).toLocaleDateString()}
                    </Badge>
                    <Download className="h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-700" />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CloseoutFormView;
