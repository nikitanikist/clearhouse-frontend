import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, Play, FileX, UserPlus, CheckCircle } from 'lucide-react';
import { CloseoutForm } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { fetchAdminUsers } from '@/services/api';

interface CloseoutFormAdminViewProps {
  form: CloseoutForm;
}

const CloseoutFormAdminView = ({ form }: CloseoutFormAdminViewProps) => {
  const { user } = useAuth();
  const { updateFormStatus, assignForm } = useData();
  const [showAmendmentDialog, setShowAmendmentDialog] = useState(false);
  const [amendmentNote, setAmendmentNote] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [availableAdmins, setAvailableAdmins] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Fetch admin users for assignment
  useEffect(() => {
    const loadAdminUsers = async () => {
      if (user?.role === 'admin' || user?.role === 'superadmin') {
        setLoadingAdmins(true);
        try {
          const adminUsers = await fetchAdminUsers();
          setAvailableAdmins(adminUsers);
        } catch (error) {
          console.error('Failed to load admin users:', error);
          // Fallback to empty array if API fails
          setAvailableAdmins([]);
        } finally {
          setLoadingAdmins(false);
        }
      }
    };

    loadAdminUsers();
  }, [user?.role]);

  const handleStartWorking = () => {
    updateFormStatus(form.id, 'active', 'Admin started working on this form');
  };

  const handleMarkComplete = () => {
    updateFormStatus(form.id, 'completed', 'Form marked as completed by admin');
  };

  const submitAmendment = async () => {
    if (amendmentNote.trim()) {
      try {
        await updateFormStatus(form.id, 'rejected', undefined, amendmentNote);
        setShowAmendmentDialog(false);
        setAmendmentNote('');
      } catch (error) {
        console.error('Error submitting amendment:', error);
        // Error is already handled in updateFormStatus function
      }
    }
  };

  const submitAssignment = async () => {
    if (selectedAssignee) {
      const assigneeName = availableAdmins.find(admin => admin.id === selectedAssignee)?.name || '';
      try {
        await assignForm(form.id, selectedAssignee, assigneeName);
        setShowAssignDialog(false);
        setSelectedAssignee('');
      } catch (error) {
        console.error('Error assigning form:', error);
        // Error is already handled in assignForm function
      }
    }
  };

  const showAdminActions = form.status === 'pending' && (user?.role === 'admin' || user?.role === 'superadmin');
  const showMarkCompleteButton = form.status === 'active' && (user?.role === 'admin' || user?.role === 'superadmin');

  const TableRow = ({ label, value, isHighlighted = false }: { label: string; value: React.ReactNode; isHighlighted?: boolean }) => (
    <tr className={isHighlighted ? 'bg-yellow-50' : ''}>
      <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50 w-1/3">{label}</td>
      <td className="border border-gray-300 px-4 py-2 w-2/3">{value}</td>
    </tr>
  );

  const CheckboxDisplay = ({ checked, label }: { checked: boolean; label: string }) => (
    <div className="flex items-center space-x-2">
      <div className="w-5 h-5 border-2 border-gray-400 flex items-center justify-center">
        {checked && <Check className="h-3 w-3 text-black font-bold" />}
      </div>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto bg-white p-8 space-y-8">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-4">
        <h1 className="text-2xl font-bold">CLOSEOUT FORM</h1>
        <p className="text-gray-600 mt-2">Administrative Review</p>
      </div>

      {/* Amendment Note Display - Show only for rejected forms */}
      {form.status === 'rejected' && form.rejectionReason && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FileX className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-bold text-red-800">Amendment Required</h3>
          </div>
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-2">Amendment Note:</h4>
            <p className="text-gray-800 whitespace-pre-wrap">{form.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* 1. Client & Signer Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">CLIENT & SIGNER DETAILS</h2>
        <table className="w-full border-collapse">
          <tbody>
            <TableRow label="Name of Client" value={form.clientName} />
            <TableRow label="File Path" value={<span className="font-mono text-sm">{form.filePath}</span>} />
            <TableRow label="Name of person signing" value={form.signingPerson} />
            <TableRow label="Email of person signing" value={<a href={`mailto:${form.signingEmail}`} className="text-blue-600 underline">{form.signingEmail}</a>} />
            <TableRow 
              label="Additional emails to send package" 
              value={
                form.additionalEmails && form.additionalEmails.length > 0 
                  ? form.additionalEmails.join(', ')
                  : '-'
              }
            />
          </tbody>
        </table>
      </div>

      {/* 2. Internal Assignment */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">INTERNAL ASSIGNMENT</h2>
        <table className="w-full border-collapse">
          <tbody>
            <TableRow label="Partner" value={form.partner} />
            <TableRow label="Manager" value={form.manager} />
          </tbody>
        </table>
      </div>

      {/* 3. Job Details */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">JOB DETAILS</h2>
        <table className="w-full border-collapse">
          <tbody>
            <TableRow label="Year-End" value={form.years} />
            <TableRow label="Job #" value={form.jobNumber} />
            <TableRow label="Invoice amount (+ disb, HST)" value={form.invoiceAmount} />
            <TableRow label="Invoice description" value={form.invoiceDescription || 'Standard wording for T2'} />
            <TableRow 
              label="Payment required before filing - Yes/No" 
              value={
                <div className="flex items-center space-x-4">
                  <CheckboxDisplay checked={form.paymentRequired} label="Yes" />
                  <CheckboxDisplay checked={!form.paymentRequired} label="No" />
                </div>
              }
            />
            <TableRow label="WIP recovery % (WIP + 20% Partner time)" value={form.wipRecovery} />
          </tbody>
        </table>
      </div>

      {/* 4. Return Type Checkboxes */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">RETURN TYPE</h2>
        <table className="w-full border-collapse">
          <tbody>
            <TableRow 
              label="Return Type" 
              value={
                <div className="flex items-center space-x-8">
                  <CheckboxDisplay checked={form.billDetail === 'T2 only'} label="T2 only" />
                  <CheckboxDisplay checked={form.billDetail === 'T2 & NTR'} label="T2 & NTR" />
                  <CheckboxDisplay checked={form.billDetail === 'NTR only'} label="NTR only" />
                </div>
              }
            />
          </tbody>
        </table>
      </div>

      {/* 5. Tax Forms Section (Highlighted) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">TAX FORMS (HIGHLIGHTED)</h2>
        <table className="w-full border-collapse">
          <tbody>
            <TableRow 
              label="T1135" 
              value={<CheckboxDisplay checked={form.t1135ForeignProperty || false} label="" />}
              isHighlighted={true}
            />
            <TableRow 
              label="T106" 
              value={<CheckboxDisplay checked={form.t106 || false} label="" />}
              isHighlighted={true}
            />
            <TableRow 
              label="T1134" 
              value={<CheckboxDisplay checked={form.t1134 || false} label="" />}
              isHighlighted={true}
            />
          </tbody>
        </table>
      </div>

      {/* 6. Other Return Checkboxes */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">OTHER RETURNS</h2>
        <table className="w-full border-collapse">
          <tbody>
            <TableRow 
              label="Quebec return" 
              value={<CheckboxDisplay checked={form.quebecReturn || false} label="" />}
            />
            <TableRow 
              label="Alberta Return" 
              value={<CheckboxDisplay checked={form.albertaReturn || false} label="" />}
            />
          </tbody>
        </table>
      </div>

      {/* 7. Other Documents */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">OTHER DOCUMENTS</h2>
        <table className="w-full border-collapse">
          <tbody>
            <TableRow 
              label="Other documents to include" 
              value={
                <div className="whitespace-pre-wrap">
                  {form.otherDocuments || 'T2 Schedule 130 - attached'}
                </div>
              }
            />
          </tbody>
        </table>
      </div>

      {/* 8. Corporate Tax Installment Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">CORPORATE TAX INSTALLMENTS</h2>
        <table className="w-full border-collapse">
          <tbody>
            <TableRow 
              label="Are corporate tax installments required? (Yes/No)" 
              value={
                <div className="flex items-center space-x-4">
                  <CheckboxDisplay checked={form.corporateInstallmentsRequired || false} label="Yes" />
                  <CheckboxDisplay checked={!(form.corporateInstallmentsRequired || false)} label="No" />
                </div>
              }
            />
            <TableRow 
              label="Attach FED Schedule from T2 (Yes/No)" 
              value={
                <div className="flex items-center space-x-4">
                  <CheckboxDisplay checked={form.fedScheduleAttached || false} label="Yes" />
                  <CheckboxDisplay checked={!(form.fedScheduleAttached || false)} label="No" />
                </div>
              }
            />
            <TableRow 
              label="HST - indicate draft or filed and attach pdf" 
              value={
                form.hstDraftOrFinal ? 
                  `${form.hstDraftOrFinal} - No file uploaded` : 
                  'Draft - No file uploaded'
              }
            />
            <TableRow 
              label="Are HST installments required? (Yes/No)" 
              value={
                <div className="flex items-center space-x-4">
                  <CheckboxDisplay checked={form.hstInstallmentRequired || false} label="Yes" />
                  <CheckboxDisplay checked={!(form.hstInstallmentRequired || false)} label="No" />
                </div>
              }
            />
            <TableRow 
              label='Yes - complete "HST Installments" tab and print to PDF.' 
              value={form.hstTabCompleted ? 'Yes' : '-'}
            />
          </tbody>
        </table>
      </div>

      {/* 9. Ontario and T-Slip Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">ONTARIO & T-SLIPS</h2>
        <table className="w-full border-collapse">
          <tbody>
            <TableRow 
              label="Ontario Annual return" 
              value={<CheckboxDisplay checked={form.ontarioAnnualReturn || false} label="" />}
            />
            <TableRow 
              label="T Slips" 
              value={<CheckboxDisplay checked={form.tSlips || false} label="" />}
            />
          </tbody>
        </table>
      </div>

      {/* 10. Family Members & Installment Attachments Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">FAMILY MEMBERS & INSTALLMENT ATTACHMENTS</h2>
        
        {/* Check if there are multiple family members */}
        {form.familyMembers && form.familyMembers.length > 0 ? (
          /* Multiple family members - horizontal layout like Excel */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50 text-left min-w-[200px]">
                    Field
                  </th>
                  <th className="border border-gray-300 px-4 py-2 font-semibold bg-blue-50 text-center min-w-[180px]">
                    {form.clientName}
                  </th>
                  {form.familyMembers.map((member, index) => (
                    <th key={index} className="border border-gray-300 px-4 py-2 font-semibold bg-blue-50 text-center min-w-[180px]">
                      {member.clientName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* File Path - shared for all */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">File Path</td>
                  <td className="border border-gray-300 px-4 py-2 text-xs font-mono" colSpan={1 + form.familyMembers.length}>
                    {form.filePath}
                  </td>
                </tr>
                
                {/* Signing Person */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Signing Person</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {form.signingPerson || '-'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      {member.signingPerson || '-'}
                    </td>
                  ))}
                </tr>
                
                {/* Signing Email */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Signing Email</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {form.signingEmail ? (
                      <a href={`mailto:${form.signingEmail}`} className="text-blue-600 underline text-sm">
                        {form.signingEmail}
                      </a>
                    ) : '-'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      {member.signingEmail ? (
                        <a href={`mailto:${member.signingEmail}`} className="text-blue-600 underline text-sm">
                          {member.signingEmail}
                        </a>
                      ) : '-'}
                    </td>
                  ))}
                </tr>
                
                {/* T1 Form */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">T1</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <CheckboxDisplay checked={form.isT1 || false} label="" />
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      <CheckboxDisplay checked={member.isT1 || false} label="" />
                    </td>
                  ))}
                </tr>
                
                {/* S216 Form */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">S216</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <CheckboxDisplay checked={form.isS216 || false} label="" />
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      <CheckboxDisplay checked={member.isS216 || false} label="" />
                    </td>
                  ))}
                </tr>
                
                {/* S116 Form */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">S116</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <CheckboxDisplay checked={form.isS116 || false} label="" />
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      <CheckboxDisplay checked={member.isS116 || false} label="" />
                    </td>
                  ))}
                </tr>
                
                {/* Paper Filed */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Paper Filed</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <CheckboxDisplay checked={form.isPaperFiled || false} label="" />
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      <CheckboxDisplay checked={member.isPaperFiled || false} label="" />
                    </td>
                  ))}
                </tr>
                
                {/* Installments Required */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Installments Required</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {form.installmentsRequired ? 'Yes' : 'No'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      {member.installmentsRequired ? 'Yes' : 'No'}
                    </td>
                  ))}
                </tr>
                
                {/* Installment Attachment */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Installment Attachment</td>
                  <td className="border border-gray-300 px-4 py-2 text-center" colSpan={1 + form.familyMembers.length}>
                    {form.installmentAttachment ? 'Uploaded' : 'No attachment uploaded'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* Single member - original vertical layout */
          <table className="w-full border-collapse">
            <tbody>
              <TableRow 
                label="Signing Person" 
                value={form.signingPerson || '-'} 
              />
              <TableRow 
                label="Signing Email" 
                value={
                  form.signingEmail ? 
                    <a href={`mailto:${form.signingEmail}`} className="text-blue-600 underline">
                      {form.signingEmail}
                    </a> : 
                    '-'
                } 
              />
              <TableRow 
                label="Tax Forms" 
                value={
                  <div className="flex items-center space-x-6">
                    <CheckboxDisplay checked={form.isT1 || false} label="T1" />
                    <CheckboxDisplay checked={form.isS216 || false} label="S216" />
                    <CheckboxDisplay checked={form.isS116 || false} label="S116" />
                    <CheckboxDisplay checked={form.isPaperFiled || false} label="Paper Filed" />
                  </div>
                }
              />
              <TableRow 
                label="Installments Required (Yes/No)" 
                value={
                  <div className="flex items-center space-x-4">
                    <CheckboxDisplay checked={form.installmentsRequired || false} label="Yes" />
                    <CheckboxDisplay checked={!(form.installmentsRequired || false)} label="No" />
                  </div>
                }
              />
              <TableRow 
                label="Installment Attachment" 
                value={form.installmentAttachment ? 'Uploaded' : 'No attachment uploaded'}
              />
            </tbody>
          </table>
        )}
      </div>

      {/* 11. Personal Tax Summary Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">PERSONAL TAX SUMMARY</h2>
        
        {/* Check if there are multiple family members */}
        {form.familyMembers && form.familyMembers.length > 0 ? (
          /* Multiple family members - horizontal layout like Excel */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50 text-left min-w-[200px]">
                    Field
                  </th>
                  <th className="border border-gray-300 px-4 py-2 font-semibold bg-blue-50 text-center min-w-[180px]">
                    {form.clientName}
                  </th>
                  {form.familyMembers.map((member, index) => (
                    <th key={index} className="border border-gray-300 px-4 py-2 font-semibold bg-blue-50 text-center min-w-[180px]">
                      {member.clientName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Prior Periods Balance */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Prior Periods Balance</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.priorPeriodsBalance || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.priorPeriodsBalance || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Taxes Payable */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Taxes Payable</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.taxesPayable || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.taxesPayable || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Installments During Year */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Installments During Year</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.installmentsDuringYear || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.installmentsDuringYear || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Installments After Year */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Installments After Year</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.installmentsAfterYear || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.installmentsAfterYear || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Amount Owing */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Amount Owing</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.amountOwing || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.amountOwing || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Tax Payment Due Date */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Tax Payment Due Date</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {form.taxPaymentDueDate || 'N/A'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      {member.taxPaymentDueDate || 'N/A'}
                    </td>
                  ))}
                </tr>
                
                {/* Return Filing Due Date */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Return Filing Due Date</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {form.returnFilingDueDate || 'April 30'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      {member.returnFilingDueDate || 'April 30'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* Single member - original vertical layout */
          <table className="w-full border-collapse">
            <tbody>
              <TableRow label="Prior Periods Balance" value={`$${form.priorPeriodsBalance || '0'}`} />
              <TableRow label="Taxes Payable" value={`$${form.taxesPayable || '0'}`} />
              <TableRow label="Installments During Year" value={`$${form.installmentsDuringYear || '0'}`} />
              <TableRow label="Installments After Year" value={`$${form.installmentsAfterYear || '0'}`} />
              <TableRow label="Amount Owing" value={`$${form.amountOwing || '0'}`} />
              <TableRow label="Tax Payment Due Date" value={form.taxPaymentDueDate || 'N/A'} />
              <TableRow label="Return Filing Due Date" value={form.returnFilingDueDate || 'April 30'} />
            </tbody>
          </table>
        )}
      </div>

      {/* 12. T1 Summary Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">T1 SUMMARY</h2>
        
        {/* Check if there are multiple family members */}
        {form.familyMembers && form.familyMembers.length > 0 ? (
          /* Multiple family members - horizontal layout like Excel */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50 text-left min-w-[200px]">
                    Field
                  </th>
                  <th className="border border-gray-300 px-4 py-2 font-semibold bg-blue-50 text-center min-w-[180px]">
                    {form.clientName}
                  </th>
                  {form.familyMembers.map((member, index) => (
                    <th key={index} className="border border-gray-300 px-4 py-2 font-semibold bg-blue-50 text-center min-w-[180px]">
                      {member.clientName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Prior Periods Balance */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Prior Periods Balance</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.priorPeriodsBalance || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.priorPeriodsBalance || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Taxes Payable */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Taxes Payable</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.taxesPayable || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.taxesPayable || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Installments During Year */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Installments During Year</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.installmentsDuringYear || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.installmentsDuringYear || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Installments After Year */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Installments After Year</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.installmentsAfterYear || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.installmentsAfterYear || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Amount Owing */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Amount Owing</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.amountOwing || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.amountOwing || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* Tax Payment Due Date */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Tax Payment Due Date</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {form.taxPaymentDueDate || 'N/A'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      {member.taxPaymentDueDate || 'N/A'}
                    </td>
                  ))}
                </tr>
                
                {/* Return Filing Due Date */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">Return Filing Due Date</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {form.returnFilingDueDate || 'April 30'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      {member.returnFilingDueDate || 'April 30'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* Single member - original vertical layout */
          <table className="w-full border-collapse">
            <tbody>
              <TableRow label="Prior Periods Balance" value={`$${form.priorPeriodsBalance || '0'}`} />
              <TableRow label="Taxes Payable" value={`$${form.taxesPayable || '0'}`} />
              <TableRow label="Installments During Year" value={`$${form.installmentsDuringYear || '0'}`} />
              <TableRow label="Installments After Year" value={`$${form.installmentsAfterYear || '0'}`} />
              <TableRow label="Amount Owing" value={`$${form.amountOwing || '0'}`} />
              <TableRow label="Tax Payment Due Date" value={form.taxPaymentDueDate || 'N/A'} />
              <TableRow label="Return Filing Due Date" value={form.returnFilingDueDate || 'April 30'} />
            </tbody>
          </table>
        )}
      </div>

      {/* 13. HST Summary Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold border-b border-gray-300 pb-2">HST SUMMARY</h2>
        
        {/* Check if there are multiple family members */}
        {form.familyMembers && form.familyMembers.length > 0 ? (
          /* Multiple family members - horizontal layout like Excel */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-max">
              <thead>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50 text-left min-w-[200px]">
                    Field
                  </th>
                  <th className="border border-gray-300 px-4 py-2 font-semibold bg-blue-50 text-center min-w-[180px]">
                    {form.clientName}
                  </th>
                  {form.familyMembers.map((member, index) => (
                    <th key={index} className="border border-gray-300 px-4 py-2 font-semibold bg-blue-50 text-center min-w-[180px]">
                      {member.clientName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* HST Prior Balance */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">HST Prior Balance</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.hstPriorBalance || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.hstPriorBalance || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* HST Payable */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">HST Payable</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.hstPayable || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.hstPayable || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* HST Installments During */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">HST Installments During</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.hstInstallmentsDuring || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.hstInstallmentsDuring || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* HST Installments After */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">HST Installments After</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.hstInstallmentsAfter || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.hstInstallmentsAfter || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* HST Payment Due */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">HST Payment Due</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    ${form.hstPaymentDue || '0'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      ${member.hstPaymentDue || '0'}
                    </td>
                  ))}
                </tr>
                
                {/* HST Due Date */}
                <tr>
                  <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-50">HST Due Date</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {form.hstDueDate || 'April 30'}
                  </td>
                  {form.familyMembers.map((member, index) => (
                    <td key={index} className="border border-gray-300 px-4 py-2 text-center">
                      {member.hstDueDate || 'April 30'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          /* Single member - original vertical layout */
          <table className="w-full border-collapse">
            <tbody>
              <TableRow label="HST Prior Balance" value={`$${form.hstPriorBalance || '0'}`} />
              <TableRow label="HST Payable" value={`$${form.hstPayable || '0'}`} />
              <TableRow label="HST Installments During" value={`$${form.hstInstallmentsDuring || '0'}`} />
              <TableRow label="HST Installments After" value={`$${form.hstInstallmentsAfter || '0'}`} />
              <TableRow label="HST Payment Due" value={`$${form.hstPaymentDue || '0'}`} />
              <TableRow label="HST Due Date" value={form.hstDueDate || 'April 30'} />
            </tbody>
          </table>
        )}
      </div>

      {/* Admin Action Buttons */}
      {(showAdminActions || showMarkCompleteButton) && (
        <div className="border-t-2 border-gray-300 pt-6">
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
        </div>
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

export default CloseoutFormAdminView;
