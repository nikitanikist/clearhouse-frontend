
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Download, Check, X, Play, FileX, UserPlus, CheckCircle } from 'lucide-react';
import { CloseoutForm } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

interface CloseoutFormViewProps {
  form: CloseoutForm;
}

const CloseoutFormView = ({ form }: CloseoutFormViewProps) => {
  const { user } = useAuth();
  const { updateFormStatus, assignForm } = useData();
  const [showAmendmentDialog, setShowAmendmentDialog] = useState(false);
  const [amendmentNote, setAmendmentNote] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  // Available admins for assignment
  const availableAdmins = [
    { id: 'admin-1', name: 'Jordan Lee' },
    { id: 'admin-2', name: 'Sarah Chen' },
    { id: 'admin-3', name: 'Mike Davis' },
  ];

  const handleStartWorking = () => {
    updateFormStatus(form.id, 'active', 'Admin started working on this form');
  };

  const handleMarkComplete = () => {
    updateFormStatus(form.id, 'completed', 'Form marked as completed by admin');
  };

  const submitAmendment = () => {
    if (amendmentNote.trim()) {
      updateFormStatus(form.id, 'rejected', amendmentNote);
      setShowAmendmentDialog(false);
      setAmendmentNote('');
    }
  };

  const submitAssignment = () => {
    if (selectedAssignee) {
      const assigneeName = availableAdmins.find(admin => admin.id === selectedAssignee)?.name || '';
      assignForm(form.id, selectedAssignee, assigneeName);
      setShowAssignDialog(false);
      setSelectedAssignee('');
    }
  };

  // Show admin action buttons only for pending forms and if user is admin/superadmin
  const showAdminActions = form.status === 'pending' && (user?.role === 'admin' || user?.role === 'superadmin');
  const showMarkCompleteButton = form.status === 'active' && (user?.role === 'admin' || user?.role === 'superadmin');

  return (
    <div className="space-y-6">
      {/* General Information Table */}
      <Card>
        <CardHeader>
          <CardTitle>1. General Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/4 bg-gray-50">Client Name</TableCell>
                <TableCell className="w-1/4">{form.clientName}</TableCell>
                <TableCell className="font-medium w-1/4 bg-gray-50">File Path</TableCell>
                <TableCell className="w-1/4 font-mono text-sm">{form.filePath}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">Partner</TableCell>
                <TableCell>{form.partner}</TableCell>
                <TableCell className="font-medium bg-gray-50">Manager</TableCell>
                <TableCell>{form.manager}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">Year(s)</TableCell>
                <TableCell>{form.years}</TableCell>
                <TableCell className="font-medium bg-gray-50">Job Number</TableCell>
                <TableCell>{form.jobNumber}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">Invoice Amount</TableCell>
                <TableCell>{form.invoiceAmount}</TableCell>
                <TableCell className="font-medium bg-gray-50">Invoice Description</TableCell>
                <TableCell>{form.invoiceDescription || 'N/A'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">WIP Recovery</TableCell>
                <TableCell>{form.wipRecovery}</TableCell>
                <TableCell className="font-medium bg-gray-50">Bill Detail</TableCell>
                <TableCell>{form.billDetail}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">Payment Required</TableCell>
                <TableCell>
                  <Badge variant={form.paymentRequired ? "destructive" : "secondary"}>
                    {form.paymentRequired ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium bg-gray-50">Recovery Reason</TableCell>
                <TableCell>{form.recoveryReason || 'N/A'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Filing Details */}
      <Card>
        <CardHeader>
          <CardTitle>2. Filing Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/4 bg-gray-50">T106</TableCell>
                <TableCell className="w-1/4">
                  <div className="flex items-center space-x-2">
                    {form.t106 ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.t106 ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium w-1/4 bg-gray-50">T1134</TableCell>
                <TableCell className="w-1/4">
                  <div className="flex items-center space-x-2">
                    {form.t1134 ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.t1134 ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">T1135 Foreign Property</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {form.t1135ForeignProperty ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.t1135ForeignProperty ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium bg-gray-50">T2091 Principal Residence</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {form.t2091PrincipalResidence ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.t2091PrincipalResidence ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">T1032 Pension Split</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {form.t1032PensionSplit ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.t1032PensionSplit ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium bg-gray-50">Ontario Annual Return</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {form.ontarioAnnualReturn ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.ontarioAnnualReturn ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">T Slips</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {form.tSlips ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.tSlips ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium bg-gray-50">Quebec Return</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {form.quebecReturn ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.quebecReturn ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">Alberta Return</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {form.albertaReturn ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.albertaReturn ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium bg-gray-50"></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Installments */}
      <Card>
        <CardHeader>
          <CardTitle>3. Tax Installments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/4 bg-gray-50">Corporate Installments Required</TableCell>
                <TableCell className="w-1/4">
                  <div className="flex items-center space-x-2">
                    {form.corporateInstallmentsRequired ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.corporateInstallmentsRequired ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium w-1/4 bg-gray-50">FED Schedule Attached</TableCell>
                <TableCell className="w-1/4">
                  <div className="flex items-center space-x-2">
                    {form.fedScheduleAttached ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.fedScheduleAttached ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">HST Installment Required</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {form.hstInstallmentRequired ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.hstInstallmentRequired ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium bg-gray-50">HST Tab Completed</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {form.hstTabCompleted ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                    <span>{form.hstTabCompleted ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">HST Draft/Final</TableCell>
                <TableCell>{form.hstDraftOrFinal}</TableCell>
                <TableCell className="font-medium bg-gray-50"></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>4. Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              {form.otherDocuments && (
                <TableRow>
                  <TableCell className="font-medium w-1/4 bg-gray-50">Other Documents to Include</TableCell>
                  <TableCell colSpan={3}>{form.otherDocuments}</TableCell>
                </TableRow>
              )}
              {form.otherNotes && (
                <TableRow>
                  <TableCell className="font-medium bg-gray-50">Other Notes</TableCell>
                  <TableCell colSpan={3}>{form.otherNotes}</TableCell>
                </TableRow>
              )}
              {!form.otherDocuments && !form.otherNotes && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 italic">No additional documents or notes</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* T1 Summary */}
      <Card>
        <CardHeader>
          <CardTitle>7. T1 Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/4 bg-gray-50">Prior Periods Balance</TableCell>
                <TableCell className="w-1/4">${form.priorPeriodsBalance}</TableCell>
                <TableCell className="font-medium w-1/4 bg-gray-50">Taxes Payable</TableCell>
                <TableCell className="w-1/4">${form.taxesPayable}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">Installments During Year</TableCell>
                <TableCell>${form.installmentsDuringYear}</TableCell>
                <TableCell className="font-medium bg-gray-50">Installments After Year</TableCell>
                <TableCell>${form.installmentsAfterYear}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">Amount Owing</TableCell>
                <TableCell>${form.amountOwing}</TableCell>
                <TableCell className="font-medium bg-gray-50">Due Date</TableCell>
                <TableCell>{form.dueDate}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* HST Summary */}
      <Card>
        <CardHeader>
          <CardTitle>8. HST Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium w-1/4 bg-gray-50">HST Prior Balance</TableCell>
                <TableCell className="w-1/4">${form.hstPriorBalance}</TableCell>
                <TableCell className="font-medium w-1/4 bg-gray-50">HST Payable</TableCell>
                <TableCell className="w-1/4">${form.hstPayable}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">HST Installments During</TableCell>
                <TableCell>${form.hstInstallmentsDuring}</TableCell>
                <TableCell className="font-medium bg-gray-50">HST Installments After</TableCell>
                <TableCell>${form.hstInstallmentsAfter}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium bg-gray-50">HST Payment Due</TableCell>
                <TableCell>${form.hstPaymentDue}</TableCell>
                <TableCell className="font-medium bg-gray-50">HST Due Date</TableCell>
                <TableCell>{form.hstDueDate}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 5. Signature & Delivery - Family Members */}
      <Card>
        <CardHeader>
          <CardTitle>5. Signature & Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          {form.familyMembers && form.familyMembers.length > 0 ? (
            <div className="space-y-4">
              {form.familyMembers.map((member, index) => (
                <div key={member.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-2 border-b">
                    <h4 className="font-medium">Family Member {index + 1}</h4>
                  </div>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium w-1/4 bg-gray-50">Client Name</TableCell>
                        <TableCell className="w-1/4">{member.clientName}</TableCell>
                        <TableCell className="font-medium w-1/4 bg-gray-50">Signing Person</TableCell>
                        <TableCell className="w-1/4">{member.signingPerson}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium bg-gray-50">Email</TableCell>
                        <TableCell>{member.signingEmail}</TableCell>
                        <TableCell className="font-medium bg-gray-50">Personal Tax Payment</TableCell>
                        <TableCell>{member.personalTaxPayment}</TableCell>
                      </TableRow>
                      {member.additionalEmails && member.additionalEmails.length > 0 && (
                        <TableRow>
                          <TableCell className="font-medium bg-gray-50">Additional Emails</TableCell>
                          <TableCell colSpan={3}>
                            <div className="flex flex-wrap gap-2">
                              {member.additionalEmails.map((email, emailIndex) => (
                                <Badge key={emailIndex} variant="outline">{email}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow>
                        <TableCell className="font-medium bg-gray-50">Tax Forms</TableCell>
                        <TableCell colSpan={3}>
                          <div className="grid grid-cols-5 gap-4">
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
                        </TableCell>
                      </TableRow>
                      {member.installmentsRequired && (
                        <TableRow>
                          <TableCell className="font-medium bg-gray-50">6. Installment Attachment</TableCell>
                          <TableCell colSpan={3}>
                            {member.installmentAttachment ? (
                              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                  <div className="font-medium text-blue-900">{member.installmentAttachment.fileName}</div>
                                  <div className="text-sm text-blue-700">
                                    Uploaded {new Date(member.installmentAttachment.uploadedAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                  Attached
                                </Badge>
                                <button 
                                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                  onClick={() => window.open(member.installmentAttachment?.fileUrl, '_blank')}
                                >
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                <FileText className="h-5 w-5 text-amber-600" />
                                <span className="text-amber-800 font-medium">No attachment uploaded</span>
                                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                                  Missing
                                </Badge>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          ) : (
            // Fallback to legacy single member display
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium w-1/4 bg-gray-50">Signing Person</TableCell>
                  <TableCell className="w-1/4">{form.signingPerson}</TableCell>
                  <TableCell className="font-medium w-1/4 bg-gray-50">Signing Email</TableCell>
                  <TableCell className="w-1/4">{form.signingEmail}</TableCell>
                </TableRow>
                {form.additionalEmails && form.additionalEmails.length > 0 && (
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">Additional Emails</TableCell>
                    <TableCell colSpan={3}>
                      <div className="flex flex-wrap gap-2">
                        {form.additionalEmails.map((email, emailIndex) => (
                          <Badge key={emailIndex} variant="outline">{email}</Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-medium bg-gray-50">Tax Forms</TableCell>
                  <TableCell colSpan={3}>
                    <div className="grid grid-cols-5 gap-4">
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
                      <div className="flex items-center space-x-2">
                        {form.installmentsRequired ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
                        <span className="text-sm">Installments Required</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
                {form.installmentsRequired && (
                  <TableRow>
                    <TableCell className="font-medium bg-gray-50">6. Installment Attachment</TableCell>
                    <TableCell colSpan={3}>
                      {form.installmentAttachment ? (
                        <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div className="flex-1">
                            <div className="font-medium text-blue-900">{form.installmentAttachment.fileName}</div>
                            <div className="text-sm text-blue-700">
                              Uploaded {new Date(form.installmentAttachment.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                            Attached
                          </Badge>
                          <button 
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                            onClick={() => window.open(form.installmentAttachment?.fileUrl, '_blank')}
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <FileText className="h-5 w-5 text-amber-600" />
                          <span className="text-amber-800 font-medium">No attachment uploaded</span>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                            Missing
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Admin Action Buttons */}
      {(showAdminActions || showMarkCompleteButton) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-end gap-3">
              {showAdminActions && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowAssignDialog(true)}
                    className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign To
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAmendmentDialog(true)}
                    className="flex items-center gap-2 text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    <FileX className="h-4 w-4" />
                    Amendment
                  </Button>
                  <Button
                    onClick={handleStartWorking}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="h-4 w-4" />
                    Working on it
                  </Button>
                </>
              )}
              {showMarkCompleteButton && (
                <Button
                  onClick={handleMarkComplete}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as Complete
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Amendment Request Dialog */}
      <Dialog open={showAmendmentDialog} onOpenChange={setShowAmendmentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Amendment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amendment-note">Amendment Note</Label>
              <Textarea
                id="amendment-note"
                placeholder="Please describe what amendments are needed..."
                value={amendmentNote}
                onChange={(e) => setAmendmentNote(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAmendmentDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitAmendment}
                disabled={!amendmentNote.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Request Amendment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assign Form Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Form to Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignee">Select Admin</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an admin..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAdmins.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id}>
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitAssignment}
                disabled={!selectedAssignee}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Assign Form
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CloseoutFormView;
