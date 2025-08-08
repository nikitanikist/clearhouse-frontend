
import { CloseoutFormTableData } from '../CloseoutFormTable';
import { User } from '@/contexts/AuthContext';

// Utility to clean currency strings to numbers
function cleanCurrency(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[$,]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

// Utility to clean date fields
function cleanDate(value: string | null | undefined): string | null {
  if (!value || value === 'N/A' || value === '' || value === 'null') return null;
  return value;
}

export const mapTableDataToCloseoutForm = (
  formData: CloseoutFormTableData, 
  user: User,
  formType: 'personal' | 'corporate' = 'personal'
) => {
  const createdByInfo = {
    id: user.id,
    name: user.name,
    role: user.role,
  };
  
  const primaryMember = formData.familyMembers[0];
  // Get taxesPayable and amountOwing from primary member if present, fallback to top-level
  const taxesPayable = primaryMember?.taxesPayable ?? formData.taxesPayable ?? '0';
  const amountOwing = primaryMember?.amountOwing ?? formData.amountOwing ?? '0';
  
  // Get filing details from primary member if present, fallback to top-level
  const t1135ForeignProperty = (primaryMember?.t1135ForeignProperty ?? primaryMember?.isT1135 ?? formData.t1135ForeignProperty) ?? false;
  console.log('[DEBUG] Final t1135ForeignProperty for preview:', t1135ForeignProperty);
  const t2091PrincipalResidence = (primaryMember?.isT2091 ?? formData.t2091PrincipalResidence) ?? false;
  const t1032PensionSplit = (primaryMember?.t1032PensionSplit ?? primaryMember?.isT1032 ?? formData.t1032PensionSplit) ?? false;
  
  // Map formType to database-compatible values
  const mappedFormType = formType === 'personal' ? 'T1' : formType === 'corporate' ? 'Corporate' : 'T1';
  
  return {
    formType: mappedFormType,
    clientName: primaryMember.signingPerson || primaryMember.clientName || '',
    filePath: formData.filePath && formData.filePath.trim() !== '' ? formData.filePath : 'not_provided',
    signingPerson: primaryMember.signingPerson,
    signingEmail: primaryMember.signingEmail,
    additionalEmails: primaryMember.additionalEmails,
    partner: formData.partner,
    manager: formData.manager,
    years: formData.years,
    jobNumber: formData.jobNumber,
    invoiceAmount: formData.invoiceAmount,
    invoiceDescription: formData.billDetail, // Map billDetail to invoiceDescription
    billDetail: formData.billDetail,
    paymentRequired: formData.paymentRequired,
    wipRecovery: formData.wipRecovery,
    recoveryReason: formData.recoveryReason ?? '',
    returnType: primaryMember.isT1 ? 'T1' : primaryMember.isS216 ? 'S216' : primaryMember.isS116 ? 'S116' : 'T1',
    
    // Individual boolean fields for return types
    isT1: primaryMember.isT1,
    isS216: primaryMember.isS216,
    isS116: primaryMember.isS116,
    isEfiled: !primaryMember.isPaperFiled,
    isPaperFiled: primaryMember.isPaperFiled,
    installmentsRequired: primaryMember.installmentsRequired,
    
    // New filing detail fields with default values
    t106: false,
    t1134: false,
    ontarioAnnualReturn: formData.ontarioAnnualReturn || false,
    tSlips: formData.tSlipType ? true : false,
    quebecReturn: false,
    albertaReturn: false,
    
    // Tax forms
    t2091PrincipalResidence: t2091PrincipalResidence,
    t1135ForeignProperty: t1135ForeignProperty,
    t1032PensionSplit: t1032PensionSplit,
    hstDraftOrFinal: formData.hstDraftOrFinal,
    tSlipType: formData.tSlipType,
    
    // Other documents and notes
    otherNotes: formData.otherNotes,
    otherDocuments: formData.otherDocuments || '',
    
    // Tax installment fields with default values
    corporateInstallmentsRequired: false,
    fedScheduleAttached: false,
    hstInstallmentRequired: formData.hstInstallmentsRequired || false,
    hstTabCompleted: false,
    
    // Installments
    personalTaxInstallmentsRequired: formData.personalTaxInstallmentsRequired,
    hstInstallmentsRequired: formData.hstInstallmentsRequired,
    
    // Outstanding balance
    outstandingTaxBalance: formData.outstandingTaxBalance,
    
    // T1 Summary fields
    priorPeriodsBalance: cleanCurrency(formData.priorPeriodsBalance)?.toString() || '',
    taxesPayable: cleanCurrency(taxesPayable)?.toString() || '',
    installmentsDuringYear: cleanCurrency(formData.installmentsDuringYear)?.toString() || '',
    installmentsAfterYear: cleanCurrency(formData.installmentsAfterYear)?.toString() || '',
    amountOwing: cleanCurrency(amountOwing)?.toString() || '',
    dueDate: cleanDate(formData.taxPaymentDueDate),
    taxPaymentDueDate: cleanDate(formData.taxPaymentDueDate),
    returnFilingDueDate: cleanDate(formData.returnFilingDueDate),
    
    // HST Summary fields
    hstPriorBalance: cleanCurrency(formData.hstPriorBalance)?.toString() || '',
    hstPayable: cleanCurrency(formData.hstPayable)?.toString() || '',
    hstInstallmentsDuring: cleanCurrency(formData.hstInstallmentsDuring)?.toString() || '',
    hstInstallmentsAfter: cleanCurrency(formData.hstInstallmentsAfter)?.toString() || '',
    hstPaymentDue: cleanCurrency(formData.hstPaymentDue)?.toString() || '',
    hstDueDate: cleanDate(formData.hstDueDate),
    
    // Multi-year support
    yearlyAmounts: formData.yearlyAmounts,
    
    installmentAttachment: primaryMember.installmentAttachment,
    status: 'pending' as const,
    assignedTo: null, // Will be assigned to admin by backend logic
    createdBy: createdByInfo,
    familyMembers: formData.familyMembers.map(member => ({
      id: member.id,
      clientName: member.clientName,
      signingPerson: member.signingPerson,
      signingEmail: member.signingEmail,
      additionalEmails: member.additionalEmails,
      isT1: member.isT1,
      isS216: member.isS216,
      isS116: member.isS116,
      isPaperFiled: member.isPaperFiled,
      installmentsRequired: member.installmentsRequired,
      personalTaxPayment: cleanCurrency(member.personalTaxPayment)?.toString() || '',
      taxesPayable: cleanCurrency(member.taxesPayable)?.toString() || '',
      amountOwing: cleanCurrency(member.amountOwing)?.toString() || '',
      installmentAttachment: member.installmentAttachment,
    })),
  };
};
